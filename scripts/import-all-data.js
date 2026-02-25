/**
 * NEXUS UNIKIN - Import intégré des données
 * 
 * Sources:
 * 1. PERSONNEL ACADEMIQUE UNIKIN CORRIGE.xlsx → 1554 enseignants (toutes facultés)
 * 2. COLLECTE_DONNEES_PHARMACIE_NEXUS-1.xlsx → Cours LTP, Matricule ESU, Critères
 * 3. COMPOSITION DES JURY DE DELIBERATION 2025 2026.doc → Jurys de délibération
 * 
 * Usage: node scripts/import-all-data.js [db_url]
 */

const XLSX = require('xlsx');
const { Pool } = require('pg');
const WordExtractor = require('word-extractor');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const DB_URL = process.argv[2] || process.env.DATABASE_URL || 'postgresql://nexus_admin:NexusUnikin2026@localhost:5432/nexus_unikin';
const BASE_DIR = process.platform === 'win32' ? 'c:\\Users\\kason\\Downloads' : '/tmp';

const FILES = {
  personnel: path.join(BASE_DIR, 'PERSONNEL ACADEMIQUE UNIKIN CORRIGE.xlsx'),
  pharma1: path.join(BASE_DIR, 'COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx'),
  pharma2: path.join(BASE_DIR, 'COLLECTE_DONNEES_PHARMACIE_NEXUS-1.xlsx'),
  jury_doc: path.join(BASE_DIR, 'COMPOSITION DES JURY DE DELIBERATION 2025 2026.doc'),
};

const pool = new Pool({ connectionString: DB_URL });

// ============================================
// MAPPING GRADES (Excel → DB)
// ============================================
const GRADE_MAP = {
  'PO': 'PROFESSEUR_ORDINAIRE',
  'P O': 'PROFESSEUR_ORDINAIRE',
  'po': 'PROFESSEUR_ORDINAIRE',
  'PE': 'PROFESSEUR_ORDINAIRE',   // Professeur Émérite → PROFESSEUR_ORDINAIRE (highest)
  'P': 'PROFESSEUR',
  'PA': 'PROFESSEUR_ASSOCIE',
  'PA à nommer': 'PROFESSEUR_ASSOCIE',
  'P.O': 'PROFESSEUR_ORDINAIRE',
  'P.O.': 'PROFESSEUR_ORDINAIRE',
  'P.A': 'PROFESSEUR_ASSOCIE',
  'P.A.': 'PROFESSEUR_ASSOCIE',
  'P.E': 'PROFESSEUR_ORDINAIRE',
  'Dr': 'CHEF_TRAVAUX',
  'CT': 'CHEF_TRAVAUX',
  'C.T': 'CHEF_TRAVAUX',
  'C.T.': 'CHEF_TRAVAUX',
  'ASS': 'ASSISTANT',
  'Ass': 'ASSISTANT',
  'A': 'ASSISTANT',
};

// ============================================
// Normaliser nom complet → {last_name, first_name}
// ============================================
function parseFullName(fullName) {
  if (!fullName) return { last_name: 'N/A', first_name: 'N/A' };
  const name = fullName.toString().trim().replace(/\s+/g, ' ');
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return { last_name: parts[0], first_name: parts.slice(1).join(' ') };
  }
  return { last_name: name, first_name: name };
}

// ============================================
// Parse Excel serial date → YYYY-MM-DD
// ============================================
function excelDateToStr(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const d = new Date((serial - 25569) * 86400000);
  return d.toISOString().split('T')[0];
}

// ============================================
// Parse lieu et date de soutenance
// ============================================
function parseSoutenanceInfo(placeStr, dateSerial) {
  let place = null;
  let date = null;

  if (dateSerial && typeof dateSerial === 'number') {
    date = excelDateToStr(dateSerial);
  }

  if (placeStr) {
    const s = placeStr.toString().trim();
    // Extract place from "UNIKIN, le 30/03/2009" type format
    const match = s.match(/^([^,]+)/);
    if (match) place = match[1].trim();
  }

  return { place, date };
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('=== NEXUS UNIKIN - Import Intégré ===');
  console.log('Date:', new Date().toISOString());
  console.log('');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ============================================
    // PART 1: Personnel Académique UNIKIN (1554 enseignants)
    // ============================================
    console.log('📖 1. PERSONNEL ACADEMIQUE UNIKIN...');
    const wbPerso = XLSX.readFile(FILES.personnel);
    const persoData = XLSX.utils.sheet_to_json(wbPerso.Sheets['Feuil1'], { header: 1 }).slice(1);
    console.log(`   ${persoData.length} lignes`);

    let teachersCreated = 0, teachersUpdated = 0, teachersSkipped = 0;

    // Compteur pour générer des matricules uniques pour enseignants sans matricule
    let fakeMatCounter = 90000;

    for (const row of persoData) {
      if (!row[1]) continue; // pas de nom

      const fullName = row[1].toString().trim();
      const gradeRaw = (row[4] || '').toString().trim();
      const grade = GRADE_MAP[gradeRaw] || null;
      const { place, date } = parseSoutenanceInfo(row[2], row[3]);
      const { last_name, first_name } = parseFullName(fullName);

      if (!grade) {
        // Essayer de deviner le grade depuis le contexte
        // Si pas de grade, skip
        teachersSkipped++;
        continue;
      }

      // Chercher l'enseignant par nom (UPPER)
      const nameLookup = fullName.toUpperCase().replace(/\s+/g, ' ').trim();
      
      await client.query('SAVEPOINT teacher_save');
      try {
        // Chercher par nom dans users (enseignants)
        const existing = await client.query(
          `SELECT t.id, t.user_id, t.matricule, u.first_name, u.last_name 
           FROM teachers t JOIN users u ON t.user_id = u.id 
           WHERE UPPER(TRIM(u.last_name)) = $1 
              OR UPPER(TRIM(CONCAT(u.last_name, ' ', u.first_name))) = $2
              OR UPPER(TRIM(CONCAT(u.last_name, ' ', COALESCE(u.postnom, ''), ' ', u.first_name))) LIKE $3`,
          [last_name.toUpperCase(), nameLookup, '%' + last_name.toUpperCase() + '%' + (first_name.split(' ')[0] || '').toUpperCase() + '%']
        );

        if (existing.rows.length > 0) {
          // Update le grade si différent ou meilleur
          const t = existing.rows[0];
          await client.query(
            'UPDATE teachers SET grade = $1 WHERE id = $2',
            [grade, t.id]
          );
          teachersUpdated++;
        } else {
          // Créer un nouveau user + teacher
          fakeMatCounter++;
          const matricule = `UNIKIN${fakeMatCounter}`;
          const email = `${matricule.toLowerCase()}@unikin.ac.cd`;

          const userResult = await client.query(
            `INSERT INTO users (email, password, first_name, last_name, role, is_active, account_activated, must_change_password) 
             VALUES ($1, NULL, $2, $3, 'TEACHER', TRUE, FALSE, TRUE) RETURNING id`,
            [email, first_name, last_name]
          );

          await client.query(
            `INSERT INTO teachers (user_id, matricule, grade, is_permanent) 
             VALUES ($1, $2, $3, TRUE)`,
            [userResult.rows[0].id, matricule, grade]
          );
          teachersCreated++;
        }
        await client.query('RELEASE SAVEPOINT teacher_save');
      } catch (e) {
        await client.query('ROLLBACK TO SAVEPOINT teacher_save');
        teachersSkipped++;
        if (teachersSkipped <= 10) {
          console.log(`   ⚠️  Skip ${fullName}: ${e.message}`);
        }
      }
    }
    console.log(`   ✅ Créés: ${teachersCreated} | Mis à jour: ${teachersUpdated} | Skippés: ${teachersSkipped}`);

    // ============================================
    // PART 2: Mise à jour enseignants Pharma (matricule ESU)
    // ============================================
    console.log('\n📖 2. ENSEIGNANTS PHARMA (Matricule ESU)...');
    const wbPharma = XLSX.readFile(FILES.pharma2);
    const ensData = XLSX.utils.sheet_to_json(wbPharma.Sheets['Enseignants'], { header: 1 }).slice(1);
    let esuUpdated = 0;

    for (const row of ensData) {
      if (!row[0] || !row[1]) continue;
      const name = row[1].toString().trim();
      const matUnikin = row[2] ? row[2].toString().trim() : null;
      const matESU = row[3] ? row[3].toString().trim() : null;
      const gradeRaw = (row[4] || '').toString().trim();
      const personalEmail = (row[5] || '').toString().trim();
      const dept = (row[6] || '').toString().trim();

      if (!matUnikin) continue;

      await client.query('SAVEPOINT esu_save');
      try {
        // Find teacher by matricule
        const existing = await client.query(
          'SELECT id FROM teachers WHERE matricule = $1',
          [matUnikin]
        );

        if (existing.rows.length > 0) {
          const updates = [];
          const values = [];
          let paramIdx = 1;

          if (matESU) {
            updates.push(`matricule_esu = $${paramIdx++}`);
            values.push(matESU);
          }

          if (updates.length > 0) {
            values.push(existing.rows[0].id);
            await client.query(
              `UPDATE teachers SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
              values
            );
            esuUpdated++;
          }
        }
        await client.query('RELEASE SAVEPOINT esu_save');
      } catch (e) {
        await client.query('ROLLBACK TO SAVEPOINT esu_save');
      }
    }
    console.log(`   ✅ ${esuUpdated} enseignants mis à jour avec matricule ESU`);

    // ============================================
    // PART 3: Cours LTP (Licence en Techniques Pharmaceutiques)
    // ============================================
    console.log('\n📖 3. COURS LTP (Licence en Techniques Pharmaceutiques)...');
    const ltpData = XLSX.utils.sheet_to_json(wbPharma.Sheets['Cours LTP'], { header: 1 });

    // Get faculty id for FSPHAR
    const facResult = await client.query("SELECT id FROM faculties WHERE code = 'FSPHAR'");
    const pharmaFacId = facResult.rows[0]?.id;
    if (!pharmaFacId) throw new Error('Faculté FSPHAR non trouvée');

    // Find or create LTP department
    let ltpDeptResult = await client.query(
      "SELECT id FROM departments WHERE UPPER(name) LIKE '%LICENCE%TECHNIQUES%PHARMACEUTIQUES%' AND faculty_id = $1",
      [pharmaFacId]
    );
    let ltpDeptId;
    if (ltpDeptResult.rows.length > 0) {
      ltpDeptId = ltpDeptResult.rows[0].id;
    } else {
      const r = await client.query(
        "INSERT INTO departments (code, name, faculty_id) VALUES ('DLTP', 'Licence et Techniques Pharmaceutiques', $1) RETURNING id",
        [pharmaFacId]
      );
      ltpDeptId = r.rows[0].id;
      console.log(`   + Département LTP créé: id=${ltpDeptId}`);
    }

    // Parse LTP courses by level
    let currentLevel = null;
    let currentSemester = null;
    let currentOption = null; // PTP or PIP
    let coursesCreated = 0;
    let coursesSkipped = 0;

    const levelMap = {
      'L1 LTP': 'L1', 'L2 LTP': 'L2', 'L3 LTP': 'L3',
    };

    for (const row of ltpData) {
      const cell0 = (row[0] || '').toString().trim();
      const cell1 = (row[1] || '').toString().trim();

      // Detect option (filière)
      if (cell0.includes('PHARMACIE TRADITIONNELLE')) {
        currentOption = 'PTP';
        continue;
      }
      if (cell0.includes('PRATIQUES ET INDUSTRIES')) {
        currentOption = 'PIP';
        continue;
      }

      // Detect level
      for (const [key, level] of Object.entries(levelMap)) {
        if (cell0 === key || cell1 === key) {
          currentLevel = level;
          currentSemester = null;
          continue;
        }
      }

      // Detect semester
      if (cell0.startsWith('Semestre')) {
        currentSemester = cell0.includes('1') ? 1 : 2;
      }

      // If we have a code (column 1) and we're in a level context, this is a course
      if (cell1 && cell1.match(/^[A-Z]{2,4}\d{3}$/) && currentLevel) {
        const code = cell1;
        const credits = row[2] ? parseInt(row[2]) : 0;
        let name = (row[3] || '').toString().trim();
        // Sometimes the name is in column 4
        if (!name && row[4]) name = row[4].toString().trim();

        if (!name || name === 'PROJET PROFESSIONNEL') {
          // Project professionnel special handling
          if (row[3] && row[3].toString().includes('PROJET')) {
            name = 'Projet Professionnel';
          }
        }
        if (!name) continue;

        // Suffix with option if needed
        const fullCode = currentOption ? `${code}_${currentOption}` : code;
        const fullName = currentOption === 'PIP' && !name.includes('PIP') ? `${name} (PIP)` : name;

        // Find or create promotion for this level in LTP dept
        let promoResult = await client.query(
          'SELECT id FROM promotions WHERE level = $1 AND department_id = $2',
          [currentLevel, ltpDeptId]
        );
        let promoId;
        if (promoResult.rows.length > 0) {
          promoId = promoResult.rows[0].id;
        } else {
          const promoCode = `${currentLevel}_${ltpDeptId}`;
          await client.query('SAVEPOINT promo_save');
          try {
            const r = await client.query(
              "INSERT INTO promotions (code, name, level, department_id) VALUES ($1, $2, $3, $4) RETURNING id",
              [promoCode, `${currentLevel} LTP`, currentLevel, ltpDeptId]
            );
            promoId = r.rows[0].id;
            console.log(`   + Promotion ${currentLevel} LTP créée: id=${promoId}`);
            await client.query('RELEASE SAVEPOINT promo_save');
          } catch (e) {
            await client.query('ROLLBACK TO SAVEPOINT promo_save');
            const fallback = await client.query('SELECT id FROM promotions WHERE code = $1', [`${currentLevel}_${ltpDeptId}`]);
            promoId = fallback.rows[0]?.id;
          }
        }

        if (!promoId) continue;

        // Insert course
        await client.query('SAVEPOINT course_save');
        try {
          // Check if exists
          const existingCourse = await client.query(
            'SELECT id FROM courses WHERE code = $1 AND promotion_id = $2',
            [fullCode, promoId]
          );

          if (existingCourse.rows.length === 0) {
            await client.query(
              `INSERT INTO courses (code, name, credits, hours_cm, hours_tp, promotion_id, semester, course_type, is_active)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 'OBLIGATOIRE', TRUE)`,
              [fullCode, fullName, credits || 3, credits ? credits * 15 : 45, 0, promoId, currentSemester || 1]
            );
            coursesCreated++;
          } else {
            coursesSkipped++;
          }
          await client.query('RELEASE SAVEPOINT course_save');
        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT course_save');
          coursesSkipped++;
          if (coursesSkipped <= 5) {
            console.log(`   ⚠️  Skip cours ${fullCode}: ${e.message}`);
          }
        }
      }
    }
    console.log(`   ✅ Cours LTP créés: ${coursesCreated} | Existants: ${coursesSkipped}`);

    // ============================================
    // PART 4: Composition Jury de Délibération
    // ============================================
    console.log('\n📖 4. JURY DE DÉLIBÉRATION...');
    
    // Read from .doc file
    let juryText = '';
    try {
      const extractor = new WordExtractor();
      const doc = await extractor.extract(FILES.jury_doc);
      juryText = doc.getBody();
    } catch (e) {
      console.log(`   ⚠️  Impossible de lire le .doc: ${e.message}`);
      console.log('   → Utilisation des données codées en dur');
    }

    // Parse jury data (from doc + hardcoded from analysis)
    const juryData = [
      // PharmD
      { filiere: 'PharmD', level: 'B1', dept: 'PHARMACIE', president: 'KODONDO KULE KOTE', secretaire: 'MBINZE KINDENGE', membre: 'MANA KIALENGILA' },
      { filiere: 'PharmD', level: 'B2', dept: 'PHARMACIE', president: 'MPUZA KAPUNDU', secretaire: 'MUSUYU MUGANZA', membre: 'NDELO PATRICK' },
      { filiere: 'PharmD', level: 'B3', dept: 'PHARMACIE', president: 'MIEZI NSIMBA', secretaire: 'BUYA BANZENGA', membre: 'KAMBALE' },
      { filiere: 'PharmD', level: 'P1', dept: 'PHARMACIE', president: 'NDELO DI PHANZU', secretaire: 'KIMBENI MALOLO', membre: 'LAMI NZUNZU' },
      { filiere: 'PharmD', level: 'P2', dept: 'PHARMACIE', president: 'TONA DI LUTETE', secretaire: 'NSUADI MANGA', membre: 'MEMVANGA' },
      { filiere: 'PharmD', level: 'P3', dept: 'PHARMACIE', president: 'MESIA KAHUNU', secretaire: 'LIESSE IYAMBA', membre: 'LUSAKIBANZA MANZO' },
      // LTP
      { filiere: 'LTP', level: 'L1', dept: 'LTP', president: 'NSANGU MPASI', secretaire: 'SUAMI BUEYA', membre: 'MBENZA PUATI' },
      { filiere: 'LTP', level: 'L2', dept: 'LTP', president: 'ILANGALA', secretaire: 'TSHODI', membre: 'CT MAYANGI' },
      { filiere: 'LTP', level: 'L3', dept: 'LTP', president: 'CIZA AMULI', secretaire: 'MAMBANZULUA', membre: 'TSHISEKEDI' },
    ];

    // Get current academic year
    const ayResult = await client.query("SELECT id FROM academic_years WHERE is_current = true LIMIT 1");
    let ayId;
    if (ayResult.rows.length > 0) {
      ayId = ayResult.rows[0].id;
    } else {
      const fallback = await client.query("SELECT id FROM academic_years ORDER BY id DESC LIMIT 1");
      ayId = fallback.rows[0]?.id;
    }
    console.log(`   Année académique courante: id=${ayId}`);

    // Get pharma department (PHARMACIE)
    const pharmaDeptResult = await client.query(
      "SELECT id FROM departments WHERE UPPER(name) = 'PHARMACIE' AND faculty_id = $1",
      [pharmaFacId]
    );
    const pharmaDeptId = pharmaDeptResult.rows[0]?.id;

    let juriesCreated = 0;
    let membersCreated = 0;

    for (const jury of juryData) {
      const deptId = jury.dept === 'LTP' ? ltpDeptId : pharmaDeptId;
      if (!deptId) continue;

      // Find promotion
      const promoResult = await client.query(
        'SELECT id FROM promotions WHERE level = $1 AND department_id = $2',
        [jury.level, deptId]
      );
      if (promoResult.rows.length === 0) {
        console.log(`   ⚠️  Promotion ${jury.level} dept=${deptId} non trouvée`);
        continue;
      }
      const promoId = promoResult.rows[0].id;

      await client.query('SAVEPOINT jury_save');
      try {
        // Check if jury already exists
        const existingJury = await client.query(
          'SELECT id FROM deliberation_juries WHERE promotion_id = $1 AND academic_year_id = $2',
          [promoId, ayId]
        );

        let juryId;
        if (existingJury.rows.length > 0) {
          juryId = existingJury.rows[0].id;
          // Delete existing members to replace
          await client.query('DELETE FROM deliberation_jury_members WHERE jury_id = $1', [juryId]);
        } else {
          const r = await client.query(
            'INSERT INTO deliberation_juries (promotion_id, academic_year_id, filiere) VALUES ($1, $2, $3) RETURNING id',
            [promoId, ayId, jury.filiere]
          );
          juryId = r.rows[0].id;
          juriesCreated++;
        }

        // Add members
        const members = [
          { name: jury.president, role: 'PRESIDENT' },
          { name: jury.secretaire, role: 'SECRETAIRE' },
          { name: jury.membre, role: 'MEMBRE' },
        ];

        for (const m of members) {
          // Try to find teacher by last_name match
          const teacherLookup = await client.query(
            `SELECT t.id FROM teachers t JOIN users u ON t.user_id = u.id 
             WHERE UPPER(u.last_name) = $1 OR UPPER(CONCAT(u.last_name, ' ', u.first_name)) LIKE $2`,
            [m.name.split(' ')[0].toUpperCase(), '%' + m.name.split(' ')[0].toUpperCase() + '%']
          );

          await client.query(
            `INSERT INTO deliberation_jury_members (jury_id, teacher_id, teacher_name, role) 
             VALUES ($1, $2, $3, $4)`,
            [juryId, teacherLookup.rows[0]?.id || null, m.name, m.role]
          );
          membersCreated++;
        }
        await client.query('RELEASE SAVEPOINT jury_save');
      } catch (e) {
        await client.query('ROLLBACK TO SAVEPOINT jury_save');
        console.log(`   ⚠️  Jury ${jury.filiere} ${jury.level}: ${e.message}`);
      }
    }
    console.log(`   ✅ Jurys créés: ${juriesCreated} | Membres: ${membersCreated}`);

    // ============================================
    // PART 5: Critères de Délibération
    // ============================================
    console.log('\n📖 5. CRITÈRES DE DÉLIBÉRATION...');
    
    await client.query('SAVEPOINT criteria_save');
    try {
      const existingCriteria = await client.query(
        'SELECT id FROM deliberation_criteria WHERE faculty_id = $1 AND academic_year_id = $2',
        [pharmaFacId, ayId]
      );

      if (existingCriteria.rows.length > 0) {
        await client.query(
          `UPDATE deliberation_criteria SET
            min_average_pass = 10, min_average_pass_with_debt = 10,
            min_average_retake = 8, min_average_fail = 8,
            pct_credits_pass = 80, pct_credits_pass_with_debt = 60,
            pct_payment_for_results = 70,
            weight_tp = 30, weight_td = 0, weight_exam = 70,
            blocked_student_can_deliberate = FALSE,
            elimination_note = NULL, max_debt_courses = NULL,
            mentions_enabled = TRUE,
            threshold_distinction = 14, threshold_grande_distinction = 16,
            threshold_plus_grande_distinction = 18,
            updated_at = NOW()
          WHERE id = $1`,
          [existingCriteria.rows[0].id]
        );
        console.log('   ✅ Critères mis à jour');
      } else {
        await client.query(
          `INSERT INTO deliberation_criteria (
            faculty_id, academic_year_id,
            min_average_pass, min_average_pass_with_debt,
            min_average_retake, min_average_fail,
            pct_credits_pass, pct_credits_pass_with_debt,
            pct_payment_for_results,
            weight_tp, weight_td, weight_exam,
            blocked_student_can_deliberate,
            elimination_note, max_debt_courses,
            mentions_enabled,
            threshold_distinction, threshold_grande_distinction, threshold_plus_grande_distinction
          ) VALUES ($1, $2, 10, 10, 8, 8, 80, 60, 70, 30, 0, 70, FALSE, NULL, NULL, TRUE, 14, 16, 18)`,
          [pharmaFacId, ayId]
        );
        console.log('   ✅ Critères créés');
      }
      await client.query('RELEASE SAVEPOINT criteria_save');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT criteria_save');
      console.log(`   ⚠️  Critères: ${e.message}`);
    }

    // ============================================
    // COMMIT
    // ============================================
    await client.query('COMMIT');

    // ============================================
    // RÉSUMÉ FINAL
    // ============================================
    console.log('\n' + '='.repeat(55));
    console.log('✅ IMPORT INTÉGRÉ TERMINÉ');
    console.log('='.repeat(55));

    const stats = await client.query(`
      SELECT 
        (SELECT count(*) FROM teachers) as total_teachers,
        (SELECT count(*) FROM courses) as total_courses,
        (SELECT count(*) FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = $1) as pharma_courses,
        (SELECT count(*) FROM departments WHERE faculty_id = $1) as pharma_depts,
        (SELECT count(*) FROM promotions p JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = $1) as pharma_promos,
        (SELECT count(*) FROM deliberation_juries) as juries,
        (SELECT count(*) FROM deliberation_jury_members) as jury_members,
        (SELECT count(*) FROM deliberation_criteria) as criteria
    `, [pharmaFacId]);

    const s = stats.rows[0];
    console.log(`  Total enseignants:      ${s.total_teachers}`);
    console.log(`  Total cours:            ${s.total_courses}`);
    console.log(`  Cours Pharma:           ${s.pharma_courses}`);
    console.log(`  Départements Pharma:    ${s.pharma_depts}`);
    console.log(`  Promotions Pharma:      ${s.pharma_promos}`);
    console.log(`  Jurys de délibération:  ${s.juries}`);
    console.log(`  Membres de jurys:       ${s.jury_members}`);
    console.log(`  Critères délibération:  ${s.criteria}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERREUR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

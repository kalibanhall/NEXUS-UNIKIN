// ============================================================
// NEXUS UNIKIN - Importation des données Excel pour la Faculté de Pharmacie
// Ce script lit le fichier Excel rempli et importe dans la base de données
// ============================================================

const XLSX = require('xlsx');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

// Configuration DB (même que le reste du projet)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nexus_unikin',
  user: process.env.DB_USER || 'nexus_admin',
  password: process.env.DB_PASSWORD || 'NexusUnikin2026!',
});

const EXCEL_FILE = path.join(__dirname, '..', 'output', 'COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx');
const DEFAULT_PASSWORD = 'Nexus@2026';
const FACULTY_ID = 17; // Faculté des Sciences Pharmaceutiques

// Correspondance grades
const GRADES_MAP = {
  'ASSISTANT': 'ASSISTANT',
  'CHEF_TRAVAUX': 'CHEF_TRAVAUX',
  'CHEF DE TRAVAUX': 'CHEF_TRAVAUX',
  'PROFESSEUR_ASSOCIE': 'PROFESSEUR_ASSOCIE',
  'PROFESSEUR ASSOCIÉ': 'PROFESSEUR_ASSOCIE',
  'PROFESSEUR ASSOCIE': 'PROFESSEUR_ASSOCIE',
  'PROFESSEUR': 'PROFESSEUR', 
  'PROFESSEUR_ORDINAIRE': 'PROFESSEUR_ORDINAIRE',
  'PROFESSEUR ORDINAIRE': 'PROFESSEUR_ORDINAIRE',
};

// Correspondance départements
const DEPARTMENT_MAP = {
  'PHARMACIE': 38,
  'LICENCE ET TECHNIQUES PHARMACEUTIQUES': 107,
  'LTP': 107,
};

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  NEXUS UNIKIN — Import données Pharmacie depuis Excel   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Lire le fichier Excel
  let wb;
  try {
    wb = XLSX.readFile(EXCEL_FILE);
    console.log(`📄 Fichier Excel lu: ${EXCEL_FILE}`);
  } catch (e) {
    console.error(`❌ Impossible de lire le fichier: ${EXCEL_FILE}`);
    console.error(`   Assurez-vous que le fichier Excel rempli est dans output/`);
    process.exit(1);
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // ============================================
    // 1. IMPORTER LES ENSEIGNANTS
    // ============================================
    console.log('\n📋 1/6 — IMPORT DES ENSEIGNANTS');
    const wsEns = wb.Sheets['ENSEIGNANTS'];
    if (!wsEns) {
      console.log('   ⚠️ Feuille ENSEIGNANTS non trouvée, saut...');
    } else {
      const enseignants = XLSX.utils.sheet_to_json(wsEns, { defval: '' });
      let countTeachers = 0;
      const teacherMap = {}; // nom+prénom → teacher_id
      
      for (const row of enseignants) {
        const nom = (row['Nom de famille*'] || '').toString().trim();
        const prenom = (row['Prénom*'] || '').toString().trim();
        if (!nom || !prenom) continue; // Ligne vide
        if (nom === 'EXEMPLE') continue; // Exemples
        
        const postnom = (row['Post-nom'] || '').toString().trim();
        const sexe = (row['Sexe (M/F)*'] || 'M').toString().trim().toUpperCase();
        const matricule = (row['Matricule enseignant'] || '').toString().trim();
        const gradeRaw = (row[Object.keys(row).find(k => k.includes('Grade'))] || 'ASSISTANT').toString().trim().toUpperCase();
        const grade = GRADES_MAP[gradeRaw] || 'ASSISTANT';
        const deptRaw = (row[Object.keys(row).find(k => k.includes('Département'))] || 'Pharmacie').toString().trim().toUpperCase();
        const departmentId = DEPARTMENT_MAP[deptRaw] || 38;
        const specialisation = (row['Spécialisation'] || '').toString().trim();
        const phone = (row['Téléphone*'] || '').toString().trim();
        const email = (row['Email personnel'] || '').toString().trim();
        const dateEngagement = (row[Object.keys(row).find(k => k.includes('engagement'))] || '').toString().trim();
        const permanent = (row[Object.keys(row).find(k => k.includes('Permanent'))] || 'Oui').toString().trim().toLowerCase() === 'oui';
        const roleDelib = (row[Object.keys(row).find(k => k.includes('délibération'))] || '').toString().trim().toUpperCase();
        
        // Créer email si vide
        const emailFinal = email || `${prenom.toLowerCase().replace(/[^a-z]/g, '')}.${nom.toLowerCase().replace(/[^a-z]/g, '')}@unikin.ac.cd`;
        const matriculeFinal = matricule || `ENS-PHAR-${String(countTeachers + 1).padStart(3, '0')}`;
        
        // Vérifier si l'enseignant existe déjà
        const existCheck = await client.query(
          `SELECT u.id FROM users u 
           JOIN teachers t ON t.user_id = u.id 
           WHERE u.first_name = $1 AND u.last_name = $2 AND t.department_id = $3`,
          [prenom, nom, departmentId]
        );
        
        if (existCheck.rows.length > 0) {
          console.log(`   ⏭️ ${nom} ${prenom} existe déjà, saut...`);
          teacherMap[`${nom} ${prenom}`.toUpperCase()] = existCheck.rows[0].id;
          continue;
        }
        
        const hashedPwd = await hashPassword(DEFAULT_PASSWORD);
        
        // Créer utilisateur
        const userResult = await client.query(
          `INSERT INTO users (email, password, first_name, last_name, postnom, phone, role, is_active, account_activated, must_change_password)
           VALUES ($1, $2, $3, $4, $5, $6, 'TEACHER', true, true, true) RETURNING id`,
          [emailFinal, hashedPwd, prenom, nom, postnom || null, phone || null]
        );
        const userId = userResult.rows[0].id;
        
        // Parser date d'engagement
        let hireDate = '2020-10-01';
        if (dateEngagement) {
          const parts = dateEngagement.split('/');
          if (parts.length === 3) {
            hireDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        
        // Créer enseignant
        const teacherResult = await client.query(
          `INSERT INTO teachers (user_id, matricule, grade, specialization, department_id, hire_date, employment_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [userId, matriculeFinal, grade, specialisation || null, departmentId, hireDate, permanent ? 'PERMANENT' : 'CONTRACT']
        );
        
        teacherMap[`${nom} ${prenom}`.toUpperCase()] = teacherResult.rows[0].id;
        countTeachers++;
        console.log(`   ✅ ${nom} ${prenom} (${grade}, dept ${departmentId}) → Teacher ID: ${teacherResult.rows[0].id}`);
      }
      console.log(`   📊 Total enseignants importés: ${countTeachers}`);
    }

    // ============================================
    // 2. IMPORTER LES COURS
    // ============================================
    console.log('\n📋 2/6 — IMPORT DES COURS');
    const wsCours = wb.Sheets['COURS'];
    if (!wsCours) {
      console.log('   ⚠️ Feuille COURS non trouvée, saut...');
    } else {
      const cours = XLSX.utils.sheet_to_json(wsCours, { defval: '' });
      let countCourses = 0;
      
      // Charger les promotions de la faculté Pharmacie
      const promosResult = await client.query(
        `SELECT p.id, p.level, d.name as dept_name, d.id as dept_id 
         FROM promotions p 
         JOIN departments d ON p.department_id = d.id 
         WHERE d.faculty_id = $1`,
        [FACULTY_ID]
      );
      
      // Créer un index des promotions
      const promoIndex = {};
      for (const p of promosResult.rows) {
        // Créer plusieurs clés de recherche
        const key1 = `${p.level} ${p.dept_name}`.toUpperCase();
        const key2 = `${p.level} LMD ${p.dept_name}`.toUpperCase();
        promoIndex[key1] = p.id;
        promoIndex[key2] = p.id;
      }
      
      // Charger les enseignants existants
      const teachersResult = await client.query(
        `SELECT t.id, u.first_name, u.last_name 
         FROM teachers t JOIN users u ON t.user_id = u.id 
         JOIN departments d ON t.department_id = d.id 
         WHERE d.faculty_id = $1`,
        [FACULTY_ID]
      );
      const teacherIndex = {};
      for (const t of teachersResult.rows) {
        teacherIndex[`${t.last_name} ${t.first_name}`.toUpperCase()] = t.id;
        teacherIndex[`${t.first_name} ${t.last_name}`.toUpperCase()] = t.id;
      }
      
      for (const row of cours) {
        const code = (row[Object.keys(row).find(k => k.includes('Code'))] || '').toString().trim();
        const intitule = (row[Object.keys(row).find(k => k.includes('Intitulé') || k.includes('ntitul'))] || '').toString().trim();
        if (!code || !intitule) continue;
        if (code === 'PHAR101' || code === 'PHAR102') continue; // Exemples
        
        const promoName = (row[Object.keys(row).find(k => k.includes('Promotion'))] || '').toString().trim().toUpperCase();
        const semestre = parseInt(row[Object.keys(row).find(k => k.includes('Semestre'))] || '1') || 1;
        const credits = parseInt(row[Object.keys(row).find(k => k.includes('Crédits') || k.includes('dits'))] || '3') || 3;
        const heuresCM = parseInt(row[Object.keys(row).find(k => k.includes('CM'))] || '0') || 0;
        const heuresTD = parseInt(row[Object.keys(row).find(k => k.includes('TD'))] || '0') || 0;
        const heuresTP = parseInt(row[Object.keys(row).find(k => k.includes('TP') && !k.includes('Type'))] || '0') || 0;
        const enseignantName = (row[Object.keys(row).find(k => k.includes('Enseignant') || k.includes('titulaire'))] || '').toString().trim().toUpperCase();
        const typeRaw = (row[Object.keys(row).find(k => k.includes('Type'))] || 'OBLIGATOIRE').toString().trim().toUpperCase();
        const courseType = typeRaw === 'OPTIONNEL' ? 'OPTIONNEL' : 'OBLIGATOIRE';
        
        // Chercher la promotion
        let promotionId = null;
        for (const [key, id] of Object.entries(promoIndex)) {
          if (promoName.includes(key) || key.includes(promoName)) {
            promotionId = id;
            break;
          }
        }
        
        if (!promotionId) {
          // Essayer une recherche plus souple
          const promoResult = await client.query(
            `SELECT p.id FROM promotions p 
             JOIN departments d ON p.department_id = d.id 
             WHERE d.faculty_id = $1 AND UPPER(p.level || ' ' || d.name) LIKE $2`,
            [FACULTY_ID, `%${promoName.substring(0, 10)}%`]
          );
          if (promoResult.rows.length > 0) {
            promotionId = promoResult.rows[0].id;
          } else {
            console.log(`   ⚠️ Promotion non trouvée pour "${promoName}", cours "${code}" ignoré`);
            continue;
          }
        }
        
        // Chercher l'enseignant
        const teacherId = teacherIndex[enseignantName] || null;
        
        // Vérifier si le cours existe déjà
        const existCheck = await client.query(
          `SELECT id FROM courses WHERE code = $1 AND promotion_id = $2`,
          [code, promotionId]
        );
        
        if (existCheck.rows.length > 0) {
          console.log(`   ⏭️ Cours ${code} existe déjà pour cette promotion, saut...`);
          continue;
        }
        
        await client.query(
          `INSERT INTO courses (code, name, description, credits, hours_cm, hours_td, hours_tp, promotion_id, teacher_id, semester, course_type, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`,
          [code, intitule, `Cours de ${intitule}`, credits, heuresCM, heuresTD, heuresTP, promotionId, teacherId, semestre, courseType]
        );
        
        countCourses++;
        console.log(`   ✅ ${code} - ${intitule} (S${semestre}, ${credits} crédits) → Promo ${promotionId}`);
      }
      console.log(`   📊 Total cours importés: ${countCourses}`);
    }

    // ============================================
    // 3. IMPORTER LE JURY DE DÉLIBÉRATION
    // ============================================
    console.log('\n📋 3/6 — IMPORT DU JURY DE DÉLIBÉRATION');
    const wsJury = wb.Sheets['JURY DÉLIBÉRATION'];
    if (!wsJury) {
      console.log('   ⚠️ Feuille JURY DÉLIBÉRATION non trouvée, saut...');
    } else {
      const jury = XLSX.utils.sheet_to_json(wsJury, { defval: '' });
      let countJury = 0;
      
      for (const row of jury) {
        const nom = (row['Nom de famille*'] || '').toString().trim();
        const prenom = (row['Prénom*'] || '').toString().trim();
        if (!nom || !prenom) continue;
        
        const roleRaw = (row[Object.keys(row).find(k => k.includes('Rôle'))] || 'MEMBRE').toString().trim().toUpperCase();
        let role = 'MEMBER';
        if (roleRaw.includes('PRESIDENT')) role = 'PRESIDENT';
        else if (roleRaw.includes('SECRETAIRE')) role = 'SECRETARY';
        
        // Chercher l'enseignant dans la base
        const teacherResult = await client.query(
          `SELECT t.id FROM teachers t JOIN users u ON t.user_id = u.id 
           WHERE UPPER(u.last_name) = $1 AND UPPER(u.first_name) = $2`,
          [nom.toUpperCase(), prenom.toUpperCase()]
        );
        
        if (teacherResult.rows.length === 0) {
          console.log(`   ⚠️ Enseignant ${nom} ${prenom} non trouvé en base, sera ajouté une fois importé`);
          continue;
        }
        
        const teacherId = teacherResult.rows[0].id;
        
        // Vérifier s'il y a une délibération en cours, sinon en créer une
        let deliberationId;
        const delibResult = await client.query(
          `SELECT id FROM deliberations WHERE academic_year_id = (SELECT id FROM academic_years WHERE is_current = true LIMIT 1) 
           AND status = 'DRAFT' LIMIT 1`
        );
        
        if (delibResult.rows.length === 0) {
          // Créer une délibération préliminaire
          const yearResult = await client.query(`SELECT id FROM academic_years WHERE is_current = true LIMIT 1`);
          if (yearResult.rows.length > 0) {
            const newDelib = await client.query(
              `INSERT INTO deliberations (academic_year_id, session_type, status, faculty_id) 
               VALUES ($1, 'NORMAL', 'DRAFT', $2) RETURNING id`,
              [yearResult.rows[0].id, FACULTY_ID]
            );
            deliberationId = newDelib.rows[0].id;
          }
        } else {
          deliberationId = delibResult.rows[0].id;
        }
        
        if (deliberationId) {
          await client.query(
            `INSERT INTO jury_members (deliberation_id, teacher_id, role) 
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [deliberationId, teacherId, role]
          );
          countJury++;
          console.log(`   ✅ ${nom} ${prenom} → ${role}`);
        }
      }
      console.log(`   📊 Total membres du jury: ${countJury}`);
    }

    // ============================================
    // 4. IMPORTER LES EMPLOYÉS
    // ============================================
    console.log('\n📋 4/6 — IMPORT DES EMPLOYÉS ADMINISTRATIFS');
    const wsEmpl = wb.Sheets['EMPLOYÉS ADMINISTRATIFS'];
    if (!wsEmpl) {
      console.log('   ⚠️ Feuille EMPLOYÉS ADMINISTRATIFS non trouvée, saut...');
    } else {
      const employes = XLSX.utils.sheet_to_json(wsEmpl, { defval: '' });
      let countEmployees = 0;
      
      for (const row of employes) {
        const nom = (row['Nom de famille*'] || '').toString().trim();
        const prenom = (row['Prénom*'] || '').toString().trim();
        if (!nom || !prenom) continue;
        
        const postnom = (row['Post-nom'] || '').toString().trim();
        const sexe = (row[Object.keys(row).find(k => k.includes('Sexe'))] || 'M').toString().trim();
        const poste = (row[Object.keys(row).find(k => k.includes('Fonction') || k.includes('Poste'))] || '').toString().trim();
        const service = (row[Object.keys(row).find(k => k.includes('Service'))] || '').toString().trim();
        const phone = (row['Téléphone*'] || '').toString().trim();
        const email = (row['Email'] || '').toString().trim();
        const contractType = (row[Object.keys(row).find(k => k.includes('contrat'))] || 'PERMANENT').toString().trim().toUpperCase();
        
        const emailFinal = email || `${prenom.toLowerCase().replace(/[^a-z]/g, '')}.${nom.toLowerCase().replace(/[^a-z]/g, '')}.emp@unikin.ac.cd`;
        const hashedPwd = await hashPassword(DEFAULT_PASSWORD);
        
        // Vérifier si existe
        const existCheck = await client.query(
          `SELECT id FROM users WHERE first_name = $1 AND last_name = $2 AND role = 'EMPLOYEE'`,
          [prenom, nom]
        );
        
        if (existCheck.rows.length > 0) {
          console.log(`   ⏭️ ${nom} ${prenom} existe déjà, saut...`);
          continue;
        }
        
        const userResult = await client.query(
          `INSERT INTO users (email, password, first_name, last_name, postnom, phone, role, is_active, account_activated, must_change_password)
           VALUES ($1, $2, $3, $4, $5, $6, 'EMPLOYEE', true, true, true) RETURNING id`,
          [emailFinal, hashedPwd, prenom, nom, postnom || null, phone || null]
        );
        
        // Créer entrée employée si table existe
        try {
          await client.query(
            `INSERT INTO employees (user_id, position, service, department_id, employment_type)
             VALUES ($1, $2, $3, $4, $5)`,
            [userResult.rows[0].id, poste || 'Agent administratif', service || 'Administration', 38, contractType === 'TEMPORARY' ? 'TEMPORARY' : contractType === 'CONTRACT' ? 'CONTRACT' : 'PERMANENT']
          );
        } catch (e) {
          // Table employees n'existe peut-être pas encore
          console.log(`   ⚠️ Table employees non trouvée, utilisateur créé sans entrée employee`);
        }
        
        countEmployees++;
        console.log(`   ✅ ${nom} ${prenom} (${poste || 'Agent'})`);
      }
      console.log(`   📊 Total employés importés: ${countEmployees}`);
    }

    // ============================================
    // 5. IMPORTER LES NOTES (si disponibles)
    // ============================================
    console.log('\n📋 5/6 — IMPORT DES NOTES');
    const wsNotes = wb.Sheets['NOTES (si disponibles)'];
    if (!wsNotes) {
      console.log('   ⚠️ Feuille NOTES non trouvée, saut...');
    } else {
      const notes = XLSX.utils.sheet_to_json(wsNotes, { defval: '' });
      let countGrades = 0;
      
      for (const row of notes) {
        const matricule = (row['Matricule étudiant*'] || '').toString().trim();
        const codeCours = (row['Code du cours*'] || '').toString().trim();
        if (!matricule || !codeCours) continue;
        if (matricule === '2201773') continue; // Exemple
        
        const noteTP = parseFloat(row[Object.keys(row).find(k => k.includes('Note TP'))] || '') || null;
        const noteExam = parseFloat(row[Object.keys(row).find(k => k.includes('Examen'))] || '') || null;
        const annee = (row[Object.keys(row).find(k => k.includes('académique'))] || '2025-2026').toString().trim();
        const semester = parseInt(row[Object.keys(row).find(k => k.includes('Semestre'))] || '1') || 1;
        
        if (noteTP === null && noteExam === null) continue;
        
        // Trouver l'étudiant
        const studentResult = await client.query(
          `SELECT s.id FROM students s WHERE s.matricule = $1`,
          [matricule]
        );
        if (studentResult.rows.length === 0) {
          console.log(`   ⚠️ Étudiant ${matricule} non trouvé, note ignorée`);
          continue;
        }
        
        // Trouver le cours
        const courseResult = await client.query(
          `SELECT c.id FROM courses c WHERE c.code = $1 LIMIT 1`,
          [codeCours]
        );
        if (courseResult.rows.length === 0) {
          console.log(`   ⚠️ Cours ${codeCours} non trouvé, note ignorée`);
          continue;
        }
        
        // Trouver l'année académique
        const yearResult = await client.query(
          `SELECT id FROM academic_years WHERE name = $1 LIMIT 1`,
          [annee]
        );
        const academicYearId = yearResult.rows.length > 0 ? yearResult.rows[0].id : null;
        
        // Calculer la note finale
        const tp = noteTP || 0;
        const exam = noteExam || 0;
        const finalScore = Math.round((tp * 0.3 + exam * 0.7) * 100) / 100;
        
        // Déterminer la cote
        let gradeLetter = 'E';
        if (finalScore >= 16) gradeLetter = 'A';
        else if (finalScore >= 14) gradeLetter = 'B';
        else if (finalScore >= 12) gradeLetter = 'C';
        else if (finalScore >= 10) gradeLetter = 'D';
        
        await client.query(
          `INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, exam_score, final_score, grade, semester, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'VALIDATED')
           ON CONFLICT (student_id, course_id, academic_year_id) 
           DO UPDATE SET tp_score = $4, exam_score = $5, final_score = $6, grade = $7`,
          [studentResult.rows[0].id, courseResult.rows[0].id, academicYearId, noteTP, noteExam, finalScore, gradeLetter, semester]
        );
        
        countGrades++;
      }
      console.log(`   📊 Total notes importées: ${countGrades}`);
    }

    // ============================================
    // 6. INSCRIPTION AUTOMATIQUE DES ÉTUDIANTS AUX COURS
    // ============================================
    console.log('\n📋 6/6 — INSCRIPTION DES ÉTUDIANTS AUX COURS DE LEUR PROMOTION');
    
    const coursesCreated = await client.query(
      `SELECT c.id as course_id, c.code, c.name, c.promotion_id 
       FROM courses c 
       JOIN promotions p ON c.promotion_id = p.id 
       JOIN departments d ON p.department_id = d.id 
       WHERE d.faculty_id = $1`,
      [FACULTY_ID]
    );
    
    let countEnrollments = 0;
    for (const course of coursesCreated.rows) {
      // Trouver tous les étudiants de cette promotion
      const students = await client.query(
        `SELECT e.student_id 
         FROM enrollments e 
         WHERE e.promotion_id = $1 
         AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_current = true LIMIT 1)`,
        [course.promotion_id]
      );
      
      for (const student of students.rows) {
        try {
          await client.query(
            `INSERT INTO course_enrollments (student_id, course_id, academic_year_id, status)
             VALUES ($1, $2, (SELECT id FROM academic_years WHERE is_current = true LIMIT 1), 'ACTIVE')
             ON CONFLICT DO NOTHING`,
            [student.student_id, course.course_id]
          );
          countEnrollments++;
        } catch (e) {
          // Table course_enrollments n'existe peut-être pas
          if (e.message.includes('course_enrollments')) {
            console.log('   ⚠️ Table course_enrollments non trouvée');
            break;
          }
        }
      }
    }
    console.log(`   📊 Total inscriptions cours: ${countEnrollments}`);

    await client.query('COMMIT');
    
    // ============================================
    // RÉSUMÉ FINAL
    // ============================================
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    RÉSUMÉ DE L\'IMPORT                    ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    
    // Compter les résultats
    const stats = {};
    const statsQueries = [
      { label: 'Enseignants (Pharmacie)', query: `SELECT COUNT(*) FROM teachers t JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = ${FACULTY_ID}` },
      { label: 'Cours (Pharmacie)', query: `SELECT COUNT(*) FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = ${FACULTY_ID}` },
      { label: 'Notes (Pharmacie)', query: `SELECT COUNT(*) FROM grades g JOIN courses c ON g.course_id = c.id JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = ${FACULTY_ID}` },
      { label: 'Étudiants (Pharmacie)', query: `SELECT COUNT(DISTINCT s.id) FROM students s JOIN enrollments e ON s.id = e.student_id JOIN promotions p ON e.promotion_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = ${FACULTY_ID}` },
    ];
    
    for (const s of statsQueries) {
      try {
        const r = await client.query(s.query);
        console.log(`║  ${s.label.padEnd(30)} : ${r.rows[0].count.toString().padStart(6)}   ║`);
      } catch (e) {
        console.log(`║  ${s.label.padEnd(30)} : erreur   ║`);
      }
    }
    
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  Mot de passe par défaut: Nexus@2026                    ║');
    console.log('║  Les utilisateurs devront le changer à la 1ère connexion║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERREUR lors de l\'import:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);

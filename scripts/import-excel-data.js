/**
 * NEXUS UNIKIN - Script d'importation des données Excel
 * Importe les étudiants, facultés, départements, promotions et paiements
 * depuis le fichier "Donnees Chris.xlsx"
 * 
 * Usage: node scripts/import-excel-data.js [chemin_excel] [db_url]
 */

const XLSX = require('xlsx');
const { Pool } = require('pg');

// ============================================
// CONFIGURATION
// ============================================
const EXCEL_PATH = process.argv[2] || 'c:\\Users\\kason\\Downloads\\Donnees Chris.xlsx';
const DB_URL = process.argv[3] || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexus_unikin';

const pool = new Pool({ connectionString: DB_URL });

// ============================================
// MAPPING FACULTÉS (Excel → Code)
// ============================================
const FACULTY_MAP = {
  'DROIT': { code: 'FDROIT', name: 'Faculté de Droit' },
  'ECOLE DES SCIENCES DE LA POPULATION ET DEVELOPPEMENT': { code: 'ESPD', name: 'École des Sciences de la Population et du Développement' },
  'LETTRES ET SCIENCES HUMAINES': { code: 'FLSH', name: 'Faculté des Lettres et Sciences Humaines' },
  'MEDECINE': { code: 'FMED', name: 'Faculté de Médecine' },
  'MEDECINE DENTAIRE': { code: 'FMEDD', name: 'Faculté de Médecine Dentaire' },
  'MEDECINE VETERINAIRE': { code: 'FMEDV', name: 'Faculté de Médecine Vétérinaire' },
  'PETROLE, GAZ ET ENERGIES RENOUVELABLES': { code: 'FPGER', name: 'Faculté de Pétrole, Gaz et Énergies Renouvelables' },
  'POLYTECHNIQUE': { code: 'FPOLY', name: 'Faculté Polytechnique' },
  'PSYCHOLOGIE ET SCIENCES DE L\'EDUCATION': { code: 'FPSE', name: 'Faculté de Psychologie et Sciences de l\'Éducation' },
  'SCIENCES AGRONOMIQUES ET ENVOIRONNEMENT': { code: 'FSAE', name: 'Faculté des Sciences Agronomiques et Environnement' },
  'SCIENCES ECONOMIQUES ET DE GESTION': { code: 'FSEG', name: 'Faculté des Sciences Économiques et de Gestion' },
  'SCIENCES ET TECHNOLOGIES': { code: 'FST', name: 'Faculté des Sciences et Technologies' },
  'SCIENCES PHARMACEUTIQUES': { code: 'FSPHAR', name: 'Faculté des Sciences Pharmaceutiques' },
  'SCIENCES SOCIALES ADMINISTRATIVES ET POLITIQUES': { code: 'FSSAP', name: 'Faculté des Sciences Sociales, Administratives et Politiques' },
};

// ============================================
// MAPPING NIVEAUX (Excel → DB level)
// ============================================
function parseLevel(promoStr) {
  if (!promoStr) return 'OTHER';
  const s = promoStr.toUpperCase().trim();
  
  // Direct matches
  const directMap = {
    'L0': 'L0', 'L1': 'L1', 'L1 LMD': 'L1', 'L2': 'L2', 'L2 LMD': 'L2', 'L3 LMD': 'L3',
    'M1': 'M1', 'M2': 'M2', 'M3': 'M3', 'MASTER2': 'M2',
    'D1': 'D1', 'D2': 'D2', 'D3': 'D3', 'D4': 'D4',
    'B1': 'B1', 'B2': 'B2', 'B3': 'B3',
    'G2': 'G2', 'G3': 'G3', 'GRADE1': 'GRADE1', 'GRADE2': 'GRADE2',
    'IR1': 'IR1', 'IR2': 'IR2',
    'P1': 'P1', 'P2': 'P2', 'P3': 'P3',
    'DP': 'DP', 'PREPARATOIRE': 'PREP', 'PRÉPO': 'PREP',
    'LICNECE-SPECIALE': 'LS',
    'DEUXIEME': 'L2', 'DEUXIEME EPREUVE': 'L2', 'PREMIERE EPREUVE': 'L1',
    'LETTRES': 'L1', 'MEDECINE': 'D1',
  };
  
  for (const [key, val] of Object.entries(directMap)) {
    if (s === key || s.startsWith(key + ' ')) return val;
  }
  
  // Pattern matching
  if (s.includes('L1') || s.includes('L1 LMD')) return 'L1';
  if (s.includes('L2') || s.includes('L2 LMD')) return 'L2';
  if (s.includes('L3') || s.includes('L3 LMD')) return 'L3';
  if (s.includes('M1')) return 'M1';
  if (s.includes('M2') || s.includes('MASTER2')) return 'M2';
  if (s.includes('D1')) return 'D1';
  if (s.includes('B1')) return 'B1';
  if (s.includes('B2')) return 'B2';
  if (s.includes('B3')) return 'B3';
  if (s.includes('G2')) return 'G2';
  if (s.includes('G3')) return 'G3';
  
  return 'OTHER';
}

// ============================================
// PARSER NOM COMPLET → NOM, POSTNOM, PRENOM
// ============================================
function parseName(nom, postnom, prenom) {
  // Sheets 2 et 3 ont le nom complet dans NOM, POSTNOM et PRENOM sont null
  if (!postnom && !prenom && nom) {
    const parts = nom.trim().split(/\s+/);
    if (parts.length >= 3) {
      return {
        last_name: parts[0],
        postnom: parts[1],
        first_name: parts.slice(2).join(' ')
      };
    } else if (parts.length === 2) {
      return { last_name: parts[0], postnom: null, first_name: parts[1] };
    } else {
      return { last_name: parts[0], postnom: null, first_name: parts[0] };
    }
  }
  return {
    last_name: (nom || '').trim(),
    postnom: (postnom || '').trim() || null,
    first_name: (prenom || '').trim() || (nom || '').trim()
  };
}

// ============================================
// MAPPER MOTIF DE PAIEMENT → payment_type
// ============================================
function mapPaymentType(motif) {
  if (!motif) return 'AUTRES';
  const m = motif.toUpperCase();
  if (m.includes('INSCRIPTION') || m.includes('FORMULAIRE')) return 'FRAIS_INSCRIPTION';
  if (m.includes('REINSCRIPTION')) return 'FRAIS_REINSCRIPTION';
  if (m.includes('LOGEMENT')) return 'FRAIS_LOGEMENT';
  if (m.includes('TOTALITE') && m.includes('ETRANGER')) return 'FRAIS_ACADEMIQUES_ETRANGER';
  if (m.includes('SOLDE') && m.includes('ETRANGER')) return 'FRAIS_ACADEMIQUES_ETRANGER';
  if (m.includes('ACOMPTE') && m.includes('ETRANGER')) return 'FRAIS_ACADEMIQUES_ETRANGER';
  if (m.includes('TOTALITE')) return 'FRAIS_ACADEMIQUES_TOTALITE';
  if (m.includes('ACOMPTE')) return 'FRAIS_ACADEMIQUES_ACOMPTE';
  if (m.includes('SOLDE')) return 'FRAIS_ACADEMIQUES_SOLDE';
  if (m.includes('ACADEMIQUE')) return 'FRAIS_ACADEMIQUES';
  return 'AUTRES';
}

// ============================================
// NORMALISER MATRICULE
// ============================================
function normalizeMatricule(mat) {
  if (!mat) return null;
  return String(mat).trim().toUpperCase();
}

// ============================================
// MAIN IMPORT
// ============================================
async function main() {
  console.log('=== NEXUS UNIKIN - Importation Excel ===');
  console.log('Fichier:', EXCEL_PATH);
  console.log('Base de données:', DB_URL.replace(/:[^:@]+@/, ':***@'));
  console.log('');

  const client = await pool.connect();

  try {
    // Lire le fichier Excel
    console.log('📖 Lecture du fichier Excel...');
    const wb = XLSX.readFile(EXCEL_PATH);
    
    const sheet1 = XLSX.utils.sheet_to_json(wb.Sheets['Frais 2024 2025'], { header: 1 }).slice(2);
    const sheet2 = XLSX.utils.sheet_to_json(wb.Sheets['FRais 2025-2026'], { header: 1 }).slice(2);
    const sheet3 = XLSX.utils.sheet_to_json(wb.Sheets['inscription 2025 2026'], { header: 1 }).slice(2);

    console.log(`  Frais 2024-2025: ${sheet1.length} lignes`);
    console.log(`  Frais 2025-2026: ${sheet2.length} lignes`);
    console.log(`  Inscriptions 2025-2026: ${sheet3.length} lignes`);

    // Collecter tous les étudiants uniques (par matricule)
    console.log('\n📊 Collecte des données uniques...');
    const allRows = [
      ...sheet1.map(r => ({ ...rowToObj(r), sheet: 'frais_2024' })),
      ...sheet2.map(r => ({ ...rowToObj(r), sheet: 'frais_2025' })),
      ...sheet3.map(r => ({ ...rowToObj(r), sheet: 'inscription_2025' })),
    ].filter(r => r.matricule);

    // Étudiants uniques par matricule
    const studentMap = new Map();
    const faculties = new Set();
    const departments = new Map(); // dept → faculty
    const promotionSet = new Map(); // "level|dept|faculty" → promo info

    for (const row of allRows) {
      const mat = normalizeMatricule(row.matricule);
      if (!mat) continue;

      if (row.faculte) faculties.add(row.faculte.toUpperCase().trim());

      const dept = (row.departement || '').trim();
      const fac = (row.faculte || '').trim().toUpperCase();
      if (dept && fac) departments.set(dept.toUpperCase(), fac);

      const level = parseLevel(row.promotion);
      const promoKey = `${level}|${dept.toUpperCase()}|${fac}`;
      if (!promotionSet.has(promoKey) && dept) {
        promotionSet.set(promoKey, {
          level,
          department: dept,
          faculty: fac,
          code_promotion: row.code_promotion || '',
          promotion_raw: row.promotion || ''
        });
      }

      // Prendre les infos les plus récentes pour chaque étudiant
      if (!studentMap.has(mat) || row.sheet === 'inscription_2025') {
        const names = parseName(row.nom, row.postnom, row.prenom);
        studentMap.set(mat, {
          matricule: mat,
          ...names,
          sexe: row.sexe || (studentMap.has(mat) ? studentMap.get(mat).sexe : null),
          faculte: fac || (studentMap.has(mat) ? studentMap.get(mat).faculte : ''),
          departement: dept || (studentMap.has(mat) ? studentMap.get(mat).departement : ''),
          promotion: row.promotion || (studentMap.has(mat) ? studentMap.get(mat).promotion : ''),
          option: row.option || (studentMap.has(mat) ? studentMap.get(mat).option : ''),
          code_promotion: row.code_promotion || '',
        });
      }
    }

    console.log(`  Étudiants uniques: ${studentMap.size}`);
    console.log(`  Facultés: ${faculties.size}`);
    console.log(`  Départements: ${departments.size}`);
    console.log(`  Promotions: ${promotionSet.size}`);

    // ============================================
    // BEGIN TRANSACTION
    // ============================================
    await client.query('BEGIN');

    // ============================================
    // 1. FACULTÉS
    // ============================================
    console.log('\n🏛️  Import des facultés...');
    const facultyIds = {};
    
    for (const facName of faculties) {
      const mapping = FACULTY_MAP[facName];
      if (!mapping) {
        console.log(`  ⚠️  Faculté inconnue: "${facName}"`);
        continue;
      }

      const existing = await client.query('SELECT id FROM faculties WHERE code = $1', [mapping.code]);
      if (existing.rows.length > 0) {
        facultyIds[facName] = existing.rows[0].id;
        // Update name if different
        await client.query('UPDATE faculties SET name = $1 WHERE id = $2', [mapping.name, existing.rows[0].id]);
      } else {
        const result = await client.query(
          'INSERT INTO faculties (code, name) VALUES ($1, $2) RETURNING id',
          [mapping.code, mapping.name]
        );
        facultyIds[facName] = result.rows[0].id;
      }
    }
    console.log(`  ✅ ${Object.keys(facultyIds).length} facultés`);

    // ============================================
    // 2. DÉPARTEMENTS
    // ============================================
    console.log('\n📚 Import des départements...');
    const deptIds = {};
    let deptCounter = 0;

    for (const [deptName, facName] of departments) {
      const facId = facultyIds[facName];
      if (!facId) continue;

      deptCounter++;
      const deptCode = 'D' + deptCounter + '_' + facId;
      const deptNameClean = deptName.charAt(0) + deptName.slice(1).toLowerCase();

      const existing = await client.query(
        'SELECT id FROM departments WHERE UPPER(name) = $1 AND faculty_id = $2',
        [deptName, facId]
      );

      if (existing.rows.length > 0) {
        deptIds[deptName] = existing.rows[0].id;
      } else {
        await client.query('SAVEPOINT dept_save');
        try {
          const result = await client.query(
            'INSERT INTO departments (code, name, faculty_id) VALUES ($1, $2, $3) RETURNING id',
            [deptCode, deptNameClean, facId]
          );
          deptIds[deptName] = result.rows[0].id;
          await client.query('RELEASE SAVEPOINT dept_save');
        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT dept_save');
          console.log(`  ⚠️  Dept skip: ${deptNameClean} - ${e.message}`);
        }
      }
    }
    console.log(`  ✅ ${Object.keys(deptIds).length} départements`);

    // ============================================
    // 3. PROMOTIONS
    // ============================================
    console.log('\n🎓 Import des promotions...');
    const promoIds = {};

    for (const [key, info] of promotionSet) {
      const deptId = deptIds[info.department.toUpperCase()];
      if (!deptId) continue;

      const promoName = `${info.promotion_raw || info.level} ${info.department}`.substring(0, 255);
      const promoCode = `${info.level}_${deptId}`;

      const existing = await client.query(
        'SELECT id FROM promotions WHERE level = $1 AND department_id = $2',
        [info.level, deptId]
      );

      if (existing.rows.length > 0) {
        promoIds[key] = existing.rows[0].id;
      } else {
        await client.query('SAVEPOINT promo_save');
        try {
          const result = await client.query(
            'INSERT INTO promotions (code, name, level, department_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [promoCode, promoName, info.level, deptId]
          );
          promoIds[key] = result.rows[0].id;
          await client.query('RELEASE SAVEPOINT promo_save');
        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT promo_save');
          // Try to find by code
          const byCode = await client.query('SELECT id FROM promotions WHERE code = $1', [promoCode]);
          if (byCode.rows.length > 0) promoIds[key] = byCode.rows[0].id;
        }
      }
    }
    console.log(`  ✅ ${Object.keys(promoIds).length} promotions`);

    // ============================================
    // 4. ÉTUDIANTS (users + students)
    // ============================================
    console.log('\n👨‍🎓 Import des étudiants...');
    let studentsCreated = 0;
    let studentsUpdated = 0;
    let studentsSkipped = 0;
    const studentDbIds = {}; // matricule → student.id

    const BATCH_SIZE = 500;
    const studentEntries = [...studentMap.entries()];

    for (let i = 0; i < studentEntries.length; i += BATCH_SIZE) {
      const batch = studentEntries.slice(i, i + BATCH_SIZE);
      
      for (const [mat, info] of batch) {
        await client.query('SAVEPOINT student_save');
        try {
          // Trouver la promotion ID
          const level = parseLevel(info.promotion);
          const promoKey = `${level}|${info.departement.toUpperCase()}|${info.faculte}`;
          const promoId = promoIds[promoKey] || null;

          // Check si l'étudiant existe déjà
          const existingStudent = await client.query(
            'SELECT s.id, s.user_id FROM students s WHERE s.matricule = $1',
            [mat]
          );

          if (existingStudent.rows.length > 0) {
            // Update student info
            studentDbIds[mat] = existingStudent.rows[0].id;
            if (promoId) {
              await client.query(
                'UPDATE students SET promotion_id = $1, option_name = $2, code_promotion = $3, gender = $4 WHERE id = $5',
                [promoId, info.option || null, info.code_promotion || null, info.sexe || null, existingStudent.rows[0].id]
              );
            }
            // Update user postnom
            await client.query(
              'UPDATE users SET postnom = $1 WHERE id = $2 AND postnom IS NULL',
              [info.postnom, existingStudent.rows[0].user_id]
            );
            studentsUpdated++;
            await client.query('RELEASE SAVEPOINT student_save');
            continue;
          }

          // Check si user avec ce matricule email existe
          const email = `${mat.replace(/\s+/g, '')}@unikin.ac.cd`;
          const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);

          let userId;
          if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
          } else {
            // Créer le user (sans mot de passe, compte non activé)
            const userResult = await client.query(
              `INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password) 
               VALUES ($1, NULL, $2, $3, $4, 'STUDENT', TRUE, FALSE, TRUE) RETURNING id`,
              [email, info.first_name || 'N/A', info.last_name || 'N/A', info.postnom]
            );
            userId = userResult.rows[0].id;
          }

          // Créer le student
          const studentResult = await client.query(
            `INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, status, gender, option_name, code_promotion) 
             VALUES ($1, $2, $3, CURRENT_DATE, 'ACTIVE', $4, $5, $6) RETURNING id`,
            [userId, mat, promoId, info.sexe || null, info.option || null, info.code_promotion || null]
          );
          studentDbIds[mat] = studentResult.rows[0].id;
          studentsCreated++;
          await client.query('RELEASE SAVEPOINT student_save');

        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT student_save');
          studentsSkipped++;
          if (studentsSkipped <= 10) {
            console.log(`  ⚠️  Skip ${mat}: ${e.message}`);
          }
        }
      }

      process.stdout.write(`\r  Progression: ${Math.min(i + BATCH_SIZE, studentEntries.length)}/${studentEntries.length}`);
    }
    console.log(`\n  ✅ Créés: ${studentsCreated} | Mis à jour: ${studentsUpdated} | Skippés: ${studentsSkipped}`);

    // ============================================
    // 5. PAIEMENTS
    // ============================================
    console.log('\n💰 Import des paiements...');
    let paymentsCreated = 0;
    let paymentsSkipped = 0;

    // Récupérer les academic_year IDs
    const ayRows = await client.query('SELECT id, name FROM academic_years');
    const ayIds = {};
    for (const ay of ayRows.rows) {
      ayIds[ay.name] = ay.id;
    }

    // Traiter les 3 sheets
    const paymentSheets = [
      { data: sheet1, ayName: '2024-2025', label: 'Frais 2024-2025' },
      { data: sheet2, ayName: '2025-2026', label: 'Frais 2025-2026' },
      { data: sheet3, ayName: '2025-2026', label: 'Inscriptions 2025-2026' },
    ];

    for (const { data, ayName, label } of paymentSheets) {
      console.log(`  📋 ${label}...`);
      const ayId = ayIds[ayName];
      if (!ayId) {
        console.log(`  ⚠️  Année académique ${ayName} non trouvée, skip`);
        continue;
      }

      let sheetCreated = 0;
      let sheetSkipped = 0;

      for (let i = 0; i < data.length; i++) {
        const row = rowToObj(data[i]);
        const mat = normalizeMatricule(row.matricule);
        if (!mat) { sheetSkipped++; continue; }

        const studentId = studentDbIds[mat];
        if (!studentId) { sheetSkipped++; continue; }

        const amount = parseFloat(row.montant);
        if (!amount || isNaN(amount)) { sheetSkipped++; continue; }

        const paymentType = mapPaymentType(row.motif);
        const devise = (row.devise || 'USD').toUpperCase().trim();
        const transRef = row.transaction ? String(row.transaction) : null;
        const invoiceNo = row.invoice_no ? String(row.invoice_no) : null;
        const acompteNo = row.acompte ? String(row.acompte) : null;

        // Parse date
        let payDate = null;
        if (row.date_pay) {
          const d = String(row.date_pay);
          if (d.includes('-')) {
            payDate = d.split(' ')[0]; // "2024-07-15 00:00:00" → "2024-07-15"
          }
        }

        try {
          await client.query('SAVEPOINT pay_save');
          await client.query(
            `INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_date, devise, transaction_ref, invoice_no, acompte_number, motif, status, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'COMPLETED', $11)`,
            [studentId, ayId, amount, paymentType, payDate || 'now()', devise, transRef, invoiceNo, acompteNo, row.motif || null, `Import Excel - ${label}`]
          );
          sheetCreated++;

          // Mettre à jour le payment_status de l'étudiant
          if (paymentType.includes('TOTALITE')) {
            await client.query(
              "UPDATE students SET payment_status = 'PAID' WHERE id = $1 AND payment_status != 'PAID'",
              [studentId]
            );
          } else if (paymentType.includes('ACOMPTE')) {
            await client.query(
              "UPDATE students SET payment_status = 'PARTIAL' WHERE id = $1 AND payment_status = 'UNPAID'",
              [studentId]
            );
          }
          await client.query('RELEASE SAVEPOINT pay_save');

        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT pay_save');
          sheetSkipped++;
        }

        if (i > 0 && i % 5000 === 0) {
          process.stdout.write(`\r    ${i}/${data.length}`);
        }
      }

      paymentsCreated += sheetCreated;
      paymentsSkipped += sheetSkipped;
      console.log(`    ✅ ${sheetCreated} paiements créés, ${sheetSkipped} skippés`);
    }

    console.log(`\n  💰 Total paiements: ${paymentsCreated} créés, ${paymentsSkipped} skippés`);

    // ============================================
    // COMMIT
    // ============================================
    await client.query('COMMIT');

    // ============================================
    // RÉSUMÉ
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORTATION TERMINÉE');
    console.log('='.repeat(50));

    // Stats finales
    const stats = await client.query(`
      SELECT 
        (SELECT count(*) FROM faculties) as facs,
        (SELECT count(*) FROM departments) as depts,
        (SELECT count(*) FROM promotions) as promos,
        (SELECT count(*) FROM users WHERE role = 'STUDENT') as users_students,
        (SELECT count(*) FROM students) as students,
        (SELECT count(*) FROM payments) as payments,
        (SELECT count(*) FROM users WHERE account_activated = false) as inactive
    `);
    const s = stats.rows[0];
    console.log(`  Facultés:     ${s.facs}`);
    console.log(`  Départements: ${s.depts}`);
    console.log(`  Promotions:   ${s.promos}`);
    console.log(`  Users (étudiants): ${s.users_students}`);
    console.log(`  Students:     ${s.students}`);
    console.log(`  Paiements:    ${s.payments}`);
    console.log(`  Comptes non activés: ${s.inactive}`);

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

// ============================================
// HELPER: Row array → Object
// ============================================
function rowToObj(row) {
  return {
    num: row[0],
    matricule: row[1] != null ? String(row[1]).trim() : null,
    nom: row[2] || null,
    postnom: row[3] || null,
    prenom: row[4] || null,
    sexe: row[5] || null,
    faculte: row[6] || null,
    promotion: row[7] || null,
    departement: row[8] || null,
    option: row[9] || null,
    montant: row[10],
    date_pay: row[11] || null,
    devise: row[12] || null,
    transaction: row[13] || null,
    acompte: row[14] || null,
    code_promotion: row[15] || null,
    motif: row[16] || null,
    invoice_no: row[17] || null,
  };
}

main().catch(console.error);

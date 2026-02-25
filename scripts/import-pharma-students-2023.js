/**
 * NEXUS UNIKIN - Import étudiants Faculté des Sciences Pharmaceutiques
 * Source: ANNEE 2023 2024 (1).xlsx - Journal des transactions de paiement
 * 
 * Ce script:
 * 1. Filtre les lignes pour SCIENCES PHARMACEUTIQUES
 * 2. Crée les départements/promotions manquants
 * 3. Crée les users + students (email = matricule@unikin.ac.cd)
 * 4. Enregistre les paiements avec références de transaction
 * 
 * Usage: node scripts/import-pharma-students-2023.js [chemin_excel] [db_url]
 */

const XLSX = require('xlsx');
const { Pool } = require('pg');

// ============================================
// CONFIGURATION
// ============================================
const EXCEL_PATH = process.argv[2] || 'c:\\Users\\kason\\Downloads\\ANNEE 2023 2024 (1).xlsx';
const DB_URL = process.argv[3] || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexus_unikin';

const pool = new Pool({ connectionString: DB_URL });

// Faculté cible
const FACULTY_CODE = 'FSPHAR';
const FACULTY_FILTER = 'SCIENCES PHARMACEUTIQUES';

// ============================================
// MAPPING NIVEAUX (Excel PROMOTION → DB level)
// ============================================
function parseLevel(promoStr) {
  if (!promoStr) return 'OTHER';
  const s = promoStr.toUpperCase().trim();
  
  const directMap = {
    'L1 LMD': 'L1', 'L2 LMD': 'L2', 'L3 LMD': 'L3',
    'L1': 'L1', 'L2': 'L2', 'L3': 'L3',
    'B1': 'B1', 'B2': 'B2', 'B3': 'B3',
    'G1': 'G1', 'G2': 'G2', 'G3': 'G3',
    'P1': 'P1', 'P2': 'P2', 'P3': 'P3',
    'D1': 'D1', 'D2': 'D2', 'D3': 'D3',
    'M1': 'M1', 'M2': 'M2',
    'SCIENCES': 'B1', // probablement année préparatoire
  };
  
  for (const [key, val] of Object.entries(directMap)) {
    if (s === key) return val;
  }
  
  // Pattern matching
  if (s.startsWith('L1')) return 'L1';
  if (s.startsWith('L2')) return 'L2';
  if (s.startsWith('L3')) return 'L3';
  if (s.startsWith('B1')) return 'B1';
  if (s.startsWith('B2')) return 'B2';
  if (s.startsWith('B3')) return 'B3';
  if (s.startsWith('G2')) return 'G2';
  if (s.startsWith('G3')) return 'G3';
  if (s.startsWith('P1')) return 'P1';
  if (s.startsWith('P2')) return 'P2';
  if (s.startsWith('P3')) return 'P3';
  
  return 'OTHER';
}

// ============================================
// MAPPER MOTIF DE PAIEMENT → payment_type
// ============================================
function mapPaymentType(motif) {
  if (!motif) return 'AUTRES';
  const m = motif.toUpperCase();
  if (m.includes('INSCRIPTION') || m.includes('FORMULAIRE') || m.includes('REINSCRIPTION')) return 'FRAIS_INSCRIPTION';
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
  console.log('=== NEXUS UNIKIN - Import Étudiants Pharma (2023-2024) ===');
  console.log('Fichier:', EXCEL_PATH);
  console.log('');

  const client = await pool.connect();

  try {
    // ============================================
    // 1. LIRE LE FICHIER EXCEL
    // ============================================
    console.log('📖 Lecture du fichier Excel...');
    const wb = XLSX.readFile(EXCEL_PATH);
    const sheetName = wb.SheetNames[0];
    const allRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    
    // Skip header row
    const dataRows = allRows.slice(1).filter(r => r && r.length > 5);
    console.log(`  Total lignes: ${dataRows.length}`);

    // Convertir en objets
    const allData = dataRows.map(row => ({
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
    }));

    // ============================================
    // 2. FILTRER SCIENCES PHARMACEUTIQUES
    // ============================================
    const pharmaRows = allData.filter(r => {
      if (!r.faculte) return false;
      return r.faculte.toUpperCase().trim().includes(FACULTY_FILTER);
    });
    console.log(`  Lignes Pharma: ${pharmaRows.length}`);

    // ============================================
    // 3. COLLECTER ÉTUDIANTS UNIQUES
    // ============================================
    const studentMap = new Map();
    const deptSet = new Set();
    const promoSet = new Map(); // "level|dept" → info

    for (const row of pharmaRows) {
      const mat = normalizeMatricule(row.matricule);
      if (!mat) continue;

      const dept = (row.departement || '').trim().toUpperCase();
      if (dept) deptSet.add(dept);

      const level = parseLevel(row.promotion);
      const promoKey = `${level}|${dept}`;
      if (!promoSet.has(promoKey) && dept) {
        promoSet.set(promoKey, {
          level,
          department: dept,
          promotion_raw: row.promotion || '',
          code_promotion: row.code_promotion || '',
        });
      }

      if (!studentMap.has(mat)) {
        studentMap.set(mat, {
          matricule: mat,
          nom: (row.nom || '').trim(),
          postnom: (row.postnom || '').trim() || null,
          prenom: (row.prenom || '').trim() || null,
          sexe: (row.sexe || '').trim() || null,
          departement: dept,
          promotion: row.promotion || '',
          option: (row.option || '').trim() || null,
          code_promotion: row.code_promotion || '',
        });
      }
    }

    console.log(`  Étudiants uniques: ${studentMap.size}`);
    console.log(`  Départements: ${deptSet.size} → ${[...deptSet].join(', ')}`);
    console.log(`  Promotions: ${promoSet.size}`);

    // Afficher distribution par promo
    const promoCount = {};
    for (const [, info] of studentMap) {
      const lvl = parseLevel(info.promotion);
      promoCount[lvl] = (promoCount[lvl] || 0) + 1;
    }
    console.log('  Distribution:', JSON.stringify(promoCount));

    // ============================================
    // BEGIN TRANSACTION
    // ============================================
    await client.query('BEGIN');

    // ============================================
    // 4. TROUVER LA FACULTÉ
    // ============================================
    const facResult = await client.query('SELECT id FROM faculties WHERE code = $1', [FACULTY_CODE]);
    if (facResult.rows.length === 0) {
      throw new Error(`Faculté ${FACULTY_CODE} non trouvée dans la base`);
    }
    const facultyId = facResult.rows[0].id;
    console.log(`\n🏛️  Faculté ${FACULTY_CODE} → id=${facultyId}`);

    // ============================================
    // 5. DÉPARTEMENTS
    // ============================================
    console.log('\n📚 Vérification des départements...');
    const deptIds = {};
    
    for (const deptName of deptSet) {
      if (!deptName) continue;

      // Chercher par nom (case-insensitive)
      const existing = await client.query(
        'SELECT id, name FROM departments WHERE UPPER(name) = $1 AND faculty_id = $2',
        [deptName, facultyId]
      );

      if (existing.rows.length > 0) {
        deptIds[deptName] = existing.rows[0].id;
        console.log(`  ✓ ${existing.rows[0].name} → id=${existing.rows[0].id}`);
      } else {
        // Créer le département
        const deptCode = `DPHAR_${deptName.substring(0, 10).replace(/\s+/g, '')}`;
        const deptNameFormatted = deptName.charAt(0) + deptName.slice(1).toLowerCase();
        
        await client.query('SAVEPOINT dept_save');
        try {
          const r = await client.query(
            'INSERT INTO departments (code, name, faculty_id) VALUES ($1, $2, $3) RETURNING id',
            [deptCode, deptNameFormatted, facultyId]
          );
          deptIds[deptName] = r.rows[0].id;
          console.log(`  + Créé: ${deptNameFormatted} → id=${r.rows[0].id}`);
          await client.query('RELEASE SAVEPOINT dept_save');
        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT dept_save');
          console.log(`  ⚠️  Erreur dept ${deptName}: ${e.message}`);
        }
      }
    }

    // ============================================
    // 6. PROMOTIONS
    // ============================================
    console.log('\n🎓 Vérification des promotions...');
    const promoIds = {};

    for (const [key, info] of promoSet) {
      const deptId = deptIds[info.department];
      if (!deptId) {
        console.log(`  ⚠️  Promo ${key}: département ${info.department} non trouvé`);
        continue;
      }

      const existing = await client.query(
        'SELECT id FROM promotions WHERE level = $1 AND department_id = $2',
        [info.level, deptId]
      );

      if (existing.rows.length > 0) {
        promoIds[key] = existing.rows[0].id;
      } else {
        const promoCode = `${info.level}_${deptId}`;
        const promoName = `${info.promotion_raw || info.level} - ${info.department}`.substring(0, 255);

        await client.query('SAVEPOINT promo_save');
        try {
          const r = await client.query(
            'INSERT INTO promotions (code, name, level, department_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [promoCode, promoName, info.level, deptId]
          );
          promoIds[key] = r.rows[0].id;
          console.log(`  + Créé: ${info.level} / ${info.department} → id=${r.rows[0].id}`);
          await client.query('RELEASE SAVEPOINT promo_save');
        } catch (e) {
          await client.query('ROLLBACK TO SAVEPOINT promo_save');
          // Try fallback
          const byCode = await client.query('SELECT id FROM promotions WHERE code = $1', [promoCode]);
          if (byCode.rows.length > 0) promoIds[key] = byCode.rows[0].id;
          else console.log(`  ⚠️  Promo ${key}: ${e.message}`);
        }
      }
    }
    console.log(`  ✅ ${Object.keys(promoIds).length} promotions prêtes`);

    // ============================================
    // 7. ÉTUDIANTS (users + students)
    // ============================================
    console.log('\n👨‍🎓 Import des étudiants...');
    let studentsCreated = 0;
    let studentsUpdated = 0;
    let studentsSkipped = 0;
    const studentDbIds = {}; // matricule → student.id

    for (const [mat, info] of studentMap) {
      await client.query('SAVEPOINT student_save');
      try {
        const level = parseLevel(info.promotion);
        const promoKey = `${level}|${info.departement}`;
        const promoId = promoIds[promoKey] || null;

        // Check si l'étudiant existe déjà
        const existingStudent = await client.query(
          'SELECT s.id, s.user_id FROM students s WHERE s.matricule = $1',
          [mat]
        );

        if (existingStudent.rows.length > 0) {
          studentDbIds[mat] = existingStudent.rows[0].id;
          
          // Update promotion + info si disponible
          if (promoId) {
            await client.query(
              `UPDATE students SET 
                promotion_id = COALESCE($1, promotion_id),
                option_name = COALESCE($2, option_name),
                code_promotion = COALESCE($3, code_promotion),
                gender = COALESCE($4, gender)
              WHERE id = $5`,
              [promoId, info.option, info.code_promotion || null, info.sexe, existingStudent.rows[0].id]
            );
          }
          // Update user postnom if null
          if (info.postnom) {
            await client.query(
              'UPDATE users SET postnom = COALESCE(postnom, $1) WHERE id = $2',
              [info.postnom, existingStudent.rows[0].user_id]
            );
          }
          studentsUpdated++;
          await client.query('RELEASE SAVEPOINT student_save');
          continue;
        }

        // Créer le user
        const email = `${mat.replace(/\s+/g, '').toLowerCase()}@unikin.ac.cd`;
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        let userId;
        if (existingUser.rows.length > 0) {
          userId = existingUser.rows[0].id;
        } else {
          const firstName = info.prenom || info.nom || 'N/A';
          const lastName = info.nom || 'N/A';
          const userResult = await client.query(
            `INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password) 
             VALUES ($1, NULL, $2, $3, $4, 'STUDENT', TRUE, FALSE, TRUE) RETURNING id`,
            [email, firstName, lastName, info.postnom]
          );
          userId = userResult.rows[0].id;
        }

        // Créer le student
        const studentResult = await client.query(
          `INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, status, gender, option_name, code_promotion) 
           VALUES ($1, $2, $3, CURRENT_DATE, 'ACTIVE', $4, $5, $6) RETURNING id`,
          [userId, mat, promoId, info.sexe, info.option, info.code_promotion || null]
        );
        studentDbIds[mat] = studentResult.rows[0].id;
        studentsCreated++;
        await client.query('RELEASE SAVEPOINT student_save');

      } catch (e) {
        await client.query('ROLLBACK TO SAVEPOINT student_save');
        studentsSkipped++;
        if (studentsSkipped <= 15) {
          console.log(`  ⚠️  Skip ${mat}: ${e.message}`);
        }
      }
    }
    console.log(`  ✅ Créés: ${studentsCreated} | Mis à jour: ${studentsUpdated} | Skippés: ${studentsSkipped}`);

    // ============================================
    // 8. PAIEMENTS
    // ============================================
    console.log('\n💰 Import des paiements...');
    let paymentsCreated = 0;
    let paymentsSkipped = 0;
    let paymentsDuplicates = 0;

    // Trouver l'année académique 2023-2024 (créer si nécessaire)
    let ayResult = await client.query("SELECT id FROM academic_years WHERE name = '2023-2024'");
    let ayId;
    if (ayResult.rows.length > 0) {
      ayId = ayResult.rows[0].id;
    } else {
      // Essayer de créer
      await client.query('SAVEPOINT ay_save');
      try {
        const r = await client.query(
          "INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES ('2023-2024', '2023-10-01', '2024-09-30', FALSE) RETURNING id"
        );
        ayId = r.rows[0].id;
        console.log('  + Année académique 2023-2024 créée');
        await client.query('RELEASE SAVEPOINT ay_save');
      } catch (e) {
        await client.query('ROLLBACK TO SAVEPOINT ay_save');
        // Prendre la première année existante
        const fallback = await client.query('SELECT id FROM academic_years ORDER BY id LIMIT 1');
        ayId = fallback.rows[0]?.id;
        console.log(`  ⚠️  Année 2023-2024 non créée, utilise id=${ayId}: ${e.message}`);
      }
    }
    console.log(`  Année académique: id=${ayId}`);

    for (const row of pharmaRows) {
      const mat = normalizeMatricule(row.matricule);
      if (!mat) { paymentsSkipped++; continue; }

      const studentId = studentDbIds[mat];
      if (!studentId) { paymentsSkipped++; continue; }

      const amount = parseFloat(row.montant);
      if (!amount || isNaN(amount)) { paymentsSkipped++; continue; }

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
          payDate = d.split(' ')[0]; // "2025-01-15 00:00:00" → "2025-01-15"
        } else if (d.includes('/')) {
          const parts = d.split('/');
          if (parts.length === 3) {
            payDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }

      await client.query('SAVEPOINT pay_save');
      try {
        // Check doublon par transaction_ref
        if (transRef) {
          const dup = await client.query(
            'SELECT id FROM payments WHERE transaction_ref = $1 AND student_id = $2',
            [transRef, studentId]
          );
          if (dup.rows.length > 0) {
            paymentsDuplicates++;
            await client.query('RELEASE SAVEPOINT pay_save');
            continue;
          }
        }

        await client.query(
          `INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_date, devise, transaction_ref, invoice_no, acompte_number, motif, status, remarks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'COMPLETED', 'Import Excel ANNEE 2023-2024')`,
          [studentId, ayId, amount, paymentType, payDate || new Date().toISOString().split('T')[0], devise, transRef, invoiceNo, acompteNo, row.motif || null]
        );
        paymentsCreated++;

        // Mettre à jour payment_status
        if (paymentType.includes('TOTALITE')) {
          await client.query(
            "UPDATE students SET payment_status = 'PAID' WHERE id = $1 AND (payment_status IS NULL OR payment_status != 'PAID')",
            [studentId]
          );
        } else if (paymentType.includes('ACOMPTE') || paymentType.includes('SOLDE')) {
          await client.query(
            "UPDATE students SET payment_status = 'PARTIAL' WHERE id = $1 AND (payment_status IS NULL OR payment_status = 'UNPAID')",
            [studentId]
          );
        }

        await client.query('RELEASE SAVEPOINT pay_save');
      } catch (e) {
        await client.query('ROLLBACK TO SAVEPOINT pay_save');
        paymentsSkipped++;
        if (paymentsSkipped <= 10) {
          console.log(`  ⚠️  Paiement skip ${mat}: ${e.message}`);
        }
      }
    }
    console.log(`  ✅ Paiements créés: ${paymentsCreated} | Doublons: ${paymentsDuplicates} | Skippés: ${paymentsSkipped}`);

    // ============================================
    // COMMIT
    // ============================================
    await client.query('COMMIT');

    // ============================================
    // RÉSUMÉ FINAL
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORTATION TERMINÉE');
    console.log('='.repeat(50));

    const stats = await client.query(`
      SELECT 
        (SELECT count(*) FROM students s 
         JOIN promotions p ON s.promotion_id = p.id 
         JOIN departments d ON p.department_id = d.id 
         WHERE d.faculty_id = $1) as pharma_students,
        (SELECT count(*) FROM students) as total_students,
        (SELECT count(*) FROM users WHERE role = 'STUDENT') as student_users,
        (SELECT count(*) FROM payments) as total_payments,
        (SELECT count(*) FROM users WHERE account_activated = false AND role = 'STUDENT') as inactive_students
    `, [facultyId]);

    const s = stats.rows[0];
    console.log(`  Étudiants Pharma:      ${s.pharma_students}`);
    console.log(`  Total étudiants:       ${s.total_students}`);
    console.log(`  Users étudiants:       ${s.student_users}`);
    console.log(`  Total paiements:       ${s.total_payments}`);
    console.log(`  Comptes non activés:   ${s.inactive_students}`);

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

/**
 * Script d'import des données de la Faculté des Sciences Pharmaceutiques
 * Source: COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx
 * Génère un fichier SQL pour import sur le VPS
 */

const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'c:\\Users\\kason\\Downloads\\tickets\\COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx';
const OUTPUT_PATH = path.join(__dirname, '..', 'database', 'import-pharma.sql');

// DB references existantes
const FACULTY_ID = 8; // Faculté des Sciences Pharmaceutiques
const ACADEMIC_YEAR_ID = 4; // 2025-2026

// Mapping promotions existantes
const PROMO_MAP = {
  'B1': 29,  // B1 PHARMACIE
  'B2': 13,  // B2 PHARMACIE
  'B3': 64,  // B3 PHARMACIE
  'P1': 142, // P1 PHARMACIE
  'P2': 80,  // P2 PHARMACIE
  'P3': 179, // P3 PHARMACIE
};

// 5 départements académiques à créer
const DEPARTMENTS = [
  { name: 'Chimie Médicinale et Pharmacognosie', code: 'CMP_8' },
  { name: 'Galénique et Analyse des Médicaments', code: 'GAM_8' },
  { name: 'Sciences Biopharmaceutiques et Alimentaires', code: 'SBA_8' },
  { name: 'Pharmacologie et Thérapeutique', code: 'PHT_8' },
  { name: 'Sciences de Base', code: 'SDB_8' },
];

function escapeSQL(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "''").trim();
}

function parseHours(val) {
  if (val === '-' || val === '' || val === null || val === undefined) return 0;
  const n = parseInt(val);
  return isNaN(n) ? 0 : n;
}

function parseSemester(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (val.includes('&') || val.includes(',')) return 1; // "1 & 2" → 1 (annuel)
    const n = parseInt(val);
    return isNaN(n) ? 1 : n;
  }
  return 1;
}

function parseTeacherName(fullName) {
  if (!fullName) return { lastName: '', postnom: '', firstName: '' };
  const parts = fullName.trim().split(/\s+/);
  
  let lastName = '';
  let postnom = '';
  let firstName = '';
  
  // Chercher le premier mot en minuscule/mixte (c'est le prénom)
  let firstNameIdx = -1;
  for (let i = 0; i < parts.length; i++) {
    // Si le mot n'est pas tout en majuscules et n'est pas un tiret
    if (parts[i] !== parts[i].toUpperCase() && parts[i] !== '-') {
      firstNameIdx = i;
      break;
    }
  }
  
  if (firstNameIdx >= 0) {
    // Tout avant le prénom = nom + postnom
    const upperParts = parts.slice(0, firstNameIdx);
    lastName = upperParts[0] || '';
    postnom = upperParts.slice(1).join(' ');
    firstName = parts.slice(firstNameIdx).join(' ');
  } else {
    // Tout en majuscules: premier mot = nom, reste = postnom
    lastName = parts[0] || '';
    postnom = parts.slice(1).join(' ');
  }
  
  return { lastName, postnom, firstName };
}

function cleanMatricule(val) {
  if (!val || val === '--' || val === '-') return '';
  return String(val).replace(/,/g, '.').trim();
}

// Mapping des grades Excel → DB
function mapGrade(excelGrade) {
  if (!excelGrade) return 'ASSISTANT';
  const g = excelGrade.trim().toUpperCase().replace(/\s+/g, '').replace(/\./g, '');
  if (g === 'PO') return 'PROFESSEUR_ORDINAIRE';
  if (g === 'PA' || g === 'P A') return 'PROFESSEUR_ASSOCIE';
  if (g === 'PE') return 'PROFESSEUR'; // Professeur Émérite → PROFESSEUR
  if (g === 'P') return 'PROFESSEUR';
  if (g === 'DR') return 'CHEF_TRAVAUX'; // Docteur sans grade → CT
  if (g === 'CT' || g === 'CT') return 'CHEF_TRAVAUX';
  if (g.startsWith('ASS')) return 'ASSISTANT'; // Ass. 0, Ass. 1, Ass. 2
  return 'ASSISTANT';
}

function generateEmail(fullName, existingEmails) {
  const parts = fullName.replace(/-/g, ' ').split(/\s+/).filter(p => p.length > 0);
  const base = parts.map(p => p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')).join('.');
  let email = `${base}@fsphar.unikin.ac.cd`;
  let counter = 1;
  while (existingEmails.has(email)) {
    email = `${base}${counter}@fsphar.unikin.ac.cd`;
    counter++;
  }
  existingEmails.add(email);
  return email;
}

async function main() {
  console.log('Lecture du fichier Excel...');
  const wb = XLSX.readFile(EXCEL_PATH);
  
  // ====== COURSES ======
  console.log('Extraction des cours...');
  const coursesSheet = XLSX.utils.sheet_to_json(wb.Sheets['Cours PharmD'], { header: 1 });
  
  const courses = [];
  let currentPromo = null;
  
  for (const row of coursesSheet) {
    // Détecter les headers de promotion
    const cell1 = row[1] ? String(row[1]).trim() : '';
    
    if (cell1 === 'B1 Pharm-D' || cell1 === 'B1 PharmD') { currentPromo = 'B1'; continue; }
    if (cell1 === 'B2 PharmD' || cell1 === 'B2 Pharm-D') { currentPromo = 'B2'; continue; }
    if (cell1 === 'B3 PharmD' || cell1 === 'B3 Pharm-D') { currentPromo = 'B3'; continue; }
    if (cell1.includes('P1') && cell1.includes('harm')) { currentPromo = 'P1'; continue; }
    if (cell1 === 'P2 PharmD' || cell1 === 'P2 Pharm-D') { currentPromo = 'P2'; continue; }
    if (cell1 === 'P3 PharmD' || cell1 === 'P3 Pharm-D') { currentPromo = 'P3'; continue; }
    
    // Skip headers, empty rows, special sections
    if (!currentPromo) continue;
    if (cell1 === 'MATIERES ENSEIGNEES') continue;
    if (cell1 === 'Jurys' || cell1 === 'Examen' || cell1 === 'Stage' || cell1 === 'Mémoire') continue;
    
    // Pour P3: items sans code (Production et Analyse, etc.)
    if (currentPromo === 'P3' && cell1 === '' && row[2] && typeof row[7] === 'number') {
      const name = String(row[2]).trim();
      const p3Idx = courses.filter(c => c.promoKey === 'P3').length + 1;
      courses.push({
        code: `PHAR3${String(p3Idx).padStart(3, '0')}`,
        name,
        hours_cm: 0,
        hours_td: 0,
        hours_tp: 0,
        credits: row[7] || 0,
        semester: parseSemester(row[8]),
        promoKey: 'P3',
        course_type: 'OBLIGATOIRE'
      });
      continue;
    }
    
    if (cell1 === '') continue;
    
    // Vérifier si c'est un code de cours (commence par PHAR)
    const code = cell1.replace(/\s+/g, ''); // normalize spaces in codes like "PHAR 1308"
    if (!code.startsWith('PHAR')) {
      continue;
    }
    
    const name = row[2] ? String(row[2]).trim() : '';
    if (!name) continue;
    
    courses.push({
      code,
      name,
      hours_cm: parseHours(row[3]),  // Théorie
      hours_tp: parseHours(row[4]),  // Pratique
      hours_td: parseHours(row[5]),  // Séminaire → TD
      credits: typeof row[7] === 'number' ? row[7] : 0,
      semester: parseSemester(row[8]),
      promoKey: currentPromo,
      course_type: 'OBLIGATOIRE'
    });
  }
  
  console.log(`${courses.length} cours extraits`);
  
  // ====== TEACHERS ======
  console.log('Extraction des enseignants...');
  const teachersSheet = XLSX.utils.sheet_to_json(wb.Sheets['Enseignants'], { header: 1 });
  
  const teachers = [];
  const existingEmails = new Set();
  let skipHeader = true;
  
  for (const row of teachersSheet) {
    if (skipHeader) { skipHeader = false; continue; }
    
    const num = row[0];
    const fullName = row[1] ? String(row[1]).trim() : '';
    if (!fullName || !num) continue;
    
    const matriculeUnikin = cleanMatricule(row[2]);
    const matriculeESU = row[3] ? String(row[3]).trim() : '';
    const grade = row[4] ? String(row[4]).trim() : '';
    const email = row[5] ? String(row[5]).trim() : null;
    const department = row[6] ? String(row[6]).trim() : '';
    const promoIntervention = row[7] ? String(row[7]).trim() : '';
    const coursEnseignes = row[8] ? String(row[8]).trim() : '';
    
    const { lastName, postnom, firstName } = parseTeacherName(fullName);
    
    // Email: utiliser celui du fichier ou en générer un
    let finalEmail = email;
    if (!finalEmail || finalEmail === '-' || finalEmail === '--') {
      finalEmail = generateEmail(fullName, existingEmails);
    } else {
      existingEmails.add(finalEmail.toLowerCase());
    }
    
    teachers.push({
      fullName,
      lastName,
      postnom,
      firstName,
      matriculeUnikin,
      matriculeESU,
      grade,
      email: finalEmail,
      department,
      promoIntervention,
      coursEnseignes,
    });
  }
  
  console.log(`${teachers.length} enseignants extraits`);
  
  // ====== GENERATE SQL ======
  console.log('Génération du SQL...');
  
  // Hash password
  const defaultPassword = await bcrypt.hash('Nexus2026!', 10);
  
  let sql = `-- ============================================================
-- IMPORT DONNÉES - Faculté des Sciences Pharmaceutiques
-- Généré automatiquement depuis COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx
-- Date: ${new Date().toISOString().split('T')[0]}
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CRÉATION DES 5 DÉPARTEMENTS ACADÉMIQUES
-- ============================================================
-- Note: On garde les départements existants (Pharmacie ID=12, LTP ID=81)
-- car les promotions et étudiants y sont rattachés.
-- On ajoute les 5 départements académiques pour les enseignants.

`;
  
  for (const dept of DEPARTMENTS) {
    sql += `INSERT INTO departments (name, code, faculty_id, created_at, updated_at)
SELECT '${escapeSQL(dept.name)}', '${dept.code}', ${FACULTY_ID}, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = '${dept.code}');\n\n`;
  }
  
  // ============================================================
  // 2. COURSES
  // ============================================================
  sql += `-- ============================================================
-- 2. INSERTION DES COURS (${courses.length} cours)
-- ============================================================

`;
  
  for (const course of courses) {
    const promoId = PROMO_MAP[course.promoKey];
    if (!promoId) {
      console.warn(`  ⚠ Promotion non trouvée pour ${course.promoKey}, skip ${course.code}`);
      continue;
    }
    
    sql += `INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT '${escapeSQL(course.code)}', '${escapeSQL(course.name)}', ${course.credits}, ${course.hours_cm}, ${course.hours_td}, ${course.hours_tp}, ${promoId}, ${course.semester}, '${course.course_type}', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = '${escapeSQL(course.code)}' AND promotion_id = ${promoId});\n\n`;
  }
  
  // ============================================================
  // 3. TEACHERS - Users + Teachers records
  // ============================================================
  sql += `-- ============================================================
-- 3. INSERTION DES ENSEIGNANTS (${teachers.length} enseignants)
-- ============================================================
-- Mot de passe par défaut: Nexus2026!

`;
  
  const seenMatricules = new Set();
  for (let i = 0; i < teachers.length; i++) {
    const t = teachers[i];
    const emailLower = t.email.toLowerCase();
    
    // Gérer les matricules vides ou dupliqués
    let matricule = t.matriculeUnikin;
    if (!matricule || matricule === '--' || matricule === '-') {
      // Générer un matricule placeholder
      let genIdx = 1;
      matricule = `FSPHAR_${String(genIdx).padStart(3, '0')}`;
      while (seenMatricules.has(matricule)) {
        genIdx++;
        matricule = `FSPHAR_${String(genIdx).padStart(3, '0')}`;
      }
    } else if (seenMatricules.has(matricule)) {
      matricule = `${matricule}-bis`;
      let counter = 2;
      while (seenMatricules.has(matricule)) {
        matricule = `${t.matriculeUnikin}-${counter}`;
        counter++;
      }
    }
    if (matricule) seenMatricules.add(matricule);
    
    const matriculeSQL = `'${escapeSQL(matricule)}'`;
    
    sql += `-- ${i + 1}. ${t.fullName} (${t.grade})
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT '${escapeSQL(emailLower)}', '${defaultPassword}', '${escapeSQL(t.firstName)}', '${escapeSQL(t.lastName)}', '${escapeSQL(t.postnom)}', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = '${escapeSQL(emailLower)}');
  
  SELECT id INTO v_user_id FROM users WHERE email = '${escapeSQL(emailLower)}';
  
  -- Trouver le département
  ${t.department ? `SELECT id INTO v_dept_id FROM departments WHERE name = '${escapeSQL(t.department)}' AND faculty_id = ${FACULTY_ID} LIMIT 1;` : `v_dept_id := 12; -- Pharmacie par défaut`}
  ${!t.department ? '' : `IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;`}
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, ${matriculeSQL}, '${mapGrade(t.grade)}', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;\n\n`;
  }
  
  // ============================================================
  // 4. SUMMARY VERIFICATION
  // ============================================================
  sql += `-- ============================================================
-- 4. VÉRIFICATION
-- ============================================================
SELECT 'DÉPARTEMENTS CRÉÉS' AS info, COUNT(*) AS total FROM departments WHERE faculty_id = ${FACULTY_ID};
SELECT 'COURS INSÉRÉS' AS info, COUNT(*) AS total FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = ${FACULTY_ID};
SELECT 'ENSEIGNANTS CRÉÉS' AS info, COUNT(*) AS total FROM teachers t JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = ${FACULTY_ID};

COMMIT;
`;
  
  fs.writeFileSync(OUTPUT_PATH, sql, 'utf8');
  console.log(`\n✅ SQL généré: ${OUTPUT_PATH}`);
  console.log(`   ${courses.length} cours`);
  console.log(`   ${teachers.length} enseignants`);
  console.log(`   ${DEPARTMENTS.length} départements`);
}

main().catch(console.error);

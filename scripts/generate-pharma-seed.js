/**
 * NEXUS UNIKIN - Génération du Seed SQL pour la Faculté des Sciences Pharmaceutiques
 * Source: COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx
 * 
 * Ce script lit le fichier Excel et génère un fichier SQL complet
 * pour intégrer toutes les données de la Faculté de Pharmacie.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'c:\\Users\\kason\\Downloads\\tickets\\COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx';
const OUTPUT_PATH = path.join(__dirname, '..', 'database', 'seed-pharmacie.sql');

// Lecture du fichier Excel
const wb = XLSX.readFile(EXCEL_PATH);

// ============================================
// 1. COURS PharmD
// ============================================
const coursWs = wb.Sheets['Cours PharmD'];
const coursData = XLSX.utils.sheet_to_json(coursWs, { header: 1, defval: '' });

// Parser les cours par promotion
const coursesByPromotion = {};
let currentPromo = null;

for (const row of coursData) {
  const col1 = String(row[1] || '').trim();
  
  // Détection de la promotion
  if (col1.startsWith('B1')) currentPromo = 'B1';
  else if (col1.startsWith('B2')) currentPromo = 'B2';
  else if (col1.startsWith('B3')) currentPromo = 'B3';
  else if (col1.startsWith('P1')) currentPromo = 'P1';
  else if (col1.startsWith('P2')) currentPromo = 'P2';
  else if (col1.startsWith('P3')) currentPromo = 'P3';
  else if (col1.startsWith('PHAR') && currentPromo) {
    if (!coursesByPromotion[currentPromo]) coursesByPromotion[currentPromo] = [];
    
    const code = col1.replace(/\s+/g, ''); // Nettoyer les espaces dans le code
    const name = String(row[2] || '').trim().replace(/\s+/g, ' ').replace(/\u00a0/g, ' ');
    const theory = parseInt(row[3]) || 0;
    const practical = parseInt(row[4]) || 0;
    const seminar = parseInt(row[5]) || 0;
    const total = parseInt(row[6]) || 0;
    const credit = parseInt(row[7]) || 0;
    const semesterRaw = String(row[8] || '').trim();
    
    // Mapping du semestre
    let semester;
    if (semesterRaw === '1 & 2' || semesterRaw === '1&2' || semesterRaw.includes('&')) {
      semester = 0; // Annuel
    } else {
      semester = parseInt(semesterRaw) || 1;
    }
    
    coursesByPromotion[currentPromo].push({
      code, name, theory, practical, seminar, total, credit, semester
    });
  }
}

// ============================================
// 2. ENSEIGNANTS
// ============================================
const ensWs = wb.Sheets['Enseignants'];
const ensData = XLSX.utils.sheet_to_json(ensWs, { header: 1, defval: '' });

const professors = [];  // Professeurs titulaires (avec grade P.O/P.A/P/P.E/Dr)
const assistants = [];  // Personnel scientifique (C.T./Ass.)

let section = 'professors'; // Deux sections dans le fichier

for (let i = 1; i < ensData.length; i++) {
  const row = ensData[i];
  const name = String(row[1] || '').trim();
  if (!name || name === '') continue;
  
  const gradeRaw = String(row[4] || '').trim();
  
  // Vérifier si on est passé à la section assistants
  if (gradeRaw.startsWith('C.T') || gradeRaw.startsWith('Ass')) {
    section = 'assistants';
  }
  
  const matUnikin = String(row[2] || '').replace(/,/g, '.').replace(/\s+/g, '').trim();
  const matESU = String(row[3] || '').trim();
  const email = String(row[5] || '').trim();
  const dept = String(row[6] || '').trim();
  const promo = String(row[7] || '').trim();
  const cours = String(row[8] || '').trim();
  
  // Mapper le grade vers le format DB
  let dbGrade;
  if (gradeRaw === 'P.O' || gradeRaw === 'P.O.') dbGrade = 'PROFESSEUR_ORDINAIRE';
  else if (gradeRaw === 'P.E' || gradeRaw === 'P.E.') dbGrade = 'PROFESSEUR_ORDINAIRE'; // Émérite → P.O
  else if (gradeRaw === 'P.A' || gradeRaw === 'P. A' || gradeRaw === 'P.A.') dbGrade = 'PROFESSEUR_ASSOCIE';
  else if (gradeRaw === 'P' || gradeRaw === 'P.') dbGrade = 'PROFESSEUR';
  else if (gradeRaw === 'Dr' || gradeRaw === 'Dr.') dbGrade = 'ASSISTANT'; // Docteur sans grade → Assistant
  else if (gradeRaw.startsWith('C.T')) dbGrade = 'CHEF_TRAVAUX';
  else if (gradeRaw.startsWith('Ass')) dbGrade = 'ASSISTANT';
  else dbGrade = 'ASSISTANT';
  
  // Séparer nom en first_name / last_name
  const nameParts = name.split(' ');
  let lastName, firstName;
  if (nameParts.length >= 3 && nameParts[nameParts.length - 1].length > 2) {
    // Cas avec prénom en dernier: "MUKUBWA KATHONDO Grady"
    firstName = nameParts[nameParts.length - 1];
    lastName = nameParts.slice(0, -1).join(' ');
  } else if (nameParts.length >= 2) {
    lastName = nameParts[0];
    firstName = nameParts.slice(1).join(' ');
  } else {
    lastName = name;
    firstName = '';
  }
  
  // Mapper le département
  let deptCode;
  if (dept.includes('Chimie Médicinale') || dept.includes('M├®dicinale') || dept.includes('Pharmacognosie')) {
    deptCode = 'PHAR-CMP';
  } else if (dept.includes('nique') || dept.includes('Analyse')) {
    deptCode = 'PHAR-GAM';
  } else if (dept.includes('Biopharmac') || dept.includes('Alimentaire')) {
    deptCode = 'PHAR-SBA';
  } else if (dept.includes('Pharmacologie') || dept.includes('rapeutique') || dept.includes('Th')) {
    deptCode = 'PHAR-PT';
  } else if (dept.includes('Sciences de Base') || dept.includes('Base')) {
    deptCode = 'PHAR-SB';
  } else {
    deptCode = null; // Pas de département assigné
  }
  
  const teacher = {
    name, firstName, lastName, matUnikin, matESU, gradeRaw, dbGrade,
    email, dept, deptCode, promo, cours
  };
  
  if (section === 'professors' && (gradeRaw.startsWith('P') || gradeRaw === 'Dr')) {
    professors.push(teacher);
  } else {
    assistants.push(teacher);
  }
}

// ============================================
// 3. CRITÈRES DE DÉLIBÉRATION
// ============================================
const critWs = wb.Sheets['CRITÈRES DÉLIBÉRATION'];
const critData = XLSX.utils.sheet_to_json(critWs, { header: 1, defval: '' });

const criteria = {};
for (const row of critData) {
  const param = String(row[0] || '').trim();
  const value = String(row[1] || '').trim();
  if (param && value) {
    criteria[param] = value;
  }
}

// ============================================
// GÉNÉRATION DU SQL
// ============================================

let sql = `-- ============================================
-- NEXUS UNIKIN - Seed Faculté des Sciences Pharmaceutiques
-- Généré automatiquement depuis COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx
-- Date: ${new Date().toISOString().split('T')[0]}
-- ============================================
-- Contenu:
--   - 5 départements
--   - 5 promotions (B1-B3 PharmD = L1-L3, P1-P2 PharmD = M1-M2)
--   - ${Object.values(coursesByPromotion).reduce((s, c) => s + c.length, 0)} cours
--   - ${professors.length} professeurs titulaires
--   - ${assistants.length} membres du personnel scientifique
--   - Critères de délibération
-- ============================================

BEGIN;

-- ============================================
-- MISE À JOUR CONTRAINTE SEMESTRE (support annuel = 0)
-- ============================================
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_semester_check;
ALTER TABLE courses ADD CONSTRAINT courses_semester_check CHECK (semester IN (0, 1, 2));

-- ============================================
-- DÉPARTEMENTS DE LA FACULTÉ DE PHARMACIE
-- ============================================
INSERT INTO departments (code, name, description, faculty_id) VALUES
('PHAR-CMP', 'Département de Chimie Médicinale et Pharmacognosie', 
 'Chimie des substances naturelles et médicinales, pharmacognosie', 
 (SELECT id FROM faculties WHERE code = 'PHARMACIE')),
('PHAR-GAM', 'Département de Galénique et Analyse des Médicaments', 
 'Pharmacie galénique, analyse pharmaceutique et contrôle qualité', 
 (SELECT id FROM faculties WHERE code = 'PHARMACIE')),
('PHAR-SBA', 'Département des Sciences Biopharmaceutiques et Alimentaires', 
 'Biochimie, microbiologie, nutrition et sciences alimentaires', 
 (SELECT id FROM faculties WHERE code = 'PHARMACIE')),
('PHAR-PT', 'Département de Pharmacologie et Thérapeutique', 
 'Pharmacologie générale et spéciale, thérapeutique', 
 (SELECT id FROM faculties WHERE code = 'PHARMACIE')),
('PHAR-SB', 'Département des Sciences de Base', 
 'Chimie générale, physique, mathématiques et sciences fondamentales', 
 (SELECT id FROM faculties WHERE code = 'PHARMACIE'))
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  faculty_id = EXCLUDED.faculty_id;

-- ============================================
-- PROMOTIONS PharmD
-- ============================================
`;

const promoMap = {
  'B1': { code: 'PHAR-B1', name: 'B1 Pharm-D (Sciences Pharmaceutiques)', level: 'L1' },
  'B2': { code: 'PHAR-B2', name: 'B2 Pharm-D (Sciences Pharmaceutiques)', level: 'L2' },
  'B3': { code: 'PHAR-B3', name: 'B3 Pharm-D (Sciences Pharmaceutiques)', level: 'L3' },
  'P1': { code: 'PHAR-P1', name: 'P1 Pharm-D (Sciences Pharmaceutiques)', level: 'M1' },
  'P2': { code: 'PHAR-P2', name: 'P2 Pharm-D (Sciences Pharmaceutiques)', level: 'M2' }
};

// Les promotions sont rattachées au département principal (PHAR-CMP par défaut)
for (const [promoKey, promoInfo] of Object.entries(promoMap)) {
  sql += `INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT '${promoInfo.code}', '${promoInfo.name}', '${promoInfo.level}', 
       d.id, a.id
FROM departments d, academic_years a 
WHERE d.code = 'PHAR-CMP' AND a.is_current = TRUE
ON CONFLICT (code, academic_year_id) DO NOTHING;

`;
}

// ============================================
// COURS
// ============================================
sql += `-- ============================================
-- COURS PharmD (${Object.values(coursesByPromotion).reduce((s, c) => s + c.length, 0)} cours)
-- ============================================
`;

for (const [promoKey, courses] of Object.entries(coursesByPromotion)) {
  const promoCode = promoMap[promoKey]?.code;
  if (!promoCode) continue;
  
  sql += `\n-- --- ${promoKey} PharmD (${courses.length} cours) ---\n`;
  
  for (const course of courses) {
    const escapedName = course.name.replace(/'/g, "''");
    sql += `INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT '${course.code}', '${escapedName}', ${course.credit}, ${course.theory}, ${course.seminar}, ${course.practical}, ${course.semester},
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = '${promoCode}'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
`;
  }
}

// ============================================
// ENSEIGNANTS - Professeurs titulaires
// ============================================
sql += `\n-- ============================================
-- ENSEIGNANTS TITULAIRES (${professors.length} professeurs)
-- Password par défaut: Prof@Pharma2026
-- ============================================
`;

const defaultPassword = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

for (let i = 0; i < professors.length; i++) {
  const t = professors[i];
  const escapedFirst = t.firstName.replace(/'/g, "''");
  const escapedLast = t.lastName.replace(/'/g, "''");
  const email = t.email || `prof.pharma${i + 1}@unikin.ac.cd`;
  const cleanEmail = email.replace(/'/g, "''").toLowerCase().trim();
  const matClean = t.matUnikin.replace(/'/g, "''");
  
  sql += `
-- ${t.name} (${t.gradeRaw})
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = '${cleanEmail}') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('${cleanEmail}', '${defaultPassword}', '${escapedFirst}', '${escapedLast}', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-${matClean}', '${t.dbGrade}', 
       ${t.deptCode ? `(SELECT id FROM departments WHERE code = '${t.deptCode}')` : 'NULL'},
       TRUE
FROM users u WHERE u.email = '${cleanEmail}'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;
`;
}

// ============================================
// ENSEIGNANTS - Personnel scientifique (Assistants, C.T.)
// ============================================
sql += `\n-- ============================================
-- PERSONNEL SCIENTIFIQUE (${assistants.length} membres)
-- Password par défaut: Prof@Pharma2026
-- ============================================
`;

for (let i = 0; i < assistants.length; i++) {
  const t = assistants[i];
  const escapedFirst = t.firstName.replace(/'/g, "''");
  const escapedLast = t.lastName.replace(/'/g, "''");
  // Générer un email si absent
  const baseEmail = t.email || `${t.lastName.toLowerCase().replace(/[^a-z]/g, '')}.pharma@unikin.ac.cd`;
  const cleanEmail = baseEmail.replace(/'/g, "''").toLowerCase().trim();
  const matClean = t.matUnikin.replace(/'/g, "''");
  
  sql += `
-- ${t.name} (${t.gradeRaw})
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = '${cleanEmail}') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('${cleanEmail}', '${defaultPassword}', '${escapedFirst}', '${escapedLast}', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-${matClean}', '${t.dbGrade}', 
       ${t.deptCode ? `(SELECT id FROM departments WHERE code = '${t.deptCode}')` : `(SELECT id FROM departments WHERE code = 'PHAR-CMP')`},
       TRUE
FROM users u WHERE u.email = '${cleanEmail}'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;
`;
}

// ============================================
// CRITÈRES DE DÉLIBÉRATION
// ============================================
sql += `\n-- ============================================
-- CRITÈRES DE DÉLIBÉRATION - Faculté de Pharmacie
-- ============================================

-- Table de configuration des critères (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS deliberation_criteria (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    parameter VARCHAR(255) NOT NULL,
    default_value VARCHAR(100),
    custom_value VARCHAR(100),
    category VARCHAR(50) DEFAULT 'GENERAL',
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, parameter)
);

-- Insertion des critères pour la Faculté de Pharmacie
INSERT INTO deliberation_criteria (faculty_id, parameter, default_value, category) VALUES
-- Critères d'admission
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Moyenne minimale pour ADMIS', '10/20', 'ADMISSION'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Moyenne minimale pour ADMIS AVEC DETTE', '10/20 (60%+ crédits)', 'ADMISSION'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Moyenne minimale pour AJOURNÉ (repêchable)', '8/20', 'ADMISSION'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Moyenne en dessous de laquelle REFUSÉ', '< 8/20', 'ADMISSION'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Pourcentage de crédits pour ADMIS', '80%', 'CREDITS'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Pourcentage de crédits pour ADMIS AVEC DETTE', '60%', 'CREDITS'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Pourcentage minimum paiement pour voir résultats', '70%', 'PAIEMENT'),
-- Pondération
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Poids TP dans la note finale', '30%', 'PONDERATION'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Poids TD dans la note finale', '0% (inclus dans TP)', 'PONDERATION'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Poids Examen dans la note finale', '70%', 'PONDERATION'),
-- Règles complémentaires
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Étudiant bloqué (paiement) peut-il être délibéré', 'Non', 'REGLES'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Note éliminatoire', 'Aucune', 'REGLES'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Nombre maximum de cours en dette autorisés', 'Aucune limite', 'REGLES'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Les mentions sont-elles attribuées', 'Oui', 'MENTIONS'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Seuil pour Distinction', '14/20', 'MENTIONS'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Seuil pour Grande Distinction', '16/20', 'MENTIONS'),
((SELECT id FROM faculties WHERE code = 'PHARMACIE'), 'Seuil pour La Plus Grande Distinction', '18/20', 'MENTIONS')
ON CONFLICT (faculty_id, parameter) DO UPDATE SET
  default_value = EXCLUDED.default_value,
  category = EXCLUDED.category;
`;

// ============================================
// STATISTIQUES FINALES
// ============================================
sql += `\n-- ============================================
-- VÉRIFICATION ET STATISTIQUES
-- ============================================

-- Afficher les statistiques d'insertion
DO $$
DECLARE
  dept_count INTEGER;
  promo_count INTEGER;
  course_count INTEGER;
  teacher_count INTEGER;
  criteria_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dept_count FROM departments d 
    JOIN faculties f ON d.faculty_id = f.id WHERE f.code = 'PHARMACIE';
  SELECT COUNT(*) INTO promo_count FROM promotions p
    JOIN departments d ON p.department_id = d.id
    JOIN faculties f ON d.faculty_id = f.id WHERE f.code = 'PHARMACIE';
  SELECT COUNT(*) INTO course_count FROM courses c
    JOIN promotions p ON c.promotion_id = p.id
    JOIN departments d ON p.department_id = d.id
    JOIN faculties f ON d.faculty_id = f.id WHERE f.code = 'PHARMACIE';
  SELECT COUNT(*) INTO teacher_count FROM teachers t
    JOIN departments d ON t.department_id = d.id
    JOIN faculties f ON d.faculty_id = f.id WHERE f.code = 'PHARMACIE';
  SELECT COUNT(*) INTO criteria_count FROM deliberation_criteria dc
    JOIN faculties f ON dc.faculty_id = f.id WHERE f.code = 'PHARMACIE';
    
  RAISE NOTICE '=== PHARMACIE - RÉSULTATS ===';
  RAISE NOTICE 'Départements: %', dept_count;
  RAISE NOTICE 'Promotions: %', promo_count;
  RAISE NOTICE 'Cours: %', course_count;
  RAISE NOTICE 'Enseignants: %', teacher_count;
  RAISE NOTICE 'Critères délibération: %', criteria_count;
END $$;

COMMIT;

-- ============================================
-- FIN DU SEED PHARMACIE
-- ============================================
`;

// Écriture du fichier
fs.writeFileSync(OUTPUT_PATH, sql, 'utf8');

// Rapport
console.log('=== GÉNÉRATION TERMINÉE ===');
console.log(`Fichier: ${OUTPUT_PATH}`);
console.log(`\nStatistiques:`);
console.log(`  Départements: 5`);
console.log(`  Promotions: ${Object.keys(coursesByPromotion).length}`);
for (const [promo, courses] of Object.entries(coursesByPromotion)) {
  console.log(`    ${promo}: ${courses.length} cours`);
}
console.log(`  Total cours: ${Object.values(coursesByPromotion).reduce((s, c) => s + c.length, 0)}`);
console.log(`  Professeurs titulaires: ${professors.length}`);
console.log(`  Personnel scientifique: ${assistants.length}`);
console.log(`  Total enseignants: ${professors.length + assistants.length}`);
console.log(`  Critères de délibération: ${Object.keys(criteria).length}`);
console.log(`\nTaille du fichier SQL: ${(sql.length / 1024).toFixed(1)} KB`);

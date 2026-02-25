-- ============================================
-- NEXUS UNIKIN - Seed Faculté des Sciences Pharmaceutiques
-- Généré automatiquement depuis COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx
-- Date: 2026-02-23
-- ============================================
-- Contenu:
--   - 5 départements
--   - 5 promotions (B1-B3 PharmD = L1-L3, P1-P2 PharmD = M1-M2)
--   - 79 cours
--   - 50 professeurs titulaires
--   - 51 membres du personnel scientifique
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
INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'PHAR-B1', 'B1 Pharm-D (Sciences Pharmaceutiques)', 'L1', 
       d.id, a.id
FROM departments d, academic_years a 
WHERE d.code = 'PHAR-CMP' AND a.is_current = TRUE
ON CONFLICT (code, academic_year_id) DO NOTHING;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'PHAR-B2', 'B2 Pharm-D (Sciences Pharmaceutiques)', 'L2', 
       d.id, a.id
FROM departments d, academic_years a 
WHERE d.code = 'PHAR-CMP' AND a.is_current = TRUE
ON CONFLICT (code, academic_year_id) DO NOTHING;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'PHAR-B3', 'B3 Pharm-D (Sciences Pharmaceutiques)', 'L3', 
       d.id, a.id
FROM departments d, academic_years a 
WHERE d.code = 'PHAR-CMP' AND a.is_current = TRUE
ON CONFLICT (code, academic_year_id) DO NOTHING;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'PHAR-P1', 'P1 Pharm-D (Sciences Pharmaceutiques)', 'M1', 
       d.id, a.id
FROM departments d, academic_years a 
WHERE d.code = 'PHAR-CMP' AND a.is_current = TRUE
ON CONFLICT (code, academic_year_id) DO NOTHING;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'PHAR-P2', 'P2 Pharm-D (Sciences Pharmaceutiques)', 'M2', 
       d.id, a.id
FROM departments d, academic_years a 
WHERE d.code = 'PHAR-CMP' AND a.is_current = TRUE
ON CONFLICT (code, academic_year_id) DO NOTHING;

-- ============================================
-- COURS PharmD (79 cours)
-- ============================================

-- --- B1 PharmD (14 cours) ---
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1101', 'Anglais Scientifique I', 4, 45, 0, 15, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1102', 'Anthropologie Médicale', 1, 15, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1103', 'Biologie Cellulaire Animale', 5, 45, 0, 30, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1104', 'Biologie Cellulaire Végétale', 4, 30, 0, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1105', 'Chimie Générale', 7, 60, 0, 45, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1106', 'Chimie Inorganique', 3, 30, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1107', 'Chimie Organique I', 7, 60, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1108', 'Education à la Citoyenneté', 2, 30, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1109', 'Histoire de la Pharmacie', 1, 15, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1110', 'Informatique I', 2, 15, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1111', 'Logique et Expression Orale et Ecrite', 3, 30, 0, 15, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1112', 'Mathématiques', 7, 60, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1113', 'Physique', 7, 60, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1114', 'Psychologie Générale', 2, 30, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;

-- --- B2 PharmD (13 cours) ---
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1201', 'Anatomie Humaine', 4, 60, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1202', 'Anglais Scientifique II', 2, 15, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1203', 'Biochimie Générale Structurale', 4, 30, 0, 30, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1204', 'Biostatistiques', 4, 30, 0, 30, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1205', 'Botanique Systématique (Phylogénique et Taxonomique)', 5, 45, 0, 30, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1206', 'Chimie Analytique I', 9, 45, 0, 90, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1207', 'Chimie Organique II', 6, 45, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1208', 'Chimie Physique Appliquée aux Sciences Pharmaceutiques', 3, 30, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1209', 'Informatique II', 4, 30, 0, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1210', 'Initiation à la Recherche Scientifique', 2, 15, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1211', 'Physiologie Humaine', 7, 75, 0, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1212', 'Physiologie Végétale', 2, 15, 0, 15, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1213', 'Santé Publique et Hygiène', 4, 45, 0, 15, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;

-- --- B3 PharmD (17 cours) ---
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1301', 'Anglais Scientifique III', 1, 0, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1302', 'Biochimie Générale Métabolique', 4, 30, 0, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1303', 'Biologie Moléculaire', 3, 30, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1304', 'Chimie Analytique II', 7, 60, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1305', 'Chimie Pharmaceutique Inorganique', 3, 30, 0, 15, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1306', 'Chimie Pharmaceutique Organique I', 5, 45, 0, 30, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1307', 'Immunologie Générale et Pathologique', 3, 30, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1308', 'Information Pharmaceutique', 1, 0, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1309', 'Introduction à la Pratique Pharmaceutique', 5, 30, 15, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1310', 'Microbiologie Générale et Pharmaceutique', 4, 30, 0, 30, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1311', 'Parasitologie Médicale', 3, 30, 0, 15, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1132', 'Pharmacie Galénique I', 6, 45, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1313', 'Pharmacognosie I', 4, 30, 0, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1314', 'Pharmacologie Générale', 4, 45, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1315', 'Pharmacopée Traditionnelle', 1, 15, 0, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1316', 'Physiopathologie', 4, 60, 0, 0, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR1317', 'Travail de Fin de Cycle', 4, 0, 0, 0, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-B3'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;

-- --- P1 PharmD (18 cours) ---
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2101', 'Anglais Scientifique IV', 1, 0, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2102', 'Assurance-Qualité des soins', 1, 15, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2103', 'Biochimie Médicale', 5, 45, 0, 30, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2104', 'Biotechnologie Pharmaceutique', 1, 15, 0, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2105', 'Chimie Pharmaceutique Organique II', 7, 45, 15, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2106', 'Hématologie et Immuno- Hématologie', 3, 30, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2107', 'Microbiologie Médicale et Industrielle', 5, 45, 0, 30, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2108', 'Pathologie Médicale, Pharmacologie et Thérapeutique I', 8, 90, 15, 15, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2109', 'Pharmacie Clinique I', 2, 15, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2110', 'Pharmacie Galénique II', 6, 45, 15, 30, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2111', 'Pharmacoépidémiologie', 2, 15, 0, 15, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2112', 'Pharmacognosie II', 7, 60, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2113', 'Pharmacovigilance', 1, 0, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2114', 'Phytopharmacie', 1, 15, 0, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2115', 'Pratique Pharmaceutique I', 5, 0, 30, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2116', 'Séminaire d’Elaboration et d’Evaluation des Projets', 1, 0, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2117', 'Sémiologie Médicale', 4, 30, 30, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2118', 'Toxicologie Analytique et Clinique', 4, 30, 0, 30, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P1'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;

-- --- P2 PharmD (17 cours) ---
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2201', 'Analyse des Aliments', 6, 45, 0, 45, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2202', 'Analyse des Médicaments et des Produits de Santé', 6, 45, 0, 45, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2203', 'Anglais Scientifique V', 1, 0, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2204', 'Anthropologie Pharmaceutique', 1, 15, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2205', 'Entrepreneuriat et Leadership', 2, 15, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2206', 'Ethique et Déontologie Pharmaceutique', 2, 15, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2207', 'Gestion Pharmaceutique et Informatique', 6, 45, 15, 30, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2208', 'Législation et Règlementation Pharmaceutiques', 3, 30, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2209', 'Méthodologie et Ethique de la Recherche Biomédicale', 2, 30, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2210', 'Nutrition et Diététique', 3, 30, 0, 15, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2211', 'Pathologie Médicale, Pharmacologie et Thérapeutique II', 4, 45, 15, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2212', 'Pharmacie Galénique III', 6, 45, 15, 30, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2213', 'Pharmacocinétique Clinique', 3, 30, 15, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2214', 'Pharmacoéconomie', 1, 15, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2215', 'Pharmacogénomique', 1, 15, 0, 0, 2,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2216', 'Pratique Pharmaceutique II', 10, 30, 30, 90, 0,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;
INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, semester, promotion_id, course_type)
SELECT 'PHAR2217', 'Psychologie Médicale', 2, 30, 0, 0, 1,
       p.id, 'OBLIGATOIRE'
FROM promotions p WHERE p.code = 'PHAR-P2'
ON CONFLICT (code, promotion_id) DO UPDATE SET 
  name = EXCLUDED.name, credits = EXCLUDED.credits, hours_cm = EXCLUDED.hours_cm,
  hours_td = EXCLUDED.hours_td, hours_tp = EXCLUDED.hours_tp, semester = EXCLUDED.semester;

-- ============================================
-- ENSEIGNANTS TITULAIRES (50 professeurs)
-- Password par défaut: Prof@Pharma2026
-- ============================================

-- BAMBI NYANGUILE (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sm_bambi@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('sm_bambi@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NYANGUILE', 'BAMBI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.577', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'sm_bambi@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- BUYA BANZENGA (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'aristote.buya@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('aristote.buya@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BANZENGA', 'BUYA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-19.268', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'aristote.buya@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- CIMANGA KANYANGA (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'rkcimanga@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('rkcimanga@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KANYANGA', 'CIMANGA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1.719', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'rkcimanga@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- CIZA HAMULI (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'cpatient2017@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('cpatient2017@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HAMULI', 'CIZA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.388', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'cpatient2017@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- ILANGALA BOOKA (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ange.ilangala@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ange.ilangala@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BOOKA', 'ILANGALA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.389', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'ange.ilangala@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KABALA DIHUIDI (P.E)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kabaladihuidi@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kabaladihuidi@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'DIHUIDI', 'KABALA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.748', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'kabaladihuidi@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KALENDA TSHILOMBO (P. A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'nickalenda@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('nickalenda@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TSHILOMBO', 'KALENDA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.392', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'nickalenda@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KALENDA T. DIBUNGI (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'dibungikalenda@yahoo.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('dibungikalenda@yahoo.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'DIBUNGI', 'KALENDA T.', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-8.458', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'dibungikalenda@yahoo.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KAMBALE KAVUNGERE (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'espoirkyuma@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('espoirkyuma@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAVUNGERE', 'KAMBALE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.391', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'espoirkyuma@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KAMBERE AMERIGOS (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'dadkambere@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('dadkambere@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AMERIGOS', 'KAMBERE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-22.254', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'dadkambere@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KIMBENI MALONGO (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tresor.kimbeni@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tresor.kimbeni@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MALONGO', 'KIMBENI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14.141', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'tresor.kimbeni@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KODONDI KULE-KOTO (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'k_kodondi@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('k_kodondi@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KULE-KOTO', 'KODONDI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1.099', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'k_kodondi@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LAMI KRIS (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'krislami839@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('krislami839@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KRIS', 'LAMI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.393', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'krislami839@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LAMI NZUNZU (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jos.lam85@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('jos.lam85@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NZUNZU', 'LAMI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1.184', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'jos.lam85@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LIESSE IYAMBA (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'liesseiyamba@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('liesseiyamba@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'IYAMBA', 'LIESSE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.575', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'liesseiyamba@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LUSAKIBANZA MANZO (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mlusakibanza@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mlusakibanza@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MANZO', 'LUSAKIBANZA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14.352', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-PT'),
       TRUE
FROM users u WHERE u.email = 'mlusakibanza@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MAMBANZULUA NGOMA (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'pmambanzuluang@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('pmambanzuluang@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NGOMA', 'MAMBANZULUA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14.064', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SB'),
       TRUE
FROM users u WHERE u.email = 'pmambanzuluang@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MANA KIALENGILA (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'manakialengila@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('manakialengila@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KIALENGILA', 'MANA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16.359', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'manakialengila@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MASIALA TSOBO (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'christophe.masiala@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('christophe.masiala@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TSOBO', 'MASIALA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.791', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'christophe.masiala@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MAVAR TAYEY MBAY (P.E)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mavartayey@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mavartayey@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MBAY', 'MAVAR TAYEY', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.239', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'mavartayey@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MAWONZI NDUELE (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'prof.pharma21@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('prof.pharma21@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NDUELE', 'MAWONZI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21.274', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-PT'),
       TRUE
FROM users u WHERE u.email = 'prof.pharma21@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBENZA MBAMBI (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'prof.pharma22@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('prof.pharma22@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MBAMBI', 'MBENZA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR---', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-PT'),
       TRUE
FROM users u WHERE u.email = 'prof.pharma22@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBENZA PHUATI (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'adembenza@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('adembenza@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PHUATI', 'MBENZA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.251', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SB'),
       TRUE
FROM users u WHERE u.email = 'adembenza@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBINZE KINDENGE (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jeremiembinze@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('jeremiembinze@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KINDENGE', 'MBINZE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.578', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'jeremiembinze@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MEMVANGA BONDO (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'patrick.memvanga@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('patrick.memvanga@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BONDO', 'MEMVANGA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16.389', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'patrick.memvanga@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MESIA KAHUNU (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mesia.kahunu@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mesia.kahunu@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAHUNU', 'MESIA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-0.715', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-PT'),
       TRUE
FROM users u WHERE u.email = 'mesia.kahunu@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MIANDA MUTOMBO (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sephoramianda@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('sephoramianda@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MUTOMBO', 'MIANDA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.396', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'sephoramianda@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MPUZA KAPUNDU (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mpuzakapundu@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mpuzakapundu@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAPUNDU', 'MPUZA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1.165', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mpuzakapundu@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUFUSAMA KOY SITA (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mufphar@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mufphar@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SITA', 'MUFUSAMA KOY', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-17.545', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mufphar@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUKALA NSENGU (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jeremiembinze@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('jeremiembinze@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NSENGU', 'MUKALA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1183', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-SB'),
       TRUE
FROM users u WHERE u.email = 'jeremiembinze@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MULWAHALI WAMBALE (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jose.mulwahali@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('jose.mulwahali@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'WAMBALE', 'MULWAHALI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.579', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'jose.mulwahali@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUSUYU MUGANZA (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'cdmuganza@hotmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('cdmuganza@hotmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MUGANZA', 'MUSUYU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14.138', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'cdmuganza@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUTWALE KAPEPULA (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'paulin.mutwale@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('paulin.mutwale@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAPEPULA', 'MUTWALE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16.368', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'paulin.mutwale@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NDELO-di-PHANZU (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'garaphmutwal@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('garaphmutwal@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '', 'NDELO-di-PHANZU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-8.459', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'garaphmutwal@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NGOMBE KABAMBA (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jos_ndelo@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('jos_ndelo@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KABAMBA', 'NGOMBE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.298', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'jos_ndelo@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NKANGA ISALOMBOTO (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'nadegengk@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('nadegengk@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ISALOMBOTO', 'NKANGA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.398', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'nadegengk@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NSANGU MPASI (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jnsangum@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('jnsangum@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MPASI', 'NSANGU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-8.186', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SB'),
       TRUE
FROM users u WHERE u.email = 'jnsangum@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NSIMBA MIEZI (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'marie.nsimba@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('marie.nsimba@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MIEZI', 'NSIMBA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1.42', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'marie.nsimba@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NSUADI MANGA (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'francine.nsuadim@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('francine.nsuadim@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MANGA', 'NSUADI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14.065', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-PT'),
       TRUE
FROM users u WHERE u.email = 'francine.nsuadim@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NUAPIA BELO (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'yannicknuapia9@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('yannicknuapia9@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BELO', 'NUAPIA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-17.546', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'yannicknuapia9@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- ONOKODI KASONGO (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'onokodi.jacques@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('onokodi.jacques@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KASONGO', 'ONOKODI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.484', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'onokodi.jacques@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- OPOTA ONYA (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'opotadaniel@hotmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('opotadaniel@hotmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ONYA', 'OPOTA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.484', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-GAM'),
       TRUE
FROM users u WHERE u.email = 'opotadaniel@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- SUAMI BUEYA (P.A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'suamibueya@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('suamibueya@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUEYA', 'SUAMI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14.066', 'PROFESSEUR_ASSOCIE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SB'),
       TRUE
FROM users u WHERE u.email = 'suamibueya@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TAKAISI KINUNI (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'takaisik@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('takaisik@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KINUNI', 'TAKAISI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-1.495', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'takaisik@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TONA LUTETE (P.O)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tonalutete@gmail.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tonalutete@gmail.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LUTETE', 'TONA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.794', 'PROFESSEUR_ORDINAIRE', 
       (SELECT id FROM departments WHERE code = 'PHAR-PT'),
       TRUE
FROM users u WHERE u.email = 'tonalutete@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TSHILUMBU KANTOLA (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ptshika@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ptshika@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KANTOLA', 'TSHILUMBU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.299', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-SBA'),
       TRUE
FROM users u WHERE u.email = 'ptshika@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TSHISEKEDI TSHIBANGU (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tshis_pas@yahoo.fr') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tshis_pas@yahoo.fr', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TSHIBANGU', 'TSHISEKEDI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16.369', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'tshis_pas@yahoo.fr'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TSHITENGE TSHITENGE (P)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'dtshitenge2007@yahoo.com') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('dtshitenge2007@yahoo.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TSHITENGE', 'TSHITENGE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-17.692', 'PROFESSEUR', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'dtshitenge2007@yahoo.com'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TSHODI EHATA Michel (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'prof.pharma49@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('prof.pharma49@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michel', 'TSHODI EHATA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-14234', 'ASSISTANT', 
       NULL,
       TRUE
FROM users u WHERE u.email = 'prof.pharma49@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MAVANGA MABAYA (Dr)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'prof.pharma50@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('prof.pharma50@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MABAYA', 'MAVANGA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR---', 'ASSISTANT', 
       NULL,
       TRUE
FROM users u WHERE u.email = 'prof.pharma50@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- ============================================
-- PERSONNEL SCIENTIFIQUE (51 membres)
-- Password par défaut: Prof@Pharma2026
-- ============================================

-- NDELO MATONDO (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ndelo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ndelo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MATONDO', 'NDELO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16432', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'ndelo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KIKWETA MUNDUKU (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kikweta.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kikweta.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MUNDUKU', 'KIKWETA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16501', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'kikweta.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- BAYEBILA MENANZAMBI (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'bayebila.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('bayebila.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MENANZAMBI', 'BAYEBILA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18386', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'bayebila.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- DHIMBE BUJO (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'dhimbe.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('dhimbe.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUJO', 'DHIMBE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20211', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'dhimbe.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- DISASHI TSHIMPANGILA (Ass. 2)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'disashi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('disashi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TSHIMPANGILA', 'DISASHI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-17719', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'disashi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- DUKI MPANZU Arthur (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'dukimpanzu.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('dukimpanzu.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arthur', 'DUKI MPANZU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-11.24', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'dukimpanzu.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- INKALABA KASASUKA (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'inkalaba.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('inkalaba.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KASASUKA', 'INKALABA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18.39', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'inkalaba.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- IVE KITENGE Dadit (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ivekitenge.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ivekitenge.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dadit', 'IVE KITENGE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21353', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'ivekitenge.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KABEYA KABENGELE (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kabeya.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kabeya.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KABENGELE', 'KABEYA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18158', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'kabeya.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KABONGO KAPINGA (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kabongo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kabongo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAPINGA', 'KABONGO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16428', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'kabongo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KASONGO KAWAYIDIKO (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kasongo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kasongo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAWAYIDIKO', 'KASONGO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16501', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'kasongo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KIMBENZE Rodrigue (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kimbenze.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kimbenze.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rodrigue', 'KIMBENZE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20696', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'kimbenze.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- KODONDI NGBANDANI (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kodondi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('kodondi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'NGBANDANI', 'KODONDI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18392', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'kodondi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LAPIKA FWAM Cathy (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'lapikafwam.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('lapikafwam.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cathy', 'LAPIKA FWAM', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-19154', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'lapikafwam.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LOKOLE BAHATI Pathy (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'lokolebahati.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('lokolebahati.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pathy', 'LOKOLE BAHATI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20697', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'lokolebahati.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LUYINDAMO SAVU (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'luyindamo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('luyindamo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SAVU', 'LUYINDAMO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20699', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'luyindamo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- LUZALA MUKANDE (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'luzala.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('luzala.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MUKANDE', 'LUZALA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20.7', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'luzala.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MABENGA MOSHI Paola (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mabengamoshi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mabengamoshi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Paola', 'MABENGA MOSHI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21083', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mabengamoshi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MANKULU KAKUMBA (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mankulu.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mankulu.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KAKUMBA', 'MANKULU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18394', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mankulu.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MAYANGI MAKOLA (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mayangi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mayangi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MAKOLA', 'MAYANGI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.25', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mayangi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MAYUWU KWETE Merveille (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mayuwukwete.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mayuwukwete.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Merveille', 'MAYUWU KWETE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21085', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mayuwukwete.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBAMU MAYA Blaise (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbamumaya.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mbamumaya.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Blaise', 'MBAMU MAYA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16449', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mbamumaya.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBOMBO MUNGITSHI Patricia (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbombomungitshi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mbombomungitshi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Patricia', 'MBOMBO MUNGITSHI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-17693', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mbombomungitshi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBUNDU LUKUKULA (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbundu.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mbundu.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LUKUKULA', 'MBUNDU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.5', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mbundu.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MBUSA VIHEMBO (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbusa.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mbusa.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VIHEMBO', 'MBUSA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18395', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mbusa.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MIHATANO BARIHUTA Magain (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mihatanobarihuta.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mihatanobarihuta.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Magain', 'MIHATANO BARIHUTA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20213', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mihatanobarihuta.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MILO KEBWI Louis (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'milokebwi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('milokebwi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Louis', 'MILO KEBWI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20071', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'milokebwi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MOGISHO KASAGO (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mogisho.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mogisho.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KASAGO', 'MOGISHO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-18397', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mogisho.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MONA BIZIZI (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mona.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mona.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BIZIZI', 'MONA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20214', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mona.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUANGA KALUNDA Claude (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'muangakalunda.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('muangakalunda.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Claude', 'MUANGA KALUNDA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21223', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'muangakalunda.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUIPATA MUABILUA (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'muipata.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('muipata.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MUABILUA', 'MUIPATA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20703', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'muipata.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUKANYA MPOYI (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukanya.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mukanya.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MPOYI', 'MUKANYA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20215', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mukanya.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUKENDI CIMUANGA (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukendi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mukendi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CIMUANGA', 'MUKENDI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20704', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mukendi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUKUBWA KATHONDO Grady (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukubwakathondo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mukubwakathondo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grady', 'MUKUBWA KATHONDO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20216', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mukubwakathondo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUKUMBAYI MULUMBA (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukumbayi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mukumbayi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MULUMBA', 'MUKUMBAYI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20705', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mukumbayi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUKUNDI LUKUSA Dorcas (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukundilukusa.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mukundilukusa.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dorcas', 'MUKUNDI LUKUSA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20217', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mukundilukusa.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MUTONKOLE ILUNGA (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mutonkole.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mutonkole.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ILUNGA', 'MUTONKOLE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20218', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mutonkole.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- MWABONKOLO MANYALA (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'mwabonkolo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('mwabonkolo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MANYALA', 'MWABONKOLO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20219', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'mwabonkolo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NANGA MFWAWUNU (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'nanga.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('nanga.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MFWAWUNU', 'NANGA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15.58', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'nanga.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NDJIBU KIUNGU Walter (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ndjibukiungu.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ndjibukiungu.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Walter', 'NDJIBU KIUNGU', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20706', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'ndjibukiungu.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NGELEKA NGOIE Joël (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ngelekangoie.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ngelekangoie.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joël', 'NGELEKA NGOIE', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20.22', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'ngelekangoie.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NGOY KANKIENZA Francis (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ngoykankienza.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('ngoykankienza.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Francis', 'NGOY KANKIENZA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20707', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'ngoykankienza.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NZINGULA PHASI Olivier (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'nzingulaphasi.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('nzingulaphasi.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Olivier', 'NZINGULA PHASI', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-16.6', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'nzingulaphasi.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- NZONZI MBALA Rachidi (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'nzonzimbala.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('nzonzimbala.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rachidi', 'NZONZI MBALA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20709', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'nzonzimbala.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- PANDI BELEBINDA David (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'pandibelebinda.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('pandibelebinda.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'PANDI BELEBINDA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-17056', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'pandibelebinda.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- SONGO MILETE (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'songo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('songo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MILETE', 'SONGO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-7.849', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'songo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TEMBO MONYELE (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tembo.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tembo.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MONYELE', 'TEMBO', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21084', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'tembo.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TSHIMANGA MUYONA Clément (Ass. 0)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tshimangamuyona.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tshimangamuyona.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Clément', 'TSHIMANGA MUYONA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-21086', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'tshimangamuyona.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TUALA TUALA DI LUKANDA Robert (Ass. 1)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tualatualadilukanda.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tualatualadilukanda.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'TUALA TUALA DI LUKANDA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-20.71', 'ASSISTANT', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'tualatualadilukanda.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- TUJIBIKILA MUKUTA (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tujibikila.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('tujibikila.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MUKUTA', 'TUJIBIKILA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-15581', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'tujibikila.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- WELO UNYA Joseph (C.T.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'welounya.pharma@unikin.ac.cd') THEN
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('welounya.pharma@unikin.ac.cd', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joseph', 'WELO UNYA', 'TEACHER', TRUE);
  END IF;
END $$;

INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent)
SELECT u.id, 'PHAR-10428', 'CHEF_TRAVAUX', 
       (SELECT id FROM departments WHERE code = 'PHAR-CMP'),
       TRUE
FROM users u WHERE u.email = 'welounya.pharma@unikin.ac.cd'
ON CONFLICT (user_id) DO UPDATE SET 
  grade = EXCLUDED.grade,
  department_id = EXCLUDED.department_id;

-- ============================================
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

-- ============================================
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

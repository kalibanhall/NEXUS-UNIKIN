-- ============================================================
-- IMPORT DONNÉES - Faculté des Sciences Pharmaceutiques
-- Généré automatiquement depuis COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx
-- Date: 2026-02-23
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CRÉATION DES 5 DÉPARTEMENTS ACADÉMIQUES
-- ============================================================
-- Note: On garde les départements existants (Pharmacie ID=12, LTP ID=81)
-- car les promotions et étudiants y sont rattachés.
-- On ajoute les 5 départements académiques pour les enseignants.

INSERT INTO departments (name, code, faculty_id, created_at, updated_at)
SELECT 'Chimie Médicinale et Pharmacognosie', 'CMP_8', 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'CMP_8');

INSERT INTO departments (name, code, faculty_id, created_at, updated_at)
SELECT 'Galénique et Analyse des Médicaments', 'GAM_8', 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'GAM_8');

INSERT INTO departments (name, code, faculty_id, created_at, updated_at)
SELECT 'Sciences Biopharmaceutiques et Alimentaires', 'SBA_8', 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'SBA_8');

INSERT INTO departments (name, code, faculty_id, created_at, updated_at)
SELECT 'Pharmacologie et Thérapeutique', 'PHT_8', 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'PHT_8');

INSERT INTO departments (name, code, faculty_id, created_at, updated_at)
SELECT 'Sciences de Base', 'SDB_8', 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'SDB_8');

-- ============================================================
-- 2. INSERTION DES COURS (88 cours)
-- ============================================================

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1101', 'Anglais Scientifique I', 4, 45, 0, 15, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1101' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1102', 'Anthropologie Médicale', 1, 15, 0, 0, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1102' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1103', 'Biologie Cellulaire Animale', 5, 45, 0, 30, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1103' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1104', 'Biologie Cellulaire Végétale', 4, 30, 0, 30, 29, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1104' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1105', 'Chimie Générale', 7, 60, 0, 45, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1105' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1106', 'Chimie Inorganique', 3, 30, 0, 15, 29, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1106' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1107', 'Chimie Organique I', 7, 60, 0, 45, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1107' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1108', 'Education à la Citoyenneté', 2, 30, 0, 0, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1108' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1109', 'Histoire de la Pharmacie', 1, 15, 0, 0, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1109' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1110', 'Informatique  I', 2, 15, 0, 15, 29, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1110' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1111', 'Logique et Expression Orale et Ecrite', 3, 30, 0, 15, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1111' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1112', 'Mathématiques', 7, 60, 0, 45, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1112' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1113', 'Physique', 7, 60, 0, 45, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1113' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1114', 'Psychologie Générale', 2, 30, 0, 0, 29, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1114' AND promotion_id = 29);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1201', 'Anatomie Humaine', 4, 60, 0, 0, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1201' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1202', 'Anglais Scientifique II', 2, 15, 15, 0, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1202' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1203', 'Biochimie Générale Structurale', 4, 30, 0, 30, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1203' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1204', 'Biostatistiques', 4, 30, 0, 30, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1204' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1205', 'Botanique Systématique (Phylogénique et Taxonomique)', 5, 45, 0, 30, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1205' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1206', 'Chimie Analytique I', 9, 45, 0, 90, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1206' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1207', 'Chimie Organique II', 6, 45, 0, 45, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1207' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1208', 'Chimie Physique Appliquée aux Sciences Pharmaceutiques', 3, 30, 0, 15, 13, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1208' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1209', 'Informatique II', 4, 30, 0, 30, 13, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1209' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1210', 'Initiation à la Recherche Scientifique', 2, 15, 15, 0, 13, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1210' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1211', 'Physiologie Humaine', 7, 75, 0, 30, 13, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1211' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1212', 'Physiologie Végétale', 2, 15, 0, 15, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1212' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1213', 'Santé Publique et Hygiène', 4, 45, 0, 15, 13, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1213' AND promotion_id = 13);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1301', 'Anglais Scientifique III', 1, 0, 15, 0, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1301' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1302', 'Biochimie Générale Métabolique', 4, 30, 0, 30, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1302' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1303', 'Biologie Moléculaire', 3, 30, 0, 15, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1303' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1304', 'Chimie Analytique II', 7, 60, 0, 45, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1304' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1305', 'Chimie Pharmaceutique Inorganique', 3, 30, 0, 15, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1305' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1306', 'Chimie Pharmaceutique Organique I', 5, 45, 0, 30, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1306' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1307', 'Immunologie Générale et Pathologique', 3, 30, 0, 15, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1307' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1308', 'Information Pharmaceutique', 1, 0, 15, 0, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1308' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1309', 'Introduction à la Pratique Pharmaceutique', 5, 30, 15, 30, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1309' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1310', 'Microbiologie Générale et Pharmaceutique', 4, 30, 0, 30, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1310' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1311', 'Parasitologie Médicale', 3, 30, 0, 15, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1311' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1132', 'Pharmacie Galénique I', 6, 45, 0, 45, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1132' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1313', 'Pharmacognosie I', 4, 30, 0, 30, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1313' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1314', 'Pharmacologie   Générale', 4, 45, 15, 0, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1314' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1315', 'Pharmacopée Traditionnelle', 1, 15, 0, 0, 64, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1315' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1316', 'Physiopathologie', 4, 60, 0, 0, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1316' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR1317', 'Travail de Fin de Cycle', 4, 0, 0, 0, 64, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR1317' AND promotion_id = 64);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2101', 'Anglais Scientifique IV', 1, 0, 15, 0, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2101' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2102', 'Assurance-Qualité des soins', 1, 15, 0, 0, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2102' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2103', 'Biochimie Médicale', 5, 45, 0, 30, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2103' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2104', 'Biotechnologie Pharmaceutique', 1, 15, 0, 0, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2104' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2105', 'Chimie Pharmaceutique Organique II', 7, 45, 15, 45, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2105' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2106', 'Hématologie et Immuno- Hématologie', 3, 30, 0, 15, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2106' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2107', 'Microbiologie Médicale et Industrielle', 5, 45, 0, 30, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2107' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2108', 'Pathologie Médicale, Pharmacologie et Thérapeutique I', 8, 90, 15, 15, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2108' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2109', 'Pharmacie Clinique I', 2, 15, 15, 0, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2109' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2110', 'Pharmacie Galénique II', 6, 45, 15, 30, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2110' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2111', 'Pharmacoépidémiologie', 2, 15, 0, 15, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2111' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2112', 'Pharmacognosie II', 7, 60, 0, 45, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2112' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2113', 'Pharmacovigilance', 1, 0, 15, 0, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2113' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2114', 'Phytopharmacie', 1, 15, 0, 0, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2114' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2115', 'Pratique Pharmaceutique I', 5, 0, 30, 45, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2115' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2116', 'Séminaire d’Elaboration et d’Evaluation des Projets', 1, 0, 15, 0, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2116' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2117', 'Sémiologie Médicale', 4, 30, 30, 0, 142, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2117' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2118', 'Toxicologie Analytique et Clinique', 4, 30, 0, 30, 142, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2118' AND promotion_id = 142);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2201', 'Analyse des Aliments', 6, 45, 0, 45, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2201' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2202', 'Analyse des Médicaments et des Produits de Santé', 6, 45, 0, 45, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2202' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2203', 'Anglais Scientifique V', 1, 0, 15, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2203' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2204', 'Anthropologie Pharmaceutique', 1, 15, 0, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2204' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2205', 'Entrepreneuriat et Leadership', 2, 15, 15, 0, 80, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2205' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2206', 'Ethique et Déontologie Pharmaceutique', 2, 15, 15, 0, 80, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2206' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2207', 'Gestion Pharmaceutique et Informatique', 6, 45, 15, 30, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2207' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2208', 'Législation et Règlementation Pharmaceutiques', 3, 30, 15, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2208' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2209', 'Méthodologie et Ethique de la Recherche Biomédicale', 2, 30, 0, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2209' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2210', 'Nutrition et Diététique', 3, 30, 0, 15, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2210' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2211', 'Pathologie Médicale, Pharmacologie et Thérapeutique II', 4, 45, 15, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2211' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2212', 'Pharmacie Galénique III', 6, 45, 15, 30, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2212' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2213', 'Pharmacocinétique Clinique', 3, 30, 15, 0, 80, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2213' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2214', 'Pharmacoéconomie', 1, 15, 0, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2214' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2215', 'Pharmacogénomique', 1, 15, 0, 0, 80, 2, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2215' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2216', 'Pratique Pharmaceutique II', 10, 30, 30, 90, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2216' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR2217', 'Psychologie Médicale', 2, 30, 0, 0, 80, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR2217' AND promotion_id = 80);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3001', 'Production et Analyse des Médicaments', 4, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3001' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3002', 'Pratique Pharmaceutique', 6, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3002' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3003', 'Biologie Médicale', 3, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3003' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3004', 'Connaissances générales', 2, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3004' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3005', 'Rapport de stages', 5, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3005' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3006', 'Cotation du Maître de stage', 3, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3006' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3007', 'Cotation du Directeur', 2, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3007' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3008', 'Cotation des Lecteurs', 3, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3008' AND promotion_id = 179);

INSERT INTO courses (code, name, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type, is_active, created_at, updated_at)
SELECT 'PHAR3009', 'Défense publique', 3, 0, 0, 0, 179, 1, 'OBLIGATOIRE', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'PHAR3009' AND promotion_id = 179);

-- ============================================================
-- 3. INSERTION DES ENSEIGNANTS (101 enseignants)
-- ============================================================
-- Mot de passe par défaut: Nexus2026!

-- 1. BAMBI NYANGUILE (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'sm_bambi@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'BAMBI', 'NYANGUILE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sm_bambi@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'sm_bambi@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.577', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 2. BUYA BANZENGA (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'aristote.buya@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'BUYA', 'BANZENGA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'aristote.buya@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'aristote.buya@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '19.268', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 3. CIMANGA KANYANGA (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'rkcimanga@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'CIMANGA', 'KANYANGA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rkcimanga@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'rkcimanga@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1.719', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 4. CIZA HAMULI (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'cpatient2017@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'CIZA', 'HAMULI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'cpatient2017@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'cpatient2017@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.388', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 5. ILANGALA BOOKA (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ange.ilangala@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'ILANGALA', 'BOOKA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ange.ilangala@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ange.ilangala@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.389', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 6. KABALA DIHUIDI (P.E)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kabaladihuidi@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KABALA', 'DIHUIDI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kabaladihuidi@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kabaladihuidi@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7.748', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 7. KALENDA TSHILOMBO (P. A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'nickalenda@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KALENDA', 'TSHILOMBO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nickalenda@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'nickalenda@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.392', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 8. KALENDA T. DIBUNGI (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'dibungikalenda@yahoo.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KALENDA', 'T. DIBUNGI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dibungikalenda@yahoo.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'dibungikalenda@yahoo.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '8.458', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 9. KAMBALE KAVUNGERE (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'espoirkyuma@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KAMBALE', 'KAVUNGERE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'espoirkyuma@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'espoirkyuma@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.391', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 10. KAMBERE AMERIGOS (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'dadkambere@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KAMBERE', 'AMERIGOS', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dadkambere@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'dadkambere@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '22.254', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 11. KIMBENI MALONGO (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tresor.kimbeni@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KIMBENI', 'MALONGO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tresor.kimbeni@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tresor.kimbeni@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14.141', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 12. KODONDI KULE-KOTO (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'k_kodondi@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KODONDI', 'KULE-KOTO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'k_kodondi@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'k_kodondi@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1.099', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 13. LAMI KRIS (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'krislami839@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'LAMI', 'KRIS', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'krislami839@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'krislami839@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.393', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 14. LAMI NZUNZU (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'jos.lam85@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'LAMI', 'NZUNZU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jos.lam85@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'jos.lam85@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1.184', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 15. LIESSE IYAMBA (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'liesseiyamba@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'LIESSE', 'IYAMBA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'liesseiyamba@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'liesseiyamba@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.575', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 16. LUSAKIBANZA MANZO (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mlusakibanza@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'LUSAKIBANZA', 'MANZO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mlusakibanza@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mlusakibanza@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Pharmacologie et Thérapeutique' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14.352', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 17. MAMBANZULUA NGOMA (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'pmambanzuluang@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MAMBANZULUA', 'NGOMA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pmambanzuluang@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'pmambanzuluang@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences de Base' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14.064', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 18. MANA KIALENGILA (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'manakialengila@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MANA', 'KIALENGILA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manakialengila@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'manakialengila@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16.359', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 19. MASIALA TSOBO (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'christophe.masiala@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MASIALA', 'TSOBO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'christophe.masiala@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'christophe.masiala@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7.791', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 20. MAVAR TAYEY MBAY (P.E)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mavartayey@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MAVAR', 'TAYEY MBAY', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mavartayey@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mavartayey@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7.239', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 21. MAWONZI NDUELE (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mawonzi.nduele@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MAWONZI', 'NDUELE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mawonzi.nduele@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mawonzi.nduele@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Pharmacologie et Thérapeutique' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21.274', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 22. MBENZA MBAMBI (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mbenza.mbambi@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MBENZA', 'MBAMBI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbenza.mbambi@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mbenza.mbambi@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Pharmacologie et Thérapeutique' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, 'FSPHAR_001', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 23. MBENZA PHUATI (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'adembenza@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MBENZA', 'PHUATI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'adembenza@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'adembenza@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences de Base' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.251', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 24. MBINZE KINDENGE (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'jeremiembinze@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MBINZE', 'KINDENGE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jeremiembinze@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'jeremiembinze@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.578', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 25. MEMVANGA BONDO (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'patrick.memvanga@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MEMVANGA', 'BONDO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'patrick.memvanga@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'patrick.memvanga@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16.389', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 26. MESIA KAHUNU (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mesia.kahunu@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MESIA', 'KAHUNU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mesia.kahunu@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mesia.kahunu@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Pharmacologie et Thérapeutique' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '0.715', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 27. MIANDA MUTOMBO (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'sephoramianda@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MIANDA', 'MUTOMBO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sephoramianda@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'sephoramianda@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.396', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 28. MPUZA KAPUNDU (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mpuzakapundu@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MPUZA', 'KAPUNDU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mpuzakapundu@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mpuzakapundu@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1.165', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 29. MUFUSAMA KOY SITA (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mufphar@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUFUSAMA', 'KOY SITA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mufphar@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mufphar@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '17.545', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 30. MUKALA NSENGU (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'jeremiembinze@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUKALA', 'NSENGU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jeremiembinze@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'jeremiembinze@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences de Base' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1183', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 31. MULWAHALI WAMBALE (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'jose.mulwahali@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MULWAHALI', 'WAMBALE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jose.mulwahali@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'jose.mulwahali@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.579', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 32. MUSUYU MUGANZA (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'cdmuganza@hotmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUSUYU', 'MUGANZA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'cdmuganza@hotmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'cdmuganza@hotmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14.138', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 33. MUTWALE KAPEPULA (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'paulin.mutwale@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUTWALE', 'KAPEPULA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'paulin.mutwale@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'paulin.mutwale@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16.368', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 34. NDELO-di-PHANZU (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'garaphmutwal@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'NDELO-di-PHANZU', '', '', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'garaphmutwal@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'garaphmutwal@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '8.459', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 35. NGOMBE KABAMBA (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'jos_ndelo@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NGOMBE', 'KABAMBA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jos_ndelo@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'jos_ndelo@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.298', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 36. NKANGA ISALOMBOTO (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'nadegengk@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NKANGA', 'ISALOMBOTO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nadegengk@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'nadegengk@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.398', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 37. NSANGU MPASI (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'jnsangum@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NSANGU', 'MPASI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jnsangum@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'jnsangum@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences de Base' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '8.186', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 38. NSIMBA MIEZI (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'marie.nsimba@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NSIMBA', 'MIEZI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'marie.nsimba@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'marie.nsimba@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1.42', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 39. NSUADI MANGA (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'francine.nsuadim@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NSUADI', 'MANGA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'francine.nsuadim@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'francine.nsuadim@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Pharmacologie et Thérapeutique' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14.065', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 40. NUAPIA BELO (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'yannicknuapia9@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NUAPIA', 'BELO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'yannicknuapia9@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'yannicknuapia9@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '17. 546', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 41. ONOKODI KASONGO (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'onokodi.jacques@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'ONOKODI', 'KASONGO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'onokodi.jacques@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'onokodi.jacques@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7.484', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 42. OPOTA ONYA (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'opotadaniel@hotmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'OPOTA', 'ONYA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'opotadaniel@hotmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'opotadaniel@hotmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Galénique et Analyse des Médicaments' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7.484-bis', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 43. SUAMI BUEYA (P.A)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'suamibueya@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'SUAMI', 'BUEYA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'suamibueya@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'suamibueya@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences de Base' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14.066', 'PROFESSEUR_ASSOCIE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 44. TAKAISI KINUNI (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'takaisik@unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TAKAISI', 'KINUNI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'takaisik@unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'takaisik@unikin.ac.cd';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '1.495', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 45. TONA LUTETE (P.O)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tonalutete@gmail.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TONA', 'LUTETE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tonalutete@gmail.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tonalutete@gmail.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Pharmacologie et Thérapeutique' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7.794', 'PROFESSEUR_ORDINAIRE', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 46. TSHILUMBU KANTOLA (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ptshika@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TSHILUMBU', 'KANTOLA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ptshika@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ptshika@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Sciences Biopharmaceutiques et Alimentaires' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.299', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 47. TSHISEKEDI TSHIBANGU (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tshis_pas@yahoo.fr', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TSHISEKEDI', 'TSHIBANGU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tshis_pas@yahoo.fr');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tshis_pas@yahoo.fr';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16. 369', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 48. TSHITENGE TSHITENGE (P)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'dtshitenge2007@yahoo.com', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TSHITENGE', 'TSHITENGE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dtshitenge2007@yahoo.com');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'dtshitenge2007@yahoo.com';
  
  -- Trouver le département
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Chimie Médicinale et Pharmacognosie' AND faculty_id = 8 LIMIT 1;
  IF v_dept_id IS NULL THEN v_dept_id := 12; END IF;
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '17.692', 'PROFESSEUR', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 49. TSHODI EHATA Michel (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tshodi.ehata.michel@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Michel', 'TSHODI', 'EHATA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tshodi.ehata.michel@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tshodi.ehata.michel@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '14234', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 50. MAVANGA MABAYA (Dr)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mavanga.mabaya@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MAVANGA', 'MABAYA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mavanga.mabaya@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mavanga.mabaya@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, 'FSPHAR_002', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 51. NDELO MATONDO (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ndelo.matondo@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NDELO', 'MATONDO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ndelo.matondo@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ndelo.matondo@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16432', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 52. KIKWETA MUNDUKU (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kikweta.munduku@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KIKWETA', 'MUNDUKU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kikweta.munduku@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kikweta.munduku@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16501', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 53. BAYEBILA MENANZAMBI (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'bayebila.menanzambi@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'BAYEBILA', 'MENANZAMBI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bayebila.menanzambi@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'bayebila.menanzambi@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18386', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 54. DHIMBE BUJO (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'dhimbe.bujo@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'DHIMBE', 'BUJO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dhimbe.bujo@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'dhimbe.bujo@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20211', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 55. DISASHI TSHIMPANGILA (Ass. 2)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'disashi.tshimpangila@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'DISASHI', 'TSHIMPANGILA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'disashi.tshimpangila@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'disashi.tshimpangila@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '17719', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 56. DUKI MPANZU Arthur (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'duki.mpanzu.arthur@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Arthur', 'DUKI', 'MPANZU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'duki.mpanzu.arthur@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'duki.mpanzu.arthur@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '11.24', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 57. INKALABA KASASUKA (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'inkalaba.kasasuka@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'INKALABA', 'KASASUKA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'inkalaba.kasasuka@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'inkalaba.kasasuka@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18.39', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 58. IVE KITENGE Dadit (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ive.kitenge.dadit@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Dadit', 'IVE', 'KITENGE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ive.kitenge.dadit@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ive.kitenge.dadit@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21353', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 59. KABEYA KABENGELE (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kabeya.kabengele@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KABEYA', 'KABENGELE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kabeya.kabengele@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kabeya.kabengele@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18158', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 60. KABONGO KAPINGA (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kabongo.kapinga@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KABONGO', 'KAPINGA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kabongo.kapinga@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kabongo.kapinga@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16428', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 61. KASONGO KAWAYIDIKO (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kasongo.kawayidiko@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KASONGO', 'KAWAYIDIKO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kasongo.kawayidiko@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kasongo.kawayidiko@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16501-bis', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 62. KIMBENZE Rodrigue (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kimbenze.rodrigue@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Rodrigue', 'KIMBENZE', '', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kimbenze.rodrigue@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kimbenze.rodrigue@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20696', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 63. KODONDI NGBANDANI (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'kodondi.ngbandani@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'KODONDI', 'NGBANDANI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kodondi.ngbandani@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'kodondi.ngbandani@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18392', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 64. LAPIKA FWAM Cathy (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'lapika.fwam.cathy@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Cathy', 'LAPIKA', 'FWAM', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lapika.fwam.cathy@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'lapika.fwam.cathy@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '19154', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 65. LOKOLE BAHATI Pathy (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'lokole.bahati.pathy@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Pathy', 'LOKOLE', 'BAHATI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lokole.bahati.pathy@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'lokole.bahati.pathy@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20697', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 66. LUYINDAMO SAVU (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'luyindamo.savu@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'LUYINDAMO', 'SAVU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'luyindamo.savu@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'luyindamo.savu@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20699', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 67. LUZALA MUKANDE (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'luzala.mukande@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'LUZALA', 'MUKANDE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'luzala.mukande@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'luzala.mukande@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20.7', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 68. MABENGA MOSHI Paola (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mabenga.moshi.paola@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Paola', 'MABENGA', 'MOSHI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mabenga.moshi.paola@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mabenga.moshi.paola@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21083', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 69. MANKULU KAKUMBA (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mankulu.kakumba@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MANKULU', 'KAKUMBA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mankulu.kakumba@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mankulu.kakumba@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18394', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 70. MAYANGI MAKOLA (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mayangi.makola@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MAYANGI', 'MAKOLA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mayangi.makola@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mayangi.makola@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.25', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 71. MAYUWU KWETE Merveille (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mayuwu.kwete.merveille@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Merveille', 'MAYUWU', 'KWETE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mayuwu.kwete.merveille@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mayuwu.kwete.merveille@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21085', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 72. MBAMU MAYA Blaise (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mbamu.maya.blaise@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Blaise', 'MBAMU', 'MAYA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbamu.maya.blaise@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mbamu.maya.blaise@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16449', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 73. MBOMBO MUNGITSHI Patricia (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mbombo.mungitshi.patricia@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Patricia', 'MBOMBO', 'MUNGITSHI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbombo.mungitshi.patricia@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mbombo.mungitshi.patricia@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '17693', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 74. MBUNDU LUKUKULA (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mbundu.lukukula@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MBUNDU', 'LUKUKULA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbundu.lukukula@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mbundu.lukukula@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.5', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 75. MBUSA VIHEMBO (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mbusa.vihembo@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MBUSA', 'VIHEMBO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mbusa.vihembo@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mbusa.vihembo@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18395', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 76. MIHATANO BARIHUTA Magain (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mihatano.barihuta.magain@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Magain', 'MIHATANO', 'BARIHUTA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mihatano.barihuta.magain@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mihatano.barihuta.magain@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20213', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 77. MILO KEBWI Louis (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'milo.kebwi.louis@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Louis', 'MILO', 'KEBWI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'milo.kebwi.louis@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'milo.kebwi.louis@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20071', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 78. MOGISHO KASAGO (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mogisho.kasago@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MOGISHO', 'KASAGO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mogisho.kasago@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mogisho.kasago@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '18397', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 79. MONA BIZIZI (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mona.bizizi@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MONA', 'BIZIZI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mona.bizizi@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mona.bizizi@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20214', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 80. MUANGA KALUNDA Claude (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'muanga.kalunda.claude@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Claude', 'MUANGA', 'KALUNDA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'muanga.kalunda.claude@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'muanga.kalunda.claude@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21223', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 81. MUIPATA MUABILUA (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'muipata.muabilua@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUIPATA', 'MUABILUA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'muipata.muabilua@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'muipata.muabilua@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20703', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 82. MUKANYA MPOYI (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mukanya.mpoyi@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUKANYA', 'MPOYI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukanya.mpoyi@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mukanya.mpoyi@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20215', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 83. MUKENDI CIMUANGA (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mukendi.cimuanga@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUKENDI', 'CIMUANGA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukendi.cimuanga@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mukendi.cimuanga@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20704', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 84. MUKUBWA KATHONDO Grady (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mukubwa.kathondo.grady@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Grady', 'MUKUBWA', 'KATHONDO', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukubwa.kathondo.grady@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mukubwa.kathondo.grady@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20216', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 85. MUKUMBAYI MULUMBA (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mukumbayi.mulumba@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUKUMBAYI', 'MULUMBA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukumbayi.mulumba@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mukumbayi.mulumba@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20705', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 86. MUKUNDI LUKUSA Dorcas (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mukundi.lukusa.dorcas@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Dorcas', 'MUKUNDI', 'LUKUSA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mukundi.lukusa.dorcas@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mukundi.lukusa.dorcas@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20217', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 87. MUTONKOLE ILUNGA (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mutonkole.ilunga@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MUTONKOLE', 'ILUNGA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mutonkole.ilunga@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mutonkole.ilunga@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20218', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 88. MWABONKOLO MANYALA (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'mwabonkolo.manyala@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'MWABONKOLO', 'MANYALA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mwabonkolo.manyala@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'mwabonkolo.manyala@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20219', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 89. NANGA MFWAWUNU (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'nanga.mfwawunu@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'NANGA', 'MFWAWUNU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nanga.mfwawunu@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'nanga.mfwawunu@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15.58', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 90. NDJIBU KIUNGU Walter (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ndjibu.kiungu.walter@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Walter', 'NDJIBU', 'KIUNGU', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ndjibu.kiungu.walter@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ndjibu.kiungu.walter@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20706', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 91. NGELEKA NGOIE Joël (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ngeleka.ngoie.joel@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Joël', 'NGELEKA', 'NGOIE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ngeleka.ngoie.joel@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ngeleka.ngoie.joel@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20.22', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 92. NGOY KANKIENZA Francis (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'ngoy.kankienza.francis@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Francis', 'NGOY', 'KANKIENZA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ngoy.kankienza.francis@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'ngoy.kankienza.francis@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20707', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 93. NZINGULA PHASI Olivier (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'nzingula.phasi.olivier@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Olivier', 'NZINGULA', 'PHASI', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nzingula.phasi.olivier@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'nzingula.phasi.olivier@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '16.6', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 94. NZONZI MBALA Rachidi (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'nzonzi.mbala.rachidi@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Rachidi', 'NZONZI', 'MBALA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nzonzi.mbala.rachidi@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'nzonzi.mbala.rachidi@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20709', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 95. PANDI BELEBINDA David (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'pandi.belebinda.david@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'David', 'PANDI', 'BELEBINDA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pandi.belebinda.david@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'pandi.belebinda.david@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '17056', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 96. SONGO MILETE (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'songo.milete@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'SONGO', 'MILETE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'songo.milete@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'songo.milete@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '7. 849', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 97. TEMBO MONYELE (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tembo.monyele@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TEMBO', 'MONYELE', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tembo.monyele@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tembo.monyele@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21084', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 98. TSHIMANGA MUYONA Clément (Ass. 0)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tshimanga.muyona.clement@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Clément', 'TSHIMANGA', 'MUYONA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tshimanga.muyona.clement@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tshimanga.muyona.clement@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '21086', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 99. TUALA TUALA DI LUKANDA Robert (Ass. 1)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tuala.tuala.di.lukanda.robert@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Robert', 'TUALA', 'TUALA DI LUKANDA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tuala.tuala.di.lukanda.robert@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tuala.tuala.di.lukanda.robert@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '20.71', 'ASSISTANT', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 100. TUJIBIKILA MUKUTA (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'tujibikila.mukuta@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', '', 'TUJIBIKILA', 'MUKUTA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tujibikila.mukuta@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'tujibikila.mukuta@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '15581', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- 101. WELO UNYA Joseph (C.T.)
DO $$
DECLARE v_user_id INTEGER;
DECLARE v_dept_id INTEGER;
BEGIN
  -- Créer le compte utilisateur
  INSERT INTO users (email, password, first_name, last_name, postnom, role, is_active, account_activated, must_change_password, created_at, updated_at)
  SELECT 'welo.unya.joseph@fsphar.unikin.ac.cd', '$2a$10$LdjUbh9AC7N1VeCJM05o1e7h0D5Cz.GGQmOOAsRLr1Pq5oJhEL1Oq', 'Joseph', 'WELO', 'UNYA', 'TEACHER', TRUE, TRUE, TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'welo.unya.joseph@fsphar.unikin.ac.cd');
  
  SELECT id INTO v_user_id FROM users WHERE email = 'welo.unya.joseph@fsphar.unikin.ac.cd';
  
  -- Trouver le département
  v_dept_id := 12; -- Pharmacie par défaut
  
  
  -- Créer l'enregistrement enseignant
  INSERT INTO teachers (user_id, matricule, grade, department_id, is_permanent, created_at, updated_at)
  SELECT v_user_id, '10428', 'CHEF_TRAVAUX', COALESCE(v_dept_id, 12), TRUE, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = v_user_id);
END $$;

-- ============================================================
-- 4. VÉRIFICATION
-- ============================================================
SELECT 'DÉPARTEMENTS CRÉÉS' AS info, COUNT(*) AS total FROM departments WHERE faculty_id = 8;
SELECT 'COURS INSÉRÉS' AS info, COUNT(*) AS total FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.faculty_id = 8;
SELECT 'ENSEIGNANTS CRÉÉS' AS info, COUNT(*) AS total FROM teachers t JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = 8;

COMMIT;

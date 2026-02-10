-- ============================================
-- NEXUS UNIKIN - Données Initiales
-- Uniquement les données essentielles
-- ============================================

-- ============================================
-- ANNÉE ACADÉMIQUE
-- ============================================

INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES
('2024-2025', '2024-10-01', '2025-09-30', TRUE);

-- ============================================
-- SUPER ADMIN UNIQUE
-- Password: Admin@Unikin2026 (hashed avec bcrypt)
-- ============================================

INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, must_change_password) VALUES
('admin@unikin.ac.cd', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4aH0sG7JQPHfPsJ6', 'Super', 'Administrateur', '+243 999 000 001', 'SUPER_ADMIN', TRUE, FALSE);

-- Lier à la table admins
INSERT INTO admins (user_id, admin_type, permissions)
SELECT id, 'SUPER_ADMIN', '{"all": true}'::jsonb
FROM users WHERE email = 'admin@unikin.ac.cd';

-- ============================================
-- FACULTÉS DE L'UNIKIN
-- ============================================

INSERT INTO faculties (code, name, description) VALUES
('DROIT', 'Faculté de Droit', 'Formation en sciences juridiques'),
('MEDECINE', 'Faculté de Médecine', 'Formation médicale et sciences de la santé'),
('POLYTECHNIQUE', 'Faculté Polytechnique', 'Formation en ingénierie et sciences techniques'),
('SCIENCES', 'Faculté des Sciences', 'Sciences fondamentales et appliquées'),
('LETTRES', 'Faculté des Lettres et Sciences Humaines', 'Langues, littérature et sciences humaines'),
('ECONOMIE', 'Faculté des Sciences Économiques et de Gestion', 'Économie, gestion et commerce'),
('SSPA', 'Faculté des Sciences Sociales, Politiques et Administratives', 'Sciences politiques et administration publique'),
('AGRONOMIE', 'Faculté des Sciences Agronomiques', 'Agriculture et sciences agronomiques'),
('PHARMACIE', 'Faculté des Sciences Pharmaceutiques', 'Sciences pharmaceutiques et pharmacologie'),
('PSYCHOLOGIE', 'Faculté de Psychologie et Sciences de l''Éducation', 'Psychologie, pédagogie et éducation'),
('PETROLIERS', 'Faculté des Sciences Pétrolières', 'Génie pétrolier et ressources naturelles'),
('INFORMATIQUE', 'Faculté des Sciences de l''Information et de la Communication', 'Informatique et communication');

-- ============================================
-- DÉPARTEMENTS (exemples pour chaque faculté)
-- ============================================

-- Droit
INSERT INTO departments (code, name, faculty_id)
SELECT 'DROIT-PRIV', 'Département de Droit Privé', id FROM faculties WHERE code = 'DROIT';
INSERT INTO departments (code, name, faculty_id)
SELECT 'DROIT-PUB', 'Département de Droit Public', id FROM faculties WHERE code = 'DROIT';
INSERT INTO departments (code, name, faculty_id)
SELECT 'DROIT-ECO', 'Département de Droit Économique', id FROM faculties WHERE code = 'DROIT';

-- Médecine
INSERT INTO departments (code, name, faculty_id)
SELECT 'MED-GEN', 'Département de Médecine Générale', id FROM faculties WHERE code = 'MEDECINE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'MED-CHIR', 'Département de Chirurgie', id FROM faculties WHERE code = 'MEDECINE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'MED-PED', 'Département de Pédiatrie', id FROM faculties WHERE code = 'MEDECINE';

-- Polytechnique
INSERT INTO departments (code, name, faculty_id)
SELECT 'POLY-INFO', 'Département d''Informatique', id FROM faculties WHERE code = 'POLYTECHNIQUE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'POLY-ELEC', 'Département d''Électricité', id FROM faculties WHERE code = 'POLYTECHNIQUE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'POLY-CIVIL', 'Département de Génie Civil', id FROM faculties WHERE code = 'POLYTECHNIQUE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'POLY-MECA', 'Département de Mécanique', id FROM faculties WHERE code = 'POLYTECHNIQUE';

-- Sciences
INSERT INTO departments (code, name, faculty_id)
SELECT 'SCI-MATH', 'Département de Mathématiques', id FROM faculties WHERE code = 'SCIENCES';
INSERT INTO departments (code, name, faculty_id)
SELECT 'SCI-PHY', 'Département de Physique', id FROM faculties WHERE code = 'SCIENCES';
INSERT INTO departments (code, name, faculty_id)
SELECT 'SCI-CHIM', 'Département de Chimie', id FROM faculties WHERE code = 'SCIENCES';
INSERT INTO departments (code, name, faculty_id)
SELECT 'SCI-BIO', 'Département de Biologie', id FROM faculties WHERE code = 'SCIENCES';

-- Économie
INSERT INTO departments (code, name, faculty_id)
SELECT 'ECO-GES', 'Département de Gestion', id FROM faculties WHERE code = 'ECONOMIE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'ECO-FIN', 'Département de Finance', id FROM faculties WHERE code = 'ECONOMIE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'ECO-MARK', 'Département de Marketing', id FROM faculties WHERE code = 'ECONOMIE';

-- Lettres
INSERT INTO departments (code, name, faculty_id)
SELECT 'LET-FR', 'Département de Langue Française', id FROM faculties WHERE code = 'LETTRES';
INSERT INTO departments (code, name, faculty_id)
SELECT 'LET-ANG', 'Département de Langue Anglaise', id FROM faculties WHERE code = 'LETTRES';
INSERT INTO departments (code, name, faculty_id)
SELECT 'LET-HIST', 'Département d''Histoire', id FROM faculties WHERE code = 'LETTRES';
INSERT INTO departments (code, name, faculty_id)
SELECT 'LET-PHILO', 'Département de Philosophie', id FROM faculties WHERE code = 'LETTRES';

-- SSPA
INSERT INTO departments (code, name, faculty_id)
SELECT 'SSPA-SPOL', 'Département de Sciences Politiques', id FROM faculties WHERE code = 'SSPA';
INSERT INTO departments (code, name, faculty_id)
SELECT 'SSPA-RI', 'Département de Relations Internationales', id FROM faculties WHERE code = 'SSPA';
INSERT INTO departments (code, name, faculty_id)
SELECT 'SSPA-ADM', 'Département d''Administration Publique', id FROM faculties WHERE code = 'SSPA';

-- Informatique
INSERT INTO departments (code, name, faculty_id)
SELECT 'INFO-DEV', 'Département de Développement Logiciel', id FROM faculties WHERE code = 'INFORMATIQUE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'INFO-RES', 'Département de Réseaux et Télécommunications', id FROM faculties WHERE code = 'INFORMATIQUE';
INSERT INTO departments (code, name, faculty_id)
SELECT 'INFO-IA', 'Département d''Intelligence Artificielle', id FROM faculties WHERE code = 'INFORMATIQUE';

-- ============================================
-- PROMOTIONS (pour l'année en cours)
-- ============================================

-- Créer des promotions L1 à L3 + M1, M2 pour quelques départements clés
INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L1-INFO', 'Licence 1 Informatique', 'L1', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'POLY-INFO' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L2-INFO', 'Licence 2 Informatique', 'L2', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'POLY-INFO' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L3-INFO', 'Licence 3 Informatique', 'L3', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'POLY-INFO' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L1-DROIT', 'Licence 1 Droit', 'L1', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'DROIT-PRIV' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L2-DROIT', 'Licence 2 Droit', 'L2', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'DROIT-PRIV' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L3-DROIT', 'Licence 3 Droit', 'L3', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'DROIT-PRIV' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L1-MED', 'Licence 1 Médecine', 'L1', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'MED-GEN' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L1-ECO', 'Licence 1 Économie', 'L1', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'ECO-GES' AND a.is_current = TRUE;

INSERT INTO promotions (code, name, level, department_id, academic_year_id)
SELECT 'L1-LETTRES', 'Licence 1 Lettres', 'L1', d.id, a.id
FROM departments d, academic_years a WHERE d.code = 'LET-FR' AND a.is_current = TRUE;

-- ============================================
-- FIN DES DONNÉES INITIALES
-- ============================================
-- 
-- Notes:
-- 1. Un seul super admin créé (admin@unikin.ac.cd / Admin@Unikin2026)
-- 2. 12 facultés de l'UNIKIN
-- 3. Départements principaux
-- 4. Promotions de base pour la structure
-- 5. Aucune donnée fictive d'étudiants, enseignants ou notes
-- 
-- Les vraies données seront ajoutées via l'interface d'administration
-- ============================================

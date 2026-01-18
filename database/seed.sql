-- ============================================
-- NEXUS UNIKIN - Données de Test (Seed)
-- Système de Gestion Universitaire
-- Université de Kinshasa
-- ============================================

-- Mot de passe hashé avec bcrypt (tous les mots de passe)
-- Admin@2026 = $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.a.N8.G1nQK8f5W
-- Prof@2026 = $2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Etudiant@2026 = $2a$12$K4GXJEoVjJDAQF0ybKxKAe1ZvZ3d1h1tMoMC6Q9aQ9o9K8OqQ8qZi
-- Employe@2026 = $2a$12$WxW3qXEJDQz1T1X3qYZDZ.2qAJQQZ3qYZDZ2qAJQQZ3qYZDZ2qAJQ

-- ============================================
-- ANNÉE ACADÉMIQUE
-- ============================================

INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES
('2024-2025', '2024-10-01', '2025-07-31', TRUE),
('2023-2024', '2023-10-01', '2024-07-31', FALSE);

-- ============================================
-- UTILISATEURS
-- ============================================

-- Super Admin
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('admin@unikin.ac.cd', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.a.N8.G1nQK8f5W', 'Jean-Pierre', 'Mbeki', '+243 812 345 678', 'SUPER_ADMIN', TRUE);

-- Enseignant
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('prof.kabongo@unikin.ac.cd', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'François', 'Kabongo', '+243 823 456 789', 'TEACHER', TRUE);

-- Étudiants
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('etudiant.mbuyi@student.unikin.ac.cd', '$2a$12$K4GXJEoVjJDAQF0ybKxKAe1ZvZ3d1h1tMoMC6Q9aQ9o9K8OqQ8qZi', 'Patrick', 'Mbuyi', '+243 834 567 890', 'STUDENT', TRUE),
('etudiant.kasongo@student.unikin.ac.cd', '$2a$12$K4GXJEoVjJDAQF0ybKxKAe1ZvZ3d1h1tMoMC6Q9aQ9o9K8OqQ8qZi', 'Marie', 'Kasongo', '+243 845 678 901', 'STUDENT', TRUE);

-- Employé
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('employe.mutombo@unikin.ac.cd', '$2a$12$WxW3qXEJDQz1T1X3qYZDZ.2qAJQQZ3qYZDZ2qAJQQZ3qYZDZ2qAJQ', 'Pierre', 'Mutombo', '+243 856 789 012', 'EMPLOYEE', TRUE);

-- Plus d'enseignants
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('prof.mukendi@unikin.ac.cd', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joseph', 'Mukendi', '+243 867 890 123', 'TEACHER', TRUE),
('prof.lukusa@unikin.ac.cd', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thérèse', 'Lukusa', '+243 878 901 234', 'TEACHER', TRUE);

-- Plus d'étudiants
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('etudiant.tshimanga@student.unikin.ac.cd', '$2a$12$K4GXJEoVjJDAQF0ybKxKAe1ZvZ3d1h1tMoMC6Q9aQ9o9K8OqQ8qZi', 'David', 'Tshimanga', '+243 889 012 345', 'STUDENT', TRUE),
('etudiant.kalonji@student.unikin.ac.cd', '$2a$12$K4GXJEoVjJDAQF0ybKxKAe1ZvZ3d1h1tMoMC6Q9aQ9o9K8OqQ8qZi', 'Sarah', 'Kalonji', '+243 890 123 456', 'STUDENT', TRUE),
('etudiant.ilunga@student.unikin.ac.cd', '$2a$12$K4GXJEoVjJDAQF0ybKxKAe1ZvZ3d1h1tMoMC6Q9aQ9o9K8OqQ8qZi', 'Emmanuel', 'Ilunga', '+243 901 234 567', 'STUDENT', TRUE);

-- ============================================
-- FACULTÉS
-- ============================================

INSERT INTO faculties (code, name, description, is_active) VALUES
('FSEG', 'Faculté des Sciences Économiques et de Gestion', 'Formation en économie, gestion et commerce', TRUE),
('FSI', 'Faculté des Sciences et Technologies de l''Information', 'Formation en informatique et technologies', TRUE),
('FDROIT', 'Faculté de Droit', 'Formation en sciences juridiques', TRUE),
('FMED', 'Faculté de Médecine', 'Formation en sciences médicales', TRUE),
('FPOLY', 'Faculté Polytechnique', 'Formation en ingénierie et sciences appliquées', TRUE);

-- ============================================
-- DÉPARTEMENTS
-- ============================================

INSERT INTO departments (code, name, description, faculty_id, is_active) VALUES
-- FSEG
('ECO', 'Département d''Économie', 'Sciences économiques et analyses', 1, TRUE),
('GEST', 'Département de Gestion', 'Management et administration', 1, TRUE),
-- FSI
('INFO', 'Département d''Informatique', 'Sciences informatiques et génie logiciel', 2, TRUE),
('TELECOM', 'Département de Télécommunications', 'Réseaux et télécommunications', 2, TRUE),
-- FDROIT
('DPUB', 'Département de Droit Public', 'Droit constitutionnel et administratif', 3, TRUE),
('DPRIV', 'Département de Droit Privé', 'Droit civil et commercial', 3, TRUE),
-- FMED
('MEDGEN', 'Département de Médecine Générale', 'Formation médicale de base', 4, TRUE),
-- FPOLY
('GENIE', 'Département de Génie Civil', 'Construction et infrastructures', 5, TRUE);

-- ============================================
-- PROMOTIONS
-- ============================================

INSERT INTO promotions (code, name, level, department_id, academic_year_id, is_active) VALUES
-- Informatique
('INFO-L1-2024', 'Informatique L1', 'L1', 3, 1, TRUE),
('INFO-L2-2024', 'Informatique L2', 'L2', 3, 1, TRUE),
('INFO-L3-2024', 'Informatique L3', 'L3', 3, 1, TRUE),
('INFO-M1-2024', 'Informatique M1', 'M1', 3, 1, TRUE),
('INFO-M2-2024', 'Informatique M2', 'M2', 3, 1, TRUE),
-- Économie
('ECO-L1-2024', 'Économie L1', 'L1', 1, 1, TRUE),
('ECO-L2-2024', 'Économie L2', 'L2', 1, 1, TRUE),
-- Droit
('DROIT-L1-2024', 'Droit L1', 'L1', 5, 1, TRUE),
-- Médecine
('MED-D1-2024', 'Médecine D1', 'D1', 7, 1, TRUE);

-- ============================================
-- ADMINISTRATEURS
-- ============================================

INSERT INTO admins (user_id, admin_type) VALUES
(1, 'SUPER_ADMIN');

-- ============================================
-- ENSEIGNANTS
-- ============================================

INSERT INTO teachers (user_id, matricule, grade, specialization, department_id, hire_date, is_permanent) VALUES
(2, 'ENS-2015-001', 'PROFESSEUR', 'Génie Logiciel et Bases de Données', 3, '2015-01-15', TRUE),
(7, 'ENS-2018-002', 'CHEF_TRAVAUX', 'Intelligence Artificielle', 3, '2018-03-01', TRUE),
(8, 'ENS-2020-003', 'ASSISTANT', 'Réseaux Informatiques', 4, '2020-09-01', FALSE);

-- ============================================
-- ÉTUDIANTS
-- ============================================

INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, status, payment_status, birth_date, birth_place, gender, nationality) VALUES
(3, 'ETU-2023-001', 2, '2023-10-01', 'ACTIVE', 'PAID', '2003-05-15', 'Kinshasa', 'M', 'Congolaise'),
(4, 'ETU-2022-002', 3, '2022-10-01', 'ACTIVE', 'BLOCKED', '2002-08-20', 'Lubumbashi', 'F', 'Congolaise'),
(9, 'ETU-2024-003', 1, '2024-10-01', 'ACTIVE', 'PARTIAL', '2004-11-10', 'Kinshasa', 'M', 'Congolaise'),
(10, 'ETU-2024-004', 1, '2024-10-01', 'ACTIVE', 'PAID', '2005-02-28', 'Matadi', 'F', 'Congolaise'),
(11, 'ETU-2023-005', 2, '2023-10-01', 'ACTIVE', 'PAID', '2003-07-12', 'Goma', 'M', 'Congolaise');

-- ============================================
-- EMPLOYÉS
-- ============================================

INSERT INTO employees (user_id, matricule, position, department, service, hire_date, contract_type) VALUES
(6, 'EMP-2019-001', 'Secrétaire Académique', 'Administration Centrale', 'Scolarité', '2019-06-01', 'PERMANENT');

-- ============================================
-- COURS
-- ============================================

INSERT INTO courses (code, name, description, credits, hours_cm, hours_td, hours_tp, promotion_id, teacher_id, semester, course_type) VALUES
-- L1 Informatique
('INFO101', 'Algorithmique et Programmation', 'Introduction à l''algorithmique et programmation en C', 6, 30, 15, 15, 1, 1, 1, 'OBLIGATOIRE'),
('INFO102', 'Architecture des Ordinateurs', 'Structure et fonctionnement des ordinateurs', 4, 30, 15, 0, 1, 2, 1, 'OBLIGATOIRE'),
('INFO103', 'Mathématiques pour l''Informatique', 'Logique, ensembles et algèbre', 4, 30, 15, 0, 1, NULL, 1, 'OBLIGATOIRE'),
('INFO104', 'Programmation Orientée Objet', 'Concepts OOP avec Java', 6, 30, 15, 15, 1, 1, 2, 'OBLIGATOIRE'),
('INFO105', 'Systèmes d''Exploitation', 'Fondamentaux des OS', 4, 30, 15, 0, 1, 3, 2, 'OBLIGATOIRE'),

-- L2 Informatique
('INFO201', 'Bases de Données', 'Conception et SQL', 6, 30, 15, 15, 2, 1, 1, 'OBLIGATOIRE'),
('INFO202', 'Réseaux Informatiques', 'Protocoles et architectures réseau', 4, 30, 15, 0, 2, 3, 1, 'OBLIGATOIRE'),
('INFO203', 'Développement Web', 'HTML, CSS, JavaScript et frameworks', 6, 30, 15, 15, 2, 1, 2, 'OBLIGATOIRE'),
('INFO204', 'Intelligence Artificielle', 'Introduction à l''IA et Machine Learning', 4, 30, 15, 0, 2, 2, 2, 'OPTIONNEL'),

-- L3 Informatique
('INFO301', 'Génie Logiciel', 'Méthodologies et outils de développement', 6, 30, 15, 15, 3, 1, 1, 'OBLIGATOIRE'),
('INFO302', 'Sécurité Informatique', 'Cryptographie et sécurité des systèmes', 4, 30, 15, 0, 3, 3, 1, 'OBLIGATOIRE'),
('INFO303', 'Projet de Fin d''Études', 'Projet pratique encadré', 8, 0, 0, 60, 3, 1, 2, 'OBLIGATOIRE');

-- ============================================
-- HORAIRES DE COURS
-- ============================================

INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room, schedule_type) VALUES
-- INFO101 - Algorithmique
(1, 1, '08:00', '10:00', 'Amphi A1', 'CM'),
(1, 3, '10:00', '12:00', 'Salle TP1', 'TP'),
(1, 5, '14:00', '16:00', 'Salle TD1', 'TD'),

-- INFO102 - Architecture
(2, 2, '08:00', '10:00', 'Amphi A2', 'CM'),
(2, 4, '10:00', '12:00', 'Salle TD2', 'TD'),

-- INFO201 - Bases de Données
(6, 1, '10:00', '12:00', 'Amphi B1', 'CM'),
(6, 2, '14:00', '16:00', 'Salle TP2', 'TP'),
(6, 4, '08:00', '10:00', 'Salle TD1', 'TD'),

-- INFO203 - Développement Web
(8, 3, '08:00', '10:00', 'Amphi B1', 'CM'),
(8, 5, '08:00', '12:00', 'Salle TP1', 'TP');

-- ============================================
-- INSCRIPTIONS AUX COURS
-- ============================================

INSERT INTO enrollments (student_id, course_id, academic_year_id, status) VALUES
-- Patrick Mbuyi (L2)
(1, 6, 1, 'ENROLLED'),
(1, 7, 1, 'ENROLLED'),
(1, 8, 1, 'ENROLLED'),
(1, 9, 1, 'ENROLLED'),

-- Marie Kasongo (L3)
(2, 10, 1, 'ENROLLED'),
(2, 11, 1, 'ENROLLED'),
(2, 12, 1, 'ENROLLED'),

-- David Tshimanga (L1)
(3, 1, 1, 'ENROLLED'),
(3, 2, 1, 'ENROLLED'),
(3, 3, 1, 'ENROLLED'),

-- Sarah Kalonji (L1)
(4, 1, 1, 'ENROLLED'),
(4, 2, 1, 'ENROLLED'),
(4, 3, 1, 'ENROLLED'),

-- Emmanuel Ilunga (L2)
(5, 6, 1, 'ENROLLED'),
(5, 7, 1, 'ENROLLED'),
(5, 8, 1, 'ENROLLED');

-- ============================================
-- NOTES
-- ============================================

INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, td_score, exam_score, final_score, grade_letter, is_validated) VALUES
-- Patrick Mbuyi - Notes L2
(1, 6, 1, 16.5, 15.0, 14.0, 14.75, 'B', TRUE),
(1, 7, 1, 14.0, 13.5, 12.0, 12.75, 'C', TRUE),

-- Marie Kasongo - Notes L3
(2, 10, 1, 17.0, 16.5, 15.5, 16.0, 'A', TRUE),

-- David Tshimanga - Notes L1
(3, 1, 1, 12.0, 11.5, 10.0, 10.75, 'C', FALSE),
(3, 2, 1, 14.5, 13.0, 12.5, 13.0, 'B', FALSE),

-- Sarah Kalonji - Notes L1
(4, 1, 1, 18.0, 17.5, 16.0, 16.75, 'A', FALSE),
(4, 2, 1, 16.0, 15.5, 14.0, 14.75, 'B', FALSE);

-- ============================================
-- PRÉSENCES (Exemple pour le mois en cours)
-- ============================================

INSERT INTO attendance (student_id, course_id, attendance_date, status, recorded_by) VALUES
-- Patrick Mbuyi
(1, 6, '2025-01-06', 'PRESENT', 2),
(1, 6, '2025-01-07', 'PRESENT', 2),
(1, 6, '2025-01-13', 'ABSENT', 2),
(1, 7, '2025-01-08', 'PRESENT', 2),

-- David Tshimanga
(3, 1, '2025-01-06', 'PRESENT', 2),
(3, 1, '2025-01-08', 'LATE', 2),
(3, 1, '2025-01-10', 'PRESENT', 2),

-- Sarah Kalonji
(4, 1, '2025-01-06', 'PRESENT', 2),
(4, 1, '2025-01-08', 'PRESENT', 2),
(4, 1, '2025-01-10', 'EXCUSED', 2);

-- ============================================
-- PAIEMENTS
-- ============================================

INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_method, reference, receipt_number, status, recorded_by) VALUES
-- Patrick Mbuyi - Payé complet
(1, 1, 500.00, 'INSCRIPTION', 'BANK', 'BNK-2024-001234', 'REC-2024-0001', 'COMPLETED', 6),
(1, 1, 800.00, 'FRAIS_ACADEMIQUES', 'MOBILE_MONEY', 'MM-2024-005678', 'REC-2024-0002', 'COMPLETED', 6),

-- Marie Kasongo - Bloquée (impayée)
(2, 1, 500.00, 'INSCRIPTION', 'BANK', 'BNK-2024-002345', 'REC-2024-0003', 'COMPLETED', 6),
-- Frais académiques impayés

-- David Tshimanga - Partiel
(3, 1, 500.00, 'INSCRIPTION', 'CASH', 'CASH-2024-001', 'REC-2024-0004', 'COMPLETED', 6),
(3, 1, 400.00, 'FRAIS_ACADEMIQUES', 'MOBILE_MONEY', 'MM-2024-006789', 'REC-2024-0005', 'COMPLETED', 6),

-- Sarah Kalonji - Payé complet
(4, 1, 500.00, 'INSCRIPTION', 'BANK', 'BNK-2024-003456', 'REC-2024-0006', 'COMPLETED', 6),
(4, 1, 800.00, 'FRAIS_ACADEMIQUES', 'BANK', 'BNK-2024-003457', 'REC-2024-0007', 'COMPLETED', 6);

-- ============================================
-- NOTIFICATIONS
-- ============================================

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Bienvenue sur NEXUS UNIKIN', 'Bienvenue dans le système de gestion universitaire. Explorez les fonctionnalités disponibles.', 'SUCCESS', FALSE),
(3, 'Notes disponibles', 'Vos notes du premier semestre sont maintenant disponibles.', 'INFO', FALSE),
(4, 'Alerte de paiement', 'Vos frais académiques sont en souffrance. Veuillez régulariser votre situation.', 'WARNING', FALSE),
(2, 'Nouvel enseignant', 'Bienvenue dans l''équipe pédagogique de l''UNIKIN.', 'SUCCESS', TRUE);

-- ============================================
-- FIN DU SEED
-- ============================================

SELECT 'Données de test insérées avec succès!' AS message;
SELECT 'Comptes de test:' AS info;
SELECT '  - Admin: admin@unikin.ac.cd / Admin@2026' AS compte1;
SELECT '  - Prof: prof.kabongo@unikin.ac.cd / Prof@2026' AS compte2;
SELECT '  - Étudiant: etudiant.mbuyi@student.unikin.ac.cd / Etudiant@2026' AS compte3;
SELECT '  - Étudiant bloqué: etudiant.kasongo@student.unikin.ac.cd / Etudiant@2026' AS compte4;
SELECT '  - Employé: employe.mutombo@unikin.ac.cd / Employe@2026' AS compte5;

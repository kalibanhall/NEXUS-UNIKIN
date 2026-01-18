-- ============================================
-- NEXUS UNIKIN - Données de Test Complètes
-- ============================================

-- Nettoyer les données existantes
TRUNCATE TABLE notifications, payments, attendance, grades, enrollments, course_schedules, courses, students, teachers, employees, admins, promotions, departments, faculties, users, academic_years RESTART IDENTITY CASCADE;

-- ============================================
-- ANNÉES ACADÉMIQUES
-- ============================================
INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES
('2024-2025', '2024-09-01', '2025-08-31', FALSE),
('2025-2026', '2025-09-01', '2026-08-31', TRUE);

-- ============================================
-- UTILISATEURS
-- ============================================
-- Admin (Kongo)
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('ADM-2024-001@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Patrick', 'NLANDU', '+243999000001', 'ADMIN', TRUE);

-- Enseignants (Kongo, Mongo, Ngala, Lunda)
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('PROF-2020-001@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Jean-Pierre', 'MAKOSSO', '+243999000002', 'TEACHER', TRUE),
('PROF-2018-002@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Blaise', 'BOLAMBA', '+243999000003', 'TEACHER', TRUE),
('PROF-2019-003@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Henriette', 'LIYOLO', '+243999000004', 'TEACHER', TRUE),
('PROF-2021-004@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Chrispin', 'MUKALAYI', '+243999000005', 'TEACHER', TRUE);

-- Étudiants (15 étudiants - mix Kongo, Luba, Mongo, Ngala, Lunda, Tchokwe, Yaka, Tetela, Shi)
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('ETU-2025-001@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Jonathan', 'MBENZA', '+243812000001', 'STUDENT', TRUE),
('ETU-2025-002@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Serge', 'LOKANGA', '+243812000002', 'STUDENT', TRUE),
('ETU-2025-003@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Clarisse', 'NZUZI', '+243812000003', 'STUDENT', TRUE),
('ETU-2025-004@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Tresor', 'LUNDA', '+243812000004', 'STUDENT', TRUE),
('ETU-2025-005@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Nadine', 'TCHISOLA', '+243812000005', 'STUDENT', TRUE),
('ETU-2025-006@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Kevin', 'MPIANA', '+243812000006', 'STUDENT', TRUE),
('ETU-2025-007@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Gloria', 'BANGALA', '+243812000007', 'STUDENT', TRUE),
('ETU-2025-008@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Thierry', 'YAMBA', '+243812000008', 'STUDENT', TRUE),
('ETU-2025-009@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Sandrine', 'MBOMBO', '+243812000009', 'STUDENT', TRUE),
('ETU-2025-010@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Gloire', 'NDOMBE', '+243812000010', 'STUDENT', TRUE),
('ETU-2025-011@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Esther', 'SHONGO', '+243812000011', 'STUDENT', TRUE),
('ETU-2025-012@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Christian', 'NGANDU', '+243812000012', 'STUDENT', TRUE),
('ETU-2025-013@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Merveille', 'OKITUNDU', '+243812000013', 'STUDENT', TRUE),
('ETU-2025-014@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Josue', 'KASHAMA', '+243812000014', 'STUDENT', TRUE),
('ETU-2025-015@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Deborah', 'WEMBA', '+243812000015', 'STUDENT', TRUE);

-- Employé (Yaka)
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES
('EMP-2022-001@unikin.ac.cd', '$2a$10$rIC/p1jdVASJYxxmDFmkxu/xxhOb7ZPxfordsXKm82kNrh8dut7c2', 'Celine', 'KINKELA', '+243999000010', 'EMPLOYEE', TRUE);

-- ============================================
-- FACULTÉS
-- ============================================
INSERT INTO faculties (code, name, description, is_active) VALUES
('FSC', 'Faculte des Sciences', 'Sciences exactes et naturelles', TRUE),
('FD', 'Faculte de Droit', 'Sciences juridiques', TRUE),
('FM', 'Faculte de Medecine', 'Sciences medicales', TRUE),
('FLSH', 'Faculte des Lettres et Sciences Humaines', 'Lettres, philosophie, histoire', TRUE);

-- ============================================
-- DÉPARTEMENTS
-- ============================================
INSERT INTO departments (code, name, description, faculty_id, is_active) VALUES
('INFO', 'Informatique', 'Sciences informatiques et programmation', 1, TRUE),
('MATH', 'Mathematiques', 'Mathematiques pures et appliquees', 1, TRUE),
('PHYS', 'Physique', 'Sciences physiques', 1, TRUE),
('DPUB', 'Droit Public', 'Droit constitutionnel et administratif', 2, TRUE),
('DPRIV', 'Droit Prive', 'Droit civil et commercial', 2, TRUE),
('MG', 'Medecine Generale', 'Medecine generale et specialisee', 3, TRUE);

-- ============================================
-- PROMOTIONS
-- ============================================
INSERT INTO promotions (code, name, level, department_id, academic_year_id, is_active) VALUES
('L1-INFO-2526', 'Licence 1 Informatique', 'L1', 1, 2, TRUE),
('L2-INFO-2526', 'Licence 2 Informatique', 'L2', 1, 2, TRUE),
('L3-INFO-2526', 'Licence 3 Informatique', 'L3', 1, 2, TRUE),
('L1-MATH-2526', 'Licence 1 Mathematiques', 'L1', 2, 2, TRUE),
('L1-DROIT-2526', 'Licence 1 Droit', 'L1', 4, 2, TRUE);

-- ============================================
-- ADMIN
-- ============================================
INSERT INTO admins (user_id, admin_type) VALUES (1, 'SUPER_ADMIN');

-- ============================================
-- ENSEIGNANTS
-- ============================================
INSERT INTO teachers (user_id, matricule, grade, specialization, department_id, hire_date, is_permanent) VALUES
(2, 'PROF-2020-001', 'PROFESSEUR', 'Algorithmique et Intelligence Artificielle', 1, '2020-01-15', TRUE),
(3, 'PROF-2018-002', 'PROFESSEUR_ASSOCIE', 'Base de donnees et Systemes distribues', 1, '2018-09-01', TRUE),
(4, 'PROF-2019-003', 'CHEF_TRAVAUX', 'Reseaux et Securite informatique', 1, '2019-03-10', TRUE),
(5, 'PROF-2021-004', 'PROFESSEUR', 'Analyse numerique', 2, '2021-09-01', TRUE);

-- ============================================
-- ÉTUDIANTS
-- ============================================
INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, status, payment_status, birth_date, gender, nationality) VALUES
(6, 'ETU-2025-001', 1, '2025-09-15', 'ACTIVE', 'PAID', '2003-05-12', 'M', 'Congolaise'),
(7, 'ETU-2025-002', 1, '2025-09-15', 'ACTIVE', 'PARTIAL', '2004-02-28', 'M', 'Congolaise'),
(8, 'ETU-2025-003', 1, '2025-09-15', 'ACTIVE', 'PAID', '2003-11-08', 'F', 'Congolaise'),
(9, 'ETU-2025-004', 1, '2025-09-15', 'ACTIVE', 'PAID', '2002-08-20', 'M', 'Congolaise'),
(10, 'ETU-2025-005', 1, '2025-09-15', 'ACTIVE', 'UNPAID', '2004-01-15', 'F', 'Congolaise'),
(11, 'ETU-2025-006', 2, '2024-09-15', 'ACTIVE', 'PAID', '2002-07-22', 'M', 'Congolaise'),
(12, 'ETU-2025-007', 2, '2024-09-15', 'ACTIVE', 'PAID', '2003-03-30', 'F', 'Congolaise'),
(13, 'ETU-2025-008', 2, '2024-09-15', 'ACTIVE', 'PARTIAL', '2002-12-05', 'M', 'Congolaise'),
(14, 'ETU-2025-009', 2, '2024-09-15', 'ACTIVE', 'PAID', '2003-09-18', 'F', 'Congolaise'),
(15, 'ETU-2025-010', 2, '2024-09-15', 'ACTIVE', 'PAID', '2002-04-25', 'M', 'Congolaise'),
(16, 'ETU-2025-011', 3, '2023-09-15', 'ACTIVE', 'PAID', '2001-06-14', 'F', 'Congolaise'),
(17, 'ETU-2025-012', 3, '2023-09-15', 'ACTIVE', 'PAID', '2002-10-03', 'M', 'Congolaise'),
(18, 'ETU-2025-013', 3, '2023-09-15', 'ACTIVE', 'PARTIAL', '2001-11-27', 'F', 'Congolaise'),
(19, 'ETU-2025-014', 4, '2025-09-15', 'ACTIVE', 'PAID', '2004-07-09', 'M', 'Congolaise'),
(20, 'ETU-2025-015', 5, '2025-09-15', 'ACTIVE', 'PAID', '2003-12-21', 'F', 'Congolaise');

-- ============================================
-- EMPLOYÉ
-- ============================================
INSERT INTO employees (user_id, matricule, position, department, service, hire_date, contract_type) VALUES
(21, 'EMP-2022-001', 'Secretaire Academique', 'Secretariat', 'Inscriptions', '2022-01-10', 'PERMANENT');

-- ============================================
-- COURS
-- ============================================
INSERT INTO courses (code, name, description, credits, hours_cm, hours_td, hours_tp, promotion_id, teacher_id, semester, course_type) VALUES
('INFO101', 'Algorithmique et Programmation I', 'Introduction a la programmation et aux algorithmes', 6, 30, 15, 15, 1, 1, 1, 'OBLIGATOIRE'),
('INFO102', 'Architecture des Ordinateurs', 'Structure et fonctionnement des ordinateurs', 4, 30, 15, 0, 1, 2, 1, 'OBLIGATOIRE'),
('INFO103', 'Mathematiques pour Informatique', 'Logique, ensembles, relations', 5, 30, 20, 0, 1, 4, 1, 'OBLIGATOIRE'),
('INFO104', 'Introduction aux Bases de Donnees', 'Concepts fondamentaux des SGBD', 4, 20, 10, 15, 1, 2, 1, 'OBLIGATOIRE'),
('INFO105', 'Systemes Exploitation', 'Principes des OS', 4, 25, 10, 10, 1, 3, 2, 'OBLIGATOIRE'),
('INFO106', 'Algorithmique et Programmation II', 'Structures de donnees avancees', 6, 30, 15, 15, 1, 1, 2, 'OBLIGATOIRE'),
('INFO201', 'Programmation Orientee Objet', 'POO avec Java', 6, 30, 15, 20, 2, 1, 1, 'OBLIGATOIRE'),
('INFO202', 'Base de Donnees Avancees', 'SQL avance, normalisation, optimisation', 5, 25, 15, 15, 2, 2, 1, 'OBLIGATOIRE'),
('INFO203', 'Reseaux Informatiques', 'Protocoles, architecture reseau', 5, 30, 10, 15, 2, 3, 1, 'OBLIGATOIRE'),
('INFO204', 'Genie Logiciel', 'Methodologies de developpement', 4, 25, 15, 10, 2, 1, 2, 'OBLIGATOIRE'),
('INFO205', 'Developpement Web', 'HTML, CSS, JavaScript, PHP', 5, 20, 10, 25, 2, 2, 2, 'OBLIGATOIRE'),
('INFO301', 'Intelligence Artificielle', 'Introduction a IA', 5, 30, 15, 10, 3, 1, 1, 'OBLIGATOIRE'),
('INFO302', 'Securite Informatique', 'Cryptographie, securite reseau', 5, 25, 10, 20, 3, 3, 1, 'OBLIGATOIRE'),
('INFO303', 'Projet de Fin Etudes', 'Memoire de licence', 10, 10, 0, 50, 3, 1, 2, 'OBLIGATOIRE');

-- ============================================
-- HORAIRES DE COURS
-- ============================================
INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room, schedule_type) VALUES
(1, 1, '08:00', '10:00', 'Amphi A', 'CM'),
(1, 3, '14:00', '16:00', 'Salle 101', 'TD'),
(1, 5, '08:00', '10:00', 'Labo Info 1', 'TP'),
(2, 1, '10:00', '12:00', 'Amphi A', 'CM'),
(2, 4, '08:00', '10:00', 'Salle 102', 'TD'),
(3, 2, '08:00', '10:00', 'Amphi B', 'CM'),
(3, 4, '10:00', '12:00', 'Salle 103', 'TD'),
(4, 2, '10:00', '12:00', 'Amphi A', 'CM'),
(4, 5, '10:00', '12:00', 'Labo Info 2', 'TP'),
(7, 1, '08:00', '10:00', 'Amphi C', 'CM'),
(7, 3, '08:00', '10:00', 'Salle 201', 'TD'),
(8, 2, '08:00', '10:00', 'Amphi C', 'CM'),
(8, 4, '14:00', '16:00', 'Labo Info 1', 'TP');

-- ============================================
-- INSCRIPTIONS AUX COURS
-- ============================================
INSERT INTO enrollments (student_id, course_id, academic_year_id, status) VALUES
(1, 1, 2, 'ENROLLED'), (1, 2, 2, 'ENROLLED'), (1, 3, 2, 'ENROLLED'), (1, 4, 2, 'ENROLLED'),
(2, 1, 2, 'ENROLLED'), (2, 2, 2, 'ENROLLED'), (2, 3, 2, 'ENROLLED'), (2, 4, 2, 'ENROLLED'),
(3, 1, 2, 'ENROLLED'), (3, 2, 2, 'ENROLLED'), (3, 3, 2, 'ENROLLED'), (3, 4, 2, 'ENROLLED'),
(4, 1, 2, 'ENROLLED'), (4, 2, 2, 'ENROLLED'), (4, 3, 2, 'ENROLLED'), (4, 4, 2, 'ENROLLED'),
(5, 1, 2, 'ENROLLED'), (5, 2, 2, 'ENROLLED'), (5, 3, 2, 'ENROLLED'), (5, 4, 2, 'ENROLLED'),
(6, 7, 2, 'ENROLLED'), (6, 8, 2, 'ENROLLED'), (6, 9, 2, 'ENROLLED'),
(7, 7, 2, 'ENROLLED'), (7, 8, 2, 'ENROLLED'), (7, 9, 2, 'ENROLLED'),
(8, 7, 2, 'ENROLLED'), (8, 8, 2, 'ENROLLED'), (8, 9, 2, 'ENROLLED'),
(9, 7, 2, 'ENROLLED'), (9, 8, 2, 'ENROLLED'), (9, 9, 2, 'ENROLLED'),
(10, 7, 2, 'ENROLLED'), (10, 8, 2, 'ENROLLED'), (10, 9, 2, 'ENROLLED'),
(11, 12, 2, 'ENROLLED'), (11, 13, 2, 'ENROLLED'), (11, 14, 2, 'ENROLLED'),
(12, 12, 2, 'ENROLLED'), (12, 13, 2, 'ENROLLED'), (12, 14, 2, 'ENROLLED'),
(13, 12, 2, 'ENROLLED'), (13, 13, 2, 'ENROLLED'), (13, 14, 2, 'ENROLLED');

-- ============================================
-- NOTES
-- ============================================
INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, td_score, exam_score, final_score, grade_letter, is_validated) VALUES
(1, 1, 2, 16, 15, 17, 16.2, 'A', TRUE),
(1, 2, 2, 14, 15, 16, 15.2, 'B', TRUE),
(1, 3, 2, 15, 14, 15, 14.7, 'B', TRUE),
(1, 4, 2, 17, 16, 18, 17.2, 'A', TRUE),
(2, 1, 2, 12, 11, 13, 12.2, 'C', TRUE),
(2, 2, 2, 10, 12, 11, 11.0, 'C', TRUE),
(2, 3, 2, 11, 10, 12, 11.2, 'C', TRUE),
(2, 4, 2, 13, 12, 11, 11.8, 'C', TRUE),
(3, 1, 2, 15, 16, 14, 14.8, 'B', TRUE),
(3, 2, 2, 16, 15, 15, 15.2, 'B', TRUE),
(3, 3, 2, 14, 15, 16, 15.2, 'B', TRUE),
(3, 4, 2, 15, 14, 15, 14.7, 'B', TRUE),
(4, 1, 2, 13, 14, 12, 12.8, 'C', TRUE),
(4, 2, 2, 12, 13, 14, 13.2, 'C', TRUE),
(4, 3, 2, 14, 12, 13, 13.0, 'C', TRUE),
(4, 4, 2, 13, 14, 13, 13.2, 'C', TRUE),
(5, 1, 2, 8, 9, 7, 7.8, 'E', TRUE),
(5, 2, 2, 9, 8, 10, 9.2, 'D', TRUE),
(5, 3, 2, 7, 8, 6, 6.8, 'F', TRUE),
(5, 4, 2, 10, 9, 8, 8.8, 'D', TRUE),
(6, 7, 2, 15, 16, 14, 14.8, 'B', TRUE),
(6, 8, 2, 14, 15, 16, 15.2, 'B', TRUE),
(6, 9, 2, 16, 15, 15, 15.2, 'B', TRUE),
(7, 7, 2, 17, 18, 16, 16.8, 'A', TRUE),
(7, 8, 2, 16, 17, 18, 17.2, 'A', TRUE),
(7, 9, 2, 15, 16, 17, 16.2, 'A', TRUE),
(8, 7, 2, 11, 12, 10, 10.8, 'C', TRUE),
(8, 8, 2, 12, 11, 13, 12.2, 'C', TRUE),
(8, 9, 2, 10, 11, 12, 11.2, 'C', TRUE),
(9, 7, 2, 14, 13, 15, 14.2, 'B', TRUE),
(9, 8, 2, 15, 14, 14, 14.2, 'B', TRUE),
(9, 9, 2, 13, 14, 15, 14.2, 'B', TRUE),
(10, 7, 2, 12, 13, 11, 11.8, 'C', TRUE),
(10, 8, 2, 13, 12, 14, 13.2, 'C', TRUE),
(10, 9, 2, 11, 12, 13, 12.2, 'C', TRUE),
(11, 12, 2, 16, 17, 15, 15.8, 'B', TRUE),
(11, 13, 2, 15, 16, 17, 16.2, 'A', TRUE),
(11, 14, 2, 17, 16, 16, 16.2, 'A', FALSE),
(12, 12, 2, 14, 15, 13, 13.8, 'B', TRUE),
(12, 13, 2, 13, 14, 15, 14.2, 'B', TRUE),
(12, 14, 2, 15, 14, 14, 14.2, 'B', FALSE),
(13, 12, 2, 12, 11, 13, 12.2, 'C', TRUE),
(13, 13, 2, 11, 12, 12, 11.8, 'C', TRUE),
(13, 14, 2, 13, 12, 11, 11.8, 'C', FALSE);

-- ============================================
-- PAIEMENTS
-- ============================================
INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_date, payment_method, reference, status, remarks) VALUES
(1, 2, 250.00, 'INSCRIPTION', '2025-09-10', 'BANK', 'PAY-2025-001', 'COMPLETED', 'Premiere tranche'),
(1, 2, 250.00, 'FRAIS_ACADEMIQUES', '2025-11-15', 'MOBILE_MONEY', 'PAY-2025-002', 'COMPLETED', 'Deuxieme tranche'),
(2, 2, 250.00, 'INSCRIPTION', '2025-09-12', 'CASH', 'PAY-2025-003', 'COMPLETED', 'Premiere tranche'),
(2, 2, 100.00, 'FRAIS_ACADEMIQUES', '2025-12-01', 'MOBILE_MONEY', 'PAY-2025-004', 'COMPLETED', 'Paiement partiel'),
(3, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-08', 'BANK', 'PAY-2025-005', 'COMPLETED', 'Paiement integral'),
(4, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-15', 'BANK', 'PAY-2025-006', 'COMPLETED', 'Paiement integral'),
(5, 2, 200.00, 'INSCRIPTION', '2025-10-01', 'CASH', 'PAY-2025-007', 'PENDING', 'En attente de validation'),
(6, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-05', 'BANK', 'PAY-2025-008', 'COMPLETED', 'Paiement integral'),
(7, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-07', 'BANK', 'PAY-2025-009', 'COMPLETED', 'Paiement integral'),
(8, 2, 300.00, 'FRAIS_ACADEMIQUES', '2025-09-10', 'MOBILE_MONEY', 'PAY-2025-010', 'COMPLETED', 'Paiement partiel'),
(9, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-06', 'BANK', 'PAY-2025-011', 'COMPLETED', 'Paiement integral'),
(10, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-08', 'BANK', 'PAY-2025-012', 'COMPLETED', 'Paiement integral'),
(11, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-03', 'BANK', 'PAY-2025-013', 'COMPLETED', 'Paiement integral'),
(12, 2, 500.00, 'FRAIS_ACADEMIQUES', '2025-09-04', 'BANK', 'PAY-2025-014', 'COMPLETED', 'Paiement integral'),
(13, 2, 350.00, 'FRAIS_ACADEMIQUES', '2025-09-09', 'CASH', 'PAY-2025-015', 'COMPLETED', 'Paiement partiel');

-- ============================================
-- PRÉSENCES
-- ============================================
INSERT INTO attendance (student_id, course_id, attendance_date, status, recorded_by) VALUES
(1, 1, '2025-12-23', 'PRESENT', 2),
(2, 1, '2025-12-23', 'PRESENT', 2),
(3, 1, '2025-12-23', 'PRESENT', 2),
(4, 1, '2025-12-23', 'LATE', 2),
(5, 1, '2025-12-23', 'ABSENT', 2),
(1, 1, '2025-12-30', 'PRESENT', 2),
(2, 1, '2025-12-30', 'PRESENT', 2),
(3, 1, '2025-12-30', 'PRESENT', 2),
(4, 1, '2025-12-30', 'PRESENT', 2),
(5, 1, '2025-12-30', 'LATE', 2),
(1, 1, '2026-01-02', 'PRESENT', 2),
(2, 1, '2026-01-02', 'PRESENT', 2),
(3, 1, '2026-01-02', 'LATE', 2),
(4, 1, '2026-01-02', 'PRESENT', 2),
(5, 1, '2026-01-02', 'ABSENT', 2),
(1, 2, '2025-12-23', 'PRESENT', 3),
(2, 2, '2025-12-23', 'PRESENT', 3),
(3, 2, '2025-12-23', 'PRESENT', 3),
(4, 2, '2025-12-23', 'PRESENT', 3),
(5, 2, '2025-12-23', 'ABSENT', 3),
(6, 7, '2025-12-23', 'PRESENT', 2),
(7, 7, '2025-12-23', 'PRESENT', 2),
(8, 7, '2025-12-23', 'LATE', 2),
(9, 7, '2025-12-23', 'PRESENT', 2),
(10, 7, '2025-12-23', 'PRESENT', 2);

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
(1, 'Nouvelle annee academique', 'Annee academique 2025-2026 demarree', 'SUCCESS', TRUE, '/admin/academic'),
(1, 'Rapport financier', 'Le rapport financier mensuel est disponible', 'INFO', FALSE, '/admin/finances'),
(6, 'Notes disponibles', 'Vos notes du premier semestre sont disponibles', 'SUCCESS', FALSE, '/student/grades'),
(6, 'Paiement confirme', 'Votre paiement de 250$ a ete confirme', 'SUCCESS', TRUE, '/student/finances'),
(6, 'Nouveau cours', 'Le cours INFO105 commence la semaine prochaine', 'INFO', FALSE, '/student/timetable'),
(2, 'Notes a encoder', 'Rappel: Les notes du semestre 1 doivent etre soumises avant le 15 janvier', 'WARNING', FALSE, '/teacher/grades'),
(2, 'Nouvelle ressource', 'Un nouvel etudiant a rejoint votre cours INFO101', 'INFO', TRUE, '/teacher/students'),
(21, 'Nouvelle demande', '5 nouvelles demandes de documents a traiter', 'INFO', FALSE, '/employee/documents'),
(21, 'Paiement en attente', '3 paiements en attente de validation', 'WARNING', FALSE, '/employee/payments');

-- ============================================
-- ANNONCES
-- ============================================
DROP TABLE IF EXISTS announcements CASCADE;
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target VARCHAR(50) DEFAULT 'ALL',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO announcements (title, content, target, priority, is_published, published_at, created_by, views_count) VALUES
('Debut des inscriptions 2025-2026', 'Les inscriptions pour annee academique 2025-2026 sont officiellement ouvertes.', 'ALL', 'HIGH', TRUE, '2025-08-15 09:00:00', 1, 1250),
('Calendrier des examens', 'Le calendrier des examens du premier semestre est disponible.', 'STUDENTS', 'URGENT', TRUE, '2025-12-01 10:00:00', 1, 890),
('Reunion du corps enseignant', 'Une reunion obligatoire du corps enseignant aura lieu le 15 janvier 2026.', 'TEACHERS', 'HIGH', TRUE, '2026-01-05 08:00:00', 1, 45),
('Maintenance systeme', 'Le systeme sera en maintenance le dimanche 12 janvier de 2h a 6h du matin.', 'ALL', 'NORMAL', TRUE, '2026-01-04 14:00:00', 1, 320),
('Nouveaux laboratoires', 'Les nouveaux laboratoires informatiques sont desormais operationnels au batiment B.', 'ALL', 'NORMAL', FALSE, NULL, 1, 0);

-- ============================================
-- DELIBERATIONS
-- ============================================
DROP TABLE IF EXISTS deliberations CASCADE;
CREATE TABLE deliberations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    semester INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    president_id INTEGER REFERENCES teachers(id),
    secretary_id INTEGER REFERENCES teachers(id),
    pass_threshold DECIMAL(5,2) DEFAULT 10.00,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO deliberations (name, promotion_id, academic_year_id, semester, status, start_date, end_date, president_id, secretary_id, created_by) VALUES
('Deliberation L1 Info - S1 2025-2026', 1, 2, 1, 'IN_PROGRESS', '2026-01-20 08:00:00', NULL, 1, 2, 1),
('Deliberation L2 Info - S1 2025-2026', 2, 2, 1, 'DRAFT', '2026-01-25 08:00:00', NULL, 2, 3, 1),
('Deliberation L3 Info - S1 2025-2026', 3, 2, 1, 'COMPLETED', '2026-01-15 08:00:00', '2026-01-18 17:00:00', 1, 2, 1);

SELECT 'Seed data completed successfully!' as status;

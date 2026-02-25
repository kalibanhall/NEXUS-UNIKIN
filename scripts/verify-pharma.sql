-- Vérification complète de l'import Pharma
SELECT '=== DÉPARTEMENTS ===' AS section;
SELECT d.id, d.name, d.code FROM departments d WHERE d.faculty_id = 8 ORDER BY d.id;

SELECT '=== COURS PAR PROMOTION ===' AS section;
SELECT p.name AS promotion, COUNT(c.id) AS nb_cours FROM courses c JOIN promotions p ON c.promotion_id = p.id WHERE p.id IN (29, 13, 64, 142, 80, 179) GROUP BY p.name, p.level ORDER BY p.level;

SELECT '=== ENSEIGNANTS PAR DÉPARTEMENT ===' AS section;
SELECT d.name AS departement, COUNT(t.id) AS nb_enseignants FROM teachers t JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = 8 GROUP BY d.name ORDER BY COUNT(t.id) DESC;

SELECT '=== ENSEIGNANTS PAR GRADE ===' AS section;
SELECT t.grade, COUNT(*) AS total FROM teachers t JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = 8 GROUP BY t.grade ORDER BY total DESC;

SELECT '=== TOTAL USERS TEACHER ===' AS section;
SELECT COUNT(*) FROM users WHERE role = 'TEACHER';

SELECT '=== ÉCHANTILLON ENSEIGNANTS ===' AS section;
SELECT u.last_name, u.postnom, u.email, t.grade, t.matricule, d.name AS dept FROM teachers t JOIN users u ON t.user_id = u.id JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = 8 ORDER BY u.last_name LIMIT 10;

SELECT '=== ÉCHANTILLON COURS ===' AS section;
SELECT c.code, c.name, c.credits, c.hours_cm, c.hours_td, c.hours_tp, c.semester, p.name AS promo FROM courses c JOIN promotions p ON c.promotion_id = p.id WHERE p.id = 29 ORDER BY c.code LIMIT 5;

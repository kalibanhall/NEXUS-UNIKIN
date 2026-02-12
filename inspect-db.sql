-- Row counts per table
SELECT 'academic_years' as tbl, count(*) as rows FROM academic_years
UNION ALL SELECT 'admins', count(*) FROM admins
UNION ALL SELECT 'attendance', count(*) FROM attendance
UNION ALL SELECT 'course_schedules', count(*) FROM course_schedules
UNION ALL SELECT 'courses', count(*) FROM courses
UNION ALL SELECT 'departments', count(*) FROM departments
UNION ALL SELECT 'employees', count(*) FROM employees
UNION ALL SELECT 'enrollments', count(*) FROM enrollments
UNION ALL SELECT 'faculties', count(*) FROM faculties
UNION ALL SELECT 'grades', count(*) FROM grades
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'payments', count(*) FROM payments
UNION ALL SELECT 'promotions', count(*) FROM promotions
UNION ALL SELECT 'students', count(*) FROM students
UNION ALL SELECT 'teachers', count(*) FROM teachers
UNION ALL SELECT 'users', count(*) FROM users
ORDER BY tbl;

-- Users details
SELECT id, email, role, first_name, last_name, is_active, created_at FROM users ORDER BY role, last_name;

-- Faculties
SELECT id, name, code FROM faculties ORDER BY name;

-- Departments
SELECT d.id, d.name, d.code, f.name as faculty FROM departments d LEFT JOIN faculties f ON d.faculty_id = f.id ORDER BY f.name, d.name;

-- Promotions
SELECT p.id, p.name, p.level, d.name as department FROM promotions p LEFT JOIN departments d ON p.department_id = d.id ORDER BY d.name, p.level;

-- Students
SELECT s.id, s.matricule, u.first_name, u.last_name, u.email, p.name as promotion, s.academic_year FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN promotions p ON s.promotion_id = p.id ORDER BY u.last_name;

-- Teachers
SELECT t.id, u.first_name, u.last_name, u.email, d.name as department FROM teachers t JOIN users u ON t.user_id = u.id LEFT JOIN departments d ON t.department_id = d.id ORDER BY u.last_name;

-- Courses
SELECT c.id, c.name, c.code, c.credits, d.name as department FROM courses c LEFT JOIN departments d ON c.department_id = d.id ORDER BY d.name, c.name;

-- Academic years
SELECT id, name, start_date, end_date, is_current FROM academic_years ORDER BY start_date DESC;

-- Enrollments count per student
SELECT u.first_name, u.last_name, count(e.id) as nb_enrollments FROM enrollments e JOIN students s ON e.student_id = s.id JOIN users u ON s.user_id = u.id GROUP BY u.first_name, u.last_name ORDER BY u.last_name;

-- Grades summary
SELECT u.first_name, u.last_name, count(g.id) as nb_grades, round(avg(g.score)::numeric, 2) as avg_score FROM grades g JOIN students s ON g.student_id = s.id JOIN users u ON s.user_id = u.id GROUP BY u.first_name, u.last_name ORDER BY u.last_name;

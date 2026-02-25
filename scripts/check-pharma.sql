-- Check pharma data
SELECT 'FACULTIES' AS section;
SELECT id, name, code FROM faculties WHERE name ILIKE '%pharma%';

SELECT 'DEPARTMENTS' AS section;
SELECT d.id, d.name, d.code, d.faculty_id FROM departments d JOIN faculties f ON d.faculty_id=f.id WHERE f.name ILIKE '%pharma%';

SELECT 'PROMOTIONS' AS section;
SELECT p.id, p.name, p.level, p.code, p.department_id FROM promotions p JOIN departments d ON p.department_id=d.id JOIN faculties f ON d.faculty_id=f.id WHERE f.name ILIKE '%pharma%' ORDER BY p.level;

SELECT 'ACADEMIC_YEAR' AS section;
SELECT id, name FROM academic_years WHERE is_current = TRUE;

SELECT 'TEACHER_COUNT' AS section;
SELECT COUNT(*) as count FROM teachers t JOIN departments d ON t.department_id = d.id JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%';

SELECT 'COURSE_COUNT' AS section;
SELECT COUNT(*) as count FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%';

SELECT 'TABLE_COLUMNS' AS section;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'teachers' ORDER BY ordinal_position;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees' ORDER BY ordinal_position;

-- Check existing schema for teachers/users  
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'teachers' ORDER BY ordinal_position;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'students' ORDER BY ordinal_position;

-- Check existing pharma teachers data
SELECT u.email, t.matricule, u.first_name, u.last_name FROM teachers t JOIN users u ON t.user_id = u.id JOIN departments d ON t.department_id = d.id WHERE d.faculty_id = 8 ORDER BY u.last_name LIMIT 5;

-- Check if birth_date column exists
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_date';
SELECT column_name FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'birth_date';

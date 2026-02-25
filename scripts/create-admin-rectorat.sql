-- Check admins table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admins' ORDER BY ordinal_position;

-- Check existing admin users
SELECT u.email, u.role, a.admin_type FROM users u JOIN admins a ON a.user_id = u.id;

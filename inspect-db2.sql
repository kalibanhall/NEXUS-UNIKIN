-- Students details
SELECT s.id, s.matricule, u.first_name, u.last_name, u.email, p.name as promotion, s.status, s.payment_status FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN promotions p ON s.promotion_id = p.id ORDER BY u.last_name;

-- Courses
SELECT c.id, c.code, c.name, c.credits, c.semester, p.name as promotion, t_u.last_name as teacher FROM courses c LEFT JOIN promotions p ON c.promotion_id = p.id LEFT JOIN teachers t ON c.teacher_id = t.id LEFT JOIN users t_u ON t.user_id = t_u.id ORDER BY p.name, c.code;

-- Enrollments
SELECT e.id, u.last_name, c.code, c.name, ay.name as year FROM enrollments e JOIN students s ON e.student_id = s.id JOIN users u ON s.user_id = u.id JOIN courses c ON e.course_id = c.id JOIN academic_years ay ON e.academic_year_id = ay.id;

-- Course schedules
SELECT cs.id, c.code, cs.day_of_week, cs.start_time, cs.end_time, cs.room FROM course_schedules cs JOIN courses c ON cs.course_id = c.id ORDER BY cs.day_of_week, cs.start_time;

-- Notifications
SELECT id, title, type, is_read, created_at FROM notifications ORDER BY created_at DESC;

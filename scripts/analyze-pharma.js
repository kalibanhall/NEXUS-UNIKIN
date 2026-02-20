const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin' });

(async () => {
  try {
    // Faculty info
    const fac = await pool.query("SELECT * FROM faculties WHERE name ILIKE '%pharma%'");
    console.log('=== FACULTÉ PHARMACIE ===');
    console.table(fac.rows);
    
    // Departments
    const deps = await pool.query("SELECT d.id, d.code, d.name FROM departments d JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%'");
    console.log('=== DÉPARTEMENTS ===');
    console.table(deps.rows);
    
    // Promotions
    const promos = await pool.query("SELECT p.id, p.code, p.name, p.level FROM promotions p JOIN departments d ON p.department_id = d.id JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%' ORDER BY d.name, p.level");
    console.log('=== PROMOTIONS ===');
    console.table(promos.rows);
    
    // Students count per promo
    const studs = await pool.query("SELECT p.name as promotion, p.level, COUNT(s.id) as students FROM promotions p JOIN departments d ON p.department_id = d.id JOIN faculties f ON d.faculty_id = f.id LEFT JOIN students s ON s.promotion_id = p.id WHERE f.name ILIKE '%pharma%' GROUP BY p.id, p.name, p.level ORDER BY p.level, p.name");
    console.log('=== ÉTUDIANTS PAR PROMOTION ===');
    console.table(studs.rows);
    
    // Teachers total
    const teach = await pool.query('SELECT COUNT(*) as total FROM teachers');
    console.log('Total enseignants dans le système:', teach.rows[0].total);
    
    // Courses pharma
    const courses = await pool.query("SELECT COUNT(*) as total FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%'");
    console.log('Cours Pharmacie:', courses.rows[0].total);
    
    // Enrollments
    const enr = await pool.query('SELECT COUNT(*) as total FROM enrollments');
    console.log('Total inscriptions:', enr.rows[0].total);
    
    // Grades
    const grd = await pool.query('SELECT COUNT(*) as total FROM grades');
    console.log('Total notes:', grd.rows[0].total);
    
    // Table columns
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'teachers' ORDER BY ordinal_position");
    console.log('=== COLONNES TEACHERS ===');
    console.table(cols.rows);
    
    const colsC = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position");
    console.log('=== COLONNES COURSES ===');
    console.table(colsC.rows);
    
    const colsG = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'grades' ORDER BY ordinal_position");
    console.log('=== COLONNES GRADES ===');
    console.table(colsG.rows);
    
    // Check academic years
    const years = await pool.query('SELECT * FROM academic_years');
    console.log('=== ANNÉES ACADÉMIQUES ===');
    console.table(years.rows);
    
    // Check existing tables
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('=== TOUTES LES TABLES ===');
    console.table(tables.rows);

  } catch (e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
})();

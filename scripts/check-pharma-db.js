const {Pool} = require('pg');
const p = new Pool({host:'94.72.97.228',port:5432,database:'nexus_unikin',user:'postgres',password:'postgres'});

async function run() {
  // Faculty
  let r = await p.query("SELECT id, name, code FROM faculties WHERE name ILIKE '%pharma%' OR code ILIKE '%PHAR%'");
  console.log('Faculty:', JSON.stringify(r.rows));
  
  // Departments
  r = await p.query("SELECT d.id, d.name, d.code, d.faculty_id FROM departments d JOIN faculties f ON d.faculty_id=f.id WHERE f.name ILIKE '%pharma%'");
  console.log('Departments:', JSON.stringify(r.rows));
  
  // Promotions
  r = await p.query("SELECT p.id, p.name, p.level, p.code, p.department_id FROM promotions p JOIN departments d ON p.department_id=d.id JOIN faculties f ON d.faculty_id=f.id WHERE f.name ILIKE '%pharma%' ORDER BY p.level");
  console.log('Promotions:', JSON.stringify(r.rows));
  
  // Current academic year
  r = await p.query("SELECT id, name FROM academic_years WHERE is_current = TRUE");
  console.log('Academic Year:', JSON.stringify(r.rows));
  
  // Existing teachers count
  r = await p.query("SELECT COUNT(*) as count FROM teachers t JOIN departments d ON t.department_id = d.id JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%'");
  console.log('Existing pharma teachers:', r.rows[0].count);
  
  // Existing courses count
  r = await p.query("SELECT COUNT(*) as count FROM courses c JOIN promotions p ON c.promotion_id = p.id JOIN departments d ON p.department_id = d.id JOIN faculties f ON d.faculty_id = f.id WHERE f.name ILIKE '%pharma%'");
  console.log('Existing pharma courses:', r.rows[0].count);

  // Columns in teachers table
  r = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'teachers' ORDER BY ordinal_position");
  console.log('Teachers columns:', r.rows.map(c => c.column_name + '(' + c.data_type + ')').join(', '));

  // Columns in courses table
  r = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position");
  console.log('Courses columns:', r.rows.map(c => c.column_name + '(' + c.data_type + ')').join(', '));

  // Columns in users table
  r = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
  console.log('Users columns:', r.rows.map(c => c.column_name + '(' + c.data_type + ')').join(', '));
  
  await p.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });

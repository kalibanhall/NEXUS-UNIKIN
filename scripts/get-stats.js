const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin' });

(async () => {
  const r1 = await pool.query('SELECT COUNT(*) as total FROM users');
  const r2 = await pool.query("SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role");
  const r3 = await pool.query('SELECT COUNT(*) as total FROM students');
  const r4 = await pool.query('SELECT COUNT(*) as total FROM faculties WHERE is_active = TRUE');
  const r5 = await pool.query('SELECT COUNT(*) as total FROM departments WHERE is_active = TRUE');
  const r6 = await pool.query('SELECT COUNT(*) as total FROM promotions');
  const r7 = await pool.query("SELECT COUNT(*) as total FROM payments WHERE status = 'COMPLETED'");
  const r8 = await pool.query(`SELECT f.name, COUNT(DISTINCT d.id) as departments, COUNT(DISTINCT p.id) as promotions, COUNT(DISTINCT s.id) as students
    FROM faculties f
    LEFT JOIN departments d ON d.faculty_id = f.id
    LEFT JOIN promotions p ON p.department_id = d.id
    LEFT JOIN students s ON s.promotion_id = p.id
    WHERE f.is_active = TRUE
    GROUP BY f.id, f.name
    ORDER BY COUNT(DISTINCT s.id) DESC`);
  const r9 = await pool.query('SELECT COUNT(*) as total FROM academic_years');
  const r10 = await pool.query("SELECT COUNT(*) as total FROM users WHERE account_activated = TRUE");
  const r11 = await pool.query("SELECT COUNT(*) as total FROM users WHERE account_activated = FALSE OR account_activated IS NULL");

  console.log('=== STATS GLOBALES ===');
  console.log('Total utilisateurs:', r1.rows[0].total);
  console.table(r2.rows);
  console.log('Total etudiants:', r3.rows[0].total);
  console.log('Facultes actives:', r4.rows[0].total);
  console.log('Departements actifs:', r5.rows[0].total);
  console.log('Promotions:', r6.rows[0].total);
  console.log('Paiements:', r7.rows[0].total);
  console.log('Annees academiques:', r9.rows[0].total);
  console.log('Comptes actives:', r10.rows[0].total);
  console.log('Comptes non actives:', r11.rows[0].total);
  console.log('\n=== FACULTES DETAIL ===');
  console.table(r8.rows);
  pool.end();
})();

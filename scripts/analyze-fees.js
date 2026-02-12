const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin' });

async function main() {
  // Fee analysis by level (USD)
  const r1 = await pool.query(`
    SELECT p.level, 
           COUNT(DISTINCT py.student_id) as students_with_payments,
           COUNT(py.id) as payment_count,
           ROUND(SUM(py.amount)::numeric, 2) as total_amount,
           py.devise,
           ROUND(AVG(py.amount)::numeric, 2) as avg_payment,
           ROUND(MIN(py.amount)::numeric, 2) as min_payment,
           ROUND(MAX(py.amount)::numeric, 2) as max_payment
    FROM payments py
    JOIN students s ON py.student_id = s.id
    JOIN promotions p ON s.promotion_id = p.id
    WHERE py.status = 'COMPLETED' AND py.devise = 'USD'
    GROUP BY p.level, py.devise
    ORDER BY p.level
  `);
  console.log('=== Payments by Level (USD) ===');
  console.table(r1.rows);

  // Payment types breakdown
  const r2 = await pool.query(`
    SELECT py.payment_type, py.devise,
           COUNT(*) as count,
           ROUND(SUM(py.amount)::numeric, 2) as total,
           ROUND(AVG(py.amount)::numeric, 2) as avg_amount
    FROM payments py
    WHERE py.status = 'COMPLETED'
    GROUP BY py.payment_type, py.devise
    ORDER BY py.devise, py.payment_type
  `);
  console.log('\n=== Payment Types ===');
  console.table(r2.rows);

  // Total per student by level (USD only)
  const r3 = await pool.query(`
    SELECT sub.level,
           ROUND(AVG(sub.student_total)::numeric, 2) as avg_total_per_student,
           ROUND(MIN(sub.student_total)::numeric, 2) as min_total,
           ROUND(MAX(sub.student_total)::numeric, 2) as max_total,
           COUNT(*) as student_count
    FROM (
      SELECT s.id, p.level, SUM(py.amount) as student_total
      FROM payments py
      JOIN students s ON py.student_id = s.id
      JOIN promotions p ON s.promotion_id = p.id
      WHERE py.status = 'COMPLETED' AND py.devise = 'USD'
      GROUP BY s.id, p.level
    ) sub
    GROUP BY sub.level
    ORDER BY sub.level
  `);
  console.log('\n=== Avg Total per Student by Level (USD) ===');
  console.table(r3.rows);

  // Check CDF payments too
  const r4 = await pool.query(`
    SELECT p.level, 
           COUNT(DISTINCT py.student_id) as students,
           COUNT(py.id) as payments,
           ROUND(SUM(py.amount)::numeric, 0) as total_cdf
    FROM payments py
    JOIN students s ON py.student_id = s.id
    JOIN promotions p ON s.promotion_id = p.id
    WHERE py.status = 'COMPLETED' AND py.devise = 'CDF'
    GROUP BY p.level
    ORDER BY p.level
  `);
  console.log('\n=== Payments by Level (CDF) ===');
  console.table(r4.rows);

  // Check student MERVEILLE KANKOLONGO specifically
  const r5 = await pool.query(`
    SELECT s.matricule, p.level, p.name as promotion_name,
           py.amount, py.devise, py.payment_type, py.motif, py.payment_date
    FROM payments py
    JOIN students s ON py.student_id = s.id
    LEFT JOIN promotions p ON s.promotion_id = p.id
    WHERE s.matricule = '2201773'
    ORDER BY py.payment_date
  `);
  console.log('\n=== MERVEILLE KANKOLONGO (2201773) Payments ===');
  console.table(r5.rows);

  // Students per level
  const r6 = await pool.query(`
    SELECT p.level, COUNT(*) as count
    FROM students s
    JOIN promotions p ON s.promotion_id = p.id
    GROUP BY p.level
    ORDER BY p.level
  `);
  console.log('\n=== Students per Level ===');
  console.table(r6.rows);

  pool.end();
}

main().catch(e => { console.error(e); pool.end(); });

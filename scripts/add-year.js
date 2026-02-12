const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin' });

async function run() {
  await p.query(
    "INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES ('2024-2025', '2024-10-01', '2025-07-31', FALSE) ON CONFLICT (name) DO NOTHING"
  );
  const r = await p.query('SELECT * FROM academic_years ORDER BY name');
  console.log('Academic years:', r.rows);
  await p.end();
}
run().catch(e => { console.error(e); p.end(); });

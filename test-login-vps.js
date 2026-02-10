const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://nexus_admin:NexusUnikin2026@localhost:5432/nexus_unikin'
});

async function test() {
  const result = await pool.query("SELECT email, password FROM users WHERE email = 'admin@unikin.ac.cd'");
  const user = result.rows[0];
  console.log('Email:', user.email);
  console.log('Hash in DB:', user.password);
  
  const passwords = ['Admin@2026', 'admin@2026', 'Admin2026', 'password', 'admin123'];
  for (const pwd of passwords) {
    const isValid = await bcrypt.compare(pwd, user.password);
    console.log('Testing:', pwd, '-> Valid:', isValid);
  }
  
  // Generate correct hash
  const newHash = await bcrypt.hash('Admin@2026', 10);
  console.log('\nNew correct hash for Admin@2026:', newHash);
  
  await pool.end();
}
test().catch(console.error);

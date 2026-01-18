const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Qualis2025@localhost:5432/nexus_unikin'
});

async function checkAdmins() {
  try {
    const result = await pool.query("SELECT id, email, role, is_active FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN')");
    console.log('Comptes Admin trouvés:');
    console.log(result.rows);
    
    const allUsers = await pool.query("SELECT id, email, role FROM users ORDER BY id LIMIT 20");
    console.log('\nTous les utilisateurs:');
    console.log(allUsers.rows);
  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    await pool.end();
  }
}

checkAdmins();

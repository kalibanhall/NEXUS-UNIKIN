const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://nexus_admin:NexusUnikin2026@localhost:5432/nexus_unikin'
});

async function createAdmin() {
  const email = 'sg.recherche@unikin.ac.cd';
  const firstName = 'Paulin';
  const lastName = 'Mutwale';
  const password = 'MPaulin@2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      // Update existing user
      await pool.query(
        'UPDATE users SET password = $1, role = $2, is_active = true WHERE email = $3',
        [hashedPassword, 'SUPER_ADMIN', email]
      );
      console.log('User updated to SUPER_ADMIN:', email);
    } else {
      // Create new user
      const userResult = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', true, NOW())
         RETURNING id`,
        [email, hashedPassword, firstName, lastName]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create admin record
      await pool.query(
        `INSERT INTO admins (user_id, admin_type, created_at)
         VALUES ($1, 'SUPER_ADMIN', NOW())`,
        [userId]
      );
      
      console.log('SUPER_ADMIN created successfully!');
    }
    
    console.log('\nCredentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();

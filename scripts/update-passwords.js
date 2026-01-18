const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Qualis2025@localhost:5432/nexus_unikin'
});

async function updatePasswords() {
  try {
    console.log('Generating password hashes...');
    
    const adminHash = bcrypt.hashSync('Admin@2026', 10);
    const profHash = bcrypt.hashSync('Prof@2026', 10);
    const studentHash = bcrypt.hashSync('Etudiant@2026', 10);
    const employeeHash = bcrypt.hashSync('Employe@2026', 10);

    console.log('Updating passwords in database...');

    await pool.query('UPDATE users SET password = $1 WHERE role = $2', [adminHash, 'SUPER_ADMIN']);
    console.log('✓ SUPER_ADMIN password updated');
    
    await pool.query('UPDATE users SET password = $1 WHERE role = $2', [profHash, 'TEACHER']);
    console.log('✓ TEACHER passwords updated');
    
    await pool.query('UPDATE users SET password = $1 WHERE role = $2', [studentHash, 'STUDENT']);
    console.log('✓ STUDENT passwords updated');
    
    await pool.query('UPDATE users SET password = $1 WHERE role = $2', [employeeHash, 'EMPLOYEE']);
    console.log('✓ EMPLOYEE passwords updated');

    // Verify
    const result = await pool.query('SELECT email, role, password FROM users LIMIT 5');
    console.log('\nVerification:');
    for (const row of result.rows) {
      let testPassword;
      switch(row.role) {
        case 'SUPER_ADMIN': testPassword = 'Admin@2026'; break;
        case 'TEACHER': testPassword = 'Prof@2026'; break;
        case 'STUDENT': testPassword = 'Etudiant@2026'; break;
        case 'EMPLOYEE': testPassword = 'Employe@2026'; break;
      }
      const match = bcrypt.compareSync(testPassword, row.password);
      console.log(`${row.email} (${row.role}): ${match ? '✓ OK' : '✗ FAILED'}`);
    }

    console.log('\nPasswords updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updatePasswords();

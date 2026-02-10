const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://nexus_admin:NexusUnikin2026@localhost:5432/nexus_unikin'
});

async function updatePasswords() {
  const passwords = {
    'SUPER_ADMIN': 'Admin@2026',
    'ADMIN': 'Admin@2026',
    'TEACHER': 'Teacher@2026',
    'STUDENT': 'Student@2026',
    'EMPLOYEE': 'Employee@2026'
  };
  
  for (const [role, pwd] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(pwd, 10);
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE role = $2 RETURNING email',
      [hash, role]
    );
    console.log(`Updated ${result.rowCount} ${role} users with password: ${pwd}`);
  }
  
  console.log('\n✅ All passwords updated successfully!');
  console.log('\nCredentials:');
  console.log('- Admin: admin@unikin.ac.cd / Admin@2026');
  console.log('- Teacher: prof.kabongo@unikin.ac.cd / Teacher@2026');
  console.log('- Student: etudiant.mbuyi@student.unikin.ac.cd / Student@2026');
  console.log('- Employee: employe.mutombo@unikin.ac.cd / Employee@2026');
  
  await pool.end();
}
updatePasswords().catch(console.error);

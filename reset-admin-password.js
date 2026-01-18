const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Qualis2025@localhost:5432/nexus_unikin'
});

async function resetAdminPassword() {
  try {
    // Générer un nouveau hash pour Admin@2026
    const newPassword = 'Admin@2026';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('Nouveau hash généré pour Admin@2026:', hashedPassword);
    
    // Mettre à jour le mot de passe admin
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = 'ADM-2024-001@unikin.ac.cd' RETURNING id, email",
      [hashedPassword]
    );
    
    console.log('Mot de passe mis à jour pour:', result.rows[0]);
    console.log('\nNouveaux identifiants:');
    console.log('Email: ADM-2024-001@unikin.ac.cd');
    console.log('Mot de passe: Admin@2026');
  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();

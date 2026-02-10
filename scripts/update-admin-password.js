// Script pour mettre à jour le mot de passe admin
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'nexus_unikin',
    user: 'postgres',
    password: 'postgres',
  });
  
  try {
    const hashedPassword = await bcrypt.hash('Admin@2026', 10);
    console.log('Hash généré:', hashedPassword);
    
    await pool.query(
      `UPDATE users SET password = $1 WHERE email = 'admin@unikin.ac.cd'`,
      [hashedPassword]
    );
    console.log('Mot de passe admin mis à jour avec succès!');
    
    // Vérification
    const result = await pool.query(
      `SELECT email, password FROM users WHERE email = 'admin@unikin.ac.cd'`
    );
    console.log('User:', result.rows[0]?.email);
    
    // Test du mot de passe
    const isValid = await bcrypt.compare('Admin@2026', result.rows[0]?.password);
    console.log('Validation mot de passe:', isValid);
    
  } finally {
    await pool.end();
  }
}

updateAdmin().catch(console.error);

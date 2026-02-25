const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://nexus_admin:NexusUnikin2026@localhost:5432/nexus_unikin'
});

async function createRectoratAdmin() {
  const email = 'Rectorat@unikin.ac.cd';
  const firstName = 'Rectorat';
  const lastName = 'UNIKIN';
  const password = 'RECT@2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 1. Ajouter colonne permissions si elle n'existe pas
    await pool.query(`
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'
    `);
    console.log('✅ Colonne permissions ajoutée/vérifiée');

    // 2. Check si user existe déjà
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    let userId;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await pool.query(
        'UPDATE users SET password = $1, role = $2, is_active = true, first_name = $3, last_name = $4 WHERE id = $5',
        [hashedPassword, 'SUPER_ADMIN', firstName, lastName, userId]
      );
      console.log('✅ Utilisateur mis à jour:', email);
    } else {
      const userResult = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active, must_change_password, created_at)
         VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', true, false, NOW())
         RETURNING id`,
        [email, hashedPassword, firstName, lastName]
      );
      userId = userResult.rows[0].id;
      console.log('✅ Utilisateur créé:', email);
    }

    // 3. Créer ou mettre à jour le profil admin avec permissions restreintes
    const existingAdmin = await pool.query('SELECT id FROM admins WHERE user_id = $1', [userId]);

    const permissions = {
      hide_exact_students: true  // Masquer le nombre exact d'étudiants
    };

    if (existingAdmin.rows.length > 0) {
      await pool.query(
        'UPDATE admins SET admin_type = $1, permissions = $2, updated_at = NOW() WHERE user_id = $3',
        ['SUPER_ADMIN', JSON.stringify(permissions), userId]
      );
      console.log('✅ Profil admin mis à jour avec restrictions');
    } else {
      await pool.query(
        `INSERT INTO admins (user_id, admin_type, permissions, created_at)
         VALUES ($1, 'SUPER_ADMIN', $2, NOW())`,
        [userId, JSON.stringify(permissions)]
      );
      console.log('✅ Profil admin créé avec restrictions');
    }

    console.log('\n========================================');
    console.log('  COMPTE RECTORAT CRÉÉ');
    console.log('========================================');
    console.log('Email    :', email);
    console.log('Mot de passe :', password);
    console.log('Rôle     : SUPER_ADMIN');
    console.log('Restriction  : Nombre exact étudiants masqué');
    console.log('========================================\n');

    // Vérification
    const check = await pool.query(
      `SELECT u.email, u.role, u.first_name, u.last_name, a.admin_type, a.permissions
       FROM users u JOIN admins a ON a.user_id = u.id WHERE u.email = $1`,
      [email]
    );
    console.log('Vérification:', check.rows[0]);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

createRectoratAdmin();

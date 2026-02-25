/**
 * NEXUS UNIKIN - Inspection de la base de données VPS
 * IP: 94.72.97.228
 * Vérifie la structure existante avant intégration de la Faculté de Pharmacie
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: '94.72.97.228',
  port: 5432,
  database: 'nexus_unikin',
  user: 'nexus_admin',
  password: 'NexusUnikin2026!',
  connectionTimeoutMillis: 10000,
  ssl: false
});

async function inspect() {
  try {
    console.log('🔗 Connexion à 94.72.97.228...');
    const client = await pool.connect();
    console.log('✅ Connecté!\n');

    // 1. Tables existantes
    console.log('=== TABLES EXISTANTES ===');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    tables.rows.forEach(r => console.log('  ' + r.table_name));
    console.log(`\nTotal: ${tables.rows.length} tables\n`);

    // 2. Facultés
    console.log('=== FACULTÉS ===');
    const faculties = await client.query('SELECT id, code, name, is_active FROM faculties ORDER BY id');
    faculties.rows.forEach(r => console.log(`  [${r.id}] ${r.code} - ${r.name} (active: ${r.is_active})`));
    console.log(`\nTotal: ${faculties.rows.length}\n`);

    // 3. Départements
    console.log('=== DÉPARTEMENTS ===');
    const departments = await client.query(`
      SELECT d.id, d.code, d.name, f.code as faculty_code 
      FROM departments d 
      JOIN faculties f ON d.faculty_id = f.id 
      ORDER BY f.code, d.code
    `);
    departments.rows.forEach(r => console.log(`  [${r.id}] ${r.code} - ${r.name} (${r.faculty_code})`));
    console.log(`\nTotal: ${departments.rows.length}\n`);

    // 4. Départements Pharmacie spécifiquement
    console.log('=== DÉPARTEMENTS PHARMACIE ===');
    const pharmaDepts = await client.query(`
      SELECT d.id, d.code, d.name 
      FROM departments d 
      JOIN faculties f ON d.faculty_id = f.id 
      WHERE f.code = 'PHARMACIE' OR f.name ILIKE '%pharma%'
      ORDER BY d.code
    `);
    if (pharmaDepts.rows.length === 0) {
      console.log('  (aucun département Pharmacie trouvé)');
    } else {
      pharmaDepts.rows.forEach(r => console.log(`  [${r.id}] ${r.code} - ${r.name}`));
    }
    console.log();

    // 5. Promotions
    console.log('=== PROMOTIONS ===');
    const promotions = await client.query(`
      SELECT p.id, p.code, p.name, p.level, d.code as dept_code, a.name as year_name
      FROM promotions p
      JOIN departments d ON p.department_id = d.id
      JOIN academic_years a ON p.academic_year_id = a.id
      ORDER BY d.code, p.level
    `);
    promotions.rows.forEach(r => console.log(`  [${r.id}] ${r.code} - ${r.name} (${r.level}, ${r.dept_code}, ${r.year_name})`));
    console.log(`\nTotal: ${promotions.rows.length}\n`);

    // 6. Nombre d'utilisateurs par rôle
    console.log('=== UTILISATEURS PAR RÔLE ===');
    const users = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM users GROUP BY role ORDER BY role
    `);
    users.rows.forEach(r => console.log(`  ${r.role}: ${r.count}`));
    console.log();

    // 7. Enseignants
    console.log('=== ENSEIGNANTS ===');
    const teachers = await client.query(`
      SELECT t.id, u.first_name, u.last_name, t.matricule, t.grade, d.code as dept_code
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      ORDER BY u.last_name
      LIMIT 30
    `);
    teachers.rows.forEach(r => console.log(`  [${r.id}] ${r.last_name} ${r.first_name} - ${r.grade} (${r.dept_code || 'N/A'}) - mat: ${r.matricule}`));
    console.log(`  ... (${(await client.query('SELECT COUNT(*) FROM teachers')).rows[0].count} total)\n`);

    // 8. Cours
    console.log('=== COURS (échantillon) ===');
    const courses = await client.query(`
      SELECT c.id, c.code, c.name, c.credits, c.semester, p.code as promo_code
      FROM courses c
      JOIN promotions p ON c.promotion_id = p.id
      ORDER BY c.code
      LIMIT 20
    `);
    courses.rows.forEach(r => console.log(`  [${r.id}] ${r.code} - ${r.name} (${r.credits} cr, sem ${r.semester}, ${r.promo_code})`));
    console.log(`  ... (${(await client.query('SELECT COUNT(*) FROM courses')).rows[0].count} total)\n`);

    // 9. Année académique
    console.log('=== ANNÉES ACADÉMIQUES ===');
    const years = await client.query('SELECT * FROM academic_years ORDER BY id');
    years.rows.forEach(r => console.log(`  [${r.id}] ${r.name} - current: ${r.is_current}`));
    console.log();

    // 10. Vérifier la contrainte semester du cours
    console.log('=== CONTRAINTES TABLE COURSES ===');
    const constraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as def 
      FROM pg_constraint 
      WHERE conrelid = 'courses'::regclass AND contype = 'c'
    `);
    constraints.rows.forEach(r => console.log(`  ${r.conname}: ${r.def}`));
    console.log();

    // 11. Vérifier si la table deliberation_criteria existe
    console.log('=== TABLE DELIBERATION_CRITERIA ===');
    const hasCriteria = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'deliberation_criteria'
      ) as exists
    `);
    console.log(`  Existe: ${hasCriteria.rows[0].exists}`);

    // 12. Compter étudiants, notes, payments
    console.log('\n=== STATISTIQUES GÉNÉRALES ===');
    for (const table of ['students', 'grades', 'payments', 'enrollments', 'notifications', 'attendance']) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${count.rows[0].count} rows`);
      } catch(e) {
        console.log(`  ${table}: (table n'existe pas)`);
      }
    }

    client.release();
    await pool.end();
    console.log('\n✅ Inspection terminée');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    await pool.end();
  }
}

inspect();

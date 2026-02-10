// Script pour afficher tous les identifiants de connexion
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nexus_unikin',
  user: 'postgres',
  password: 'postgres',
});

async function showCredentials() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('        NEXUS UNIKIN - Identifiants de Connexion');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Admin
    const admins = await pool.query(`
      SELECT u.email, u.first_name || ' ' || u.last_name as name, a.admin_type
      FROM users u JOIN admins a ON u.id = a.user_id
    `);
    console.log('🔐 ADMINISTRATEURS (mot de passe: Admin@2026)');
    console.log('───────────────────────────────────────────────────────────────');
    for (const admin of admins.rows) {
      console.log(`   ${admin.name.padEnd(25)} | ${admin.email}`);
    }
    
    // Enseignants (premiers 10)
    const teachers = await pool.query(`
      SELECT u.email, u.first_name || ' ' || u.last_name as name, t.grade, d.name as dept
      FROM users u 
      JOIN teachers t ON u.id = t.user_id
      LEFT JOIN departments d ON t.department_id = d.id
      ORDER BY u.id LIMIT 15
    `);
    console.log('\n👨‍🏫 ENSEIGNANTS (mot de passe: Teacher@2026)');
    console.log('───────────────────────────────────────────────────────────────');
    for (const t of teachers.rows) {
      console.log(`   ${t.name.padEnd(25)} | ${t.email}`);
      console.log(`     └─ ${t.grade} - ${t.dept || 'N/A'}`);
    }
    console.log(`   ... et ${90 - teachers.rows.length} autres enseignants`);
    
    // Étudiants (premiers 10)
    const students = await pool.query(`
      SELECT u.email, u.first_name || ' ' || u.last_name as name, s.matricule, p.name as promo, f.name as fac
      FROM users u 
      JOIN students s ON u.id = s.user_id
      JOIN promotions p ON s.promotion_id = p.id
      JOIN departments d ON p.department_id = d.id
      JOIN faculties f ON d.faculty_id = f.id
      ORDER BY s.matricule LIMIT 20
    `);
    console.log('\n👨‍🎓 ÉTUDIANTS (mot de passe: Student@2026)');
    console.log('───────────────────────────────────────────────────────────────');
    for (const s of students.rows) {
      console.log(`   ${s.name.padEnd(25)} | ${s.email}`);
      console.log(`     └─ Matricule: ${s.matricule} | ${s.promo}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 Statistiques de la base de données:');
    console.log('───────────────────────────────────────────────────────────────');
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM faculties) as faculties,
        (SELECT COUNT(*) FROM departments) as departments,
        (SELECT COUNT(*) FROM promotions) as promotions,
        (SELECT COUNT(*) FROM teachers) as teachers,
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM enrollments) as enrollments,
        (SELECT COUNT(*) FROM grades) as grades,
        (SELECT COUNT(*) FROM attendance) as attendance,
        (SELECT COUNT(*) FROM payments) as payments
    `);
    const s = stats.rows[0];
    console.log(`   Facultés:      ${s.faculties}`);
    console.log(`   Départements:  ${s.departments}`);
    console.log(`   Promotions:    ${s.promotions}`);
    console.log(`   Enseignants:   ${s.teachers}`);
    console.log(`   Étudiants:     ${s.students}`);
    console.log(`   Cours:         ${s.courses}`);
    console.log(`   Inscriptions:  ${s.enrollments}`);
    console.log(`   Notes:         ${s.grades}`);
    console.log(`   Présences:     ${s.attendance}`);
    console.log(`   Paiements:     ${s.payments}`);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🌐 Application accessible sur: http://localhost:3000');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } finally {
    await pool.end();
  }
}

showCredentials().catch(console.error);

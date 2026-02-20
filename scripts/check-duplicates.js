const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin' });

(async () => {
  try {
    // Check for duplicate matricules
    const duplicates = await pool.query(`
      SELECT matricule, COUNT(*) as count 
      FROM students 
      GROUP BY matricule 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC 
      LIMIT 20
    `);
    
    const totalDuplicates = await pool.query(`
      SELECT COUNT(*) as total 
      FROM (
        SELECT matricule 
        FROM students 
        GROUP BY matricule 
        HAVING COUNT(*) > 1
      ) sub
    `);
    
    console.log('=== DOUBLONS DE MATRICULES ===');
    if (duplicates.rows.length > 0) {
      console.table(duplicates.rows);
      console.log('\nTotal de matricules en double:', totalDuplicates.rows[0].total);
    } else {
      console.log('Aucun doublon trouvé');
    }
    
    // Check for unique students
    const uniqueStudents = await pool.query(`
      SELECT COUNT(DISTINCT matricule) as unique_count 
      FROM students
    `);
    
    const totalStudents = await pool.query(`SELECT COUNT(*) as total FROM students`);
    
    console.log('\n=== ANALYSE ÉTUDIANTS ===');
    console.log('Total étudiants enregistrés:', totalStudents.rows[0].total);
    console.log('Matricules uniques:', uniqueStudents.rows[0].unique_count);
    console.log('Différence (doublons):', parseInt(totalStudents.rows[0].total) - parseInt(uniqueStudents.rows[0].unique_count));
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    pool.end();
  }
})();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin'
});

async function createStudentPatrick() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // ============================================
    // 1. Trouver ou créer la Faculté FLSH
    // ============================================
    let faculty = await client.query(
      "SELECT id FROM faculties WHERE code = 'FLSH'"
    );
    
    let facultyId;
    if (faculty.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO faculties (code, name, description, is_active) 
         VALUES ('FLSH', 'Faculte des Lettres et Sciences Humaines', 'Lettres, philosophie, histoire, langues', TRUE)
         RETURNING id`
      );
      facultyId = result.rows[0].id;
      console.log('✓ Faculté FLSH créée avec id:', facultyId);
    } else {
      facultyId = faculty.rows[0].id;
      console.log('✓ Faculté FLSH trouvée avec id:', facultyId);
    }
    
    // ============================================
    // 2. Trouver ou créer le département LIAC
    // ============================================
    let dept = await client.query(
      "SELECT id FROM departments WHERE code = 'LIAC'"
    );
    
    let deptId;
    if (dept.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO departments (code, name, description, faculty_id, is_active) 
         VALUES ('LIAC', 'Langues et Informatique Appliquees aux Affaires et au Commerce', 
                 'Formation en langues, informatique appliquee, commerce et affaires', $1, TRUE)
         RETURNING id`,
        [facultyId]
      );
      deptId = result.rows[0].id;
      console.log('✓ Département LIAC créé avec id:', deptId);
    } else {
      deptId = dept.rows[0].id;
      console.log('✓ Département LIAC trouvé avec id:', deptId);
    }
    
    // ============================================
    // 3. Trouver l'année académique courante (2025-2026)
    // ============================================
    let academicYear = await client.query(
      "SELECT id FROM academic_years WHERE is_current = TRUE"
    );
    
    let academicYearId;
    if (academicYear.rows.length === 0) {
      // Créer l'année académique si elle n'existe pas
      const result = await client.query(
        `INSERT INTO academic_years (name, start_date, end_date, is_current) 
         VALUES ('2025-2026', '2025-09-01', '2026-08-31', TRUE)
         RETURNING id`
      );
      academicYearId = result.rows[0].id;
      console.log('✓ Année académique 2025-2026 créée avec id:', academicYearId);
    } else {
      academicYearId = academicYear.rows[0].id;
      console.log('✓ Année académique courante trouvée avec id:', academicYearId);
    }
    
    // ============================================
    // 4. Trouver ou créer la promotion L1-LIAC
    // ============================================
    let promo = await client.query(
      "SELECT id FROM promotions WHERE code = 'L1-LIAC-2526'"
    );
    
    let promoId;
    if (promo.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO promotions (code, name, level, department_id, academic_year_id, is_active) 
         VALUES ('L1-LIAC-2526', 'Licence 1 LIAC', 'L1', $1, $2, TRUE)
         RETURNING id`,
        [deptId, academicYearId]
      );
      promoId = result.rows[0].id;
      console.log('✓ Promotion L1-LIAC créée avec id:', promoId);
    } else {
      promoId = promo.rows[0].id;
      console.log('✓ Promotion L1-LIAC trouvée avec id:', promoId);
    }
    
    // ============================================
    // 5. Créer l'utilisateur Patrick Mpiana Katanku
    // ============================================
    const email = '683C26E21@unikin.ac.cd';
    const password = 'MPatrick@2026';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vérifier si l'utilisateur existe déjà
    let existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    
    let userId;
    if (existingUser.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) 
         VALUES ($1, $2, 'Patrick', 'MPIANA KATANKU', NULL, 'STUDENT', TRUE)
         RETURNING id`,
        [email, hashedPassword]
      );
      userId = result.rows[0].id;
      console.log('✓ Utilisateur créé avec id:', userId);
    } else {
      userId = existingUser.rows[0].id;
      console.log('✓ Utilisateur existant avec id:', userId);
    }
    
    // ============================================
    // 6. Créer l'enregistrement étudiant
    // ============================================
    let existingStudent = await client.query(
      "SELECT id FROM students WHERE matricule = '683C26E21'"
    );
    
    let studentId;
    if (existingStudent.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, status, payment_status, gender, nationality) 
         VALUES ($1, '683C26E21', $2, CURRENT_DATE, 'ACTIVE', 'UNPAID', 'M', 'Congolaise')
         RETURNING id`,
        [userId, promoId]
      );
      studentId = result.rows[0].id;
      console.log('✓ Étudiant créé avec id:', studentId);
    } else {
      studentId = existingStudent.rows[0].id;
      console.log('✓ Étudiant existant avec id:', studentId);
    }
    
    // ============================================
    // 7. Créer les 4 cours dans la promotion L1-LIAC
    // ============================================
    const coursesData = [
      { code: 'LIAC101', name: 'Programmation Web', description: 'Developpement web (HTML, CSS, JavaScript)', credits: 4, semester: 1 },
      { code: 'LIAC102', name: 'Anglais des Affaires', description: 'English for Business Communication', credits: 3, semester: 1 },
      { code: 'LIAC103', name: 'Management', description: 'Principes fondamentaux du management', credits: 3, semester: 1 },
      { code: 'LIAC104', name: 'Structure des Ordinateurs', description: 'Architecture et fonctionnement des systemes informatiques', credits: 4, semester: 1 }
    ];
    
    const courseIds = [];
    
    for (const course of coursesData) {
      let existing = await client.query(
        "SELECT id FROM courses WHERE code = $1 AND promotion_id = $2",
        [course.code, promoId]
      );
      
      if (existing.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO courses (code, name, description, credits, hours_cm, hours_td, hours_tp, promotion_id, semester, course_type) 
           VALUES ($1, $2, $3, $4, 30, 15, 10, $5, $6, 'OBLIGATOIRE')
           RETURNING id`,
          [course.code, course.name, course.description, course.credits, promoId, course.semester]
        );
        courseIds.push(result.rows[0].id);
        console.log(`✓ Cours "${course.name}" créé avec id:`, result.rows[0].id);
      } else {
        courseIds.push(existing.rows[0].id);
        console.log(`✓ Cours "${course.name}" existant avec id:`, existing.rows[0].id);
      }
    }
    
    // ============================================
    // 8. Inscrire l'étudiant aux 4 cours
    // ============================================
    for (let i = 0; i < courseIds.length; i++) {
      let existing = await client.query(
        "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2 AND academic_year_id = $3",
        [studentId, courseIds[i], academicYearId]
      );
      
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO enrollments (student_id, course_id, academic_year_id, status) 
           VALUES ($1, $2, $3, 'ENROLLED')`,
          [studentId, courseIds[i], academicYearId]
        );
        console.log(`✓ Inscription au cours "${coursesData[i].name}" effectuée`);
      } else {
        console.log(`✓ Déjà inscrit au cours "${coursesData[i].name}"`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n========================================');
    console.log('COMPTE ÉTUDIANT CRÉÉ AVEC SUCCÈS');
    console.log('========================================');
    console.log('Nom complet  : Patrick MPIANA KATANKU');
    console.log('Email        :', email);
    console.log('Mot de passe : MPatrick@2026');
    console.log('Matricule    : 683C26E21');
    console.log('Faculté      : Lettres et Sciences Humaines (FLSH)');
    console.log('Département  : LIAC');
    console.log('Promotion    : L1-LIAC 2025-2026');
    console.log('Cours        : Programmation Web, Anglais des Affaires, Management, Structure des Ordinateurs');
    console.log('========================================');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createStudentPatrick().catch(console.error);

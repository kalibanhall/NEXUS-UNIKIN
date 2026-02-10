// ==============================================
// NEXUS UNIKIN - Script de Seed Complet
// Données réelles pour l'Université de Kinshasa
// ==============================================

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/nexus_unikin',
});

// Fonction pour hasher les mots de passe
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Génération de matricule étudiant: format 2122340977
function generateStudentMatricule(index, facultyCode) {
  const year = '21';
  const facultyNum = facultyCode === 'SCI' ? '22' : facultyCode === 'DRT' ? '23' : '24';
  const sequence = String(340000 + index).padStart(6, '0').slice(-4);
  return `${year}${facultyNum}${sequence}`;
}

// Génération de matricule enseignant
function generateTeacherMatricule(index) {
  return `ENS${String(2020000 + index).padStart(7, '0')}`;
}

// Prénoms et noms congolais
const FIRST_NAMES = [
  'Jean-Pierre', 'Marie', 'Patrick', 'Claudine', 'François', 'Jeanne', 'Joseph', 'Thérèse',
  'Pierre', 'Cécile', 'André', 'Béatrice', 'Michel', 'Pauline', 'Jacques', 'Christine',
  'Paul', 'Monique', 'David', 'Esther', 'Samuel', 'Ruth', 'Daniel', 'Rachel',
  'Emmanuel', 'Grâce', 'Olivier', 'Pascaline', 'Christian', 'Sylvie', 'Alain', 'Joséphine',
  'Eric', 'Nadine', 'Blaise', 'Angélique', 'Serge', 'Henriette', 'Didier', 'Francine',
  'Hervé', 'Brigitte', 'Thierry', 'Véronique', 'Guy', 'Antoinette', 'Roger', 'Madeleine',
  'Bernard', 'Martine', 'Robert', 'Jacqueline', 'Vincent', 'Catherine', 'Léon', 'Sophie',
  'Claude', 'Anne', 'Bruno', 'Hélène', 'Gaston', 'Laurence', 'Philippe', 'Denise'
];

const LAST_NAMES = [
  'Kabongo', 'Mutombo', 'Lukusa', 'Tshimanga', 'Kalala', 'Mbuyi', 'Kasongo', 'Ilunga',
  'Mwamba', 'Kanyinda', 'Mukendi', 'Tshibangu', 'Kabila', 'Lumumba', 'Mulamba', 'Tshisekedi',
  'Kabasele', 'Mbaya', 'Nkongolo', 'Kapinga', 'Mwana', 'Kibonge', 'Mukeba', 'Kalombo',
  'Mbombo', 'Nzeza', 'Kalonji', 'Mpiana', 'Ngoyi', 'Banza', 'Kazadi', 'Mudimba',
  'Ngandu', 'Kayembe', 'Mulongo', 'Tshilombo', 'Kabemba', 'Mashini', 'Ngoy', 'Katanga',
  'Muyembe', 'Kamba', 'Ntumba', 'Bakajika', 'Mukalay', 'Kalubi', 'Mbaya', 'Kisimba'
];

// Cours par faculté
const COURSES_BY_FACULTY = {
  SCI: [
    { code: 'MAT101', name: 'Analyse Mathématique I', credits: 6, hours_cm: 45, hours_td: 30, hours_tp: 0 },
    { code: 'MAT102', name: 'Algèbre Linéaire', credits: 5, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'PHY101', name: 'Mécanique Générale', credits: 5, hours_cm: 40, hours_td: 20, hours_tp: 15 },
    { code: 'PHY102', name: 'Électromagnétisme', credits: 5, hours_cm: 40, hours_td: 20, hours_tp: 15 },
    { code: 'CHI101', name: 'Chimie Générale', credits: 5, hours_cm: 40, hours_td: 15, hours_tp: 20 },
    { code: 'CHI102', name: 'Chimie Organique', credits: 4, hours_cm: 35, hours_td: 15, hours_tp: 15 },
    { code: 'BIO101', name: 'Biologie Cellulaire', credits: 4, hours_cm: 35, hours_td: 15, hours_tp: 15 },
    { code: 'BIO102', name: 'Génétique', credits: 4, hours_cm: 35, hours_td: 15, hours_tp: 15 },
    { code: 'INF101', name: 'Algorithmes et Programmation', credits: 5, hours_cm: 30, hours_td: 15, hours_tp: 30 },
    { code: 'INF102', name: 'Structures de Données', credits: 5, hours_cm: 30, hours_td: 15, hours_tp: 30 },
    { code: 'MAT201', name: 'Analyse Mathématique II', credits: 6, hours_cm: 45, hours_td: 30, hours_tp: 0 },
    { code: 'MAT202', name: 'Probabilités et Statistiques', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 0 },
    { code: 'PHY201', name: 'Thermodynamique', credits: 5, hours_cm: 40, hours_td: 20, hours_tp: 15 },
    { code: 'PHY202', name: 'Optique', credits: 4, hours_cm: 35, hours_td: 15, hours_tp: 15 },
    { code: 'INF201', name: 'Bases de Données', credits: 5, hours_cm: 30, hours_td: 15, hours_tp: 30 },
    { code: 'INF202', name: 'Systèmes d\'Exploitation', credits: 4, hours_cm: 30, hours_td: 15, hours_tp: 20 },
    { code: 'MAT301', name: 'Équations Différentielles', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 0 },
    { code: 'MAT302', name: 'Analyse Numérique', credits: 5, hours_cm: 35, hours_td: 20, hours_tp: 20 },
    { code: 'INF301', name: 'Réseaux Informatiques', credits: 5, hours_cm: 35, hours_td: 15, hours_tp: 25 },
    { code: 'INF302', name: 'Génie Logiciel', credits: 5, hours_cm: 35, hours_td: 20, hours_tp: 20 },
    { code: 'PHY301', name: 'Physique Quantique', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'CHI201', name: 'Chimie Analytique', credits: 4, hours_cm: 30, hours_td: 15, hours_tp: 20 },
    { code: 'BIO201', name: 'Microbiologie', credits: 4, hours_cm: 30, hours_td: 15, hours_tp: 20 },
    { code: 'INF401', name: 'Intelligence Artificielle', credits: 5, hours_cm: 35, hours_td: 20, hours_tp: 20 },
    { code: 'INF402', name: 'Sécurité Informatique', credits: 4, hours_cm: 30, hours_td: 15, hours_tp: 20 },
    { code: 'MAT401', name: 'Recherche Opérationnelle', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 10 },
    { code: 'PHY401', name: 'Physique des Semi-conducteurs', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 10 },
    { code: 'INF403', name: 'Développement Web Avancé', credits: 4, hours_cm: 25, hours_td: 15, hours_tp: 30 },
    { code: 'INF404', name: 'Big Data et Cloud Computing', credits: 4, hours_cm: 30, hours_td: 15, hours_tp: 25 },
    { code: 'MAT402', name: 'Cryptographie', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 10 },
  ],
  DRT: [
    { code: 'DRT101', name: 'Introduction au Droit', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT102', name: 'Droit Constitutionnel', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT103', name: 'Droit Civil (Personnes)', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT104', name: 'Histoire du Droit', credits: 4, hours_cm: 40, hours_td: 15, hours_tp: 0 },
    { code: 'DRT105', name: 'Droit Pénal Général', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT106', name: 'Méthodologie Juridique', credits: 3, hours_cm: 30, hours_td: 15, hours_tp: 0 },
    { code: 'DRT201', name: 'Droit Administratif', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT202', name: 'Droit des Obligations', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT203', name: 'Droit Commercial', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT204', name: 'Droit Pénal Spécial', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT205', name: 'Procédure Civile', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT206', name: 'Droit International Public', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT301', name: 'Droit du Travail', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT302', name: 'Droit des Sociétés', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT303', name: 'Droit Fiscal', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT304', name: 'Procédure Pénale', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT305', name: 'Droit de la Famille', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT306', name: 'Libertés Publiques', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT401', name: 'Droit Minier', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT402', name: 'Droit de l\'Environnement', credits: 4, hours_cm: 40, hours_td: 15, hours_tp: 0 },
    { code: 'DRT403', name: 'Droit des Affaires International', credits: 5, hours_cm: 45, hours_td: 20, hours_tp: 0 },
    { code: 'DRT404', name: 'Arbitrage et Médiation', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 0 },
    { code: 'DRT405', name: 'Droit Numérique', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 0 },
    { code: 'DRT406', name: 'Propriété Intellectuelle', credits: 4, hours_cm: 40, hours_td: 15, hours_tp: 0 },
    { code: 'DRT407', name: 'Droit Bancaire', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT408', name: 'Droit de la Concurrence', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 0 },
    { code: 'DRT409', name: 'Contentieux Administratif', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT410', name: 'Droit Humanitaire', credits: 4, hours_cm: 40, hours_td: 15, hours_tp: 0 },
    { code: 'DRT411', name: 'Criminologie', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'DRT412', name: 'Droit Communautaire Africain', credits: 4, hours_cm: 40, hours_td: 15, hours_tp: 0 },
  ],
  ECO: [
    { code: 'ECO101', name: 'Microéconomie I', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO102', name: 'Macroéconomie I', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO103', name: 'Mathématiques pour Économistes', credits: 5, hours_cm: 40, hours_td: 30, hours_tp: 0 },
    { code: 'ECO104', name: 'Statistiques Descriptives', credits: 4, hours_cm: 35, hours_td: 25, hours_tp: 10 },
    { code: 'ECO105', name: 'Comptabilité Générale', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 10 },
    { code: 'ECO106', name: 'Introduction à la Gestion', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO201', name: 'Microéconomie II', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO202', name: 'Macroéconomie II', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO203', name: 'Économétrie I', credits: 5, hours_cm: 40, hours_td: 20, hours_tp: 15 },
    { code: 'ECO204', name: 'Comptabilité Analytique', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 10 },
    { code: 'ECO205', name: 'Marketing', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO206', name: 'Économie Monétaire', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO301', name: 'Finance d\'Entreprise', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 10 },
    { code: 'ECO302', name: 'Économétrie II', credits: 5, hours_cm: 40, hours_td: 20, hours_tp: 15 },
    { code: 'ECO303', name: 'Gestion des Ressources Humaines', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO304', name: 'Économie Internationale', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO305', name: 'Économie du Développement', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO306', name: 'Finances Publiques', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO401', name: 'Gestion de Portefeuille', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 15 },
    { code: 'ECO402', name: 'Analyse Financière', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 10 },
    { code: 'ECO403', name: 'Management Stratégique', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO404', name: 'Économie de l\'Environnement', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO405', name: 'Politique Économique', credits: 5, hours_cm: 45, hours_td: 25, hours_tp: 0 },
    { code: 'ECO406', name: 'Marchés Financiers', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 10 },
    { code: 'ECO407', name: 'Entrepreneuriat', credits: 4, hours_cm: 30, hours_td: 20, hours_tp: 20 },
    { code: 'ECO408', name: 'Audit et Contrôle de Gestion', credits: 5, hours_cm: 40, hours_td: 25, hours_tp: 10 },
    { code: 'ECO409', name: 'Commerce International', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO410', name: 'Économie Numérique', credits: 4, hours_cm: 35, hours_td: 20, hours_tp: 15 },
    { code: 'ECO411', name: 'Banque et Assurance', credits: 4, hours_cm: 40, hours_td: 20, hours_tp: 0 },
    { code: 'ECO412', name: 'Gestion de Projet', credits: 4, hours_cm: 30, hours_td: 20, hours_tp: 20 },
  ],
};

// Départements par faculté
const DEPARTMENTS = {
  SCI: [
    { code: 'MATH', name: 'Département de Mathématiques' },
    { code: 'PHYS', name: 'Département de Physique' },
    { code: 'CHIM', name: 'Département de Chimie' },
    { code: 'BIO', name: 'Département de Biologie' },
    { code: 'INFO', name: 'Département d\'Informatique' },
  ],
  DRT: [
    { code: 'DRPUB', name: 'Département de Droit Public' },
    { code: 'DRPRV', name: 'Département de Droit Privé' },
    { code: 'DRPEN', name: 'Département de Droit Pénal' },
    { code: 'DRECO', name: 'Département de Droit Économique' },
    { code: 'DRINT', name: 'Département de Droit International' },
  ],
  ECO: [
    { code: 'ECON', name: 'Département d\'Économie' },
    { code: 'GEST', name: 'Département de Gestion' },
    { code: 'FIN', name: 'Département de Finance' },
    { code: 'MARK', name: 'Département de Marketing' },
    { code: 'MGMT', name: 'Département de Management' },
  ],
};

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage du seed NEXUS UNIKIN...\n');
    
    await client.query('BEGIN');
    
    // Nettoyer les données existantes (sauf admin)
    console.log('🧹 Nettoyage des données existantes...');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM attendance');
    await client.query('DELETE FROM grades');
    await client.query('DELETE FROM enrollments');
    await client.query('DELETE FROM course_schedules');
    await client.query('DELETE FROM deliberation_results CASCADE');
    await client.query('DELETE FROM deliberation_sessions CASCADE');
    await client.query('DELETE FROM deliberations CASCADE');
    await client.query('DELETE FROM courses CASCADE');
    await client.query('DELETE FROM students CASCADE');
    await client.query('DELETE FROM teachers CASCADE');
    await client.query('DELETE FROM promotions CASCADE');
    await client.query('DELETE FROM departments CASCADE');
    await client.query('DELETE FROM faculties CASCADE');
    await client.query('DELETE FROM users WHERE role NOT IN (\'ADMIN\', \'SUPER_ADMIN\')');
    
    // 1. Année académique
    console.log('📅 Configuration de l\'année académique...');
    let academicYearId;
    const yearResult = await client.query(
      `INSERT INTO academic_years (name, start_date, end_date, is_current) 
       VALUES ('2025-2026', '2025-10-01', '2026-07-31', true)
       ON CONFLICT (name) DO UPDATE SET is_current = true
       RETURNING id`
    );
    academicYearId = yearResult.rows[0].id;
    
    // 2. Créer les 3 facultés
    console.log('🏛️ Création des facultés...');
    const faculties = [
      { code: 'SCI', name: 'Faculté des Sciences' },
      { code: 'DRT', name: 'Faculté de Droit' },
      { code: 'ECO', name: 'Faculté des Sciences Économiques et de Gestion' },
    ];
    
    const facultyIds = {};
    for (const fac of faculties) {
      const result = await client.query(
        `INSERT INTO faculties (code, name, description, is_active) 
         VALUES ($1, $2, $3, true) RETURNING id`,
        [fac.code, fac.name, `${fac.name} de l'Université de Kinshasa`]
      );
      facultyIds[fac.code] = result.rows[0].id;
    }
    
    // 3. Créer les départements
    console.log('🏢 Création des départements...');
    const departmentIds = {};
    for (const [facCode, deps] of Object.entries(DEPARTMENTS)) {
      for (const dep of deps) {
        const result = await client.query(
          `INSERT INTO departments (code, name, faculty_id, is_active) 
           VALUES ($1, $2, $3, true) RETURNING id`,
          [dep.code, dep.name, facultyIds[facCode]]
        );
        departmentIds[dep.code] = result.rows[0].id;
      }
    }
    
    // 4. Créer les promotions (L1, L2, L3 pour chaque département)
    console.log('📚 Création des promotions...');
    const promotionIds = {};
    const levels = ['L1', 'L2', 'L3'];
    for (const [facCode, deps] of Object.entries(DEPARTMENTS)) {
      for (const dep of deps) {
        for (const level of levels) {
          const promoCode = `${dep.code}-${level}`;
          const result = await client.query(
            `INSERT INTO promotions (code, name, level, department_id, academic_year_id, is_active)
             VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
            [promoCode, `${level} ${dep.name}`, level, departmentIds[dep.code], academicYearId]
          );
          promotionIds[promoCode] = result.rows[0].id;
        }
      }
    }
    
    // 5. Créer 90 enseignants (30 par faculté)
    console.log('👨‍🏫 Création des 90 enseignants...');
    const teacherIds = {};
    const grades = ['PROFESSEUR_ORDINAIRE', 'PROFESSEUR', 'PROFESSEUR_ASSOCIE', 'CHEF_TRAVAUX', 'ASSISTANT'];
    let teacherIndex = 0;
    
    for (const [facCode, courses] of Object.entries(COURSES_BY_FACULTY)) {
      const deps = DEPARTMENTS[facCode];
      for (let i = 0; i < 30; i++) {
        const firstName = FIRST_NAMES[(teacherIndex * 7 + i) % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(teacherIndex * 11 + i) % LAST_NAMES.length];
        const matricule = generateTeacherMatricule(teacherIndex + 1);
        const email = `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase()}${teacherIndex + 1}@unikin.ac.cd`;
        const hashedPwd = await hashPassword('Teacher@2026');
        const grade = grades[i % grades.length];
        const depIndex = i % deps.length;
        
        // Créer l'utilisateur
        const userResult = await client.query(
          `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
           VALUES ($1, $2, $3, $4, $5, 'TEACHER', true) RETURNING id`,
          [email, hashedPwd, firstName, lastName, `+243${810000000 + teacherIndex}`]
        );
        
        // Créer l'enseignant
        const teacherResult = await client.query(
          `INSERT INTO teachers (user_id, matricule, grade, specialization, department_id, hire_date)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [userResult.rows[0].id, matricule, grade, courses[i % courses.length].name, departmentIds[deps[depIndex].code], '2020-10-01']
        );
        
        teacherIds[`${facCode}-${i}`] = teacherResult.rows[0].id;
        teacherIndex++;
      }
    }
    console.log(`   ✅ ${teacherIndex} enseignants créés`);
    
    // 6. Créer 90 cours (30 par faculté)
    console.log('📖 Création des 90 cours...');
    const courseIds = {};
    let courseIndex = 0;
    
    for (const [facCode, courses] of Object.entries(COURSES_BY_FACULTY)) {
      const deps = DEPARTMENTS[facCode];
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const depIndex = i % deps.length;
        const level = levels[Math.floor(i / 10) % 3];
        const promoCode = `${deps[depIndex].code}-${level}`;
        const semester = (i % 2) + 1;
        
        const result = await client.query(
          `INSERT INTO courses (code, name, description, credits, hours_cm, hours_td, hours_tp, promotion_id, teacher_id, semester, course_type, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'OBLIGATOIRE', true) RETURNING id`,
          [course.code, course.name, `Cours de ${course.name}`, course.credits, course.hours_cm, course.hours_td, course.hours_tp, 
           promotionIds[promoCode], teacherIds[`${facCode}-${i}`], semester]
        );
        courseIds[course.code] = result.rows[0].id;
        courseIndex++;
      }
    }
    console.log(`   ✅ ${courseIndex} cours créés`);
    
    // 7. Créer les horaires de cours
    console.log('🕐 Création des horaires de cours...');
    const days = [1, 2, 3, 4, 5]; // Lundi à Vendredi
    const timeSlots = [
      { start: '08:00', end: '10:00' },
      { start: '10:15', end: '12:15' },
      { start: '14:00', end: '16:00' },
      { start: '16:15', end: '18:15' },
    ];
    const rooms = ['A101', 'A102', 'A103', 'B201', 'B202', 'B203', 'C301', 'C302', 'AMPHI1', 'AMPHI2', 'LABO1', 'LABO2'];
    
    let scheduleIndex = 0;
    for (const [code, courseId] of Object.entries(courseIds)) {
      const day = days[scheduleIndex % days.length];
      const slot = timeSlots[scheduleIndex % timeSlots.length];
      const room = rooms[scheduleIndex % rooms.length];
      
      await client.query(
        `INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room, schedule_type)
         VALUES ($1, $2, $3, $4, $5, 'CM')`,
        [courseId, day, slot.start, slot.end, room]
      );
      scheduleIndex++;
    }
    console.log(`   ✅ ${scheduleIndex} horaires créés`);
    
    // 8. Créer 20 étudiants (répartis dans les 3 facultés)
    console.log('👨‍🎓 Création des 20 étudiants...');
    const studentIds = [];
    const studentsPerFaculty = { SCI: 7, DRT: 7, ECO: 6 };
    let studentIndex = 0;
    
    for (const [facCode, count] of Object.entries(studentsPerFaculty)) {
      const deps = DEPARTMENTS[facCode];
      for (let i = 0; i < count; i++) {
        const firstName = FIRST_NAMES[(studentIndex * 3 + i) % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(studentIndex * 5 + i) % LAST_NAMES.length];
        const matricule = generateStudentMatricule(studentIndex + 1, facCode);
        const email = `${matricule}@unikin.ac.cd`;
        const hashedPwd = await hashPassword('Student@2026');
        const level = levels[i % levels.length];
        const depIndex = i % deps.length;
        const promoCode = `${deps[depIndex].code}-${level}`;
        const gender = i % 2 === 0 ? 'M' : 'F';
        
        // Créer l'utilisateur
        const userResult = await client.query(
          `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
           VALUES ($1, $2, $3, $4, $5, 'STUDENT', true) RETURNING id`,
          [email, hashedPwd, firstName, lastName, `+243${990000000 + studentIndex}`]
        );
        
        // Créer l'étudiant
        const studentResult = await client.query(
          `INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, status, payment_status, birth_date, birth_place, gender, nationality)
           VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8, 'Congolaise') RETURNING id`,
          [userResult.rows[0].id, matricule, promotionIds[promoCode], '2025-10-01', 
           i % 3 === 0 ? 'PAID' : (i % 3 === 1 ? 'PARTIAL' : 'UNPAID'),
           `${2000 + (i % 6)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
           ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Kananga', 'Goma'][i % 6],
           gender]
        );
        
        studentIds.push({ id: studentResult.rows[0].id, facCode, level, depCode: deps[depIndex].code, matricule });
        studentIndex++;
      }
    }
    console.log(`   ✅ ${studentIndex} étudiants créés`);
    
    // 9. Inscrire les étudiants aux cours
    console.log('📝 Inscription des étudiants aux cours...');
    let enrollmentCount = 0;
    for (const student of studentIds) {
      // Trouver les cours correspondant à la promotion de l'étudiant
      const promoCode = `${student.depCode}-${student.level}`;
      const promoId = promotionIds[promoCode];
      
      const coursesResult = await client.query(
        `SELECT id FROM courses WHERE promotion_id = $1`,
        [promoId]
      );
      
      for (const course of coursesResult.rows) {
        await client.query(
          `INSERT INTO enrollments (student_id, course_id, academic_year_id, status)
           VALUES ($1, $2, $3, 'ENROLLED')
           ON CONFLICT DO NOTHING`,
          [student.id, course.id, academicYearId]
        );
        enrollmentCount++;
      }
    }
    console.log(`   ✅ ${enrollmentCount} inscriptions créées`);
    
    // 10. Créer des notes (partiellement remplies)
    console.log('📊 Création des notes...');
    let gradeCount = 0;
    for (const student of studentIds) {
      const promoCode = `${student.depCode}-${student.level}`;
      const promoId = promotionIds[promoCode];
      
      const enrollmentsResult = await client.query(
        `SELECT e.id, e.course_id FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = $1 AND c.promotion_id = $2`,
        [student.id, promoId]
      );
      
      for (const enrollment of enrollmentsResult.rows) {
        // 70% des cours ont des notes
        if (Math.random() < 0.7) {
          const tp = Math.floor(Math.random() * 8) + 10; // 10-17
          const td = Math.floor(Math.random() * 8) + 10; // 10-17
          const exam = Math.floor(Math.random() * 10) + 8; // 8-17
          const final = ((tp * 0.2) + (td * 0.2) + (exam * 0.6)).toFixed(2);
          const letter = final >= 16 ? 'A' : final >= 14 ? 'B' : final >= 12 ? 'C' : final >= 10 ? 'D' : 'E';
          
          await client.query(
            `INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, td_score, exam_score, final_score, grade_letter, is_validated)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT DO NOTHING`,
            [student.id, enrollment.course_id, academicYearId, tp, td, exam, final, letter, Math.random() < 0.5]
          );
          gradeCount++;
        }
      }
    }
    console.log(`   ✅ ${gradeCount} notes créées`);
    
    // 11. Créer les présences
    console.log('✅ Création des présences...');
    let attendanceCount = 0;
    const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    const attendanceDates = [];
    // Générer des dates de cours (les 2 derniers mois)
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Pas le weekend
        attendanceDates.push(date.toISOString().split('T')[0]);
      }
    }
    
    for (const student of studentIds) {
      const promoCode = `${student.depCode}-${student.level}`;
      const promoId = promotionIds[promoCode];
      
      const coursesResult = await client.query(
        `SELECT id FROM courses WHERE promotion_id = $1`,
        [promoId]
      );
      
      for (const course of coursesResult.rows) {
        // 3-5 séances de présence par cours
        const numSessions = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numSessions && i < attendanceDates.length; i++) {
          const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];
          await client.query(
            `INSERT INTO attendance (student_id, course_id, attendance_date, status)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [student.id, course.id, attendanceDates[i], status]
          );
          attendanceCount++;
        }
      }
    }
    console.log(`   ✅ ${attendanceCount} présences enregistrées`);
    
    // 12. Créer des paiements
    console.log('💰 Création des paiements...');
    let paymentCount = 0;
    const paymentTypes = ['INSCRIPTION', 'FRAIS_ACADEMIQUES', 'FRAIS_MINERVAL'];
    
    for (const student of studentIds) {
      // 1-3 paiements par étudiant
      const numPayments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPayments; i++) {
        const amount = [50, 100, 150, 200, 250, 300][Math.floor(Math.random() * 6)];
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 60));
        
        await client.query(
          `INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_date, payment_method, status, reference)
           VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', $7)`,
          [student.id, academicYearId, amount, paymentTypes[i % paymentTypes.length], paymentDate, 
           ['CASH', 'BANK', 'MOBILE_MONEY'][i % 3], `PAY-${student.matricule}-${Date.now()}`]
        );
        paymentCount++;
      }
    }
    console.log(`   ✅ ${paymentCount} paiements créés`);
    
    // 13. Créer des notifications
    console.log('🔔 Création des notifications...');
    const notificationMessages = [
      { title: 'Bienvenue sur NEXUS UNIKIN', message: 'Bienvenue sur la plateforme de gestion académique de l\'Université de Kinshasa.', type: 'INFO' },
      { title: 'Rappel: Paiement des frais', message: 'N\'oubliez pas de régulariser votre situation financière avant la date limite.', type: 'WARNING' },
      { title: 'Nouveau cours disponible', message: 'De nouveaux supports de cours ont été ajoutés. Consultez votre espace cours.', type: 'INFO' },
      { title: 'Session d\'examen', message: 'La session d\'examen du premier semestre débute dans 2 semaines.', type: 'WARNING' },
      { title: 'Notes disponibles', message: 'Les notes du contrôle continu sont maintenant disponibles.', type: 'SUCCESS' },
    ];
    
    // Récupérer tous les utilisateurs
    const usersResult = await client.query(`SELECT id FROM users`);
    for (const user of usersResult.rows) {
      const notif = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, notif.title, notif.message, notif.type, Math.random() < 0.3]
      );
    }
    console.log(`   ✅ ${usersResult.rows.length} notifications créées`);
    
    await client.query('COMMIT');
    
    console.log('\n✨ Seed terminé avec succès!\n');
    console.log('📊 Résumé:');
    console.log('   - 3 facultés: Sciences, Droit, Économie');
    console.log('   - 15 départements');
    console.log('   - 45 promotions (L1, L2, L3)');
    console.log(`   - ${teacherIndex} enseignants (professeurs titulaires)`);
    console.log(`   - ${courseIndex} cours avec notes et crédits`);
    console.log(`   - ${studentIndex} étudiants`);
    console.log(`   - ${enrollmentCount} inscriptions`);
    console.log(`   - ${gradeCount} notes`);
    console.log(`   - ${attendanceCount} présences`);
    console.log(`   - ${paymentCount} paiements`);
    
    console.log('\n🔑 Identifiants de connexion:');
    console.log('   Admin: admin@unikin.ac.cd / Admin@2026');
    console.log('   Enseignant: jeanpierre.kabongo@unikin.ac.cd / Teacher@2026');
    console.log('   Étudiant: 2122340001@unikin.ac.cd / Student@2026');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);

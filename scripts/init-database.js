/**
 * ============================================================
 * NEXUS UNIKIN - Script d'initialisation de la base de données
 * ============================================================
 * 
 * Ce script:
 * 1. Crée la base de données nexus_unikin
 * 2. Crée l'utilisateur nexus_admin
 * 3. Applique le schéma complet
 * 4. Insère les données initiales (admin, année académique)
 * 
 * Exécuter avec: node scripts/init-database.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configuration
const DB_NAME = 'nexus_unikin';
const DB_USER = 'nexus_admin';
const DB_PASSWORD = 'NexusUnikin2026!';

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Demander une entrée utilisateur
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     NEXUS UNIKIN - Initialisation Base de Données          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');

  // Demander le mot de passe PostgreSQL admin
  const pgPassword = await prompt(`${colors.yellow}Entrez le mot de passe de l'utilisateur postgres: ${colors.reset}`);
  
  if (!pgPassword) {
    logError('Mot de passe requis pour continuer.');
    process.exit(1);
  }

  // Connexion PostgreSQL en tant qu'admin
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: pgPassword,
    database: 'postgres'
  });

  try {
    logStep('1/6', 'Connexion à PostgreSQL...');
    await adminClient.connect();
    logSuccess('Connecté à PostgreSQL');

    // Étape 2: Supprimer la base existante si elle existe
    logStep('2/6', `Vérification/suppression de la base ${DB_NAME}...`);
    try {
      // Terminer les connexions existantes
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${DB_NAME}'
        AND pid <> pg_backend_pid()
      `);
      await adminClient.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      logSuccess(`Base de données ${DB_NAME} supprimée (si existante)`);
    } catch (err) {
      logWarning(`Avertissement: ${err.message}`);
    }

    // Étape 3: Supprimer l'utilisateur existant
    logStep('3/6', `Création de l'utilisateur ${DB_USER}...`);
    try {
      await adminClient.query(`DROP USER IF EXISTS ${DB_USER}`);
    } catch (err) {
      // Ignorer
    }
    
    // Créer le nouvel utilisateur
    await adminClient.query(`CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'`);
    await adminClient.query(`ALTER USER ${DB_USER} CREATEDB`);
    logSuccess(`Utilisateur ${DB_USER} créé avec succès`);

    // Étape 4: Créer la base de données
    logStep('4/6', `Création de la base de données ${DB_NAME}...`);
    await adminClient.query(`CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}`);
    logSuccess(`Base de données ${DB_NAME} créée`);

    await adminClient.end();

    // Connexion à la nouvelle base
    const nexusClient = new Client({
      host: 'localhost',
      port: 5432,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    await nexusClient.connect();
    logSuccess(`Connecté à ${DB_NAME}`);

    // Étape 5: Appliquer le schéma
    logStep('5/6', 'Application du schéma de base de données...');
    
    // Lire et exécuter le fichier SQL principal
    const schemaPath = path.join(__dirname, '..', 'database', 'schema-init.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await nexusClient.query(schema);
      logSuccess('Schéma appliqué avec succès');
    } else {
      logWarning('Fichier schema-init.sql non trouvé, application du schéma intégré...');
      // Appliquer le schéma de base intégré
      await applyBaseSchema(nexusClient);
      logSuccess('Schéma de base appliqué');
    }

    // Étape 6: Insérer les données initiales
    logStep('6/6', 'Insertion des données initiales...');
    await insertInitialData(nexusClient);
    logSuccess('Données initiales insérées');

    await nexusClient.end();

    // Résumé final
    console.log('\n');
    log('╔════════════════════════════════════════════════════════════╗', 'green');
    log('║           INITIALISATION TERMINÉE AVEC SUCCÈS              ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'green');
    console.log('\n');
    
    log('📋 Informations de connexion:', 'bold');
    console.log(`   Base de données: ${colors.cyan}${DB_NAME}${colors.reset}`);
    console.log(`   Utilisateur:     ${colors.cyan}${DB_USER}${colors.reset}`);
    console.log(`   Mot de passe:    ${colors.cyan}${DB_PASSWORD}${colors.reset}`);
    console.log(`   Hôte:            ${colors.cyan}localhost:5432${colors.reset}`);
    console.log('\n');
    
    log('👤 Compte administrateur:', 'bold');
    console.log(`   Email:           ${colors.cyan}admin@unikin.ac.cd${colors.reset}`);
    console.log(`   Mot de passe:    ${colors.cyan}Admin@Nexus2026${colors.reset}`);
    console.log('\n');

    log('🚀 Vous pouvez maintenant lancer l\'application avec: npm run dev', 'yellow');
    console.log('\n');

  } catch (error) {
    logError(`Erreur: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Appliquer le schéma de base
async function applyBaseSchema(client) {
  const schema = `
    -- Fonction pour updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Table des Années Académiques
    CREATE TABLE IF NOT EXISTS academic_years (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Utilisateurs
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        photo_url TEXT,
        role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'EMPLOYEE')),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Facultés
    CREATE TABLE IF NOT EXISTS faculties (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        dean_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Départements
    CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
        head_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Promotions
    CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        level VARCHAR(10) NOT NULL CHECK (level IN ('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3')),
        department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(code, academic_year_id)
    );

    -- Table des Administrateurs
    CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        admin_type VARCHAR(20) NOT NULL CHECK (admin_type IN ('SUPER_ADMIN', 'FACULTY_ADMIN', 'DEPARTMENT_ADMIN')),
        faculty_id INTEGER REFERENCES faculties(id),
        department_id INTEGER REFERENCES departments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Enseignants
    CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        matricule VARCHAR(50) NOT NULL UNIQUE,
        grade VARCHAR(50) NOT NULL CHECK (grade IN ('ASSISTANT', 'CHEF_TRAVAUX', 'PROFESSEUR_ASSOCIE', 'PROFESSEUR', 'PROFESSEUR_ORDINAIRE')),
        specialization VARCHAR(255),
        department_id INTEGER REFERENCES departments(id),
        hire_date DATE,
        is_permanent BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Étudiants
    CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        matricule VARCHAR(50) NOT NULL UNIQUE,
        promotion_id INTEGER NOT NULL REFERENCES promotions(id),
        enrollment_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED')),
        payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('PAID', 'PARTIAL', 'UNPAID', 'BLOCKED')),
        birth_date DATE,
        birth_place VARCHAR(255),
        nationality VARCHAR(100) DEFAULT 'Congolaise',
        gender VARCHAR(10) CHECK (gender IN ('M', 'F')),
        parent_name VARCHAR(255),
        parent_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Employés
    CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        matricule VARCHAR(50) NOT NULL UNIQUE,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        service VARCHAR(255),
        hire_date DATE,
        contract_type VARCHAR(20) CHECK (contract_type IN ('PERMANENT', 'CONTRACT', 'TEMPORARY')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Cours
    CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        credits INTEGER NOT NULL DEFAULT 3,
        hours_cm INTEGER DEFAULT 0,
        hours_td INTEGER DEFAULT 0,
        hours_tp INTEGER DEFAULT 0,
        promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES teachers(id),
        semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
        course_type VARCHAR(20) DEFAULT 'OBLIGATOIRE' CHECK (course_type IN ('OBLIGATOIRE', 'OPTIONNEL', 'LIBRE')),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(code, promotion_id)
    );

    -- Table des Notes
    CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
        tp_score DECIMAL(5,2),
        td_score DECIMAL(5,2),
        exam_score DECIMAL(5,2),
        final_score DECIMAL(5,2),
        grade_letter VARCHAR(2),
        is_validated BOOLEAN DEFAULT FALSE,
        validated_by INTEGER REFERENCES users(id),
        validated_at TIMESTAMP,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id, academic_year_id)
    );

    -- Table des Paiements
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
        amount DECIMAL(15,2) NOT NULL,
        payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('INSCRIPTION', 'FRAIS_ACADEMIQUES', 'FRAIS_MINERVAL', 'AUTRES')),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'BANK', 'MOBILE_MONEY', 'CHECK')),
        reference VARCHAR(100),
        receipt_number VARCHAR(100),
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
        recorded_by INTEGER REFERENCES users(id),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des Notifications
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'ERROR')),
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Index
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_students_matricule ON students(matricule);
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
    CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);

    -- Triggers
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_faculties_updated_at BEFORE UPDATE ON faculties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;
  
  await client.query(schema);
}

// Insérer les données initiales
async function insertInitialData(client) {
  // Hash du mot de passe admin
  const hashedPassword = await bcrypt.hash('Admin@Nexus2026', 10);
  
  // Année académique courante
  await client.query(`
    INSERT INTO academic_years (name, start_date, end_date, is_current)
    VALUES ('2025-2026', '2025-10-01', '2026-07-31', true)
    ON CONFLICT (name) DO NOTHING
  `);

  // Utilisateur admin
  await client.query(`
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES ('admin@unikin.ac.cd', $1, 'Administrateur', 'NEXUS', 'SUPER_ADMIN', true)
    ON CONFLICT (email) DO UPDATE SET password = $1
  `, [hashedPassword]);

  // Admin record
  const userResult = await client.query(`SELECT id FROM users WHERE email = 'admin@unikin.ac.cd'`);
  if (userResult.rows.length > 0) {
    await client.query(`
      INSERT INTO admins (user_id, admin_type)
      VALUES ($1, 'SUPER_ADMIN')
      ON CONFLICT (user_id) DO NOTHING
    `, [userResult.rows[0].id]);
  }

  // Faculté exemple
  await client.query(`
    INSERT INTO faculties (code, name, description)
    VALUES ('SCI', 'Faculté des Sciences', 'Faculté des Sciences de l''Université de Kinshasa')
    ON CONFLICT (code) DO NOTHING
  `);
}

// Lancer le script
main();

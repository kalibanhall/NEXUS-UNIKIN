-- ============================================
-- NEXUS UNIKIN - Schéma de Production
-- Base de données PostgreSQL
-- Sans données hardcodées
-- ============================================

-- Supprimer les tables existantes (ordre inverse des dépendances)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS course_schedules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS grade_modifications CASCADE;
DROP TABLE IF EXISTS grade_history CASCADE;

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table des Années Académiques
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Utilisateurs (centralisée)
CREATE TABLE users (
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
    must_change_password BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Facultés
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dean_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Départements
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    head_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Promotions
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3')),
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    max_students INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, academic_year_id)
);

-- Table des Administrateurs
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admin_type VARCHAR(20) NOT NULL CHECK (admin_type IN ('SUPER_ADMIN', 'FACULTY_ADMIN', 'DEPARTMENT_ADMIN')),
    faculty_id INTEGER REFERENCES faculties(id),
    department_id INTEGER REFERENCES departments(id),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Enseignants
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    grade VARCHAR(50) NOT NULL CHECK (grade IN ('ASSISTANT', 'CHEF_TRAVAUX', 'PROFESSEUR_ASSOCIE', 'PROFESSEUR', 'PROFESSEUR_ORDINAIRE')),
    specialization VARCHAR(255),
    department_id INTEGER REFERENCES departments(id),
    hire_date DATE,
    is_permanent BOOLEAN DEFAULT TRUE,
    can_encode_grades BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Étudiants
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED', 'TRANSFERRED')),
    payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('PAID', 'PARTIAL', 'UNPAID', 'EXEMPT')),
    birth_date DATE,
    birth_place VARCHAR(255),
    nationality VARCHAR(100) DEFAULT 'Congolaise',
    gender VARCHAR(10) CHECK (gender IN ('M', 'F')),
    blood_type VARCHAR(5),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Employés
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    service VARCHAR(255),
    hire_date DATE,
    contract_type VARCHAR(20) CHECK (contract_type IN ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN')),
    supervisor_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES ACADÉMIQUES
-- ============================================

-- Table des Cours
CREATE TABLE courses (
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
    coefficient DECIMAL(3,1) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, promotion_id)
);

-- Table des Horaires de Cours
CREATE TABLE course_schedules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    building VARCHAR(100),
    schedule_type VARCHAR(10) DEFAULT 'CM' CHECK (schedule_type IN ('CM', 'TD', 'TP', 'EXAM')),
    academic_year_id INTEGER REFERENCES academic_years(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Inscriptions aux Cours
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'DROPPED', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, academic_year_id)
);

-- Table des Notes (améliorée pour les enseignants)
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    -- Notes détaillées
    interro_1 DECIMAL(5,2),
    interro_2 DECIMAL(5,2),
    interro_3 DECIMAL(5,2),
    tp_score DECIMAL(5,2),
    td_score DECIMAL(5,2),
    participation DECIMAL(5,2),
    exam_score DECIMAL(5,2),
    rattrapage_score DECIMAL(5,2),
    -- Calculs
    continuous_assessment DECIMAL(5,2), -- Moyenne continue (40%)
    final_score DECIMAL(5,2), -- Note finale
    grade_letter VARCHAR(2),
    grade_points DECIMAL(3,2), -- Pour GPA
    -- Validation
    is_submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP,
    submitted_by INTEGER REFERENCES users(id),
    is_validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP,
    validated_by INTEGER REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    -- Meta
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, academic_year_id)
);

-- Historique des modifications de notes
CREATE TABLE grade_history (
    id SERIAL PRIMARY KEY,
    grade_id INTEGER NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    old_value VARCHAR(50),
    new_value VARCHAR(50),
    modified_by INTEGER REFERENCES users(id),
    modification_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demandes de modification de notes
CREATE TABLE grade_modifications (
    id SERIAL PRIMARY KEY,
    grade_id INTEGER NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL,
    current_value DECIMAL(5,2),
    requested_value DECIMAL(5,2),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Présences
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES course_schedules(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    check_in_time TIME,
    remarks TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES FINANCIÈRES
-- ============================================

-- Table des Paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('INSCRIPTION', 'FRAIS_ACADEMIQUES', 'MINERVAL', 'BIBLIOTHEQUE', 'LABORATOIRE', 'AUTRES')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'BANK', 'MOBILE_MONEY', 'CHECK', 'VIREMENT')),
    reference VARCHAR(100),
    receipt_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
    recorded_by INTEGER REFERENCES users(id),
    validated_by INTEGER REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES NOTIFICATIONS & MESSAGES
-- ============================================

-- Table des Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'GRADE', 'PAYMENT', 'ATTENDANCE')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    link VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEX POUR PERFORMANCES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_students_matricule ON students(matricule);
CREATE INDEX idx_students_promotion ON students(promotion_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_teachers_matricule ON teachers(matricule);
CREATE INDEX idx_teachers_department ON teachers(department_id);
CREATE INDEX idx_courses_promotion ON courses(promotion_id);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_validated ON grades(is_validated);
CREATE INDEX idx_grades_published ON grades(is_published);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faculties_updated_at BEFORE UPDATE ON faculties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTION DE CALCUL DES NOTES
-- ============================================

CREATE OR REPLACE FUNCTION calculate_final_grade()
RETURNS TRIGGER AS $$
DECLARE
    avg_interro DECIMAL(5,2);
    continuous DECIMAL(5,2);
    final DECIMAL(5,2);
BEGIN
    -- Moyenne des interrogations
    avg_interro := COALESCE(
        (COALESCE(NEW.interro_1, 0) + COALESCE(NEW.interro_2, 0) + COALESCE(NEW.interro_3, 0)) / 
        NULLIF((CASE WHEN NEW.interro_1 IS NOT NULL THEN 1 ELSE 0 END + 
                CASE WHEN NEW.interro_2 IS NOT NULL THEN 1 ELSE 0 END + 
                CASE WHEN NEW.interro_3 IS NOT NULL THEN 1 ELSE 0 END), 0),
        0
    );
    
    -- Moyenne continue (40%): interros + TP + TD + participation
    continuous := (avg_interro * 0.4 + COALESCE(NEW.tp_score, 0) * 0.3 + 
                   COALESCE(NEW.td_score, 0) * 0.2 + COALESCE(NEW.participation, 0) * 0.1);
    NEW.continuous_assessment := ROUND(continuous, 2);
    
    -- Note finale: continue (40%) + examen (60%)
    IF NEW.rattrapage_score IS NOT NULL AND NEW.rattrapage_score > COALESCE(NEW.exam_score, 0) THEN
        final := continuous * 0.4 + NEW.rattrapage_score * 0.6;
    ELSE
        final := continuous * 0.4 + COALESCE(NEW.exam_score, 0) * 0.6;
    END IF;
    NEW.final_score := ROUND(final, 2);
    
    -- Lettre de note
    NEW.grade_letter := CASE
        WHEN NEW.final_score >= 90 THEN 'A+'
        WHEN NEW.final_score >= 85 THEN 'A'
        WHEN NEW.final_score >= 80 THEN 'A-'
        WHEN NEW.final_score >= 75 THEN 'B+'
        WHEN NEW.final_score >= 70 THEN 'B'
        WHEN NEW.final_score >= 65 THEN 'B-'
        WHEN NEW.final_score >= 60 THEN 'C+'
        WHEN NEW.final_score >= 55 THEN 'C'
        WHEN NEW.final_score >= 50 THEN 'C-'
        WHEN NEW.final_score >= 45 THEN 'D'
        ELSE 'E'
    END;
    
    -- Points GPA
    NEW.grade_points := CASE
        WHEN NEW.final_score >= 90 THEN 4.0
        WHEN NEW.final_score >= 85 THEN 3.7
        WHEN NEW.final_score >= 80 THEN 3.3
        WHEN NEW.final_score >= 75 THEN 3.0
        WHEN NEW.final_score >= 70 THEN 2.7
        WHEN NEW.final_score >= 65 THEN 2.3
        WHEN NEW.final_score >= 60 THEN 2.0
        WHEN NEW.final_score >= 55 THEN 1.7
        WHEN NEW.final_score >= 50 THEN 1.0
        ELSE 0.0
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grade_trigger
BEFORE INSERT OR UPDATE ON grades
FOR EACH ROW EXECUTE FUNCTION calculate_final_grade();

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE users IS 'Table centrale des utilisateurs NEXUS UNIKIN';
COMMENT ON TABLE grades IS 'Notes des étudiants avec calcul automatique';
COMMENT ON COLUMN grades.continuous_assessment IS 'Moyenne continue calculée automatiquement (40%)';
COMMENT ON COLUMN grades.final_score IS 'Note finale calculée: continue (40%) + examen (60%)';
COMMENT ON COLUMN teachers.can_encode_grades IS 'Permission d''encoder les notes directement';

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

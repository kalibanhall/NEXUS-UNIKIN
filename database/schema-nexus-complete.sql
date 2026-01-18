-- ============================================
-- NEXUS UNIKIN - Schéma de Base de Données COMPLET
-- Version 2.0 - Toutes les fonctionnalités
-- Université de Kinshasa
-- ============================================

-- ============================================
-- PARTIE 1: RÔLES HIÉRARCHIQUES
-- ============================================

-- Types de rôles hiérarchiques
CREATE TYPE hierarchical_role AS ENUM (
    -- Niveau Central
    'RECTEUR',
    'SGA',           -- Secrétaire Général Académique
    'SGAD',          -- Secrétaire Général Administratif
    'SGR',           -- Secrétaire Général à la Recherche (NOUVEAU)
    'AB',            -- Administrateur du Budget
    
    -- Niveau Faculté
    'DOYEN',
    'VICE_DOYEN_ENSEIGNEMENT',
    'VICE_DOYEN_RECHERCHE',
    'SECRETAIRE_ACADEMIQUE',
    
    -- Niveau Département
    'CHEF_DEPARTEMENT',
    'PRESIDENT_JURY',
    'SECRETAIRE_JURY',
    'MEMBRE_JURY',
    
    -- Niveau Enseignement
    'PROFESSEUR_ORDINAIRE',
    'PROFESSEUR',
    'PROFESSEUR_ASSOCIE',
    'CHEF_TRAVAUX',
    'ASSISTANT',
    
    -- Niveau Étudiant
    'DELEGUE_PROMOTION',
    'ETUDIANT',
    
    -- Administration
    'EMPLOYE_SCOLARITE',
    'EMPLOYE_CAISSE',
    'EMPLOYE_BIBLIOTHEQUE',
    'SUPER_ADMIN'
);

-- Type de portée (scope) pour les permissions
CREATE TYPE scope_type AS ENUM ('UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'PROMOTION');

-- Table des rôles utilisateurs avec portée hiérarchique
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role hierarchical_role NOT NULL,
    scope_type scope_type NOT NULL DEFAULT 'UNIVERSITY',
    faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    promotion_id INTEGER REFERENCES promotions(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role, faculty_id, department_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_scope ON user_roles(scope_type, faculty_id, department_id);

-- ============================================
-- PARTIE 2: SYSTÈME DE DÉLIBÉRATION
-- ============================================

-- Statuts de délibération
CREATE TYPE deliberation_status AS ENUM (
    'DRAFT',           -- Brouillon - notes en cours de saisie
    'COMPILED',        -- Compilé - toutes les notes saisies
    'IN_SESSION',      -- En session - délibération en cours
    'ADJUSTED',        -- Ajusté - modifications apportées
    'VALIDATED',       -- Validé - approuvé par le président
    'PUBLISHED'        -- Publié - accessible aux étudiants
);

-- Table des sessions de délibération
CREATE TABLE deliberations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2, 0)), -- 0 = annuel
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('NORMALE', 'RATTRAPAGE', 'SPECIALE')),
    status deliberation_status DEFAULT 'DRAFT',
    
    -- Dates importantes
    grades_deadline TIMESTAMP,
    deliberation_date TIMESTAMP,
    publication_date TIMESTAMP,
    
    -- Validation
    president_id INTEGER REFERENCES users(id),
    validated_by INTEGER REFERENCES users(id),
    validated_at TIMESTAMP,
    published_by INTEGER REFERENCES users(id),
    published_at TIMESTAMP,
    
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliberations_promotion ON deliberations(promotion_id);
CREATE INDEX idx_deliberations_status ON deliberations(status);
CREATE INDEX idx_deliberations_year ON deliberations(academic_year_id);

-- Table des membres du jury
CREATE TABLE jury_members (
    id SERIAL PRIMARY KEY,
    deliberation_id INTEGER NOT NULL REFERENCES deliberations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('PRESIDENT', 'SECRETAIRE', 'MEMBRE')),
    is_present BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deliberation_id, user_id)
);

-- Table des modifications de notes (avec traçabilité)
CREATE TABLE grade_modifications (
    id SERIAL PRIMARY KEY,
    grade_id INTEGER NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    deliberation_id INTEGER REFERENCES deliberations(id),
    
    -- Anciennes valeurs
    old_tp_score DECIMAL(5,2),
    old_td_score DECIMAL(5,2),
    old_exam_score DECIMAL(5,2),
    old_final_score DECIMAL(5,2),
    
    -- Nouvelles valeurs
    new_tp_score DECIMAL(5,2),
    new_td_score DECIMAL(5,2),
    new_exam_score DECIMAL(5,2),
    new_final_score DECIMAL(5,2),
    
    -- Justification et traçabilité
    justification TEXT NOT NULL,
    modification_type VARCHAR(50) NOT NULL CHECK (modification_type IN (
        'ERREUR_SAISIE', 'REPECHAGE', 'BONUS_ASSIDUITE', 'AJUSTEMENT_JURY', 
        'RECLAMATION', 'CORRECTION_EXAMEN', 'AUTRE'
    )),
    
    modified_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Notifications
    teacher_notified BOOLEAN DEFAULT FALSE,
    teacher_notified_at TIMESTAMP,
    president_notified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grade_modifications_grade ON grade_modifications(grade_id);
CREATE INDEX idx_grade_modifications_deliberation ON grade_modifications(deliberation_id);

-- Résultats de délibération par étudiant
CREATE TABLE deliberation_results (
    id SERIAL PRIMARY KEY,
    deliberation_id INTEGER NOT NULL REFERENCES deliberations(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Moyennes
    semester_average DECIMAL(5,2),
    annual_average DECIMAL(5,2),
    credits_obtained INTEGER DEFAULT 0,
    credits_required INTEGER DEFAULT 0,
    
    -- Décision
    decision VARCHAR(50) NOT NULL CHECK (decision IN (
        'ADMIS', 'AJOURNE', 'EXCLUS', 'ADMIS_DETTE', 'EN_ATTENTE'
    )),
    rank_in_promotion INTEGER,
    mention VARCHAR(50),
    
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deliberation_id, student_id)
);

-- ============================================
-- PARTIE 3: LMS - COURS EN LIGNE
-- ============================================

-- Modules de cours (chapitres)
CREATE TABLE course_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ressources pédagogiques
CREATE TABLE course_resources (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN (
        'PDF', 'VIDEO', 'AUDIO', 'LINK', 'DOCUMENT', 'PRESENTATION', 'IMAGE'
    )),
    file_url TEXT,
    file_size INTEGER, -- en bytes
    duration INTEGER, -- pour vidéos/audios en secondes
    order_index INTEGER DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devoirs
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES course_modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN (
        'DEVOIR', 'TP', 'TD', 'PROJET', 'RAPPORT', 'EXPOSE'
    )),
    max_score DECIMAL(5,2) DEFAULT 20,
    coefficient DECIMAL(3,2) DEFAULT 1,
    
    -- Dates
    available_from TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    late_due_date TIMESTAMP, -- soumission tardive autorisée jusqu'à
    
    -- Options
    allow_late_submission BOOLEAN DEFAULT FALSE,
    late_penalty_percent DECIMAL(5,2) DEFAULT 0,
    max_attempts INTEGER DEFAULT 1,
    
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soumissions de devoirs
CREATE TABLE assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Fichiers soumis
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    content TEXT, -- pour les soumissions texte
    
    -- Évaluation
    score DECIMAL(5,2),
    feedback TEXT,
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    
    -- Métadonnées
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    attempt_number INTEGER DEFAULT 1,
    
    -- Plagiat
    plagiarism_score DECIMAL(5,2),
    plagiarism_checked BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id, attempt_number)
);

-- Quiz et examens en ligne
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES course_modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quiz_type VARCHAR(20) NOT NULL CHECK (quiz_type IN (
        'QUIZ', 'EXAMEN', 'AUTO_EVALUATION', 'SONDAGE'
    )),
    
    -- Configuration
    time_limit INTEGER, -- en minutes
    max_attempts INTEGER DEFAULT 1,
    passing_score DECIMAL(5,2),
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_answers BOOLEAN DEFAULT FALSE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    show_score_immediately BOOLEAN DEFAULT TRUE,
    
    -- Dates
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions de quiz
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN (
        'QCM', 'QCU', 'VRAI_FAUX', 'TEXTE_COURT', 'TEXTE_LONG', 'NUMERIQUE', 'CORRESPONDANCE'
    )),
    points DECIMAL(5,2) DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    explanation TEXT, -- explication de la bonne réponse
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options de réponse
CREATE TABLE quiz_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    feedback TEXT
);

-- Tentatives de quiz
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    time_spent INTEGER, -- en secondes
    
    attempt_number INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Réponses des étudiants aux quiz
CREATE TABLE quiz_responses (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_id INTEGER REFERENCES quiz_answers(id), -- pour QCM/QCU
    text_answer TEXT, -- pour questions texte
    numeric_answer DECIMAL(15,4), -- pour questions numériques
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forums de discussion
CREATE TABLE discussion_forums (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sujets de discussion
CREATE TABLE discussion_topics (
    id SERIAL PRIMARY KEY,
    forum_id INTEGER NOT NULL REFERENCES discussion_forums(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Réponses aux sujets
CREATE TABLE discussion_replies (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES discussion_topics(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    parent_reply_id INTEGER REFERENCES discussion_replies(id),
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE, -- marqué comme solution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progression des étudiants
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES course_modules(id),
    resource_id INTEGER REFERENCES course_resources(id),
    
    progress_percent DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0, -- en secondes
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, module_id, resource_id)
);

-- ============================================
-- PARTIE 4: ANTIPLAGIAT
-- ============================================

-- Rapports de plagiat
CREATE TABLE plagiarism_reports (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    
    overall_score DECIMAL(5,2) NOT NULL, -- pourcentage de similarité
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    )),
    
    -- Sources détectées
    sources_count INTEGER DEFAULT 0,
    internet_score DECIMAL(5,2),
    database_score DECIMAL(5,2),
    student_papers_score DECIMAL(5,2),
    
    report_url TEXT, -- lien vers le rapport détaillé
    processed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Correspondances détectées
CREATE TABLE plagiarism_matches (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES plagiarism_reports(id) ON DELETE CASCADE,
    
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN (
        'INTERNET', 'STUDENT_PAPER', 'PUBLICATION', 'DATABASE'
    )),
    source_url TEXT,
    source_title TEXT,
    source_author TEXT,
    
    matched_text TEXT,
    similarity_percent DECIMAL(5,2),
    word_count INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTIE 5: BOURSES & AIDES FINANCIÈRES
-- ============================================

-- Programmes de bourses
CREATE TABLE scholarship_programs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sponsor VARCHAR(255), -- Gouvernement, ONG, Entreprise, etc.
    
    -- Montants
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    coverage_type VARCHAR(50) CHECK (coverage_type IN (
        'FULL', 'PARTIAL', 'TUITION_ONLY', 'LIVING_EXPENSES', 'MERIT_BASED'
    )),
    
    -- Éligibilité
    min_average DECIMAL(5,2),
    max_income DECIMAL(15,2), -- revenu familial max
    eligible_levels TEXT[], -- ['L1', 'L2', 'M1', etc.]
    eligible_faculties INTEGER[], -- IDs des facultés
    
    -- Dates
    application_start DATE,
    application_end DATE,
    academic_year_id INTEGER REFERENCES academic_years(id),
    
    slots_available INTEGER,
    slots_used INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidatures aux bourses
CREATE TABLE scholarship_applications (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES scholarship_programs(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Documents
    motivation_letter TEXT,
    documents_urls TEXT[], -- URLs des documents justificatifs
    
    -- Informations socio-économiques
    family_income DECIMAL(15,2),
    family_size INTEGER,
    is_orphan BOOLEAN DEFAULT FALSE,
    has_disability BOOLEAN DEFAULT FALSE,
    
    -- Évaluation
    academic_average DECIMAL(5,2),
    score DECIMAL(5,2), -- score calculé
    rank INTEGER, -- classement
    
    -- Statut
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED'
    )),
    
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    decision_reason TEXT,
    
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, student_id)
);

-- Versements de bourses
CREATE TABLE scholarship_disbursements (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES scholarship_applications(id) ON DELETE CASCADE,
    
    amount DECIMAL(15,2) NOT NULL,
    disbursement_date DATE,
    period VARCHAR(50), -- "Semestre 1", "Année complète", etc.
    
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSED', 'PAID', 'CANCELLED'
    )),
    
    payment_reference VARCHAR(100),
    processed_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTIE 6: CARRIÈRE & ALUMNI
-- ============================================

-- Profils Alumni
CREATE TABLE alumni_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id), -- lien avec l'ancien dossier étudiant
    
    graduation_year INTEGER,
    degree VARCHAR(100),
    faculty_id INTEGER REFERENCES faculties(id),
    department_id INTEGER REFERENCES departments(id),
    
    -- Informations professionnelles
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    industry VARCHAR(100),
    linkedin_url TEXT,
    
    -- Contact
    professional_email VARCHAR(255),
    location VARCHAR(255),
    
    -- Mentorat
    is_mentor BOOLEAN DEFAULT FALSE,
    mentor_topics TEXT[], -- domaines d'expertise pour mentorat
    
    bio TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offres d'emploi/stages
CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    posted_by INTEGER REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    company_logo_url TEXT,
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN (
        'STAGE', 'EMPLOI', 'ALTERNANCE', 'FREELANCE', 'BENEVOLAT'
    )),
    contract_type VARCHAR(50), -- CDI, CDD, etc.
    
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    salary_min DECIMAL(15,2),
    salary_max DECIMAL(15,2),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Éligibilité
    eligible_faculties INTEGER[],
    eligible_levels TEXT[],
    required_skills TEXT[],
    
    application_deadline DATE,
    start_date DATE,
    
    application_url TEXT,
    contact_email VARCHAR(255),
    
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
        'DRAFT', 'ACTIVE', 'CLOSED', 'EXPIRED'
    )),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidatures emploi
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    posting_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    cover_letter TEXT,
    cv_url TEXT,
    additional_documents TEXT[],
    
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN'
    )),
    
    notes TEXT, -- notes internes
    
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(posting_id, applicant_id)
);

-- CV Builder - Sections du CV
CREATE TABLE cv_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    headline VARCHAR(255),
    summary TEXT,
    
    -- Informations de contact supplémentaires
    website TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    
    skills TEXT[],
    languages TEXT[],
    interests TEXT[],
    
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expériences professionnelles
CREATE TABLE cv_experiences (
    id SERIAL PRIMARY KEY,
    cv_id INTEGER NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    
    description TEXT,
    achievements TEXT[],
    
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formations (dans le CV)
CREATE TABLE cv_education (
    id SERIAL PRIMARY KEY,
    cv_id INTEGER NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    location VARCHAR(255),
    
    start_date DATE,
    end_date DATE,
    grade VARCHAR(50),
    
    description TEXT,
    
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relations de mentorat
CREATE TABLE mentorship_relations (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    topic VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    )),
    
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentor_id, mentee_id)
);

-- ============================================
-- PARTIE 7: MODULE STAGES
-- ============================================

-- Entreprises partenaires
CREATE TABLE partner_companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    
    -- Contact
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'RDC',
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    logo_url TEXT,
    
    -- Contact principal
    contact_person VARCHAR(255),
    contact_position VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Partenariat
    partnership_start DATE,
    partnership_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conventions de stage
CREATE TABLE internship_agreements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES partner_companies(id),
    
    -- Encadrement
    academic_supervisor_id INTEGER REFERENCES teachers(id),
    company_supervisor_name VARCHAR(255),
    company_supervisor_email VARCHAR(255),
    company_supervisor_phone VARCHAR(50),
    
    -- Détails du stage
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objectives TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_week INTEGER DEFAULT 40,
    
    -- Rémunération
    is_paid BOOLEAN DEFAULT FALSE,
    monthly_compensation DECIMAL(15,2),
    compensation_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Documents
    convention_url TEXT,
    
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    )),
    
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rapports de stage
CREATE TABLE internship_reports (
    id SERIAL PRIMARY KEY,
    agreement_id INTEGER NOT NULL REFERENCES internship_agreements(id) ON DELETE CASCADE,
    
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN (
        'WEEKLY', 'MONTHLY', 'MIDTERM', 'FINAL'
    )),
    
    title VARCHAR(255),
    content TEXT,
    file_url TEXT,
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Évaluation
    score DECIMAL(5,2),
    feedback TEXT,
    evaluated_by INTEGER REFERENCES users(id),
    evaluated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Évaluations de stage
CREATE TABLE internship_evaluations (
    id SERIAL PRIMARY KEY,
    agreement_id INTEGER NOT NULL REFERENCES internship_agreements(id) ON DELETE CASCADE,
    evaluator_type VARCHAR(20) NOT NULL CHECK (evaluator_type IN (
        'ACADEMIC', 'COMPANY', 'SELF'
    )),
    evaluator_id INTEGER REFERENCES users(id),
    
    -- Critères d'évaluation (sur 20)
    technical_skills DECIMAL(5,2),
    soft_skills DECIMAL(5,2),
    punctuality DECIMAL(5,2),
    initiative DECIMAL(5,2),
    teamwork DECIMAL(5,2),
    communication DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    
    strengths TEXT,
    areas_for_improvement TEXT,
    comments TEXT,
    
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(agreement_id, evaluator_type)
);

-- ============================================
-- PARTIE 8: BIBLIOTHÈQUE NUMÉRIQUE
-- ============================================

-- Ressources de la bibliothèque
CREATE TABLE library_resources (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(20),
    title VARCHAR(500) NOT NULL,
    authors TEXT[],
    publisher VARCHAR(255),
    publication_year INTEGER,
    
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN (
        'BOOK', 'EBOOK', 'JOURNAL', 'THESIS', 'ARTICLE', 'MAGAZINE', 'NEWSPAPER', 'VIDEO', 'AUDIO'
    )),
    
    -- Catégorisation
    category VARCHAR(100),
    subcategory VARCHAR(100),
    subjects TEXT[],
    keywords TEXT[],
    language VARCHAR(50) DEFAULT 'Français',
    
    -- Description
    description TEXT,
    table_of_contents TEXT,
    
    -- Fichiers numériques
    file_url TEXT,
    cover_image_url TEXT,
    preview_url TEXT,
    
    -- Disponibilité physique
    location VARCHAR(100), -- emplacement dans la bibliothèque
    shelf_number VARCHAR(50),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    
    -- Accès
    is_digital BOOLEAN DEFAULT FALSE,
    is_downloadable BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'ALL' CHECK (access_level IN (
        'ALL', 'STUDENT', 'TEACHER', 'RESEARCHER', 'ADMIN'
    )),
    
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_library_resources_type ON library_resources(resource_type);
CREATE INDEX idx_library_resources_title ON library_resources USING gin(to_tsvector('french', title));

-- Réservations de livres
CREATE TABLE library_reservations (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES library_resources(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_available_date DATE,
    expires_at TIMESTAMP, -- date limite pour récupérer
    
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'
    )),
    
    notified BOOLEAN DEFAULT FALSE
);

-- Emprunts de livres
CREATE TABLE library_loans (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES library_resources(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reservation_id INTEGER REFERENCES library_reservations(id),
    
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP,
    
    renewals_count INTEGER DEFAULT 0,
    max_renewals INTEGER DEFAULT 2,
    
    -- Pénalités
    is_overdue BOOLEAN DEFAULT FALSE,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'RETURNED', 'OVERDUE', 'LOST'
    )),
    
    notes TEXT
);

-- Favoris/Liste de lecture
CREATE TABLE library_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES library_resources(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_id)
);

-- ============================================
-- PARTIE 9: PAIEMENTS MOBILE
-- ============================================

-- Comptes Mobile Money enregistrés
CREATE TABLE mobile_money_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    provider VARCHAR(20) NOT NULL CHECK (provider IN (
        'AIRTEL_MONEY', 'MPESA', 'ORANGE_MONEY', 'AFRIMONEY'
    )),
    phone_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(255),
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider, phone_number)
);

-- Transactions Mobile Money
CREATE TABLE mobile_money_transactions (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id),
    account_id INTEGER REFERENCES mobile_money_accounts(id),
    
    provider VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE, -- ID fourni par le provider
    reference VARCHAR(100), -- référence interne
    
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CDF',
    
    transaction_type VARCHAR(20) DEFAULT 'PAYMENT' CHECK (transaction_type IN (
        'PAYMENT', 'REFUND', 'REVERSAL'
    )),
    
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'
    )),
    
    -- Détails du provider
    provider_response TEXT,
    provider_message VARCHAR(500),
    provider_fee DECIMAL(10,2),
    
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Webhooks
    webhook_received BOOLEAN DEFAULT FALSE,
    webhook_data TEXT
);

CREATE INDEX idx_mobile_transactions_status ON mobile_money_transactions(status);
CREATE INDEX idx_mobile_transactions_reference ON mobile_money_transactions(reference);

-- ============================================
-- PARTIE 10: SYSTÈME DE FEEDBACK
-- ============================================

-- Enquêtes de satisfaction
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN (
        'COURSE_EVALUATION', 'TEACHER_EVALUATION', 'SERVICE_FEEDBACK', 'GENERAL'
    )),
    
    -- Cible
    target_course_id INTEGER REFERENCES courses(id),
    target_teacher_id INTEGER REFERENCES teachers(id),
    target_roles TEXT[], -- rôles qui peuvent répondre
    
    -- Dates
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'
    )),
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions d'enquête
CREATE TABLE survey_questions (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN (
        'RATING', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'SCALE'
    )),
    
    options TEXT[], -- pour les questions à choix
    min_value INTEGER, -- pour les échelles
    max_value INTEGER,
    
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Réponses aux enquêtes
CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id INTEGER REFERENCES users(id), -- NULL si anonyme
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50) -- pour éviter les doublons
);

-- Réponses aux questions
CREATE TABLE survey_answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    
    rating_value INTEGER,
    text_value TEXT,
    selected_options TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTIE 11: EXAMENS ET PLANIFICATION
-- ============================================

-- Sessions d'examen
CREATE TABLE exam_sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN (
        'NORMALE', 'RATTRAPAGE'
    )),
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    status VARCHAR(20) DEFAULT 'PLANNING' CHECK (status IN (
        'PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'
    )),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Planification des examens
CREATE TABLE exam_schedules (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- en minutes
    
    room_id INTEGER REFERENCES rooms(id),
    
    -- Surveillants
    chief_supervisor_id INTEGER REFERENCES teachers(id),
    
    -- Capacité
    expected_students INTEGER,
    
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'
    )),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, session_id)
);

-- Surveillants d'examen
CREATE TABLE exam_supervisors (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'SUPERVISOR' CHECK (role IN (
        'CHIEF', 'SUPERVISOR', 'ASSISTANT'
    )),
    
    confirmed BOOLEAN DEFAULT FALSE,
    attended BOOLEAN,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, teacher_id)
);

-- Salles
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(100),
    floor INTEGER,
    capacity INTEGER NOT NULL,
    
    room_type VARCHAR(20) DEFAULT 'CLASSROOM' CHECK (room_type IN (
        'CLASSROOM', 'AMPHITHEATER', 'LAB', 'COMPUTER_LAB', 'MEETING_ROOM'
    )),
    
    equipment TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTIE 12: ANALYTICS & IA
-- ============================================

-- Prédictions de performance
CREATE TABLE performance_predictions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id),
    academic_year_id INTEGER REFERENCES academic_years(id),
    
    predicted_score DECIMAL(5,2),
    confidence_level DECIMAL(5,2), -- niveau de confiance de la prédiction
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Facteurs
    factors JSONB, -- facteurs qui ont influencé la prédiction
    recommendations TEXT[],
    
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actual_score DECIMAL(5,2), -- pour comparer après
    
    model_version VARCHAR(50)
);

-- Logs d'activité utilisateur (pour analytics)
CREATE TABLE user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50), -- 'COURSE', 'RESOURCE', 'ASSIGNMENT', etc.
    entity_id INTEGER,
    
    metadata JSONB,
    
    session_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX idx_activity_logs_date ON user_activity_logs(created_at);

-- KPIs et métriques
CREATE TABLE kpi_snapshots (
    id SERIAL PRIMARY KEY,
    
    kpi_type VARCHAR(50) NOT NULL,
    scope_type scope_type NOT NULL,
    faculty_id INTEGER REFERENCES faculties(id),
    department_id INTEGER REFERENCES departments(id),
    promotion_id INTEGER REFERENCES promotions(id),
    
    academic_year_id INTEGER REFERENCES academic_years(id),
    period VARCHAR(20), -- 'DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ANNUAL'
    period_date DATE,
    
    value DECIMAL(15,4),
    previous_value DECIMAL(15,4),
    change_percent DECIMAL(5,2),
    
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PARTIE 13: RECHERCHE SCIENTIFIQUE (SGR)
-- ============================================

-- Projets de recherche
CREATE TABLE research_projects (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Classification
    research_type VARCHAR(50) CHECK (research_type IN (
        'FUNDAMENTAL', 'APPLIED', 'DEVELOPMENT', 'DOCTORAL', 'MASTER'
    )),
    domain VARCHAR(255),
    keywords TEXT[],
    
    -- Responsable et équipe
    principal_investigator_id INTEGER NOT NULL REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    faculty_id INTEGER REFERENCES faculties(id),
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Financement
    funding_source VARCHAR(255),
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Statut
    status VARCHAR(20) DEFAULT 'PROPOSAL' CHECK (status IN (
        'PROPOSAL', 'UNDER_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'SUSPENDED', 'CANCELLED'
    )),
    
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membres de projet de recherche
CREATE TABLE research_project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'PRINCIPAL_INVESTIGATOR', 'CO_INVESTIGATOR', 'RESEARCHER', 
        'DOCTORAL_STUDENT', 'MASTER_STUDENT', 'ASSISTANT'
    )),
    
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    
    UNIQUE(project_id, user_id)
);

-- Publications scientifiques
CREATE TABLE scientific_publications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES research_projects(id),
    
    title VARCHAR(500) NOT NULL,
    authors TEXT[] NOT NULL,
    abstract TEXT,
    
    publication_type VARCHAR(50) CHECK (publication_type IN (
        'JOURNAL_ARTICLE', 'CONFERENCE_PAPER', 'BOOK', 'BOOK_CHAPTER', 
        'THESIS', 'DISSERTATION', 'REPORT', 'PATENT', 'OTHER'
    )),
    
    -- Détails de publication
    journal_name VARCHAR(255),
    conference_name VARCHAR(255),
    publisher VARCHAR(255),
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(50),
    publication_date DATE,
    
    -- Identifiants
    doi VARCHAR(100),
    issn VARCHAR(20),
    
    -- Fichiers
    file_url TEXT,
    
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'PUBLISHED', 'REJECTED'
    )),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thèses et mémoires
CREATE TABLE theses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    keywords TEXT[],
    
    thesis_type VARCHAR(20) NOT NULL CHECK (thesis_type IN (
        'LICENCE', 'MASTER', 'DOCTORATE'
    )),
    
    -- Encadrement
    supervisor_id INTEGER NOT NULL REFERENCES teachers(id),
    co_supervisor_id INTEGER REFERENCES teachers(id),
    
    -- Jury
    jury_president_id INTEGER REFERENCES teachers(id),
    
    -- Dates
    registration_date DATE,
    defense_date DATE,
    
    -- Fichiers
    manuscript_url TEXT,
    presentation_url TEXT,
    
    -- Évaluation
    grade DECIMAL(5,2),
    mention VARCHAR(50),
    
    status VARCHAR(20) DEFAULT 'REGISTERED' CHECK (status IN (
        'REGISTERED', 'IN_PROGRESS', 'SUBMITTED', 'DEFENDED', 'APPROVED', 'REJECTED'
    )),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jury de thèse
CREATE TABLE thesis_jury_members (
    id SERIAL PRIMARY KEY,
    thesis_id INTEGER NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    
    role VARCHAR(20) NOT NULL CHECK (role IN (
        'PRESIDENT', 'RAPPORTEUR', 'EXAMINATEUR', 'MEMBRE'
    )),
    
    is_external BOOLEAN DEFAULT FALSE,
    institution VARCHAR(255), -- si externe
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(thesis_id, user_id)
);

-- ============================================
-- PARTIE 14: CHATBOT & VISIOCONFÉRENCE
-- ============================================

-- Conversations chatbot
CREATE TABLE chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    
    messages_count INTEGER DEFAULT 0,
    was_helpful BOOLEAN,
    feedback TEXT
);

-- Messages chatbot
CREATE TABLE chatbot_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    
    role VARCHAR(10) NOT NULL CHECK (role IN ('USER', 'BOT')),
    content TEXT NOT NULL,
    
    -- Métadonnées
    intent VARCHAR(100), -- intention détectée
    confidence DECIMAL(5,4),
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ pour le chatbot
CREATE TABLE faq_entries (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[],
    
    order_index INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    
    is_published BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions de visioconférence
CREATE TABLE video_conferences (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    provider VARCHAR(20) DEFAULT 'INTERNAL' CHECK (provider IN (
        'INTERNAL', 'ZOOM', 'GOOGLE_MEET', 'TEAMS'
    )),
    
    meeting_url TEXT,
    meeting_id VARCHAR(100),
    meeting_password VARCHAR(50),
    
    host_id INTEGER NOT NULL REFERENCES users(id),
    
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL, -- en minutes
    
    -- Recording
    is_recorded BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    )),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants aux visioconférences
CREATE TABLE video_conference_participants (
    id SERIAL PRIMARY KEY,
    conference_id INTEGER NOT NULL REFERENCES video_conferences(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    duration INTEGER, -- temps passé en secondes
    
    UNIQUE(conference_id, user_id)
);

-- ============================================
-- TRIGGERS ET FONCTIONS
-- ============================================

-- Trigger pour mettre à jour les copies disponibles
CREATE OR REPLACE FUNCTION update_available_copies()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE library_resources 
        SET available_copies = available_copies - 1 
        WHERE id = NEW.resource_id AND available_copies > 0;
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'RETURNED' AND OLD.status != 'RETURNED' THEN
        UPDATE library_resources 
        SET available_copies = available_copies + 1 
        WHERE id = NEW.resource_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_library_loan
AFTER INSERT OR UPDATE ON library_loans
FOR EACH ROW EXECUTE FUNCTION update_available_copies();

-- Trigger pour notifications de modification de notes
CREATE OR REPLACE FUNCTION notify_grade_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une notification pour l'enseignant concerné
    INSERT INTO notifications (user_id, title, message, type, link)
    SELECT 
        t.user_id,
        'Modification de note',
        'Une note que vous avez saisie a été modifiée. Justification: ' || NEW.justification,
        'WARNING',
        '/teacher/grades/' || NEW.grade_id
    FROM grades g
    JOIN courses c ON g.course_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE g.id = NEW.grade_id;
    
    NEW.teacher_notified := TRUE;
    NEW.teacher_notified_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_grade_modification_notification
BEFORE INSERT ON grade_modifications
FOR EACH ROW EXECUTE FUNCTION notify_grade_modification();

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue des statistiques par promotion
CREATE OR REPLACE VIEW v_promotion_statistics AS
SELECT 
    p.id AS promotion_id,
    p.name AS promotion_name,
    p.level,
    d.name AS department_name,
    f.name AS faculty_name,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT CASE WHEN s.status = 'ACTIVE' THEN s.id END) AS active_students,
    AVG(g.final_score) AS average_score
FROM promotions p
JOIN departments d ON p.department_id = d.id
JOIN faculties f ON d.faculty_id = f.id
LEFT JOIN students s ON s.promotion_id = p.id
LEFT JOIN grades g ON g.student_id = s.id
GROUP BY p.id, p.name, p.level, d.name, f.name;

-- Vue des délibérations en cours
CREATE OR REPLACE VIEW v_active_deliberations AS
SELECT 
    d.*,
    p.name AS promotion_name,
    p.level,
    dep.name AS department_name,
    f.name AS faculty_name,
    COUNT(DISTINCT dr.id) AS results_count,
    COUNT(DISTINCT jm.id) AS jury_members_count
FROM deliberations d
JOIN promotions p ON d.promotion_id = p.id
JOIN departments dep ON p.department_id = dep.id
JOIN faculties f ON dep.faculty_id = f.id
LEFT JOIN deliberation_results dr ON dr.deliberation_id = d.id
LEFT JOIN jury_members jm ON jm.deliberation_id = d.id
WHERE d.status NOT IN ('PUBLISHED')
GROUP BY d.id, p.name, p.level, dep.name, f.name;

COMMENT ON DATABASE nexus_unikin IS 'Base de données NEXUS UNIKIN v2.0 - Système complet de gestion universitaire';

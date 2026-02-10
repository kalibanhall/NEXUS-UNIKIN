-- =====================================================
-- NEXUS UNIKIN - Système de Suivi de Projet
-- Schéma de base de données pour le tracking
-- Date de lancement: 30 Janvier 2026
-- Durée: 3 mois (jusqu'au 30 Avril 2026)
-- =====================================================

-- Table des phases du projet
CREATE TABLE IF NOT EXISTS project_phases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, blocked
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des semaines du projet
CREATE TABLE IF NOT EXISTS project_weeks (
    id SERIAL PRIMARY KEY,
    phase_id INTEGER REFERENCES project_phases(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    objectives TEXT[], -- Liste des objectifs de la semaine
    status VARCHAR(50) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    prestataire_notes TEXT,
    client_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS project_tasks (
    id SERIAL PRIMARY KEY,
    week_id INTEGER REFERENCES project_weeks(id) ON DELETE CASCADE,
    phase_id INTEGER REFERENCES project_phases(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- deployment, configuration, training, encoding, testing, etc.
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    assigned_to VARCHAR(255),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    start_date DATE,
    due_date DATE,
    completed_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, blocked, cancelled
    progress_percentage INTEGER DEFAULT 0,
    -- Validation côté prestataire
    prestataire_completed BOOLEAN DEFAULT FALSE,
    prestataire_completed_at TIMESTAMP,
    prestataire_completed_by VARCHAR(255),
    -- Validation côté client
    client_validated BOOLEAN DEFAULT FALSE,
    client_validated_at TIMESTAMP,
    client_validated_by VARCHAR(255),
    client_validation_notes TEXT,
    -- Métadonnées
    order_index INTEGER DEFAULT 0,
    is_milestone BOOLEAN DEFAULT FALSE,
    dependencies INTEGER[], -- IDs des tâches dépendantes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sous-tâches
CREATE TABLE IF NOT EXISTS project_subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES project_tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    completed_by VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commentaires
CREATE TABLE IF NOT EXISTS task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES project_tasks(id) ON DELETE CASCADE,
    user_type VARCHAR(50) NOT NULL, -- prestataire, client
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100),
    comment_type VARCHAR(50) DEFAULT 'comment', -- comment, suggestion, issue, question, validation
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    parent_comment_id INTEGER REFERENCES task_comments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des pièces jointes
CREATE TABLE IF NOT EXISTS task_attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES project_tasks(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES task_comments(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(255),
    user_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des facultés (pour le déploiement)
CREATE TABLE IF NOT EXISTS deployment_faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    order_index INTEGER NOT NULL,
    week_id INTEGER REFERENCES project_weeks(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, issues
    students_count INTEGER DEFAULT 0,
    teachers_count INTEGER DEFAULT 0,
    employees_count INTEGER DEFAULT 0,
    students_encoded INTEGER DEFAULT 0,
    teachers_encoded INTEGER DEFAULT 0,
    employees_encoded INTEGER DEFAULT 0,
    focal_point_name VARCHAR(255),
    focal_point_contact VARCHAR(255),
    focal_point_trained BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des points focaux
CREATE TABLE IF NOT EXISTS focal_points (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES deployment_faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_trained BOOLEAN DEFAULT FALSE,
    training_date DATE,
    training_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de l'historique des modifications
CREATE TABLE IF NOT EXISTS project_history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL, -- phase, week, task, subtask, faculty
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, status_changed, validated, commented
    old_value JSONB,
    new_value JSONB,
    changed_by VARCHAR(255),
    user_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS project_notifications (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(50) NOT NULL, -- prestataire, client, all
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error, validation_required
    related_entity_type VARCHAR(100),
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des bilans hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_reports (
    id SERIAL PRIMARY KEY,
    week_id INTEGER REFERENCES project_weeks(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    -- Résumé prestataire
    prestataire_summary TEXT,
    tasks_completed INTEGER DEFAULT 0,
    tasks_in_progress INTEGER DEFAULT 0,
    tasks_blocked INTEGER DEFAULT 0,
    issues_encountered TEXT[],
    solutions_applied TEXT[],
    -- Résumé client
    client_feedback TEXT,
    client_satisfaction_score INTEGER, -- 1-5
    client_concerns TEXT[],
    -- Planification
    next_week_priorities TEXT[],
    resources_needed TEXT[],
    risks_identified TEXT[],
    -- Validation
    prestataire_validated BOOLEAN DEFAULT FALSE,
    prestataire_validated_at TIMESTAMP,
    client_validated BOOLEAN DEFAULT FALSE,
    client_validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_tasks_week ON project_tasks(week_id);
CREATE INDEX idx_tasks_phase ON project_tasks(phase_id);
CREATE INDEX idx_tasks_status ON project_tasks(status);
CREATE INDEX idx_comments_task ON task_comments(task_id);
CREATE INDEX idx_history_entity ON project_history(entity_type, entity_id);
CREATE INDEX idx_notifications_user ON project_notifications(user_type, is_read);
CREATE INDEX idx_faculties_status ON deployment_faculties(status);

-- Vue pour le résumé du projet
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    (SELECT COUNT(*) FROM project_phases) as total_phases,
    (SELECT COUNT(*) FROM project_phases WHERE status = 'completed') as completed_phases,
    (SELECT COUNT(*) FROM project_weeks) as total_weeks,
    (SELECT COUNT(*) FROM project_weeks WHERE status = 'completed') as completed_weeks,
    (SELECT COUNT(*) FROM project_tasks) as total_tasks,
    (SELECT COUNT(*) FROM project_tasks WHERE status = 'completed') as completed_tasks,
    (SELECT COUNT(*) FROM project_tasks WHERE client_validated = TRUE) as validated_tasks,
    (SELECT COUNT(*) FROM deployment_faculties) as total_faculties,
    (SELECT COUNT(*) FROM deployment_faculties WHERE status = 'completed') as completed_faculties,
    (SELECT COALESCE(AVG(progress_percentage), 0) FROM project_phases) as overall_progress;

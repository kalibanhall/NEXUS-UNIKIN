-- ============================================
-- NEXUS UNIKIN - Schéma Étendu
-- Tables additionnelles pour fonctionnalités complètes
-- ============================================

-- Table des Sessions de Délibération
CREATE TABLE IF NOT EXISTS deliberation_sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    session_type VARCHAR(20) DEFAULT 'NORMAL' CHECK (session_type IN ('NORMAL', 'RATTRAPAGE', 'SPECIAL')),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'VALIDATED', 'PUBLISHED')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    president_id INTEGER REFERENCES users(id),
    secretary_id INTEGER REFERENCES users(id),
    remarks TEXT,
    created_by INTEGER REFERENCES users(id),
    validated_by INTEGER REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Résultats de Délibération
CREATE TABLE IF NOT EXISTS deliberation_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES deliberation_sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_credits INTEGER DEFAULT 0,
    validated_credits INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    decision VARCHAR(50) CHECK (decision IN ('ADMIS', 'AJOURNE', 'EXCLUS', 'REDOUBLE', 'EN_ATTENTE')),
    mention VARCHAR(50),
    rank_position INTEGER,
    jury_remarks TEXT,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- Table des Salles
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(100),
    floor INTEGER,
    capacity INTEGER DEFAULT 30,
    room_type VARCHAR(20) DEFAULT 'SALLE' CHECK (room_type IN ('AMPHI', 'SALLE', 'LABO', 'TP', 'BUREAU')),
    equipment TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    document_type VARCHAR(50) CHECK (document_type IN ('ATTESTATION', 'RELEVE_NOTES', 'CERTIFICAT', 'BULLETIN', 'DIPLOME', 'AUTRE')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DELIVERED')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de Configuration Académique
CREATE TABLE IF NOT EXISTS academic_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'GENERAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Messages internes
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Activités/Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Frais Académiques (Configuration)
CREATE TABLE IF NOT EXISTS fee_structures (
    id SERIAL PRIMARY KEY,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    promotion_id INTEGER REFERENCES promotions(id),
    fee_type VARCHAR(50) NOT NULL CHECK (fee_type IN ('INSCRIPTION', 'FRAIS_ACADEMIQUES', 'FRAIS_MINERVAL', 'LABORATOIRE', 'AUTRES')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    deadline DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des Événements/Calendrier
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) CHECK (event_type IN ('COURS', 'EXAMEN', 'REUNION', 'CONFERENCE', 'CEREMONIE', 'CONGE', 'AUTRE')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    target_roles TEXT[],
    target_promotions INTEGER[],
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index additionnels
CREATE INDEX IF NOT EXISTS idx_deliberation_sessions_year ON deliberation_sessions(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_sessions_promotion ON deliberation_sessions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_results_session ON deliberation_results(session_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_results_student ON deliberation_results(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- Triggers
CREATE TRIGGER update_deliberation_sessions_updated_at BEFORE UPDATE ON deliberation_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliberation_results_updated_at BEFORE UPDATE ON deliberation_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configuration initiale
INSERT INTO academic_config (config_key, config_value, description, category) VALUES
('passing_grade', '10', 'Note minimale de passage', 'GRADES'),
('max_credits_per_semester', '30', 'Maximum de crédits par semestre', 'ACADEMIC'),
('attendance_threshold', '75', 'Pourcentage minimum de présence', 'ATTENDANCE'),
('email_domain_students', 'student.unikin.ac.cd', 'Domaine email étudiants', 'EMAIL'),
('email_domain_staff', 'unikin.ac.cd', 'Domaine email personnel', 'EMAIL'),
('academic_year_start_month', '10', 'Mois de début année académique', 'ACADEMIC'),
('currency', 'USD', 'Devise par défaut', 'FINANCIAL')
ON CONFLICT (config_key) DO NOTHING;

-- Salles de cours initiales
INSERT INTO rooms (code, name, building, floor, capacity, room_type) VALUES
('A1', 'Amphithéâtre A1', 'Bâtiment Central', 0, 500, 'AMPHI'),
('A2', 'Amphithéâtre A2', 'Bâtiment Central', 0, 300, 'AMPHI'),
('B1', 'Amphithéâtre B1', 'Bâtiment Sciences', 0, 200, 'AMPHI'),
('TD1', 'Salle TD 1', 'Bâtiment Pédagogique', 1, 40, 'SALLE'),
('TD2', 'Salle TD 2', 'Bâtiment Pédagogique', 1, 40, 'SALLE'),
('TD3', 'Salle TD 3', 'Bâtiment Pédagogique', 2, 35, 'SALLE'),
('TP1', 'Laboratoire Info 1', 'Bâtiment Informatique', 1, 30, 'TP'),
('TP2', 'Laboratoire Info 2', 'Bâtiment Informatique', 1, 30, 'TP'),
('LAB1', 'Laboratoire Sciences', 'Bâtiment Sciences', 2, 25, 'LABO')
ON CONFLICT (code) DO NOTHING;

SELECT 'Schéma étendu créé avec succès!' AS message;

-- ============================================
-- NEXUS UNIKIN - Extensions de Schéma
-- Nouvelles tables pour fonctionnalités avancées
-- ============================================

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    attachment_url TEXT,
    attachment_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des statuts utilisateurs (en ligne/hors ligne)
CREATE TABLE IF NOT EXISTS user_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des codes de présence
CREATE TABLE IF NOT EXISTS attendance_codes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    valid_until TIMESTAMP NOT NULL,
    schedule_id INTEGER REFERENCES course_schedules(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les présences via code
CREATE TABLE IF NOT EXISTS attendance_submissions (
    id SERIAL PRIMARY KEY,
    code_id INTEGER NOT NULL REFERENCES attendance_codes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    UNIQUE(code_id, student_id)
);

-- Table des délibérations étudiants
CREATE TABLE IF NOT EXISTS deliberation_results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES deliberation_sessions(id),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    total_credits INTEGER DEFAULT 0,
    validated_credits INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    decision VARCHAR(50) CHECK (decision IN ('ADMIS', 'AJOURNÉ', 'EXCLUS', 'REDOUBLANT', 'EN_ATTENTE')),
    mention VARCHAR(50),
    remarks TEXT,
    is_fees_complete BOOLEAN DEFAULT FALSE,
    can_view BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, semester, academic_year_id)
);

-- Table des frais par type
CREATE TABLE IF NOT EXISTS fee_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    category VARCHAR(50) CHECK (category IN ('ACADEMIQUE', 'LABORATOIRE', 'ENROLLMENT', 'AUTRE')),
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des frais par étudiant et session
CREATE TABLE IF NOT EXISTS student_fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_type_id INTEGER NOT NULL REFERENCES fee_types(id),
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    semester INTEGER CHECK (semester IN (1, 2)),
    amount_due DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, fee_type_id, academic_year_id, semester)
);

-- Table des bordereaux/reçus de paiement
CREATE TABLE IF NOT EXISTS payment_receipts (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    receipt_type VARCHAR(50) CHECK (receipt_type IN ('BORDEREAU', 'RECU', 'FACTURE', 'AUTRE')),
    receipt_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(255),
    bank_reference VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    scan_url TEXT,
    notes TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des demandes de documents avec statistiques
CREATE TABLE IF NOT EXISTS document_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'READY')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES users(id),
    ready_at TIMESTAMP,
    collected_at TIMESTAMP,
    rejection_reason TEXT,
    file_url TEXT,
    copies INTEGER DEFAULT 1,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    fee_paid BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_status_online ON user_status(is_online);
CREATE INDEX IF NOT EXISTS idx_attendance_codes_code ON attendance_codes(code);
CREATE INDEX IF NOT EXISTS idx_attendance_codes_active ON attendance_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_deliberation_results_student ON deliberation_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_student ON payment_receipts(student_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_student ON document_requests(student_id);

-- Triggers pour updated_at
CREATE TRIGGER IF NOT EXISTS update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_user_status_updated_at BEFORE UPDATE ON user_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_student_fees_updated_at BEFORE UPDATE ON student_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_payment_receipts_updated_at BEFORE UPDATE ON payment_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_document_requests_updated_at BEFORE UPDATE ON document_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_deliberation_results_updated_at BEFORE UPDATE ON deliberation_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

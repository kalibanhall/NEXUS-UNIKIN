-- ============================================
-- MIGRATION: Tables Jury de Délibération & Critères
-- NEXUS UNIKIN - Sciences Pharmaceutiques
-- ============================================

BEGIN;

-- ============================================
-- 1. TABLE JURY DE DÉLIBÉRATION
-- ============================================
CREATE TABLE IF NOT EXISTS deliberation_juries (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id),
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    filiere VARCHAR(100), -- 'PharmD' ou 'LTP'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, academic_year_id)
);

-- ============================================
-- 2. TABLE MEMBRES DU JURY
-- ============================================
CREATE TABLE IF NOT EXISTS deliberation_jury_members (
    id SERIAL PRIMARY KEY,
    jury_id INTEGER NOT NULL REFERENCES deliberation_juries(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id),
    teacher_name VARCHAR(255), -- nom si teacher_id non résolu
    role VARCHAR(30) NOT NULL CHECK (role IN ('PRESIDENT', 'SECRETAIRE', 'MEMBRE')),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. TABLE CRITÈRES DE DÉLIBÉRATION
-- ============================================
CREATE TABLE IF NOT EXISTS deliberation_criteria (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculties(id),
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    -- Moyennes
    min_average_pass DECIMAL(4,2) DEFAULT 10.00,         -- Moyenne minimale ADMIS
    min_average_pass_with_debt DECIMAL(4,2) DEFAULT 10.00, -- ADMIS AVEC DETTE
    min_average_retake DECIMAL(4,2) DEFAULT 8.00,        -- AJOURNÉ (repêchable)
    min_average_fail DECIMAL(4,2) DEFAULT 8.00,          -- REFUSÉ si en dessous
    -- Crédits
    pct_credits_pass INTEGER DEFAULT 80,                  -- % crédits pour ADMIS
    pct_credits_pass_with_debt INTEGER DEFAULT 60,        -- % crédits ADMIS AVEC DETTE
    pct_payment_for_results INTEGER DEFAULT 70,           -- % paiement pour voir résultats
    -- Pondération
    weight_tp INTEGER DEFAULT 30,                         -- Poids TP (%)
    weight_td INTEGER DEFAULT 0,                          -- Poids TD (%)
    weight_exam INTEGER DEFAULT 70,                       -- Poids Examen (%)
    -- Règles complémentaires
    blocked_student_can_deliberate BOOLEAN DEFAULT FALSE,
    elimination_note DECIMAL(4,2) DEFAULT NULL,           -- Note éliminatoire
    max_debt_courses INTEGER DEFAULT NULL,                -- Nombre max cours en dette
    -- Mentions
    mentions_enabled BOOLEAN DEFAULT TRUE,
    threshold_distinction DECIMAL(4,2) DEFAULT 14.00,
    threshold_grande_distinction DECIMAL(4,2) DEFAULT 16.00,
    threshold_plus_grande_distinction DECIMAL(4,2) DEFAULT 18.00,
    -- Meta
    validated_by VARCHAR(255),                            -- Nom du Doyen
    validated_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, academic_year_id)
);

-- ============================================
-- 4. GRANT pour nexus_admin
-- ============================================
GRANT ALL ON deliberation_juries TO nexus_admin;
GRANT ALL ON deliberation_jury_members TO nexus_admin;
GRANT ALL ON deliberation_criteria TO nexus_admin;
GRANT USAGE, SELECT ON SEQUENCE deliberation_juries_id_seq TO nexus_admin;
GRANT USAGE, SELECT ON SEQUENCE deliberation_jury_members_id_seq TO nexus_admin;
GRANT USAGE, SELECT ON SEQUENCE deliberation_criteria_id_seq TO nexus_admin;

COMMIT;

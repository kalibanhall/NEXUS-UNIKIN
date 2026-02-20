-- Migration: Password Reset Log + File Uploads
-- Date: 19 février 2026

-- Table pour les demandes de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    matricule VARCHAR(50),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_status ON password_reset_log(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_log(user_id);

-- Ajouter la colonne must_change_password si elle n'existe pas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'must_change_password') THEN
        ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

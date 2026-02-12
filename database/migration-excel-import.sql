-- ============================================
-- NEXUS UNIKIN - Migration pour données Excel
-- Ajout champs, adaptation schema, activation comptes
-- ============================================

-- 1. Ajouter colonnes manquantes à users
ALTER TABLE users ADD COLUMN IF NOT EXISTS postnom VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_activated BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Permettre password NULL pour les comptes non activés
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Ajouter colonnes manquantes à students
ALTER TABLE students ADD COLUMN IF NOT EXISTS option_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS code_promotion VARCHAR(100);

-- 3. Ajouter colonnes manquantes à payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'USD';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS acompte_number VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS motif VARCHAR(255);

-- 4. Élargir les CHECK constraints de payments pour accepter les motifs Excel
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE payments ADD CONSTRAINT payments_payment_type_check CHECK (
  payment_type IN (
    'INSCRIPTION', 'FRAIS_ACADEMIQUES', 'FRAIS_MINERVAL', 'AUTRES',
    'FRAIS_ACADEMIQUES_TOTALITE', 'FRAIS_ACADEMIQUES_ACOMPTE', 'FRAIS_ACADEMIQUES_SOLDE',
    'FRAIS_ACADEMIQUES_ETRANGER', 'FRAIS_INSCRIPTION', 'FRAIS_REINSCRIPTION',
    'FRAIS_LOGEMENT'
  )
);

-- 5. Élargir les CHECK constraints de promotions pour les niveaux Excel
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_level_check;
ALTER TABLE promotions ADD CONSTRAINT promotions_level_check CHECK (
  level IN ('L0','L1','L2','L3','M1','M2','M3','D1','D2','D3','D4',
            'B1','B2','B3','G1','G2','G3','IR1','IR2','P1','P2','P3',
            'DP','PREP','LS','GRADE1','GRADE2','OTHER')
);

-- 6. Rendre promotion_id nullable dans students (certains étudiants n'ont pas de promo connue)
ALTER TABLE students ALTER COLUMN promotion_id DROP NOT NULL;

-- 7. Rendre academic_year_id nullable dans promotions (pas toujours applicable)
ALTER TABLE promotions ALTER COLUMN academic_year_id DROP NOT NULL;

-- 8. Créer les années académiques nécessaires
INSERT INTO academic_years (name, start_date, end_date, is_current)
VALUES ('2024-2025', '2024-10-01', '2025-07-31', FALSE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO academic_years (name, start_date, end_date, is_current)
VALUES ('2025-2026', '2025-10-01', '2026-07-31', TRUE)
ON CONFLICT (name) DO UPDATE SET is_current = TRUE;

-- Désactiver l'ancienne année courante
UPDATE academic_years SET is_current = FALSE WHERE name != '2025-2026';

-- 9. Index supplémentaires pour performance
CREATE INDEX IF NOT EXISTS idx_users_postnom ON users(postnom);
CREATE INDEX IF NOT EXISTS idx_users_activated ON users(account_activated);
CREATE INDEX IF NOT EXISTS idx_students_option ON students(option_name);
CREATE INDEX IF NOT EXISTS idx_payments_devise ON payments(devise);
CREATE INDEX IF NOT EXISTS idx_payments_motif ON payments(motif);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_ref);

-- 10. Mettre à jour le code de promotion unique constraint
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_code_academic_year_id_key;
-- Le rendre unique sur code seul (sans academic_year_id car nullable)
-- On ne recrée pas la contrainte car les promotions seront gérées par le script d'import

SELECT 'Migration terminée avec succès' AS status;

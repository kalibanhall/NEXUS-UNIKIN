-- ============================================
-- NEXUS UNIKIN - Données Initiales
-- ============================================

-- Année académique courante
INSERT INTO academic_years (name, start_date, end_date, is_current)
VALUES ('2024-2025', '2024-10-01', '2025-09-30', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Utilisateur Super Admin
-- Password: Admin@Nexus2026 (hashed with bcrypt)
INSERT INTO users (email, password, first_name, last_name, role, is_active)
VALUES (
    'admin@unikin.ac.cd',
    '$2a$10$8K1p/a0dL1LXMw0e9j9jEeKrM8YnZFX1vYmGFQQ7d5qL8U5w9H6mq',
    'Super',
    'Admin',
    'SUPER_ADMIN',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = TRUE;

-- Créer l'entrée admin
INSERT INTO admins (user_id, admin_type)
SELECT id, 'SUPER_ADMIN' FROM users WHERE email = 'admin@unikin.ac.cd'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- PHASES DU PROJET NEXUS
-- ============================================

INSERT INTO project_phases (name, description, start_date, end_date, order_index, status)
VALUES 
    ('Phase 1 - Préparation', 'Installation et configuration de l''infrastructure de base', '2025-01-06', '2025-01-17', 1, 'completed'),
    ('Phase 2 - Développement Core', 'Développement des modules principaux', '2025-01-20', '2025-02-28', 2, 'in_progress'),
    ('Phase 3 - Déploiement Pilote', 'Déploiement initial dans les facultés pilotes', '2025-03-03', '2025-03-28', 3, 'pending'),
    ('Phase 4 - Déploiement Général', 'Extension à toutes les facultés', '2025-03-31', '2025-05-23', 4, 'pending'),
    ('Phase 5 - Consolidation', 'Optimisation et formation finale', '2025-05-26', '2025-06-20', 5, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================
-- FACULTÉS POUR LE DÉPLOIEMENT
-- ============================================

INSERT INTO deployment_faculties (name, code, order_index, status)
VALUES 
    ('Faculté des Sciences', 'SCIENCES', 1, 'pending'),
    ('Faculté de Droit', 'DROIT', 2, 'pending'),
    ('Faculté de Médecine', 'MEDECINE', 3, 'pending'),
    ('Faculté Polytechnique', 'POLYTECH', 4, 'pending'),
    ('Faculté des Lettres et Sciences Humaines', 'LETTRES', 5, 'pending'),
    ('Faculté des Sciences Économiques et de Gestion', 'FASEG', 6, 'pending'),
    ('Faculté de Psychologie et Sciences de l''Education', 'PSYCHO', 7, 'pending'),
    ('Faculté des Sciences Sociales, Administratives et Politiques', 'FSSAP', 8, 'pending'),
    ('Faculté des Sciences Agronomiques', 'AGRO', 9, 'pending'),
    ('Faculté de Pharmacie', 'PHARMA', 10, 'pending'),
    ('Faculté de Médecine Vétérinaire', 'VETMED', 11, 'pending'),
    ('Institut Pédagogique National', 'IPN', 12, 'pending'),
    ('Ecole de Santé Publique', 'ESP', 13, 'pending'),
    ('Centre de Recherche en Hydrobiologie', 'CRH', 14, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================
-- FIN DES DONNÉES INITIALES
-- ============================================

-- =====================================================
-- NEXUS UNIKIN - Données initiales du système de suivi
-- Lancement: 30 Janvier 2026
-- Fin prévue: 30 Avril 2026 (3 mois)
-- =====================================================

-- =====================================================
-- PHASES DU PROJET
-- =====================================================

INSERT INTO project_phases (name, description, start_date, end_date, order_index, status) VALUES
-- Phase 1: Déploiement initial (Semaine 1)
('Phase 1: Déploiement & Configuration', 
 'Mise en ligne de la plateforme NEXUS UNIKIN, configuration de l''environnement de production, tests et corrections des erreurs liées au déploiement.',
 '2026-01-30', '2026-02-06', 1, 'in_progress'),

-- Phase 2: Préparation du déploiement facultés (Semaine 2)
('Phase 2: Préparation Déploiement Facultés',
 'Formation des points focaux, constitution du plan de déploiement, préparation des outils d''encodage.',
 '2026-02-07', '2026-02-13', 2, 'pending'),

-- Phase 3: Encodage des facultés (Semaines 3-14)
('Phase 3: Encodage des 13 Facultés',
 'Encodage progressif de toutes les facultés avec étudiants, enseignants et employés. Chaque faculté suit un cycle d''une semaine.',
 '2026-02-14', '2026-04-24', 3, 'pending'),

-- Phase 4: Finalisation et livraison
('Phase 4: Finalisation & Livraison',
 'Tests finaux, corrections, documentation, formation finale et livraison officielle.',
 '2026-04-25', '2026-04-30', 4, 'pending');

-- =====================================================
-- SEMAINES DU PROJET
-- =====================================================

INSERT INTO project_weeks (phase_id, week_number, name, description, start_date, end_date, objectives, status) VALUES
-- Semaine 1: Déploiement
(1, 1, 'Semaine 1: Déploiement Initial',
 'Mise en production de NEXUS UNIKIN sur Render, configuration DNS, SSL, et correction des bugs de déploiement.',
 '2026-01-30', '2026-02-06',
 ARRAY['Déployer la plateforme sur Render', 'Configurer le domaine et SSL', 'Tester toutes les fonctionnalités en production', 'Corriger les erreurs de déploiement', 'Documenter la procédure de déploiement'],
 'in_progress'),

-- Semaine 2: Préparation
(2, 2, 'Semaine 2: Préparation & Formation',
 'Désignation des points focaux par faculté, formation sur l''utilisation de NEXUS, élaboration du plan de déploiement.',
 '2026-02-07', '2026-02-13',
 ARRAY['Identifier les points focaux des 13 facultés', 'Former les points focaux à NEXUS', 'Élaborer le plan de déploiement détaillé', 'Préparer les templates d''importation', 'Tester le processus d''encodage'],
 'pending'),

-- Semaines 3-15: Encodage des facultés (une par semaine)
(3, 3, 'Semaine 3: Faculté de Droit',
 'Encodage complet de la Faculté de Droit: étudiants, enseignants, employés.',
 '2026-02-14', '2026-02-20',
 ARRAY['Collecter les données de la Faculté de Droit', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données avec le point focal'],
 'pending'),

(3, 4, 'Semaine 4: Faculté de Médecine',
 'Encodage complet de la Faculté de Médecine.',
 '2026-02-21', '2026-02-27',
 ARRAY['Collecter les données de la Faculté de Médecine', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 5, 'Semaine 5: Faculté des Sciences',
 'Encodage complet de la Faculté des Sciences.',
 '2026-02-28', '2026-03-06',
 ARRAY['Collecter les données de la Faculté des Sciences', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 6, 'Semaine 6: Faculté des Lettres et Sciences Humaines',
 'Encodage complet de la Faculté des Lettres et Sciences Humaines.',
 '2026-03-07', '2026-03-13',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 7, 'Semaine 7: Faculté des Sciences Économiques et de Gestion',
 'Encodage complet de la Faculté des Sciences Économiques et de Gestion.',
 '2026-03-14', '2026-03-20',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 8, 'Semaine 8: Faculté Polytechnique',
 'Encodage complet de la Faculté Polytechnique.',
 '2026-03-21', '2026-03-27',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 9, 'Semaine 9: Faculté des Sciences Agronomiques',
 'Encodage complet de la Faculté des Sciences Agronomiques.',
 '2026-03-28', '2026-04-03',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 10, 'Semaine 10: Faculté de Pharmacie',
 'Encodage complet de la Faculté de Pharmacie.',
 '2026-04-04', '2026-04-10',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 11, 'Semaine 11: Faculté de Psychologie et Sciences de l''Éducation',
 'Encodage complet de la Faculté de Psychologie et Sciences de l''Éducation.',
 '2026-04-11', '2026-04-17',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

(3, 12, 'Semaine 12: Faculté des Sciences Sociales, Administratives et Politiques',
 'Encodage complet de la Faculté des Sciences Sociales.',
 '2026-04-18', '2026-04-24',
 ARRAY['Collecter les données', 'Encoder les étudiants', 'Encoder les enseignants', 'Encoder les employés', 'Valider les données'],
 'pending'),

-- Semaine 13: Finalisation
(4, 13, 'Semaine 13: Finalisation & Livraison',
 'Tests finaux, corrections, documentation complète et livraison officielle.',
 '2026-04-25', '2026-04-30',
 ARRAY['Effectuer les tests finaux', 'Corriger les derniers bugs', 'Finaliser la documentation', 'Former les administrateurs', 'Livraison officielle'],
 'pending');

-- =====================================================
-- TÂCHES SEMAINE 1: DÉPLOIEMENT
-- =====================================================

INSERT INTO project_tasks (week_id, phase_id, title, description, category, priority, due_date, status, order_index, is_milestone) VALUES
-- Jour 1-2: Déploiement initial
(1, 1, 'Configuration du compte Render', 'Créer et configurer le compte Render pour l''hébergement de NEXUS UNIKIN', 'deployment', 'critical', '2026-01-30', 'completed', 1, FALSE),
(1, 1, 'Déploiement de la base de données PostgreSQL', 'Créer et configurer la base de données PostgreSQL sur Render', 'deployment', 'critical', '2026-01-30', 'completed', 2, FALSE),
(1, 1, 'Déploiement de l''application Next.js', 'Déployer l''application NEXUS UNIKIN sur Render', 'deployment', 'critical', '2026-01-31', 'in_progress', 3, TRUE),
(1, 1, 'Configuration des variables d''environnement', 'Configurer toutes les variables d''environnement nécessaires (DATABASE_URL, NEXTAUTH_SECRET, etc.)', 'configuration', 'critical', '2026-01-31', 'pending', 4, FALSE),

-- Jour 3-4: Configuration et tests
(1, 1, 'Configuration du domaine personnalisé', 'Configurer le domaine nexus.unikin.ac.cd (si disponible) ou utiliser le domaine Render', 'configuration', 'high', '2026-02-02', 'pending', 5, FALSE),
(1, 1, 'Configuration SSL/HTTPS', 'S''assurer que le certificat SSL est correctement configuré', 'configuration', 'high', '2026-02-02', 'pending', 6, FALSE),
(1, 1, 'Test de connexion et authentification', 'Vérifier que le système d''authentification fonctionne correctement en production', 'testing', 'critical', '2026-02-02', 'pending', 7, FALSE),
(1, 1, 'Test des fonctionnalités principales', 'Tester toutes les fonctionnalités principales: gestion étudiants, enseignants, cours, notes', 'testing', 'critical', '2026-02-03', 'pending', 8, FALSE),

-- Jour 5-6: Corrections et optimisations
(1, 1, 'Correction des erreurs de déploiement', 'Identifier et corriger toutes les erreurs liées au déploiement', 'bugfix', 'high', '2026-02-04', 'pending', 9, FALSE),
(1, 1, 'Optimisation des performances', 'Optimiser les requêtes et le temps de chargement en production', 'optimization', 'medium', '2026-02-05', 'pending', 10, FALSE),
(1, 1, 'Configuration des sauvegardes automatiques', 'Mettre en place les sauvegardes automatiques de la base de données', 'configuration', 'high', '2026-02-05', 'pending', 11, FALSE),

-- Jour 7: Documentation et bilan
(1, 1, 'Documentation de déploiement', 'Rédiger la documentation complète du processus de déploiement', 'documentation', 'medium', '2026-02-06', 'pending', 12, FALSE),
(1, 1, 'Bilan Semaine 1', 'Dresser le bilan de la semaine 1 et préparer la semaine 2', 'reporting', 'high', '2026-02-06', 'pending', 13, TRUE);

-- =====================================================
-- TÂCHES SEMAINE 2: PRÉPARATION
-- =====================================================

INSERT INTO project_tasks (week_id, phase_id, title, description, category, priority, due_date, status, order_index, is_milestone) VALUES
-- Jour 1-3: Points focaux et formation
(2, 2, 'Identification des points focaux', 'Identifier et désigner un point focal pour chaque faculté (13 au total)', 'planning', 'critical', '2026-02-09', 'pending', 1, FALSE),
(2, 2, 'Création des comptes points focaux', 'Créer les comptes utilisateurs pour tous les points focaux dans NEXUS', 'configuration', 'high', '2026-02-09', 'pending', 2, FALSE),
(2, 2, 'Préparation du matériel de formation', 'Préparer les guides, tutoriels et présentations pour la formation', 'training', 'high', '2026-02-09', 'pending', 3, FALSE),
(2, 2, 'Session de formation - Groupe 1', 'Former les points focaux des facultés 1-5', 'training', 'critical', '2026-02-10', 'pending', 4, FALSE),
(2, 2, 'Session de formation - Groupe 2', 'Former les points focaux des facultés 6-10', 'training', 'critical', '2026-02-11', 'pending', 5, FALSE),
(2, 2, 'Session de formation - Groupe 3', 'Former les points focaux des facultés 11-13', 'training', 'critical', '2026-02-11', 'pending', 6, FALSE),

-- Jour 4-5: Plan de déploiement
(2, 2, 'Élaboration du plan de déploiement', 'Créer le plan détaillé de déploiement pour chaque faculté', 'planning', 'critical', '2026-02-12', 'pending', 7, TRUE),
(2, 2, 'Préparation des templates Excel', 'Créer les templates Excel pour la collecte des données (étudiants, enseignants, employés)', 'preparation', 'high', '2026-02-12', 'pending', 8, FALSE),
(2, 2, 'Distribution des templates aux facultés', 'Envoyer les templates aux points focaux pour collecte des données', 'preparation', 'high', '2026-02-12', 'pending', 9, FALSE),

-- Jour 6-7: Tests et validation
(2, 2, 'Test du processus d''encodage', 'Tester le processus complet d''encodage avec des données de test', 'testing', 'high', '2026-02-13', 'pending', 10, FALSE),
(2, 2, 'Validation du plan avec UNIKIN', 'Présenter et valider le plan de déploiement avec les responsables UNIKIN', 'validation', 'critical', '2026-02-13', 'pending', 11, TRUE),
(2, 2, 'Bilan Semaine 2', 'Dresser le bilan et lancer officiellement la phase d''encodage', 'reporting', 'high', '2026-02-13', 'pending', 12, TRUE);

-- =====================================================
-- LES 13 FACULTÉS DE L'UNIKIN
-- =====================================================

INSERT INTO deployment_faculties (name, code, order_index, week_id, status) VALUES
('Faculté de Droit', 'DROIT', 1, 3, 'pending'),
('Faculté de Médecine', 'MED', 2, 4, 'pending'),
('Faculté des Sciences', 'SCI', 3, 5, 'pending'),
('Faculté des Lettres et Sciences Humaines', 'FLSH', 4, 6, 'pending'),
('Faculté des Sciences Économiques et de Gestion', 'FASEG', 5, 7, 'pending'),
('Faculté Polytechnique', 'POLY', 6, 8, 'pending'),
('Faculté des Sciences Agronomiques', 'AGRO', 7, 9, 'pending'),
('Faculté de Pharmacie', 'PHARMA', 8, 10, 'pending'),
('Faculté de Psychologie et Sciences de l''Éducation', 'PSE', 9, 11, 'pending'),
('Faculté des Sciences Sociales, Administratives et Politiques', 'FSSAP', 10, 12, 'pending'),
('Faculté de Médecine Vétérinaire', 'VET', 11, NULL, 'pending'),
('Faculté de Pétrole, Gaz et Énergies Nouvelles', 'PETRO', 12, NULL, 'pending'),
('École de Santé Publique', 'ESP', 13, NULL, 'pending');

-- =====================================================
-- CRÉER LES TÂCHES POUR CHAQUE FACULTÉ (Exemple: Faculté de Droit)
-- =====================================================

INSERT INTO project_tasks (week_id, phase_id, title, description, category, priority, due_date, status, order_index, is_milestone) VALUES
-- Faculté de Droit - Semaine 3
(3, 3, 'Collecte des données - Faculté de Droit', 'Recevoir et valider les fichiers Excel avec les données de la faculté', 'data_collection', 'critical', '2026-02-15', 'pending', 1, FALSE),
(3, 3, 'Encodage des étudiants - Faculté de Droit', 'Encoder tous les étudiants de la Faculté de Droit dans NEXUS', 'encoding', 'critical', '2026-02-17', 'pending', 2, FALSE),
(3, 3, 'Encodage des enseignants - Faculté de Droit', 'Encoder tous les enseignants de la Faculté de Droit', 'encoding', 'critical', '2026-02-18', 'pending', 3, FALSE),
(3, 3, 'Encodage des employés - Faculté de Droit', 'Encoder tous les employés administratifs de la Faculté de Droit', 'encoding', 'high', '2026-02-19', 'pending', 4, FALSE),
(3, 3, 'Validation des données - Faculté de Droit', 'Validation finale des données avec le point focal', 'validation', 'critical', '2026-02-20', 'pending', 5, TRUE),
(3, 3, 'Bilan encodage - Faculté de Droit', 'Dresser le bilan de l''encodage et identifier les problèmes', 'reporting', 'high', '2026-02-20', 'pending', 6, TRUE);

-- Note: Les tâches similaires seront générées automatiquement pour les autres facultés

-- =====================================================
-- NOTIFICATIONS INITIALES
-- =====================================================

INSERT INTO project_notifications (user_type, title, message, notification_type) VALUES
('all', 'Lancement du Projet NEXUS UNIKIN', 'Le projet NEXUS UNIKIN a été officiellement lancé le 30 Janvier 2026. Durée prévue: 3 mois.', 'info'),
('prestataire', 'Déploiement en cours', 'La phase de déploiement sur Render a commencé. Objectif: plateforme opérationnelle d''ici le 6 Février 2026.', 'info'),
('client', 'Bienvenue sur le tableau de suivi NEXUS', 'Vous pouvez suivre l''avancement du projet en temps réel, valider les étapes et ajouter vos commentaires.', 'info');

-- =====================================================
-- HISTORIQUE INITIAL
-- =====================================================

INSERT INTO project_history (entity_type, entity_id, action, new_value, changed_by, user_type, notes) VALUES
('phase', 1, 'created', '{"name": "Phase 1: Déploiement & Configuration", "status": "in_progress"}', 'Système', 'system', 'Création initiale du projet'),
('week', 1, 'created', '{"name": "Semaine 1: Déploiement Initial", "status": "in_progress"}', 'Système', 'system', 'Début de la semaine 1');

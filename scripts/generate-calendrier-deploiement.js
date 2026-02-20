const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType, PageBreak } = require('docx');
const PDFDocument = require('pdfkit');
const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// ============================================================================
// DATA
// ============================================================================

const META = {
  institution: 'Université de Kinshasa (UNIKIN)',
  debut: 'Jeudi 30 Janvier 2026',
  miseAJour: 'Vendredi 13 Février 2026',
  echeance: 'Mercredi 30 Avril 2026 (3 mois)'
};

const PHASE1 = [
  ['Serveur VPS provisionné', 'Fait', 'Serveur dédié, Ubuntu, 32 Go RAM'],
  ['Plateforme déployée en ligne', 'Fait', 'Next.js 14 + PostgreSQL + PM2 + Nginx'],
  ['Base de données configurée', 'Fait', '16 tables, schéma complet opérationnel'],
  ["Système d'authentification", 'Fait', 'JWT, sessions sécurisées, gestion des rôles'],
  ['Compte Super Admin créé', 'Fait', "Accès total à l'administration"]
];

const PHASE2 = [
  ['Étudiants intégrés', '50 407', 'Importés avec matricules'],
  ['Facultés encodées', '15', 'Toutes les facultés UNIKIN'],
  ['Départements encodés', '134', 'Tous les départements'],
  ['Promotions créées', '503', 'L1 à D4, tous niveaux'],
  ['Paiements importés', '93 349', 'USD + CDF, 2024-2025 et 2025-2026'],
  ['Années académiques', '2', '2024-2025 et 2025-2026'],
  ['Identifiants attribués', '50 407', 'Email : matricule@unikin.ac.cd'],
  ["Passerelle d'activation", 'Opérationnelle', 'Activation par matricule + mot de passe'],
  ['Comptes activés à ce jour', '2', 'Début campagne S4']
];

const PHASE3 = [
  ['Tableau de bord étudiant (données réelles)', 'Fait'],
  ['Tableau de bord enseignant', 'Fait'],
  ['Tableau de bord admin', 'Fait'],
  ['Gestion des finances (grille tarifaire dynamique)', 'Fait'],
  ['Gestion des notes et délibérations', 'Fait'],
  ['Système de présences (codes de validation)', 'Fait'],
  ['Gestion des évaluations', 'Fait'],
  ['Emploi du temps', 'Fait'],
  ['Messagerie interne', 'Fait'],
  ['Bibliothèque numérique', 'Fait'],
  ['11 corrections UI/UX déployées', 'Fait']
];

const FACULTES = [
  { num: 1, nom: 'Faculté de Droit', abrev: 'FDROIT', dept: 8, prom: 29, etudiants: 10823, semaine: 'S4 (16-20 fév.)' },
  { num: 2, nom: 'Faculté des Sciences Économiques et de Gestion', abrev: 'FSEG', dept: 21, prom: 59, etudiants: 8530, semaine: 'S4 (16-20 fév.)' },
  { num: 3, nom: 'Faculté de Médecine', abrev: 'FMED', dept: 7, prom: 30, etudiants: 6525, semaine: 'S4 (16-20 fév.)' },
  { num: 4, nom: 'Faculté des Sciences et Technologies', abrev: 'FST', dept: 13, prom: 48, etudiants: 4758, semaine: 'S5 (23-27 fév.)' },
  { num: 5, nom: 'Faculté de Psychologie et Sc. de l\'Éducation', abrev: 'FPSE', dept: 6, prom: 23, etudiants: 3005, semaine: 'S5 (23-27 fév.)' },
  { num: 6, nom: 'Faculté des Sc. Sociales, Admin. et Politiques', abrev: 'FSSAP', dept: 5, prom: 19, etudiants: 2990, semaine: 'S5 (23-27 fév.)' },
  { num: 7, nom: 'Faculté des Lettres et Sciences Humaines', abrev: 'FLSH', dept: 26, prom: 67, etudiants: 2268, semaine: 'S6 (2-6 mars)' },
  { num: 8, nom: 'Faculté de Médecine Dentaire', abrev: 'FMEDD', dept: 3, prom: 21, etudiants: 1554, semaine: 'S6 (2-6 mars)' },
  { num: 9, nom: 'Faculté des Sc. Agronomiques et Environnement', abrev: 'FSAE', dept: 16, prom: 68, etudiants: 1510, semaine: 'S6 (2-6 mars)' },
  { num: 10, nom: 'Faculté des Sciences Pharmaceutiques', abrev: 'FSPHAR', dept: 2, prom: 18, etudiants: 1197, semaine: 'S7 (9-13 mars)' },
  { num: 11, nom: 'Fac. de Pétrole, Gaz et Énergies Renouvelables', abrev: 'FPGER', dept: 8, prom: 65, etudiants: 850, semaine: 'S7 (9-13 mars)' },
  { num: 12, nom: 'Faculté Polytechnique', abrev: 'FPOLY', dept: 12, prom: 34, etudiants: 744, semaine: 'S7 (9-13 mars)' },
  { num: 13, nom: 'Faculté de Médecine Vétérinaire', abrev: 'FMEDV', dept: 5, prom: 20, etudiants: 170, semaine: 'S8 (16-18 mars)' },
  { num: 14, nom: 'École des Sc. de la Population et Développement', abrev: 'ESPD', dept: 2, prom: 2, etudiants: 12, semaine: 'S8 (16-18 mars)' },
  { num: 15, nom: 'Faculté des Sciences', abrev: 'FSC', dept: 0, prom: 0, etudiants: 0, semaine: 'S8 (16-18 mars)' }
];

const SEMAINES = [
  {
    id: 'S4', titre: 'SEMAINE 4 - Lundi 16 au Vendredi 20 Février 2026',
    facultes: 'DROIT (10 823) / FSEG (8 530) / MÉDECINE (6 525)',
    total: '25 878 étudiants concernés (51% du total)',
    jours: [
      { jour: 'Lundi 16', titre: 'Formation des points focaux', actions: [
        { horaire: '8h00-10h00', action: 'Briefing d\'ouverture - Présentation de NEXUS aux doyens et vice-doyens des 3 facultés', public: 'Doyens, Vice-Doyens (6-9 personnes)' },
        { horaire: '10h00-12h00', action: 'Désignation des points focaux - 1 point focal par département (36 départements)', public: 'Secrétaires académiques' },
        { horaire: '14h00-16h30', action: 'Formation points focaux Session 1 : Connexion, navigation, gestion des étudiants, consultation des paiements', public: 'Points focaux FDROIT (8) + FSEG (21) + FMED (7) = 36 personnes' },
        { horaire: '16h30-17h00', action: 'Distribution des guides d\'utilisation imprimés', public: 'Points focaux' }
      ]},
      { jour: 'Mardi 17', titre: 'Formation enseignants', actions: [
        { horaire: '8h00-10h00', action: 'Formation enseignants FDROIT : Encodage des notes, gestion des présences, codes de validation', public: 'Enseignants Droit' },
        { horaire: '10h00-12h00', action: 'Formation enseignants FSEG : Même programme', public: 'Enseignants Sciences Éco' },
        { horaire: '14h00-16h00', action: 'Formation enseignants FMED : Même programme', public: 'Enseignants Médecine' },
        { horaire: '16h00-17h00', action: 'Formation personnel administratif : Gestion des bordereaux, vérification des paiements', public: 'Secrétariats des 3 facultés' }
      ]},
      { jour: 'Mercredi 18', titre: 'Formation avancée et préparation activation', actions: [
        { horaire: '8h00-10h00', action: 'Session avancée points focaux : Gestion des délibérations, export de données, rapports', public: 'Points focaux' },
        { horaire: '10h00-12h00', action: 'Préparation matériel campagne : Affiches, dépliants avec QR code et instructions d\'activation', public: 'Équipe technique' },
        { horaire: '14h00-16h00', action: 'Test grandeur nature : Simulation complète du workflow (inscription > notes > paiement > consultation)', public: 'Points focaux + enseignants volontaires' },
        { horaire: '16h00-17h00', action: 'Collecte des retours : Identification des problèmes éventuels', public: 'Tous' }
      ]},
      { jour: 'Jeudi 19', titre: 'LANCEMENT CAMPAGNE D\'ACTIVATION ÉTUDIANTS', actions: [
        { horaire: '8h00-9h00', action: 'Affichage dans les amphithéâtres des 3 facultés : affiches avec instructions d\'activation', public: 'Équipe logistique' },
        { horaire: '9h00-12h00', action: 'Stands d\'assistance FDROIT : Aide aux étudiants pour activer leurs comptes (matricule > mot de passe)', public: 'Étudiants Droit (10 823)' },
        { horaire: '9h00-12h00', action: 'Stands d\'assistance FSEG : Même accompagnement', public: 'Étudiants FSEG (8 530)' },
        { horaire: '9h00-12h00', action: 'Stands d\'assistance FMED : Même accompagnement', public: 'Étudiants Médecine (6 525)' },
        { horaire: '14h00-17h00', action: 'Continuation des activations - Suivi en temps réel du nombre d\'activations', public: 'Points focaux + équipe technique' }
      ]},
      { jour: 'Vendredi 20', titre: 'Suivi activations et support', actions: [
        { horaire: '8h00-12h00', action: 'Poursuite des activations avec stands permanents dans les 3 facultés', public: 'Étudiants retardataires' },
        { horaire: '14h00-16h00', action: 'Bilan S4 : Comptage des activations, identification des blocages', public: 'Équipe technique' },
        { horaire: '16h00-17h00', action: 'Correctifs urgents si nécessaire', public: 'Développeur' }
      ]}
    ],
    objectif: 'Objectif fin S4 : 15 000 - 20 000 comptes activés (30-40%)'
  },
  {
    id: 'S5', titre: 'SEMAINE 5 - Lundi 23 au Vendredi 27 Février 2026',
    facultes: 'FST (4 758) / FPSE (3 005) / FSSAP (2 990)',
    total: '10 753 nouveaux étudiants concernés + Évaluation et correctifs Vague 1',
    jours: [
      { jour: 'Lundi 23', titre: 'Évaluation Vague 1 + Formation points focaux Vague 2', actions: [
        { horaire: '8h00-10h00', action: 'Évaluation Vague 1 : Analyse des retours des 3 premières facultés, taux d\'activation, problèmes signalés', public: '' },
        { horaire: '10h00-12h00', action: 'Définition charge correctifs : Priorisation des bugs et améliorations demandées', public: '' },
        { horaire: '14h00-16h30', action: 'Formation points focaux FST + FPSE + FSSAP (24 départements, 24 points focaux)', public: '' },
        { horaire: '16h30-17h00', action: 'Correctifs en cours de déploiement', public: '' }
      ]},
      { jour: 'Mardi 24', titre: 'Formation enseignants Vague 2', actions: [
        { horaire: '8h00-10h00', action: 'Formation enseignants FST', public: '' },
        { horaire: '10h00-12h00', action: 'Formation enseignants FPSE', public: '' },
        { horaire: '14h00-16h00', action: 'Formation enseignants FSSAP', public: '' },
        { horaire: '16h00-17h00', action: 'Formation personnel administratif des 3 facultés', public: '' }
      ]},
      { jour: 'Mercredi 25', titre: 'Préparation + tests', actions: [
        { horaire: '8h00-12h00', action: 'Session avancée points focaux + test grandeur nature', public: '' },
        { horaire: '14h00-17h00', action: 'Déploiement correctifs Vague 1 + préparation campagne activation', public: '' }
      ]},
      { jour: 'Jeudi 26', titre: 'Lancement activation Vague 2', actions: [
        { horaire: '8h00-12h00', action: 'Stands d\'assistance FST + FPSE + FSSAP - activation comptes étudiants', public: '' },
        { horaire: '14h00-17h00', action: 'Continuation activations + support technique permanent', public: '' }
      ]},
      { jour: 'Vendredi 27', titre: 'Suivi + bilan', actions: [
        { horaire: '8h00-12h00', action: 'Poursuite activations + support Vague 1 (FDROIT, FSEG, FMED) encore en cours', public: '' },
        { horaire: '14h00-17h00', action: 'Bilan S5 : Total activations, correctifs appliqués, préparation S6', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S5 : 28 000 - 33 000 comptes activés (55-65%)'
  },
  {
    id: 'S6', titre: 'SEMAINE 6 - Lundi 2 au Vendredi 6 Mars 2026',
    facultes: 'FLSH (2 268) / FMEDD (1 554) / FSAE (1 510)',
    total: '5 332 nouveaux étudiants concernés',
    jours: [
      { jour: 'Lundi 2', titre: 'Évaluation Vague 2 + Formation points focaux Vague 3', actions: [
        { horaire: '8h00-10h00', action: 'Évaluation Vague 2 + bilan correctifs', public: '' },
        { horaire: '10h00-12h00', action: 'Charge de travail restante et planning', public: '' },
        { horaire: '14h00-16h30', action: 'Formation points focaux FLSH (26 dépt.) + FMEDD (3 dépt.) + FSAE (16 dépt.) = 45 points focaux', public: '' }
      ]},
      { jour: 'Mardi 3', titre: 'Formation enseignants Vague 3', actions: [
        { horaire: '8h00-10h00', action: 'Formation enseignants FLSH', public: '' },
        { horaire: '10h00-12h00', action: 'Formation enseignants FMEDD', public: '' },
        { horaire: '14h00-16h00', action: 'Formation enseignants FSAE', public: '' },
        { horaire: '16h00-17h00', action: 'Personnel administratif', public: '' }
      ]},
      { jour: 'Mercredi 4', titre: 'Tests + préparation', actions: [
        { horaire: '8h00-17h00', action: 'Session avancée, tests, préparation campagne, correctifs', public: '' }
      ]},
      { jour: 'Jeudi 5', titre: 'Activation Vague 3', actions: [
        { horaire: '8h00-17h00', action: 'Stands activation FLSH + FMEDD + FSAE', public: '' }
      ]},
      { jour: 'Vendredi 6', titre: 'Suivi + bilan', actions: [
        { horaire: '8h00-17h00', action: 'Activations, support, bilan S6', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S6 : 38 000 - 42 000 comptes activés (75-83%)'
  },
  {
    id: 'S7', titre: 'SEMAINE 7 - Lundi 9 au Vendredi 13 Mars 2026',
    facultes: 'FSPHAR (1 197) / FPGER (850) / FPOLY (744)',
    total: '2 791 nouveaux étudiants concernés',
    jours: [
      { jour: 'Lundi 9', titre: 'Évaluation Vague 3 + Formation points focaux Vague 4', actions: [
        { horaire: 'Journée', action: 'Évaluation Vague 3 + Formation points focaux FSPHAR + FPGER + FPOLY (22 dépt.)', public: '' }
      ]},
      { jour: 'Mardi 10', titre: 'Formation enseignants', actions: [
        { horaire: 'Journée', action: 'Formation enseignants des 3 facultés + personnel administratif', public: '' }
      ]},
      { jour: 'Mercredi 11', titre: 'Session avancée + tests', actions: [
        { horaire: 'Journée', action: 'Session avancée + tests + correctifs', public: '' }
      ]},
      { jour: 'Jeudi 12', titre: 'Activation Vague 4', actions: [
        { horaire: 'Journée', action: 'Activation comptes étudiants FSPHAR + FPGER + FPOLY', public: '' }
      ]},
      { jour: 'Vendredi 13', titre: 'Suivi + bilan', actions: [
        { horaire: 'Journée', action: 'Suivi activations + bilan S7', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S7 : 44 000 - 47 000 comptes activés (87-93%)'
  },
  {
    id: 'S8', titre: 'SEMAINE 8 - Lundi 16 au Mercredi 18 Mars 2026',
    facultes: 'FMEDV (170) / ESPD (12) / FSC (0)',
    total: 'Dernières facultés (182 étudiants restants)',
    jours: [
      { jour: 'Lundi 16', titre: 'Formation', actions: [
        { horaire: 'Journée', action: 'Formation points focaux + enseignants FMEDV + ESPD + FSC', public: '' }
      ]},
      { jour: 'Mardi 17', titre: 'Activation', actions: [
        { horaire: 'Journée', action: 'Activation comptes FMEDV + ESPD', public: '' }
      ]},
      { jour: 'Mercredi 18', titre: 'Bilan final activations', actions: [
        { horaire: 'Journée', action: 'Bilan final des activations - Toutes les 15 facultés couvertes', public: '' }
      ]},
      { jour: 'Jeu 19 - Ven 20', titre: 'Rattrapage', actions: [
        { horaire: 'Journée', action: 'Rattrapage et support pour les étudiants des vagues précédentes n\'ayant pas encore activé', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S8 : 48 000+ comptes activés (95%+)'
  }
];

const PHASES_FINALES = [
  { id: 'S9', titre: 'SEMAINE 9 - 23 au 27 Mars 2026', sousTitre: 'CONSOLIDATION ET CORRECTIFS GLOBAUX', actions: [
    { jour: 'Lundi 23', action: 'Audit global : État de chaque faculté, taux d\'adoption, problèmes récurrents' },
    { jour: 'Mardi 24', action: 'Sprint correctifs : Résolution de tous les bugs signalés pendant les 5 semaines de déploiement' },
    { jour: 'Mercredi 25', action: 'Optimisation performance : Amélioration des temps de chargement, cache, requêtes DB' },
    { jour: 'Jeudi 26', action: 'Formation de rappel pour les points focaux des facultés à faible adoption' },
    { jour: 'Vendredi 27', action: 'Campagne de rattrapage : Stands d\'activation dans les facultés < 90% d\'activation' }
  ]},
  { id: 'S10', titre: 'SEMAINE 10 - 30 Mars au 3 Avril 2026', sousTitre: 'IMPORT DES DONNÉES COMPLÉMENTAIRES', actions: [
    { jour: 'Lundi 30', action: 'Import des enseignants : récupération des listes, création des comptes, affectation aux cours' },
    { jour: 'Mardi 31', action: 'Import des cours : catalogues, crédits, semestres, affectation aux promotions' },
    { jour: 'Mercredi 1', action: 'Import des emplois du temps : horaires, salles, fréquences' },
    { jour: 'Jeudi 2', action: 'Import des notes historiques : résultats des années précédentes si disponibles' },
    { jour: 'Vendredi 3', action: 'Activation comptes enseignants + formation complémentaire à distance' }
  ]},
  { id: 'S11', titre: 'SEMAINE 11 - 6 au 10 Avril 2026', sousTitre: 'MODULES AVANCÉS ET INTÉGRATIONS', actions: [
    { jour: 'Lundi 6', action: 'Configuration du système de notification (email/SMS pour notes, annonces, rappels)' },
    { jour: 'Mardi 7', action: 'Mise en place du chatbot IA pour l\'assistance étudiante' },
    { jour: 'Mercredi 8', action: 'Intégration paiement mobile (Mobile Money, banques partenaires)' },
    { jour: 'Jeudi 9', action: 'Module analytics avancé pour le rectorat (tableaux de bord décisionnels)' },
    { jour: 'Vendredi 10', action: 'Tests d\'intégration globaux' }
  ]},
  { id: 'S12', titre: 'SEMAINE 12 - 13 au 17 Avril 2026', sousTitre: 'TESTS FINAUX ET DOCUMENTATION', actions: [
    { jour: 'Lundi 13', action: 'Test de charge : Simulation de 5 000+ connexions simultanées' },
    { jour: 'Mardi 14', action: 'Test de sécurité : Audit des vulnérabilités, test de pénétration' },
    { jour: 'Mercredi 15', action: 'Documentation finale : Guides utilisateurs (étudiant, enseignant, admin, point focal)' },
    { jour: 'Jeudi 16', action: 'Formation des formateurs : Les points focaux deviennent autonomes pour former les nouveaux' },
    { jour: 'Vendredi 17', action: 'Remise officielle des accès et documentation au rectorat' }
  ]},
  { id: 'S13', titre: 'SEMAINE 13 - 20 au 30 Avril 2026', sousTitre: 'LANCEMENT OFFICIEL ET TRANSITION', actions: [
    { jour: 'Lundi 20', action: 'Cérémonie de lancement officiel avec le Recteur' },
    { jour: 'Mar 21 - Ven 24', action: 'Période de rodage : Support intensif, corrections en temps réel' },
    { jour: 'Lun 27 - Mer 30', action: 'Transfert de compétences final à l\'équipe informatique UNIKIN' },
    { jour: 'Mercredi 30 Avril', action: 'FIN DU PROJET - Livraison définitive' }
  ]}
];

const JALONS = [
  { jalon: 'Plateforme en ligne', date: '30 Jan. 2026', statut: 'FAIT', indicateur: 'Accessible via IP publique' },
  { jalon: '50 407 étudiants intégrés', date: '12 Fév. 2026', statut: 'FAIT', indicateur: 'Base de données complète' },
  { jalon: '93 349 paiements importés', date: '12 Fév. 2026', statut: 'FAIT', indicateur: 'Historique financier disponible' },
  { jalon: 'Passerelle activation opérationnelle', date: '12 Fév. 2026', statut: 'FAIT', indicateur: 'Processus testé et fonctionnel' },
  { jalon: 'Vague 1 - 3 premières facultés', date: '20 Fév. 2026', statut: 'À VENIR', indicateur: '15 000+ activations' },
  { jalon: 'Vague 2 - 6 facultés cumulées', date: '27 Fév. 2026', statut: 'À VENIR', indicateur: '30 000+ activations' },
  { jalon: 'Vague 3 - 9 facultés cumulées', date: '6 Mars 2026', statut: 'À VENIR', indicateur: '40 000+ activations' },
  { jalon: 'Vague 4 - 12 facultés cumulées', date: '13 Mars 2026', statut: 'À VENIR', indicateur: '46 000+ activations' },
  { jalon: 'Vague 5 - 15/15 facultés couvertes', date: '18 Mars 2026', statut: 'À VENIR', indicateur: '48 000+ activations' },
  { jalon: 'Consolidation + correctifs', date: '27 Mars 2026', statut: 'À VENIR', indicateur: '95%+ d\'adoption' },
  { jalon: 'Import enseignants + cours', date: '3 Avril 2026', statut: 'À VENIR', indicateur: 'Workflows complets opérationnels' },
  { jalon: 'Tests finaux + documentation', date: '17 Avril 2026', statut: 'À VENIR', indicateur: 'Plateforme validée' },
  { jalon: 'Lancement officiel', date: '20 Avril 2026', statut: 'À VENIR', indicateur: 'Cérémonie avec le Recteur' },
  { jalon: 'Livraison définitive', date: '30 Avril 2026', statut: 'À VENIR', indicateur: 'Transfert de compétences achevé' }
];

const RESSOURCES = [
  ['Développeur/Technicien', '1', 'Support technique, correctifs, monitoring'],
  ['Formateur principal', '1', 'Animation des sessions de formation'],
  ['Assistants stands', '2-4 par faculté', 'Aide aux étudiants pour l\'activation'],
  ['Matériel imprimé', '~500 dépliants/faculté', 'Instructions d\'activation avec QR code'],
  ['Salle de formation', '1', 'Pour les sessions points focaux et enseignants'],
  ['Connexion internet', 'Stable', 'Indispensable pour les activations en masse']
];

const outDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: '1B3A5C',
  secondary: '2E6B9E',
  accent: 'D4A843',
  success: '2E7D32',
  headerBg: '1B3A5C',
  headerText: 'FFFFFF',
  altRowBg: 'EBF0F5',
  lightBg: 'F5F7FA',
  white: 'FFFFFF',
  black: '000000',
  gray: '666666'
};

const FONT = 'Helvetica';

// ============================================================================
// 1. WORD DOCUMENT
// ============================================================================
async function generateWord() {
  console.log('[WORD] Génération en cours...');

  const borderStyle = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  };

  function headerCell(text, width) {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: COLORS.headerText, font: FONT, size: 22 })], alignment: AlignmentType.CENTER })],
      shading: { type: ShadingType.SOLID, color: COLORS.headerBg },
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      borders: borderStyle
    });
  }

  function cell(text, opts = {}) {
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: text || '', bold: opts.bold || false, color: opts.color || COLORS.black, font: FONT, size: opts.size || 22 })],
        alignment: opts.align || AlignmentType.LEFT
      })],
      shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
      width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
      borders: borderStyle
    });
  }

  const children = [];

  // Title
  children.push(new Paragraph({ children: [new TextRun({ text: 'CALENDRIER NUMÉRISATION UNIKIN', bold: true, color: COLORS.primary, font: FONT, size: 40 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'NEXUS UNIKIN -- État d\'avancement et planification opérationnelle', color: COLORS.secondary, font: FONT, size: 26 })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }));

  // Meta info
  const metaItems = [
    ['Institution', META.institution],
    ['Début effectif du projet', META.debut],
    ['Date de mise à jour', META.miseAJour],
    ['Échéance finale', META.echeance]
  ];
  metaItems.forEach(([k, v]) => {
    children.push(new Paragraph({ children: [
      new TextRun({ text: k + ' : ', bold: true, font: FONT, size: 24 }),
      new TextRun({ text: v, font: FONT, size: 24 })
    ], spacing: { after: 60 } }));
  });

  // BILAN
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'BILAN AU 13 FÉVRIER 2026 -- CE QUI A ÉTÉ ACCOMPLI', bold: true, color: COLORS.primary, font: FONT, size: 30 })], heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));

  // Phase 1
  children.push(new Paragraph({ children: [new TextRun({ text: 'Phase 1 : Infrastructure et mise en ligne (Semaine 1 -- 30 jan. - 2 fév.) [FAIT]', bold: true, color: COLORS.secondary, font: FONT, size: 26 })], spacing: { after: 100 } }));
  const p1Rows = [new TableRow({ children: [headerCell('Élément', 30), headerCell('Statut', 15), headerCell('Détail', 55)] })];
  PHASE1.forEach(r => p1Rows.push(new TableRow({ children: [cell(r[0], { width: 30 }), cell(r[1], { width: 15, align: AlignmentType.CENTER, color: COLORS.success, bold: true }), cell(r[2], { width: 55 })] })));
  children.push(new Table({ rows: p1Rows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // Phase 2
  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Phase 2 : Intégration des données (Semaines 2-3 -- 3 fév. - 12 fév.) [FAIT]', bold: true, color: COLORS.secondary, font: FONT, size: 26 })], spacing: { after: 100 } }));
  const p2Rows = [new TableRow({ children: [headerCell('Élément', 35), headerCell('Quantité', 20), headerCell('Statut', 45)] })];
  PHASE2.forEach(r => p2Rows.push(new TableRow({ children: [cell(r[0], { width: 35, bold: true }), cell(r[1], { width: 20, align: AlignmentType.CENTER, bold: true }), cell(r[2], { width: 45 })] })));
  children.push(new Table({ rows: p2Rows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // Phase 3
  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Phase 3 : Modules fonctionnels (Semaines 2-3) [FAIT]', bold: true, color: COLORS.secondary, font: FONT, size: 26 })], spacing: { after: 100 } }));
  const p3Rows = [new TableRow({ children: [headerCell('Module', 70), headerCell('Statut', 30)] })];
  PHASE3.forEach(r => p3Rows.push(new TableRow({ children: [cell(r[0], { width: 70 }), cell(r[1], { width: 30, align: AlignmentType.CENTER, color: COLORS.success, bold: true })] })));
  children.push(new Table({ rows: p3Rows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // FACULTES
  children.push(new Paragraph({ children: [new TextRun({ text: 'DÉTAIL DES 15 FACULTÉS PAR EFFECTIF', bold: true, color: COLORS.primary, font: FONT, size: 30 })], heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
  const fRows = [new TableRow({ children: [headerCell('#', 5), headerCell('Faculté', 35), headerCell('Abrév.', 10), headerCell('Dépt.', 8), headerCell('Prom.', 8), headerCell('Étudiants', 14), headerCell('Semaine', 20)] })];
  FACULTES.forEach((f, i) => {
    const bg = i % 2 === 1 ? COLORS.altRowBg : undefined;
    fRows.push(new TableRow({ children: [
      cell(String(f.num), { width: 5, align: AlignmentType.CENTER, shading: bg }),
      cell(f.nom, { width: 35, shading: bg }),
      cell(f.abrev, { width: 10, align: AlignmentType.CENTER, shading: bg }),
      cell(String(f.dept), { width: 8, align: AlignmentType.CENTER, shading: bg }),
      cell(String(f.prom), { width: 8, align: AlignmentType.CENTER, shading: bg }),
      cell(f.etudiants.toLocaleString('fr-FR'), { width: 14, align: AlignmentType.CENTER, bold: true, shading: bg }),
      cell(f.semaine, { width: 20, align: AlignmentType.CENTER, shading: bg })
    ] }));
  });
  fRows.push(new TableRow({ children: [
    cell('', { width: 5 }), cell('TOTAL', { width: 35, bold: true }), cell('', { width: 10 }),
    cell('134', { width: 8, align: AlignmentType.CENTER, bold: true }),
    cell('503', { width: 8, align: AlignmentType.CENTER, bold: true }),
    cell('50 407', { width: 14, align: AlignmentType.CENTER, bold: true, color: COLORS.primary }),
    cell('', { width: 20 })
  ] }));
  children.push(new Table({ rows: fRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // SEMAINES DETAILLEES
  children.push(new Paragraph({ children: [new TextRun({ text: 'PLANIFICATION DÉTAILLÉE -- SEMAINES 4 À 13', bold: true, color: COLORS.primary, font: FONT, size: 30 })], heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));

  SEMAINES.forEach(sem => {
    children.push(new Paragraph({ spacing: { before: 300 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: sem.titre, bold: true, color: COLORS.headerText, font: FONT, size: 26 })], shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary }, spacing: { after: 60 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: 'Facultés : ' + sem.facultes, bold: true, font: FONT, size: 24 })], spacing: { after: 40 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: sem.total, italics: true, color: COLORS.gray, font: FONT, size: 22 })], spacing: { after: 120 } }));

    sem.jours.forEach(jour => {
      children.push(new Paragraph({ children: [new TextRun({ text: jour.jour + ' -- ' + jour.titre, bold: true, color: COLORS.secondary, font: FONT, size: 24 })], spacing: { before: 100, after: 60 } }));
      const jRows = [new TableRow({ children: [headerCell('Horaire', 15), headerCell('Action', 55), headerCell('Public cible', 30)] })];
      jour.actions.forEach(a => {
        jRows.push(new TableRow({ children: [
          cell(a.horaire, { width: 15, align: AlignmentType.CENTER }),
          cell(a.action, { width: 55 }),
          cell(a.public, { width: 30 })
        ] }));
      });
      children.push(new Table({ rows: jRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    });

    children.push(new Paragraph({ children: [new TextRun({ text: sem.objectif, bold: true, color: COLORS.accent, font: FONT, size: 24 })], spacing: { before: 120, after: 60 } }));
  });

  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Phases finales
  PHASES_FINALES.forEach(phase => {
    children.push(new Paragraph({ spacing: { before: 300 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: phase.titre, bold: true, color: COLORS.headerText, font: FONT, size: 26 })], shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary }, spacing: { after: 60 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: phase.sousTitre, bold: true, color: COLORS.secondary, font: FONT, size: 24 })], spacing: { after: 100 } }));
    const phRows = [new TableRow({ children: [headerCell('Jour', 20), headerCell('Action', 80)] })];
    phase.actions.forEach(a => {
      phRows.push(new TableRow({ children: [cell(a.jour, { width: 20, bold: true }), cell(a.action, { width: 80 })] }));
    });
    children.push(new Table({ rows: phRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  });

  // Page break
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // JALONS
  children.push(new Paragraph({ children: [new TextRun({ text: 'JALONS ET INDICATEURS DE SUIVI', bold: true, color: COLORS.primary, font: FONT, size: 30 })], heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
  const jlRows = [new TableRow({ children: [headerCell('Jalon', 30), headerCell('Date', 15), headerCell('Statut', 15), headerCell('Indicateur de réussite', 40)] })];
  JALONS.forEach(j => {
    const isFait = j.statut === 'FAIT';
    jlRows.push(new TableRow({ children: [
      cell(j.jalon, { width: 30, bold: true }),
      cell(j.date, { width: 15, align: AlignmentType.CENTER }),
      cell(j.statut, { width: 15, align: AlignmentType.CENTER, bold: true, color: isFait ? COLORS.success : COLORS.secondary }),
      cell(j.indicateur, { width: 40 })
    ] }));
  });
  children.push(new Table({ rows: jlRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // RESSOURCES
  children.push(new Paragraph({ spacing: { before: 300 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'RESSOURCES NÉCESSAIRES PAR SEMAINE DE DÉPLOIEMENT', bold: true, color: COLORS.primary, font: FONT, size: 30 })], heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
  const rRows = [new TableRow({ children: [headerCell('Ressource', 30), headerCell('Quantité', 25), headerCell('Rôle', 45)] })];
  RESSOURCES.forEach(r => rRows.push(new TableRow({ children: [cell(r[0], { width: 30, bold: true }), cell(r[1], { width: 25, align: AlignmentType.CENTER }), cell(r[2], { width: 45 })] })));
  children.push(new Table({ rows: rRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // Notes
  children.push(new Paragraph({ spacing: { before: 300 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'NOTES IMPORTANTES', bold: true, color: COLORS.primary, font: FONT, size: 30 })], heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
  const notes = [
    'Les 3 plus grosses facultés (Droit, Éco, Médecine) représentent 51% des étudiants -- Traitées en priorité S4.',
    'Le rythme de 3 facultés/semaine est soutenable car les formations sont standardisées.',
    'Le jeudi est le jour de lancement des activations pour chaque vague, laissant vendredi pour le suivi.',
    'Les correctifs sont déployés en continu -- pas besoin d\'attendre une fenêtre de maintenance.',
    'La semaine 9 est un tampon pour absorber tout retard et consolider avant la phase finale.',
    'Délai respecté : 30 janvier > 30 avril = exactement 3 mois (13 semaines).'
  ];
  notes.forEach((n, i) => {
    children.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${n}`, font: FONT, size: 22 })], spacing: { after: 60 } }));
  });

  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }],
    creator: 'NEXUS UNIKIN',
    title: 'Calendrier Numérisation UNIKIN',
    description: 'État d\'avancement et planification opérationnelle'
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(outDir, 'CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN.docx');
  fs.writeFileSync(filePath, buffer);
  console.log('[WORD] Fichier généré : ' + filePath);
  return filePath;
}

// ============================================================================
// 2. PDF DOCUMENT
// ============================================================================
async function generatePDF() {
  console.log('[PDF] Génération en cours...');

  const filePath = path.join(outDir, 'CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN.pdf');
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 }, bufferPages: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const pageW = doc.page.width - 80;
  let y = 40;

  function checkPage(needed = 60) {
    if (y + needed > doc.page.height - 50) {
      doc.addPage();
      y = 40;
    }
  }

  function drawTitle(text, size = 20, color = '#1B3A5C') {
    checkPage(40);
    doc.font('Helvetica-Bold').fontSize(size).fillColor(color).text(text, 40, y, { width: pageW, align: 'center' });
    y += size + 14;
  }

  function drawSubTitle(text, size = 14, color = '#2E6B9E') {
    checkPage(30);
    doc.font('Helvetica-Bold').fontSize(size).fillColor(color).text(text, 40, y, { width: pageW });
    y += size + 10;
  }

  function drawText(text, opts = {}) {
    checkPage(20);
    doc.font(opts.bold ? 'Helvetica-Bold' : opts.italic ? 'Helvetica-Oblique' : 'Helvetica')
      .fontSize(opts.size || 10).fillColor(opts.color || '#333333')
      .text(text, opts.x || 40, y, { width: opts.width || pageW, align: opts.align || 'left' });
    y += (opts.size || 10) + (opts.spacing || 6);
  }

  function drawTable(headers, rows, colWidths) {
    const totalW = colWidths.reduce((a, b) => a + b, 0);
    const rowH = 20;
    const headerH = 22;

    checkPage(headerH + rowH * Math.min(rows.length, 3));

    // Header
    let x = 40;
    doc.save();
    doc.rect(x, y, totalW, headerH).fill('#1B3A5C');
    headers.forEach((h, i) => {
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
        .text(h, x + 3, y + 5, { width: colWidths[i] - 6, align: 'center' });
      x += colWidths[i];
    });
    doc.restore();
    y += headerH;

    // Rows
    rows.forEach((row, ri) => {
      checkPage(rowH);
      x = 40;
      const bg = ri % 2 === 1 ? '#EBF0F5' : '#FFFFFF';
      doc.save();
      doc.rect(x, y, totalW, rowH).fill(bg);
      row.forEach((cell, ci) => {
        doc.font('Helvetica').fontSize(8).fillColor('#333333')
          .text(String(cell || ''), x + 3, y + 5, { width: colWidths[ci] - 6, align: ci === 0 ? 'left' : 'center' });
        x += colWidths[ci];
      });
      doc.restore();
      y += rowH;
    });

    // Border
    doc.save();
    doc.rect(40, y - headerH - rowH * rows.length, totalW, headerH + rowH * rows.length).stroke('#CCCCCC');
    doc.restore();
    y += 8;
  }

  function drawBanner(text) {
    checkPage(30);
    doc.save();
    doc.rect(40, y, pageW, 24).fill('#1B3A5C');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF').text(text, 45, y + 6, { width: pageW - 10 });
    doc.restore();
    y += 32;
  }

  // ---- TITLE ----
  drawTitle('CALENDRIER NUMÉRISATION UNIKIN', 22);
  drawTitle('NEXUS UNIKIN', 16, '#2E6B9E');
  drawText('État d\'avancement et planification opérationnelle', { align: 'center', italic: true, size: 11, color: '#666666' });
  y += 10;

  // Meta
  const metaItems = [
    ['Institution', META.institution],
    ['Début effectif', META.debut],
    ['Mise à jour', META.miseAJour],
    ['Échéance finale', META.echeance]
  ];
  metaItems.forEach(([k, v]) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#333333').text(k + ' : ', 40, y, { continued: true });
    doc.font('Helvetica').text(v);
    y += 16;
  });
  y += 10;

  // BILAN
  drawSubTitle('BILAN AU 13 FÉVRIER 2026 -- CE QUI A ÉTÉ ACCOMPLI');

  // Phase 1
  drawText('Phase 1 : Infrastructure et mise en ligne (Semaine 1) [FAIT]', { bold: true, size: 11, color: '#2E6B9E' });
  drawTable(['Élément', 'Statut', 'Détail'], PHASE1, [160, 70, pageW - 230]);

  // Phase 2
  drawText('Phase 2 : Intégration des données (Semaines 2-3) [FAIT]', { bold: true, size: 11, color: '#2E6B9E' });
  drawTable(['Élément', 'Quantité', 'Statut'], PHASE2, [170, 90, pageW - 260]);

  // Phase 3
  drawText('Phase 3 : Modules fonctionnels (Semaines 2-3) [FAIT]', { bold: true, size: 11, color: '#2E6B9E' });
  drawTable(['Module', 'Statut'], PHASE3, [pageW - 80, 80]);

  // Page break
  doc.addPage();
  y = 40;

  // FACULTES
  drawSubTitle('DÉTAIL DES 15 FACULTÉS PAR EFFECTIF');
  const fData = FACULTES.map(f => [String(f.num), f.nom, f.abrev, String(f.dept), String(f.prom), f.etudiants.toLocaleString('fr-FR'), f.semaine]);
  fData.push(['', 'TOTAL', '', '134', '503', '50 407', '']);
  drawTable(['#', 'Faculté', 'Abrév.', 'Dépt.', 'Prom.', 'Étudiants', 'Semaine'], fData, [25, 185, 55, 40, 40, 60, pageW - 405]);

  // PLANNING DETAILLE
  doc.addPage();
  y = 40;
  drawSubTitle('PLANIFICATION DÉTAILLÉE -- SEMAINES 4 À 13', 16);

  SEMAINES.forEach(sem => {
    drawBanner(sem.id + ' -- ' + sem.titre.split(' - ')[1]);
    drawText('Facultés : ' + sem.facultes, { bold: true, size: 10 });
    drawText(sem.total, { italic: true, size: 9, color: '#666666' });

    sem.jours.forEach(jour => {
      checkPage(40);
      drawText(jour.jour + ' -- ' + jour.titre, { bold: true, size: 10, color: '#2E6B9E' });
      const actions = jour.actions.map(a => [a.horaire, a.action, a.public || '']);
      drawTable(['Horaire', 'Action', 'Public cible'], actions, [70, pageW - 200, 130]);
    });

    drawText(sem.objectif, { bold: true, size: 10, color: '#D4A843', spacing: 10 });
  });

  // Phases finales
  PHASES_FINALES.forEach(phase => {
    drawBanner(phase.id + ' -- ' + phase.sousTitre);
    const actions = phase.actions.map(a => [a.jour, a.action]);
    drawTable(['Jour', 'Action'], actions, [100, pageW - 100]);
  });

  // JALONS
  doc.addPage();
  y = 40;
  drawSubTitle('JALONS ET INDICATEURS DE SUIVI', 16);
  const jData = JALONS.map(j => [j.jalon, j.date, j.statut, j.indicateur]);
  drawTable(['Jalon', 'Date', 'Statut', 'Indicateur'], jData, [140, 80, 60, pageW - 280]);

  // RESSOURCES
  y += 10;
  drawSubTitle('RESSOURCES NÉCESSAIRES PAR SEMAINE', 16);
  drawTable(['Ressource', 'Quantité', 'Rôle'], RESSOURCES, [130, 120, pageW - 250]);

  // Notes
  y += 10;
  drawSubTitle('NOTES IMPORTANTES', 14);
  const notes = [
    '1. Les 3 plus grosses facultés (Droit, Éco, Médecine) représentent 51% des étudiants.',
    '2. Le rythme de 3 facultés/semaine est soutenable car les formations sont standardisées.',
    '3. Le jeudi est le jour de lancement des activations pour chaque vague.',
    '4. Les correctifs sont déployés en continu.',
    '5. La semaine 9 est un tampon pour absorber tout retard.',
    '6. Délai respecté : 30 janvier > 30 avril = exactement 3 mois (13 semaines).'
  ];
  notes.forEach(n => drawText(n, { size: 9 }));

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      console.log('[PDF] Fichier généré : ' + filePath);
      resolve(filePath);
    });
  });
}

// ============================================================================
// 3. POWERPOINT DOCUMENT
// ============================================================================
async function generatePPTX() {
  console.log('[PPTX] Génération en cours...');

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'A4', width: 10, height: 7.5 });
  pptx.layout = 'A4';
  pptx.title = 'Calendrier de Déploiement - NEXUS UNIKIN';
  pptx.author = 'NEXUS UNIKIN';

  const BG_DARK = '1B3A5C';
  const BG_LIGHT = 'F5F7FA';
  const TX_WHITE = 'FFFFFF';
  const TX_DARK = '333333';
  const TX_ACCENT = 'D4A843';
  const TX_BLUE = '2E6B9E';
  const FNT = 'Helvetica';

  function addSlideTitle(text, subtitle) {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    slide.addText(text, { x: 0.5, y: 2.0, w: 9.0, h: 1.2, fontSize: 30, bold: true, color: TX_WHITE, align: 'center', fontFace: FNT });
    if (subtitle) {
      slide.addText(subtitle, { x: 0.5, y: 3.4, w: 9.0, h: 0.8, fontSize: 18, color: TX_ACCENT, align: 'center', fontFace: FNT });
    }
    return slide;
  }

  function addContentSlide(title) {
    const slide = pptx.addSlide();
    slide.background = { color: TX_WHITE };
    slide.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', { x: 0, y: 0, w: 10, h: 0.7, fill: { color: BG_DARK } });
    slide.addText(title, { x: 0.3, y: 0.1, w: 9.4, h: 0.5, fontSize: 17, bold: true, color: TX_WHITE, fontFace: FNT });
    return slide;
  }

  // ---- SLIDE 1: Title ----
  const s1 = addSlideTitle('CALENDRIER NUMÉRISATION UNIKIN', 'NEXUS UNIKIN -- Université de Kinshasa');
  s1.addText('État d\'avancement et planification opérationnelle', { x: 0.5, y: 4.3, w: 9.0, h: 0.5, fontSize: 14, color: 'AAAAAA', align: 'center', fontFace: FNT, italic: true });
  s1.addText([
    { text: 'Début : ', options: { bold: true, color: TX_WHITE } },
    { text: '30 Janvier 2026   |   ', options: { color: 'CCCCCC' } },
    { text: 'Échéance : ', options: { bold: true, color: TX_WHITE } },
    { text: '30 Avril 2026   |   ', options: { color: 'CCCCCC' } },
    { text: 'Mise à jour : ', options: { bold: true, color: TX_WHITE } },
    { text: '13 Février 2026', options: { color: 'CCCCCC' } }
  ], { x: 0.5, y: 5.5, w: 9.0, h: 0.4, fontSize: 11, align: 'center', fontFace: FNT });

  // ---- SLIDE 2: Chiffres clés ----
  const s2 = addContentSlide('BILAN AU 13 FÉVRIER 2026 -- CHIFFRES CLÉS');
  const stats = [
    { val: '50 407', label: 'Étudiants intégrés' },
    { val: '15', label: 'Facultés' },
    { val: '134', label: 'Départements' },
    { val: '503', label: 'Promotions' },
    { val: '93 349', label: 'Paiements importés' },
    { val: '100%', label: 'Plateforme en ligne' }
  ];
  stats.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const yPos = 1.2 + row * 2.8;
    s2.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', { x, y: yPos, w: 2.8, h: 2.2, fill: { color: BG_LIGHT }, rectRadius: 0.1 });
    s2.addText(s.val, { x, y: yPos + 0.3, w: 2.8, h: 1.0, fontSize: 34, bold: true, color: BG_DARK, align: 'center', fontFace: FNT });
    s2.addText(s.label, { x, y: yPos + 1.3, w: 2.8, h: 0.6, fontSize: 13, color: TX_DARK, align: 'center', fontFace: FNT });
  });

  // ---- SLIDE 3: Phases accomplies ----
  const s3 = addContentSlide('CE QUI A ÉTÉ ACCOMPLI (Semaines 1-3)');
  const phases = [
    { phase: 'Phase 1 : Infrastructure', items: ['Serveur VPS provisionné', 'Next.js 14 + PostgreSQL + PM2 + Nginx', 'Système d\'authentification JWT', 'Compte Super Admin créé'] },
    { phase: 'Phase 2 : Intégration données', items: ['50 407 étudiants avec matricules', '93 349 paiements (USD + CDF)', '15 facultés, 134 départements, 503 promotions', 'Passerelle d\'activation opérationnelle'] },
    { phase: 'Phase 3 : Modules', items: ['Tableaux de bord (étudiant, enseignant, admin)', 'Finances, notes, présences, évaluations', 'Emploi du temps, messagerie, bibliothèque', '11 corrections UI/UX déployées'] }
  ];
  phases.forEach((p, i) => {
    const x = 0.3 + i * 3.2;
    s3.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', { x, y: 1.0, w: 3.0, h: 0.5, fill: { color: TX_BLUE }, rectRadius: 0.05 });
    s3.addText(p.phase, { x, y: 1.05, w: 3.0, h: 0.4, fontSize: 12, bold: true, color: TX_WHITE, align: 'center', fontFace: FNT });
    p.items.forEach((item, j) => {
      s3.addText('> ' + item, { x: x + 0.1, y: 1.7 + j * 0.45, w: 2.8, h: 0.4, fontSize: 10, color: TX_DARK, fontFace: FNT });
    });
    s3.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', { x: x + 0.5, y: 3.5, w: 2.0, h: 0.35, fill: { color: '2E7D32' }, rectRadius: 0.05 });
    s3.addText('FAIT', { x: x + 0.5, y: 3.52, w: 2.0, h: 0.3, fontSize: 11, bold: true, color: TX_WHITE, align: 'center', fontFace: FNT });
  });

  // ---- SLIDE 4: Facultés ----
  const s4 = addContentSlide('15 FACULTÉS -- RÉPARTITION DES EFFECTIFS');
  const facTableRows = FACULTES.map(f => [
    { text: String(f.num), options: { align: 'center', fontSize: 9 } },
    { text: f.abrev, options: { bold: true, fontSize: 9 } },
    { text: String(f.dept), options: { align: 'center', fontSize: 9 } },
    { text: f.etudiants.toLocaleString('fr-FR'), options: { align: 'center', bold: true, fontSize: 9 } },
    { text: f.semaine, options: { align: 'center', fontSize: 8 } }
  ]);
  facTableRows.push([
    { text: '', options: {} },
    { text: 'TOTAL', options: { bold: true, fontSize: 9 } },
    { text: '134', options: { align: 'center', bold: true, fontSize: 9 } },
    { text: '50 407', options: { align: 'center', bold: true, fontSize: 9, color: BG_DARK } },
    { text: '', options: {} }
  ]);
  s4.addTable(
    [[
      { text: '#', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, align: 'center', fontSize: 9 } },
      { text: 'Faculté', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, fontSize: 9 } },
      { text: 'Dépt.', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, align: 'center', fontSize: 9 } },
      { text: 'Étudiants', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, align: 'center', fontSize: 9 } },
      { text: 'Semaine', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, align: 'center', fontSize: 9 } }
    ], ...facTableRows],
    { x: 0.5, y: 1.0, w: 9.0, colW: [0.5, 3.0, 0.8, 1.2, 3.5], border: { pt: 0.5, color: 'CCCCCC' }, rowH: 0.35, autoPage: false }
  );

  // ---- SLIDE 5-9: Semaine détails ----
  SEMAINES.forEach(sem => {
    const slide = addContentSlide(sem.id + ' -- ' + sem.titre.split(' - ')[1]);
    slide.addText('Facultés : ' + sem.facultes, { x: 0.3, y: 0.85, w: 9.4, h: 0.35, fontSize: 12, bold: true, color: TX_DARK, fontFace: FNT });
    slide.addText(sem.total, { x: 0.3, y: 1.15, w: 9.4, h: 0.3, fontSize: 10, italic: true, color: '888888', fontFace: FNT });

    let yPos = 1.6;
    sem.jours.forEach(jour => {
      if (yPos > 6.5) return;
      slide.addText(jour.jour + ' -- ' + jour.titre, { x: 0.3, y: yPos, w: 9.4, h: 0.3, fontSize: 10, bold: true, color: TX_BLUE, fontFace: FNT });
      yPos += 0.35;
      jour.actions.forEach(a => {
        if (yPos > 6.8) return;
        slide.addText(a.horaire + '  |  ' + a.action, { x: 0.5, y: yPos, w: 9.0, h: 0.25, fontSize: 8.5, color: TX_DARK, fontFace: FNT });
        yPos += 0.28;
      });
      yPos += 0.1;
    });

    slide.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', { x: 0.3, y: 6.9, w: 9.4, h: 0.35, fill: { color: BG_LIGHT }, rectRadius: 0.05 });
    slide.addText(sem.objectif, { x: 0.5, y: 6.92, w: 9.0, h: 0.3, fontSize: 11, bold: true, color: BG_DARK, fontFace: FNT });
  });

  // ---- SLIDE 10: Phases finales ----
  const s10 = addContentSlide('SEMAINES 9 À 13 -- PHASES FINALES');
  PHASES_FINALES.forEach((phase, i) => {
    const yPos = 1.0 + i * 1.2;
    s10.addShape(pptx.ShapeType ? pptx.ShapeType.rect : 'rect', { x: 0.3, y: yPos, w: 1.5, h: 0.9, fill: { color: BG_DARK }, rectRadius: 0.05 });
    s10.addText(phase.id, { x: 0.3, y: yPos + 0.05, w: 1.5, h: 0.4, fontSize: 15, bold: true, color: TX_WHITE, align: 'center', fontFace: FNT });
    s10.addText(phase.titre.split(' - ')[1] || '', { x: 0.3, y: yPos + 0.45, w: 1.5, h: 0.3, fontSize: 7, color: TX_ACCENT, align: 'center', fontFace: FNT });
    s10.addText(phase.sousTitre, { x: 2.0, y: yPos, w: 3.0, h: 0.35, fontSize: 11, bold: true, color: TX_BLUE, fontFace: FNT });
    const summary = phase.actions.slice(0, 3).map(a => a.action.substring(0, 60) + (a.action.length > 60 ? '...' : '')).join(' | ');
    s10.addText(summary, { x: 2.0, y: yPos + 0.35, w: 7.5, h: 0.45, fontSize: 8, color: TX_DARK, fontFace: FNT });
  });

  // ---- SLIDE 11: Jalons ----
  const s11 = addContentSlide('JALONS ET INDICATEURS DE SUIVI');
  const jalonRows = JALONS.map(j => [
    { text: j.jalon, options: { fontSize: 8.5 } },
    { text: j.date, options: { align: 'center', fontSize: 8.5 } },
    { text: j.statut, options: { align: 'center', bold: true, fontSize: 8.5, color: j.statut === 'FAIT' ? '2E7D32' : TX_BLUE } },
    { text: j.indicateur, options: { fontSize: 8.5 } }
  ]);
  s11.addTable(
    [[
      { text: 'Jalon', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, fontSize: 9 } },
      { text: 'Date', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, align: 'center', fontSize: 9 } },
      { text: 'Statut', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, align: 'center', fontSize: 9 } },
      { text: 'Indicateur', options: { bold: true, color: TX_WHITE, fill: { color: BG_DARK }, fontSize: 9 } }
    ], ...jalonRows],
    { x: 0.3, y: 1.0, w: 9.4, colW: [2.5, 1.3, 1.0, 4.6], border: { pt: 0.5, color: 'CCCCCC' }, rowH: 0.38, autoPage: false }
  );

  // ---- SLIDE 12: Conclusion ----
  const s12 = addSlideTitle('NEXUS UNIKIN', '13 semaines pour transformer la gestion universitaire');
  s12.addText([
    { text: '50 407 étudiants', options: { fontSize: 16, bold: true, color: TX_ACCENT } },
    { text: '  |  ', options: { fontSize: 16, color: '888888' } },
    { text: '15 facultés', options: { fontSize: 16, bold: true, color: TX_ACCENT } },
    { text: '  |  ', options: { fontSize: 16, color: '888888' } },
    { text: '93 349 paiements', options: { fontSize: 16, bold: true, color: TX_ACCENT } }
  ], { x: 0.5, y: 4.8, w: 9.0, h: 0.5, align: 'center', fontFace: FNT });
  s12.addText('30 Janvier - 30 Avril 2026', { x: 0.5, y: 5.8, w: 9.0, h: 0.4, fontSize: 13, color: '888888', align: 'center', fontFace: FNT });

  const filePath = path.join(outDir, 'CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN.pptx');
  await pptx.writeFile({ fileName: filePath });
  console.log('[PPTX] Fichier généré : ' + filePath);
  return filePath;
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('=== Génération des documents CALENDRIER DÉPLOIEMENT NEXUS UNIKIN ===\n');

  try {
    await generateWord();
    await generatePDF();
    await generatePPTX();

    console.log('\n=== TERMINÉ ===');
    console.log('Fichiers générés dans : ' + outDir);
    console.log('  - CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN.docx');
    console.log('  - CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN.pdf');
    console.log('  - CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN.pptx');
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
}

main();

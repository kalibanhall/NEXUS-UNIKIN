const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ============================================================================
// DATA UPDATED 25 FÉVRIER 2026
// ============================================================================

const META = {
  institution: 'Université de Kinshasa (UNIKIN)',
  debut: 'Jeudi 30 Janvier 2026',
  miseAJour: 'Mardi 25 Février 2026',
  echeance: 'Mercredi 30 Avril 2026 (3 mois)'
};

const PHASE1 = [
  ['Serveur VPS provisionné', 'Fait', 'Serveur dédié, Ubuntu, 32 Go RAM'],
  ['Plateforme déployée en ligne', 'Fait', 'Next.js 14 + PostgreSQL + PM2 + Nginx'],
  ['Base de données configurée', 'Fait', '20 tables, schéma complet opérationnel'],
  ["Système d'authentification", 'Fait', 'JWT, sessions sécurisées, gestion des rôles'],
  ['Compte Super Admin créé', 'Fait', "Accès total à l'administration"]
];

const PHASE2 = [
  ['Étudiants intégrés', 'Plus de 2 000', 'Importés avec matricules et données complètes'],
  ['Facultés encodées', '15', 'Toutes les facultés UNIKIN'],
  ['Départements encodés', '134', 'Tous les départements'],
  ['Promotions créées', '503', 'L1 à D4, tous niveaux'],
  ['Paiements importés', '66 435+', 'USD + CDF, 2023-2024, 2024-2025 et 2025-2026'],
  ['Années académiques', '3', '2023-2024, 2024-2025 et 2025-2026'],
  ['Identifiants attribués', 'Tous', 'Email : matricule@unikin.ac.cd'],
  ["Passerelle d'activation", 'Opérationnelle', 'Activation par matricule + mot de passe / date de naissance']
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

const PHASE4_PHARMACIE = [
  ['Enseignants UNIKIN intégrés', '1 131', 'Personnel académique toutes facultés avec grades (données 2023-2024)'],
  ['Enseignants Pharmacie avec matricule ESU', '89', 'Matricules ESU vérifiés et attribués'],
  ['Cours PharmD créés', '88', 'B1 à P3, cours obligatoires et optionnels'],
  ['Cours LTP créés', '48', 'L1 à L3, filières PTP et PIP'],
  ['Total cours Pharmacie', '136+', '7 départements, 19 promotions'],
  ['Jurys de délibération configurés', '9', 'B1-P3 PharmD + L1-L3 LTP'],
  ['Membres de jury assignés', '27', 'Président, Secrétaire, Membre par jury'],
  ['Critères de délibération définis', 'Oui', 'Moyennes, crédits, mentions, règles'],
  ['Étudiants Pharmacie mis à jour', '1 141+', 'Données de paiement et inscriptions'],
  ['Activation enseignants', 'Opérationnelle', 'Matricule + date de naissance']
];

const FACULTES = [
  { num: 1, nom: 'Faculté de Droit', abrev: 'FDROIT', dept: 8, prom: 29 },
  { num: 2, nom: 'Faculté des Sciences Économiques et de Gestion', abrev: 'FSEG', dept: 21, prom: 59 },
  { num: 3, nom: 'Faculté de Médecine', abrev: 'FMED', dept: 7, prom: 30 },
  { num: 4, nom: 'Faculté des Sciences et Technologies', abrev: 'FST', dept: 13, prom: 48 },
  { num: 5, nom: 'Faculté de Psychologie et Sc. de l\'Éducation', abrev: 'FPSE', dept: 6, prom: 23 },
  { num: 6, nom: 'Faculté des Sc. Sociales, Admin. et Politiques', abrev: 'FSSAP', dept: 5, prom: 19 },
  { num: 7, nom: 'Faculté des Lettres et Sciences Humaines', abrev: 'FLSH', dept: 26, prom: 67 },
  { num: 8, nom: 'Faculté de Médecine Dentaire', abrev: 'FMEDD', dept: 3, prom: 21 },
  { num: 9, nom: 'Faculté des Sc. Agronomiques et Environnement', abrev: 'FSAE', dept: 16, prom: 68 },
  { num: 10, nom: 'Faculté des Sciences Pharmaceutiques', abrev: 'FSPHAR', dept: 7, prom: 19 },
  { num: 11, nom: 'Fac. de Pétrole, Gaz et Énergies Renouvelables', abrev: 'FPGER', dept: 8, prom: 65 },
  { num: 12, nom: 'Faculté Polytechnique', abrev: 'FPOLY', dept: 12, prom: 34 },
  { num: 13, nom: 'Faculté de Médecine Vétérinaire', abrev: 'FMEDV', dept: 5, prom: 20 },
  { num: 14, nom: 'École des Sc. de la Population et Développement', abrev: 'ESPD', dept: 2, prom: 2 },
  { num: 15, nom: 'Faculté des Sciences', abrev: 'FSC', dept: 0, prom: 0 }
];

const SEMAINES_PASSEES = [
  {
    id: 'S1', titre: 'SEMAINE 1 — 30 Janvier au 2 Février 2026',
    statut: 'FAIT',
    description: 'Infrastructure et mise en ligne',
    actions: [
      'Provisionnement serveur VPS (Ubuntu, 32 Go RAM)',
      'Déploiement Next.js 14 + PostgreSQL + PM2 + Nginx',
      'Configuration base de données (schéma complet)',
      'Système d\'authentification JWT',
      'Création compte Super Admin'
    ]
  },
  {
    id: 'S2-S3', titre: 'SEMAINES 2-3 — 3 au 14 Février 2026',
    statut: 'FAIT',
    description: 'Intégration des données + Modules fonctionnels',
    actions: [
      'Import de plus de 2 000 étudiants avec matricules',
      'Encodage des 15 facultés, 134 départements, 503 promotions',
      'Import des paiements (USD + CDF)',
      'Attribution des identifiants (matricule@unikin.ac.cd)',
      'Développement de tous les modules fonctionnels',
      'Passerelle d\'activation opérationnelle',
      '11 corrections UI/UX déployées'
    ]
  },
  {
    id: 'S4', titre: 'SEMAINE 4 — 18 au 25 Février 2026',
    statut: 'FAIT',
    description: 'Intégration données Faculté Pilote — Sciences Pharmaceutiques',
    actions: [
      'Import de 1 131 enseignants UNIKIN (toutes facultés) avec grades académiques',
      'Mise à jour des 89 enseignants Pharmacie avec matricules ESU',
      'Création de 88 cours PharmD (B1-P3) + 48 cours LTP (L1-L3)',
      'Configuration de 9 jurys de délibération (6 PharmD + 3 LTP)',
      'Assignation de 27 membres de jury (président, secrétaire, membre)',
      'Définition des critères de délibération (moyennes, crédits, mentions)',
      'Import et mise à jour de 1 141+ étudiants Pharmacie',
      'Implémentation de l\'activation enseignants (matricule + date de naissance)',
      'Migration emails enseignants vers matricule@unikin.ac.cd'
    ]
  }
];

const PLANNING_FUTUR = [
  {
    id: 'S5', titre: 'SEMAINE 5 — Vendredi 27 Février 2026',
    statut: 'À VENIR',
    sousTitre: 'PREMIERS TESTS EN SITUATION RÉELLE',
    jours: [
      { jour: 'Lundi 24 - Jeudi 26', titre: 'Préparation des tests', actions: [
        { horaire: 'Journée', action: 'Vérification finale des données Pharmacie (cours, enseignants, étudiants)', public: 'Équipe technique' },
        { horaire: 'Journée', action: 'Configuration de l\'environnement de test avec une promotion pilote', public: 'Développeur' },
        { horaire: 'Journée', action: 'Préparation des scénarios de test (inscription, notes, présences, paiements)', public: 'Équipe technique' }
      ]},
      { jour: 'Vendredi 27', titre: 'TESTS EN SITUATION RÉELLE', actions: [
        { horaire: '8h00-10h00', action: 'Briefing avec les participants : présentation de NEXUS et objectifs du test', public: 'Étudiants + Enseignants promotion pilote' },
        { horaire: '10h00-12h00', action: 'Test activation comptes : étudiants activent leurs comptes via matricule', public: 'Étudiants promotion pilote' },
        { horaire: '12h00-13h00', action: 'Test activation enseignants : connexion via matricule + date de naissance', public: 'Enseignants Pharmacie' },
        { horaire: '14h00-15h30', action: 'Test workflow complet : présences, consultation notes, paiements, emploi du temps', public: 'Étudiants + Enseignants' },
        { horaire: '15h30-17h00', action: 'Collecte des retours, identification des bugs, priorisation des correctifs', public: 'Tous participants + Équipe technique' }
      ]}
    ],
    objectif: 'Objectif : Valider le workflow complet avec une promotion réelle'
  },
  {
    id: 'S6', titre: 'SEMAINE 6 — Lundi 2 au Vendredi 6 Mars 2026',
    statut: 'À VENIR',
    sousTitre: 'FORMATION PERSONNEL ACADÉMIQUE PHARMACIE + CORRECTIFS',
    jours: [
      { jour: 'Lundi 2', titre: 'Analyse retours tests + correctifs', actions: [
        { horaire: '8h00-12h00', action: 'Analyse détaillée des retours du test du 27 février', public: 'Équipe technique' },
        { horaire: '14h00-17h00', action: 'Déploiement des correctifs prioritaires identifiés lors des tests', public: 'Développeur' }
      ]},
      { jour: 'Mardi 3', titre: 'FORMATION PERSONNEL ACADÉMIQUE PHARMACIE', actions: [
        { horaire: '8h00-10h00', action: 'Formation Doyen et Vice-Doyens : vue d\'ensemble, tableaux de bord, rapports', public: 'Doyen + Vice-Doyens Pharmacie' },
        { horaire: '10h00-12h00', action: 'Formation enseignants : saisie des notes, gestion des présences, codes de validation', public: 'Enseignants Pharmacie' },
        { horaire: '14h00-15h30', action: 'Formation secrétariat : gestion des bordereaux, vérification paiements, listes étudiants', public: 'Personnel administratif Pharmacie' },
        { horaire: '15h30-17h00', action: 'Formation jury de délibération : processus de délibération numérique, critères, validation', public: 'Membres des 9 jurys' }
      ]},
      { jour: 'Mercredi 4', titre: 'Session pratique + activation', actions: [
        { horaire: '8h00-12h00', action: 'Session pratique : enseignants et secrétariat manipulent la plateforme en conditions réelles', public: 'Personnel académique Pharmacie' },
        { horaire: '14h00-17h00', action: 'Début activation comptes étudiants Pharmacie (stands d\'assistance)', public: 'Étudiants Pharmacie' }
      ]},
      { jour: 'Jeudi 5 - Vendredi 6', titre: 'Activation massive + support', actions: [
        { horaire: 'Journée', action: 'Poursuite activation comptes étudiants et enseignants Pharmacie', public: 'Étudiants + Enseignants Pharmacie' },
        { horaire: 'Journée', action: 'Support technique permanent + correctifs en temps réel', public: 'Équipe technique' }
      ]}
    ],
    objectif: 'Objectif fin S6 : Faculté de Pharmacie entièrement opérationnelle sur NEXUS'
  },
  {
    id: 'S7', titre: 'SEMAINE 7 — Lundi 9 au Vendredi 13 Mars 2026',
    statut: 'À VENIR',
    sousTitre: 'VAGUE 1 — DROIT / FSEG / MÉDECINE',
    jours: [
      { jour: 'Lundi 9', titre: 'Formation points focaux Vague 1', actions: [
        { horaire: '8h00-10h00', action: 'Collecte et intégration données enseignants + cours (Droit, FSEG, Médecine)', public: 'Équipe technique' },
        { horaire: '10h00-12h00', action: 'Désignation points focaux (1 par département, 36 départements)', public: 'Secrétaires académiques' },
        { horaire: '14h00-17h00', action: 'Formation points focaux FDROIT + FSEG + FMED', public: '36 points focaux' }
      ]},
      { jour: 'Mardi 10', titre: 'Formation enseignants', actions: [
        { horaire: '8h00-10h00', action: 'Formation enseignants Droit', public: 'Enseignants FDROIT' },
        { horaire: '10h00-12h00', action: 'Formation enseignants FSEG', public: 'Enseignants FSEG' },
        { horaire: '14h00-17h00', action: 'Formation enseignants Médecine + personnel administratif', public: 'Enseignants FMED + secrétariats' }
      ]},
      { jour: 'Mercredi 11', titre: 'Tests et préparation activation', actions: [
        { horaire: '8h00-12h00', action: 'Test grandeur nature : simulation workflow complet pour les 3 facultés', public: 'Points focaux + enseignants volontaires' },
        { horaire: '14h00-17h00', action: 'Préparation campagne activation (affiches, dépliants QR code)', public: 'Équipe logistique' }
      ]},
      { jour: 'Jeudi 12', titre: 'Lancement activation Vague 1', actions: [
        { horaire: '8h00-17h00', action: 'Stands d\'assistance dans les 3 facultés — activation comptes étudiants', public: 'Étudiants Droit + FSEG + Médecine' }
      ]},
      { jour: 'Vendredi 13', titre: 'Suivi + bilan', actions: [
        { horaire: '8h00-12h00', action: 'Poursuite activations + support technique', public: 'Étudiants retardataires' },
        { horaire: '14h00-17h00', action: 'Bilan S7 : taux d\'activation, correctifs, préparation S8', public: 'Équipe technique' }
      ]}
    ],
    objectif: 'Objectif fin S7 : 3 plus grandes facultés formées et en activation'
  },
  {
    id: 'S8', titre: 'SEMAINE 8 — Lundi 16 au Vendredi 20 Mars 2026',
    statut: 'À VENIR',
    sousTitre: 'VAGUE 2 — FST / FPSE / FSSAP',
    jours: [
      { jour: 'Lundi 16', titre: 'Évaluation Vague 1 + Formation Vague 2', actions: [
        { horaire: '8h00-10h00', action: 'Évaluation Vague 1 : retours, taux d\'activation, problèmes signalés', public: 'Équipe technique' },
        { horaire: '10h00-12h00', action: 'Intégration données enseignants + cours (FST, FPSE, FSSAP)', public: 'Équipe technique' },
        { horaire: '14h00-17h00', action: 'Formation points focaux FST + FPSE + FSSAP (24 départements)', public: '24 points focaux' }
      ]},
      { jour: 'Mardi 17', titre: 'Formation enseignants Vague 2', actions: [
        { horaire: 'Journée', action: 'Formation enseignants des 3 facultés + personnel administratif', public: 'Enseignants + secrétariats' }
      ]},
      { jour: 'Mercredi 18', titre: 'Tests + préparation', actions: [
        { horaire: 'Journée', action: 'Tests, préparation campagne, déploiement correctifs Vague 1', public: '' }
      ]},
      { jour: 'Jeudi 19', titre: 'Activation Vague 2', actions: [
        { horaire: 'Journée', action: 'Stands activation FST + FPSE + FSSAP + support continu Vague 1', public: 'Étudiants 3 facultés' }
      ]},
      { jour: 'Vendredi 20', titre: 'Suivi + bilan', actions: [
        { horaire: 'Journée', action: 'Suivi activations, support, bilan S8', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S8 : 6 facultés en cours d\'activation'
  },
  {
    id: 'S9', titre: 'SEMAINE 9 — Lundi 23 au Vendredi 27 Mars 2026',
    statut: 'À VENIR',
    sousTitre: 'VAGUE 3 — FLSH / FMEDD / FSAE / FPGER',
    jours: [
      { jour: 'Lundi 23', titre: 'Évaluation + Formation Vague 3', actions: [
        { horaire: 'Journée', action: 'Évaluation Vague 2 + Formation points focaux FLSH + FMEDD + FSAE + FPGER', public: '' }
      ]},
      { jour: 'Mardi 24', titre: 'Formation enseignants Vague 3', actions: [
        { horaire: 'Journée', action: 'Formation enseignants + personnel administratif des 4 facultés', public: '' }
      ]},
      { jour: 'Mercredi 25', titre: 'Tests + correctifs', actions: [
        { horaire: 'Journée', action: 'Tests grandeur nature, correctifs globaux, préparation activation', public: '' }
      ]},
      { jour: 'Jeudi 26', titre: 'Activation Vague 3', actions: [
        { horaire: 'Journée', action: 'Activation comptes étudiants FLSH + FMEDD + FSAE + FPGER', public: '' }
      ]},
      { jour: 'Vendredi 27', titre: 'Suivi + bilan', actions: [
        { horaire: 'Journée', action: 'Suivi, support Vagues 1-3, bilan S9', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S9 : 10 facultés couvertes'
  },
  {
    id: 'S10', titre: 'SEMAINE 10 — Lundi 30 Mars au Vendredi 3 Avril 2026',
    statut: 'À VENIR',
    sousTitre: 'VAGUE 4 — FPOLY / FMEDV / ESPD / FSC + CONSOLIDATION',
    jours: [
      { jour: 'Lundi 30', titre: 'Dernières facultés + consolidation', actions: [
        { horaire: 'Journée', action: 'Formation + activation des dernières facultés (FPOLY, FMEDV, ESPD, FSC)', public: '' }
      ]},
      { jour: 'Mardi 31', titre: 'Activation + rattrapage', actions: [
        { horaire: 'Journée', action: 'Activation comptes dernières facultés + rattrapage vagues précédentes', public: '' }
      ]},
      { jour: 'Mercredi 1', titre: 'Audit global', actions: [
        { horaire: 'Journée', action: 'Audit global : état de chaque faculté, taux d\'adoption, problèmes', public: '' }
      ]},
      { jour: 'Jeudi 2', titre: 'Sprint correctifs', actions: [
        { horaire: 'Journée', action: 'Sprint correctifs : résolution bugs signalés + optimisation performances', public: '' }
      ]},
      { jour: 'Vendredi 3', titre: 'Bilan consolidation', actions: [
        { horaire: 'Journée', action: 'Bilan : 15/15 facultés couvertes, campagne rattrapage pour < 90%', public: '' }
      ]}
    ],
    objectif: 'Objectif fin S10 : 15/15 facultés couvertes, 90%+ d\'adoption'
  }
];

const PHASES_FINALES = [
  { id: 'S11', titre: 'SEMAINE 11 — 6 au 10 Avril 2026', sousTitre: 'MODULES AVANCÉS ET INTÉGRATIONS', actions: [
    { jour: 'Lundi 6', action: 'Configuration système de notifications (email/SMS pour notes, annonces)' },
    { jour: 'Mardi 7', action: 'Mise en place du chatbot IA pour assistance étudiante' },
    { jour: 'Mercredi 8', action: 'Module analytics avancé pour le rectorat (tableaux de bord décisionnels)' },
    { jour: 'Jeudi 9', action: 'Optimisation performances et mise en cache des requêtes critiques' },
    { jour: 'Vendredi 10', action: 'Tests d\'intégration globaux' }
  ]},
  { id: 'S12', titre: 'SEMAINE 12 — 13 au 17 Avril 2026', sousTitre: 'TESTS FINAUX ET DOCUMENTATION', actions: [
    { jour: 'Lundi 13', action: 'Test de charge : simulation de 5 000+ connexions simultanées' },
    { jour: 'Mardi 14', action: 'Test de sécurité : audit vulnérabilités, test de pénétration' },
    { jour: 'Mercredi 15', action: 'Documentation finale : guides utilisateurs (étudiant, enseignant, admin)' },
    { jour: 'Jeudi 16', action: 'Formation des formateurs : points focaux autonomes pour former les nouveaux' },
    { jour: 'Vendredi 17', action: 'Remise officielle des accès et documentation au rectorat' }
  ]},
  { id: 'S13', titre: 'SEMAINE 13 — 20 au 30 Avril 2026', sousTitre: 'LANCEMENT OFFICIEL ET TRANSITION', actions: [
    { jour: 'Lundi 20', action: 'Cérémonie de lancement officiel avec le Recteur' },
    { jour: 'Mar 21 - Ven 24', action: 'Période de rodage : support intensif, corrections en temps réel' },
    { jour: 'Lun 27 - Mer 30', action: 'Transfert de compétences final à l\'équipe informatique UNIKIN' },
    { jour: 'Mercredi 30 Avril', action: 'FIN DU PROJET — Livraison définitive' }
  ]}
];

const JALONS = [
  { jalon: 'Plateforme en ligne', date: '30 Jan. 2026', statut: 'FAIT', indicateur: 'Accessible via IP publique' },
  { jalon: 'Plus de 2 000 étudiants intégrés', date: '12 Fév. 2026', statut: 'FAIT', indicateur: 'Base de données complète' },
  { jalon: 'Paiements importés', date: '12 Fév. 2026', statut: 'FAIT', indicateur: 'Historique financier disponible' },
  { jalon: 'Passerelle activation opérationnelle', date: '12 Fév. 2026', statut: 'FAIT', indicateur: 'Processus testé et fonctionnel' },
  { jalon: 'Modules fonctionnels déployés', date: '13 Fév. 2026', statut: 'FAIT', indicateur: '11 modules + 11 corrections UI/UX' },
  { jalon: '1 131 enseignants intégrés', date: '20 Fév. 2026', statut: 'FAIT', indicateur: 'Toutes facultés, avec grades' },
  { jalon: 'Faculté Pharmacie complète', date: '25 Fév. 2026', statut: 'FAIT', indicateur: '136 cours, 9 jurys, critères' },
  { jalon: 'Tests situation réelle', date: '27 Fév. 2026', statut: 'À VENIR', indicateur: 'Promotion pilote Pharmacie' },
  { jalon: 'Formation académique Pharmacie', date: '3 Mars 2026', statut: 'À VENIR', indicateur: 'Enseignants + jury + secrétariat' },
  { jalon: 'Vague 1 — 3 grandes facultés', date: '13 Mars 2026', statut: 'À VENIR', indicateur: 'Droit + FSEG + Médecine' },
  { jalon: 'Vague 2 — 6 facultés', date: '20 Mars 2026', statut: 'À VENIR', indicateur: '+ FST + FPSE + FSSAP' },
  { jalon: 'Vague 3 — 10 facultés', date: '27 Mars 2026', statut: 'À VENIR', indicateur: '+ FLSH + FMEDD + FSAE + FPGER' },
  { jalon: '15/15 facultés couvertes', date: '3 Avril 2026', statut: 'À VENIR', indicateur: 'Toutes les facultés UNIKIN' },
  { jalon: 'Tests finaux + documentation', date: '17 Avril 2026', statut: 'À VENIR', indicateur: 'Plateforme validée' },
  { jalon: 'Lancement officiel', date: '20 Avril 2026', statut: 'À VENIR', indicateur: 'Cérémonie avec le Recteur' },
  { jalon: 'Livraison définitive', date: '30 Avril 2026', statut: 'À VENIR', indicateur: 'Transfert compétences achevé' }
];

// ============================================================================
// PDF GENERATION
// ============================================================================
async function generatePDF() {
  console.log('[PDF] Génération calendrier mis à jour...');

  const filePath = path.join(outDir, 'CALENDRIER_DEPLOIEMENT_NEXUS_UNIKIN_25FEV2026.pdf');
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

  function drawBullet(text, opts = {}) {
    checkPage(16);
    const indent = opts.indent || 50;
    doc.font('Helvetica').fontSize(9).fillColor('#333333')
      .text('•  ' + text, indent, y, { width: pageW - indent + 40 });
    y += 14;
  }

  function drawTable(headers, rows, colWidths) {
    const totalW = colWidths.reduce((a, b) => a + b, 0);
    const rowH = 20;
    const headerH = 22;

    checkPage(headerH + rowH * Math.min(rows.length, 3));

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

  function drawStatusBanner(text, color = '#2E7D32') {
    checkPage(26);
    doc.save();
    doc.rect(40, y, pageW, 22).fill(color);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF').text(text, 45, y + 5, { width: pageW - 10 });
    doc.restore();
    y += 28;
  }

  // ===== TITLE =====
  drawTitle('CALENDRIER DE DÉPLOIEMENT', 22);
  drawTitle('NEXUS UNIKIN', 18, '#2E6B9E');
  drawText('Université de Kinshasa — Mise à jour du 25 Février 2026', { align: 'center', italic: true, size: 11, color: '#666666' });
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

  // ===== CE QUI A ÉTÉ ACCOMPLI =====
  drawSubTitle('BILAN AU 25 FÉVRIER 2026 — CE QUI A ÉTÉ ACCOMPLI', 14);

  // Phase 1
  drawText('Phase 1 : Infrastructure et mise en ligne (Semaine 1 — 30 jan. - 2 fév.) [FAIT]', { bold: true, size: 11, color: '#2E6B9E' });
  drawTable(['Élément', 'Statut', 'Détail'], PHASE1, [160, 70, pageW - 230]);

  // Phase 2
  drawText('Phase 2 : Intégration des données (Semaines 2-3 — 3 fév. - 14 fév.) [FAIT]', { bold: true, size: 11, color: '#2E6B9E' });
  drawTable(['Élément', 'Quantité', 'Détail'], PHASE2, [170, 90, pageW - 260]);

  // Phase 3
  drawText('Phase 3 : Modules fonctionnels (Semaines 2-3) [FAIT]', { bold: true, size: 11, color: '#2E6B9E' });
  drawTable(['Module', 'Statut'], PHASE3, [pageW - 80, 80]);

  // NEW: Phase 4 Pharmacie
  doc.addPage(); y = 40;
  drawStatusBanner('✓ NOUVEAU — Phase 4 : Intégration Faculté Pilote — Sciences Pharmaceutiques (S4, 18-25 Fév.) [FAIT]');
  drawTable(['Élément', 'Quantité', 'Détail'], PHASE4_PHARMACIE, [190, 80, pageW - 270]);

  y += 5;
  drawText('Résumé Phase 4 :', { bold: true, size: 10, color: '#1B3A5C' });
  drawBullet('La Faculté des Sciences Pharmaceutiques est la première faculté entièrement configurée sur NEXUS');
  drawBullet('Deux filières gérées : PharmD (Doctorat en Pharmacie, B1-P3) et LTP (Licence en Techniques Pharmaceutiques, L1-L3)');
  drawBullet('Filière LTP avec 2 options : PTP (Pharmacie Traditionnelle et Plantes Médicinales) et PIP (Pratiques et Industries Pharmaceutiques)');
  drawBullet('Jury de délibération complet avec président, secrétaire et membre pour chaque promotion');
  drawBullet('Critères de délibération conformes aux règles académiques (moyennes, crédits, mentions)');
  drawBullet('Système d\'activation enseignants opérationnel (matricule + date de naissance)');

  // ===== FACULTES =====
  doc.addPage(); y = 40;
  drawSubTitle('DÉTAIL DES 15 FACULTÉS', 14);
  const fData = FACULTES.map(f => [String(f.num), f.nom, f.abrev, String(f.dept), String(f.prom)]);
  fData.push(['', 'TOTAL', '', '134+', '503+']);
  drawTable(['#', 'Faculté', 'Abrév.', 'Dépt.', 'Prom.'], fData, [25, 230, 60, 50, 50]);

  // ===== PLANNING DÉTAILLÉ =====
  doc.addPage(); y = 40;
  drawSubTitle('PLANNING RÉALISÉ — SEMAINES 1 À 4', 16);

  SEMAINES_PASSEES.forEach(sem => {
    checkPage(80);
    drawBanner(sem.id + ' — ' + sem.description + ' [' + sem.statut + ']');
    drawText(sem.titre, { italic: true, size: 9, color: '#666666' });
    sem.actions.forEach(action => {
      drawBullet(action);
    });
    y += 5;
  });

  // ===== PLANNING FUTUR =====
  doc.addPage(); y = 40;
  drawSubTitle('PLANNING PRÉVISIONNEL — SEMAINES 5 À 13', 16);

  PLANNING_FUTUR.forEach(sem => {
    checkPage(60);
    drawBanner(sem.id + ' — ' + sem.sousTitre + ' [' + sem.statut + ']');
    drawText(sem.titre, { italic: true, size: 9, color: '#666666' });

    sem.jours.forEach(jour => {
      checkPage(40);
      drawText(jour.jour + ' — ' + jour.titre, { bold: true, size: 10, color: '#2E6B9E' });
      const actions = jour.actions.map(a => [a.horaire, a.action, a.public || '']);
      drawTable(['Horaire', 'Action', 'Public cible'], actions, [70, pageW - 200, 130]);
    });

    drawText(sem.objectif, { bold: true, size: 10, color: '#D4A843', spacing: 10 });
  });

  // Phases finales
  PHASES_FINALES.forEach(phase => {
    checkPage(60);
    drawBanner(phase.id + ' — ' + phase.sousTitre);
    const actions = phase.actions.map(a => [a.jour, a.action]);
    drawTable(['Jour', 'Action'], actions, [100, pageW - 100]);
  });

  // ===== JALONS =====
  doc.addPage(); y = 40;
  drawSubTitle('JALONS ET INDICATEURS DE SUIVI', 16);
  const jData = JALONS.map(j => [j.jalon, j.date, j.statut, j.indicateur]);
  drawTable(['Jalon', 'Date', 'Statut', 'Indicateur'], jData, [140, 80, 60, pageW - 280]);

  // ===== NOTES =====
  y += 15;
  drawSubTitle('NOTES IMPORTANTES', 14);
  const notes = [
    '1. La Faculté des Sciences Pharmaceutiques sert de faculté pilote pour valider le workflow complet.',
    '2. L\'approche « Test puis Déploiement » garantit une expérience utilisateur optimale.',
    '3. Les tests du 27 février valideront le processus avant la formation du 3 mars.',
    '4. Le déploiement par vagues (3-4 facultés/semaine) commence après les délibérations de toutes les promotions de la Faculté des Sciences Pharmaceutiques (faculté pilote).',
    '5. Les correctifs sont déployés en continu — pas besoin de fenêtre de maintenance.',
    '6. Délai respecté : 30 janvier → 30 avril = exactement 3 mois (13 semaines).',
    '7. Plus de 2 000 étudiants sont déjà encodés dans la plateforme avec leurs données complètes.',
    '8. La délibération de la faculté pilote (Sciences Pharmaceutiques) sera effective durant le mois de mars.',
    '9. Les données de l\'année académique 2023-2024 ont été importées (personnel académique, enseignants, étudiants).'
  ];
  notes.forEach(n => drawText(n, { size: 9 }));

  // Footer
  y += 20;
  checkPage(40);
  doc.fontSize(9).fillColor('#999999').font('Helvetica')
    .text('_______________________________________________', 40, y, { width: pageW, align: 'center' });
  y += 14;
  doc.text('Document mis à jour le 25 février 2026', 40, y, { width: pageW, align: 'center' });
  y += 12;
  doc.text('NEXUS UNIKIN — Système de Gestion Universitaire — Chris NGOZULU KASONGO', 40, y, { width: pageW, align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      console.log('✅ [PDF] Calendrier généré : ' + filePath);
      resolve(filePath);
    });
  });
}

generatePDF().then(() => {
  console.log('\n🎉 Calendrier de déploiement mis à jour !');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

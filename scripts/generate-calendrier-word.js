const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
  PageBreak,
} = require('docx')
const fs = require('fs')
const path = require('path')

// Couleurs
const COLORS = {
  primary: '1a365d',      // Bleu foncé
  secondary: '2c5282',    // Bleu moyen
  accent: '3182ce',       // Bleu clair
  success: '276749',      // Vert
  warning: 'c05621',      // Orange
  headerBg: 'e8f0fe',     // Fond bleu clair
  lightGray: 'f7fafc',    // Gris très clair
  white: 'ffffff',
}

// Créer une cellule de tableau avec style
function createCell(text, options = {}) {
  const {
    bold = false,
    isHeader = false,
    width = undefined,
    color = '000000',
    fontSize = 22,
    alignment = AlignmentType.LEFT,
    bgColor = null,
  } = options

  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: isHeader
      ? { type: ShadingType.SOLID, color: COLORS.headerBg }
      : bgColor
      ? { type: ShadingType.SOLID, color: bgColor }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            bold: bold || isHeader,
            size: fontSize,
            color: isHeader ? COLORS.primary : color,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  })
}

// Créer un titre de section
function createSectionTitle(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: level === HeadingLevel.HEADING_1 ? 32 : 28,
        color: COLORS.primary,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Créer un sous-titre avec icône
function createSubTitle(text, emoji = '') {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent },
    },
    children: [
      new TextRun({
        text: `${emoji} ${text}`,
        bold: true,
        size: 26,
        color: COLORS.secondary,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Créer un paragraphe normal
function createParagraph(text, options = {}) {
  const { bold = false, italic = false, spacing = { before: 100, after: 100 } } = options
  return new Paragraph({
    spacing,
    children: [
      new TextRun({
        text,
        bold,
        italics: italic,
        size: 24,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Créer un tableau de planning hebdomadaire
function createWeekTable(weekData) {
  const rows = [
    // En-tête
    new TableRow({
      tableHeader: true,
      children: [
        createCell('Jour', { isHeader: true, width: 15 }),
        createCell('Activité', { isHeader: true, width: 30 }),
        createCell('Ce que cela signifie concrètement', { isHeader: true, width: 55 }),
      ],
    }),
  ]

  weekData.forEach((day) => {
    rows.push(
      new TableRow({
        children: [
          createCell(day.jour, { bold: true, width: 15, bgColor: COLORS.lightGray }),
          createCell(day.activite, { width: 30 }),
          createCell(day.description, { width: 55 }),
        ],
      })
    )
  })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows,
  })
}

// Créer un encadré de résultat attendu
function createResultBox(text) {
  return new Paragraph({
    spacing: { before: 150, after: 200 },
    shading: { type: ShadingType.SOLID, color: 'e6ffed' },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.success },
    },
    children: [
      new TextRun({
        text: '✓ Résultat attendu : ',
        bold: true,
        size: 22,
        color: COLORS.success,
        font: 'Times New Roman',
      }),
      new TextRun({
        text,
        size: 22,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Créer le document
async function generateDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // TITRE PRINCIPAL
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'CALENDRIER DE RÉALISATION',
                bold: true,
                size: 40,
                color: COLORS.primary,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: 'PROJET NEXUS UNIKIN',
                bold: true,
                size: 36,
                color: COLORS.secondary,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            border: {
              bottom: { style: BorderStyle.DOUBLE, size: 6, color: COLORS.accent },
            },
            children: [
              new TextRun({
                text: 'Plateforme Numérique de Gestion Universitaire',
                italics: true,
                size: 26,
                color: COLORS.accent,
                font: 'Times New Roman',
              }),
            ],
          }),

          // Informations
          createParagraph('Institution : Université de Kinshasa (UNIKIN)', { bold: true }),
          createParagraph('Projet : NEXUS UNIKIN'),
          createParagraph('Date : Janvier 2026'),
          createParagraph('Durée totale estimée : 12 semaines (3 mois)', { bold: true }),

          // RÉSUMÉ
          createSectionTitle('RÉSUMÉ DU PROJET'),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            shading: { type: ShadingType.SOLID, color: COLORS.lightGray },
            children: [
              new TextRun({
                text: 'NEXUS UNIKIN est une plateforme numérique moderne qui permettra de gérer toutes les opérations administratives et académiques de l\'université : inscription des étudiants, gestion des notes, paiements des frais, emplois du temps, communication, et bien plus encore.',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          // PHASE 1
          createSectionTitle('PHASE 1 : PRÉPARATION ET INSTALLATION'),
          createParagraph('Semaines 1 et 2', { bold: true, italic: true }),

          createSubTitle('Semaine 1 : Mise en place de l\'environnement de travail', '📦'),
          createParagraph('Objectif : Préparer tous les outils nécessaires pour commencer le travail'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Acquisition du matériel', description: 'Réception et configuration des ordinateurs de développement' },
            { jour: 'Mardi', activite: 'Installation des logiciels', description: 'Mise en place des programmes nécessaires pour créer la plateforme' },
            { jour: 'Mercredi', activite: 'Configuration internet', description: 'Installation de la connexion internet haut débit pour l\'équipe' },
            { jour: 'Jeudi', activite: 'Création des comptes cloud', description: 'Ouverture des comptes sur les services d\'hébergement en ligne' },
            { jour: 'Vendredi', activite: 'Tests de connexion', description: 'Vérification que tout fonctionne correctement' },
          ]),
          createResultBox('L\'équipe dispose de tout le matériel et les accès nécessaires pour travailler.'),

          createSubTitle('Semaine 2 : Configuration des serveurs et base de données', '🗄️'),
          createParagraph('Objectif : Créer l\'espace où seront stockées toutes les données de l\'université'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Création de la base de données', description: 'Construction du "coffre-fort numérique" qui gardera toutes les informations' },
            { jour: 'Mardi', activite: 'Structure des données étudiants', description: 'Organisation des informations : noms, matricules, facultés, etc.' },
            { jour: 'Mercredi', activite: 'Structure des données académiques', description: 'Organisation des cours, notes, emplois du temps' },
            { jour: 'Jeudi', activite: 'Structure des données financières', description: 'Organisation des paiements, frais, reçus' },
            { jour: 'Vendredi', activite: 'Tests et sauvegardes', description: 'Vérification de la sécurité et mise en place des copies de secours automatiques' },
          ]),
          createResultBox('Le système de stockage est prêt et sécurisé.'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // PHASE 2
          createSectionTitle('PHASE 2 : DÉVELOPPEMENT DES MODULES PRINCIPAUX'),
          createParagraph('Semaines 3 à 6', { bold: true, italic: true }),

          createSubTitle('Semaine 3 : Système de connexion et sécurité', '🔐'),
          createParagraph('Objectif : Créer le système qui permet aux utilisateurs de se connecter en toute sécurité'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Page de connexion', description: 'Création de l\'écran où l\'on entre son identifiant et mot de passe' },
            { jour: 'Mardi', activite: 'Gestion des mots de passe', description: 'Système pour créer, modifier et récupérer les mots de passe oubliés' },
            { jour: 'Mercredi', activite: 'Niveaux d\'accès', description: 'Définition de qui peut voir quoi (étudiant, enseignant, administrateur)' },
            { jour: 'Jeudi', activite: 'Protection des données', description: 'Mise en place du cryptage pour protéger les informations personnelles' },
            { jour: 'Vendredi', activite: 'Tests de sécurité', description: 'Vérification qu\'aucun accès non autorisé n\'est possible' },
          ]),
          createResultBox('Système de connexion sécurisé fonctionnel.'),

          createSubTitle('Semaine 4 : Gestion des étudiants', '👨‍🎓'),
          createParagraph('Objectif : Créer l\'espace où seront gérées toutes les informations des étudiants'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Fiche étudiant', description: 'Écran affichant toutes les informations d\'un étudiant (photo, nom, matricule, etc.)' },
            { jour: 'Mardi', activite: 'Inscription en ligne', description: 'Formulaire permettant d\'inscrire un nouvel étudiant' },
            { jour: 'Mercredi', activite: 'Recherche et filtres', description: 'Outil pour trouver rapidement un étudiant parmi des milliers' },
            { jour: 'Jeudi', activite: 'Historique académique', description: 'Affichage du parcours complet de l\'étudiant (années, résultats)' },
            { jour: 'Vendredi', activite: 'Export et impression', description: 'Possibilité d\'imprimer les fiches et listes d\'étudiants' },
          ]),
          createResultBox('Gestion complète des dossiers étudiants.'),

          createSubTitle('Semaine 5 : Notes et résultats académiques', '📊'),
          createParagraph('Objectif : Créer le système de saisie et consultation des notes'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Saisie des notes', description: 'Écran permettant aux enseignants d\'entrer les notes (TP, TD, Examens)' },
            { jour: 'Mardi', activite: 'Calcul automatique', description: 'Le système calcule automatiquement les moyennes et pourcentages' },
            { jour: 'Mercredi', activite: 'Bulletin de notes', description: 'Génération automatique du relevé de notes de chaque étudiant' },
            { jour: 'Jeudi', activite: 'Consultation étudiant', description: 'L\'étudiant peut voir ses notes depuis son espace personnel' },
            { jour: 'Vendredi', activite: 'Statistiques de classe', description: 'Affichage des moyennes de classe, taux de réussite' },
          ]),
          createResultBox('Système complet de gestion des notes.'),

          createSubTitle('Semaine 6 : Gestion financière (Paiements)', '💰'),
          createParagraph('Objectif : Créer le système de gestion des frais académiques'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Enregistrement des paiements', description: 'Écran pour enregistrer chaque paiement effectué' },
            { jour: 'Mardi', activite: 'Génération des reçus', description: 'Création automatique des reçus de paiement' },
            { jour: 'Mercredi', activite: 'Suivi des soldes', description: 'Affichage de ce que chaque étudiant a payé et ce qu\'il doit encore' },
            { jour: 'Jeudi', activite: 'Modes de paiement', description: 'Support du cash, virement bancaire, Mobile Money' },
            { jour: 'Vendredi', activite: 'Rapports financiers', description: 'Tableaux récapitulatifs des recettes par jour, mois, année' },
          ]),
          createResultBox('Gestion financière complète et transparente.'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // PHASE 3
          createSectionTitle('PHASE 3 : DÉVELOPPEMENT DES MODULES SECONDAIRES'),
          createParagraph('Semaines 7 à 9', { bold: true, italic: true }),

          createSubTitle('Semaine 7 : Emploi du temps et présences', '📅'),
          createParagraph('Objectif : Créer les outils de planification et de suivi des présences'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Création des horaires', description: 'Outil pour planifier les cours (jour, heure, salle)' },
            { jour: 'Mardi', activite: 'Affichage emploi du temps', description: 'Calendrier visuel des cours pour étudiants et enseignants' },
            { jour: 'Mercredi', activite: 'Système de présence', description: 'Les enseignants peuvent faire l\'appel numériquement' },
            { jour: 'Jeudi', activite: 'Code de présence', description: 'L\'enseignant génère un code que l\'étudiant entre pour confirmer sa présence' },
            { jour: 'Vendredi', activite: 'Statistiques de présence', description: 'Taux de présence par étudiant, par cours' },
          ]),
          createResultBox('Gestion des emplois du temps et présences automatisée.'),

          createSubTitle('Semaine 8 : Communication et notifications', '📢'),
          createParagraph('Objectif : Permettre la communication entre tous les acteurs'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Messagerie interne', description: 'Système pour envoyer des messages entre utilisateurs' },
            { jour: 'Mardi', activite: 'Annonces générales', description: 'L\'administration peut publier des annonces visibles par tous' },
            { jour: 'Mercredi', activite: 'Notifications automatiques', description: 'Alertes automatiques (nouvelles notes, rappels de paiement)' },
            { jour: 'Jeudi', activite: 'Notifications par email', description: 'Les alertes importantes sont aussi envoyées par email' },
            { jour: 'Vendredi', activite: 'Historique des messages', description: 'Conservation de tous les échanges' },
          ]),
          createResultBox('Communication fluide entre tous les utilisateurs.'),

          createSubTitle('Semaine 9 : Documents et attestations', '📄'),
          createParagraph('Objectif : Permettre la demande et génération de documents officiels'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Demande en ligne', description: 'L\'étudiant peut demander une attestation depuis son espace' },
            { jour: 'Mardi', activite: 'Traitement des demandes', description: 'Le service concerné reçoit et traite la demande' },
            { jour: 'Mercredi', activite: 'Génération automatique', description: 'Les documents sont générés automatiquement avec les bonnes informations' },
            { jour: 'Jeudi', activite: 'Téléchargement sécurisé', description: 'L\'étudiant peut télécharger son document une fois prêt' },
            { jour: 'Vendredi', activite: 'Suivi des demandes', description: 'L\'étudiant peut voir où en est sa demande' },
          ]),
          createResultBox('Demandes de documents simplifiées et rapides.'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // PHASE 4
          createSectionTitle('PHASE 4 : TESTS ET VÉRIFICATIONS'),
          createParagraph('Semaine 10', { bold: true, italic: true }),

          createSubTitle('Semaine 10 : Vérification complète du système', '✅'),
          createParagraph('Objectif : S\'assurer que tout fonctionne parfaitement avant le lancement'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Tests des inscriptions', description: 'Vérifier que l\'inscription des étudiants fonctionne correctement' },
            { jour: 'Mardi', activite: 'Tests des notes', description: 'Vérifier la saisie et le calcul des notes' },
            { jour: 'Mercredi', activite: 'Tests des paiements', description: 'Vérifier l\'enregistrement et les reçus de paiement' },
            { jour: 'Jeudi', activite: 'Tests de sécurité', description: 'Vérifier que les données sont bien protégées' },
            { jour: 'Vendredi', activite: 'Corrections', description: 'Réparer tous les problèmes découverts pendant les tests' },
          ]),
          createResultBox('Plateforme stable et sans erreurs.'),

          // PHASE 5
          createSectionTitle('PHASE 5 : FORMATION ET LANCEMENT'),
          createParagraph('Semaines 11 et 12', { bold: true, italic: true }),

          createSubTitle('Semaine 11 : Formation des utilisateurs', '🎓'),
          createParagraph('Objectif : Apprendre à chaque type d\'utilisateur à utiliser la plateforme'),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createCell('Jour', { isHeader: true, width: 20 }),
                  createCell('Formation', { isHeader: true, width: 35 }),
                  createCell('Participants', { isHeader: true, width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Lundi', { bold: true, width: 20, bgColor: COLORS.lightGray }),
                  createCell('Formation administrateurs', { width: 35 }),
                  createCell('Personnel de l\'administration centrale', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Mardi', { bold: true, width: 20, bgColor: COLORS.lightGray }),
                  createCell('Formation secrétaires', { width: 35 }),
                  createCell('Secrétaires des facultés et départements', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Mercredi', { bold: true, width: 20, bgColor: COLORS.lightGray }),
                  createCell('Formation service financier', { width: 35 }),
                  createCell('Personnel du service de caisse et comptabilité', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Jeudi', { bold: true, width: 20, bgColor: COLORS.lightGray }),
                  createCell('Formation enseignants', { width: 35 }),
                  createCell('Professeurs et assistants (notes, présences)', { width: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Vendredi', { bold: true, width: 20, bgColor: COLORS.lightGray }),
                  createCell('Formation étudiants', { width: 35 }),
                  createCell('Démonstration aux délégués de promotion', { width: 45 }),
                ],
              }),
            ],
          }),
          createResultBox('Tous les utilisateurs sont formés et prêts.'),

          createSubTitle('Semaine 12 : Lancement officiel', '🚀'),
          createParagraph('Objectif : Mettre la plateforme en service pour tous'),
          createWeekTable([
            { jour: 'Lundi', activite: 'Migration des données', description: 'Transfert des données existantes vers le nouveau système' },
            { jour: 'Mardi', activite: 'Création des comptes', description: 'Génération des identifiants pour tous les utilisateurs' },
            { jour: 'Mercredi', activite: 'Tests finaux', description: 'Dernières vérifications avec les vraies données' },
            { jour: 'Jeudi', activite: 'Activation publique', description: 'La plateforme est accessible à tous' },
            { jour: 'Vendredi', activite: 'Support de lancement', description: 'L\'équipe technique est disponible pour aider les utilisateurs' },
          ]),
          createResultBox('NEXUS UNIKIN est officiellement opérationnel !'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // CE QUE LES UTILISATEURS POURRONT FAIRE
          createSectionTitle('CE QUE LES UTILISATEURS POURRONT FAIRE'),

          createSubTitle('Les Étudiants pourront', '👨‍🎓'),
          createParagraph('• Consulter leur emploi du temps à tout moment'),
          createParagraph('• Voir leurs notes dès qu\'elles sont publiées'),
          createParagraph('• Suivre leurs paiements et télécharger leurs reçus'),
          createParagraph('• Demander des documents officiels en ligne'),
          createParagraph('• Recevoir des notifications importantes'),
          createParagraph('• Confirmer leur présence aux cours'),

          createSubTitle('Les Enseignants pourront', '👨‍🏫'),
          createParagraph('• Saisir les notes de leurs étudiants facilement'),
          createParagraph('• Faire l\'appel de manière numérique'),
          createParagraph('• Consulter la liste de leurs cours et étudiants'),
          createParagraph('• Communiquer avec leurs étudiants'),
          createParagraph('• Voir les statistiques de leur classe'),

          createSubTitle('L\'Administration pourra', '👨‍💼'),
          createParagraph('• Gérer les inscriptions des étudiants'),
          createParagraph('• Suivre les paiements en temps réel'),
          createParagraph('• Générer des rapports et statistiques'),
          createParagraph('• Publier des annonces officielles'),
          createParagraph('• Superviser toutes les opérations'),

          // GARANTIES
          createSectionTitle('NOS GARANTIES'),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('✓', { bold: true, width: 5, color: COLORS.success }),
                  createCell('Sécurité', { bold: true, width: 20 }),
                  createCell('Toutes les données sont protégées et cryptées', { width: 75 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('✓', { bold: true, width: 5, color: COLORS.success }),
                  createCell('Disponibilité', { bold: true, width: 20 }),
                  createCell('La plateforme est accessible 24h/24, 7j/7', { width: 75 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('✓', { bold: true, width: 5, color: COLORS.success }),
                  createCell('Sauvegardes', { bold: true, width: 20 }),
                  createCell('Copies de sécurité quotidiennes automatiques', { width: 75 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('✓', { bold: true, width: 5, color: COLORS.success }),
                  createCell('Support', { bold: true, width: 20 }),
                  createCell('Assistance technique disponible en permanence', { width: 75 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('✓', { bold: true, width: 5, color: COLORS.success }),
                  createCell('Formation', { bold: true, width: 20 }),
                  createCell('Tous les utilisateurs seront formés à l\'utilisation', { width: 75 }),
                ],
              }),
            ],
          }),

          // RÉCAPITULATIF VISUEL
          createSectionTitle('RÉCAPITULATIF DES PHASES'),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createCell('Phase', { isHeader: true, width: 15 }),
                  createCell('Semaines', { isHeader: true, width: 15 }),
                  createCell('Description', { isHeader: true, width: 40 }),
                  createCell('Durée', { isHeader: true, width: 15 }),
                  createCell('Statut', { isHeader: true, width: 15 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Phase 1', { bold: true, width: 15 }),
                  createCell('1-2', { width: 15 }),
                  createCell('Préparation et installation', { width: 40 }),
                  createCell('2 semaines', { width: 15 }),
                  createCell('À venir', { width: 15, bgColor: COLORS.lightGray }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Phase 2', { bold: true, width: 15 }),
                  createCell('3-6', { width: 15 }),
                  createCell('Modules principaux (étudiants, notes, finances)', { width: 40 }),
                  createCell('4 semaines', { width: 15 }),
                  createCell('À venir', { width: 15, bgColor: COLORS.lightGray }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Phase 3', { bold: true, width: 15 }),
                  createCell('7-9', { width: 15 }),
                  createCell('Modules secondaires (emploi du temps, communication)', { width: 40 }),
                  createCell('3 semaines', { width: 15 }),
                  createCell('À venir', { width: 15, bgColor: COLORS.lightGray }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Phase 4', { bold: true, width: 15 }),
                  createCell('10', { width: 15 }),
                  createCell('Tests et vérifications', { width: 40 }),
                  createCell('1 semaine', { width: 15 }),
                  createCell('À venir', { width: 15, bgColor: COLORS.lightGray }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Phase 5', { bold: true, width: 15 }),
                  createCell('11-12', { width: 15 }),
                  createCell('Formation et lancement', { width: 40 }),
                  createCell('2 semaines', { width: 15 }),
                  createCell('À venir', { width: 15, bgColor: COLORS.lightGray }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent },
            },
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'Document préparé par l\'équipe NEXUS UNIKIN',
                bold: true,
                size: 22,
                color: COLORS.secondary,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Janvier 2026 - Pour toute question, contactez l\'équipe de projet',
                italics: true,
                size: 20,
                color: '666666',
                font: 'Times New Roman',
              }),
            ],
          }),
        ],
      },
    ],
  })

  // Générer le fichier
  const buffer = await Packer.toBuffer(doc)
  const outputPath = path.join(__dirname, '..', 'contracts', 'CALENDRIER_PROJET_NEXUS.docx')
  fs.writeFileSync(outputPath, buffer)
  console.log('✅ Document Word généré avec succès :', outputPath)
}

generateDocument().catch(console.error)

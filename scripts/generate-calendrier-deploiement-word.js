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
  primary: '1a365d',
  secondary: '2c5282',
  accent: '3182ce',
  success: '276749',
  successBg: 'e6ffed',
  warning: 'c05621',
  headerBg: 'e8f0fe',
  lightGray: 'f7fafc',
  lightBlue: 'ebf8ff',
  white: 'ffffff',
}

// Créer une cellule de tableau
function createCell(text, options = {}) {
  const {
    bold = false,
    isHeader = false,
    width = undefined,
    color = '000000',
    fontSize = 22,
    alignment = AlignmentType.LEFT,
    bgColor = null,
    colSpan = 1,
  } = options

  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    columnSpan: colSpan,
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

// Titre de section
function createSectionTitle(text) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accent },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: COLORS.primary,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Sous-titre avec date
function createDayTitle(date, title, emoji = '📅') {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    shading: { type: ShadingType.SOLID, color: COLORS.lightBlue },
    children: [
      new TextRun({
        text: `${emoji} ${date}`,
        bold: true,
        size: 26,
        color: COLORS.primary,
        font: 'Times New Roman',
      }),
      new TextRun({
        text: ` - ${title}`,
        bold: true,
        size: 26,
        color: COLORS.secondary,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Paragraphe normal
function createParagraph(text, options = {}) {
  const { bold = false, italic = false, color = '000000', indent = 0 } = options
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: indent ? { left: indent } : undefined,
    children: [
      new TextRun({
        text,
        bold,
        italics: italic,
        size: 24,
        color,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Encadré résultat
function createResultBox(text) {
  return new Paragraph({
    spacing: { before: 100, after: 200 },
    shading: { type: ShadingType.SOLID, color: COLORS.successBg },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.success },
    },
    children: [
      new TextRun({
        text: '➜ ' + text,
        bold: true,
        size: 22,
        color: COLORS.success,
        font: 'Times New Roman',
      }),
    ],
  })
}

// Liste à puces
function createBulletPoint(text, checked = true) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 400 },
    children: [
      new TextRun({
        text: checked ? '✅ ' : '○ ',
        size: 22,
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

// Tableau horaire journalier
function createDayScheduleTable(activities) {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        createCell('Horaire', { isHeader: true, width: 20 }),
        createCell('Action', { isHeader: true, width: 30 }),
        createCell('Explication simple', { isHeader: true, width: 50 }),
      ],
    }),
  ]

  activities.forEach((act) => {
    rows.push(
      new TableRow({
        children: [
          createCell(act.horaire, { bold: true, width: 20, bgColor: COLORS.lightGray }),
          createCell(act.action, { bold: true, width: 30 }),
          createCell(act.explication, { width: 50 }),
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
          page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
        },
        children: [
          // TITRE PRINCIPAL
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'CALENDRIER DE DÉPLOIEMENT',
                bold: true,
                size: 44,
                color: COLORS.primary,
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
                text: 'NEXUS UNIKIN - Plateforme de Gestion Universitaire',
                bold: true,
                size: 28,
                color: COLORS.secondary,
                font: 'Times New Roman',
              }),
            ],
          }),

          // Informations clés
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                children: [
                  createCell('Institution', { bold: true, width: 30, bgColor: COLORS.lightGray }),
                  createCell('Université de Kinshasa (UNIKIN)', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Date de début', { bold: true, width: 30, bgColor: COLORS.lightGray }),
                  createCell('Mardi 21 Janvier 2026', { width: 70, bold: true }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Accès utilisateurs', { bold: true, width: 30, bgColor: COLORS.lightGray }),
                  createCell('Mardi 28 Janvier 2026', { width: 70, bold: true, color: COLORS.success }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Durée totale', { bold: true, width: 30, bgColor: COLORS.lightGray }),
                  createCell('4 semaines', { width: 70 }),
                ],
              }),
            ],
          }),

          // CONTEXTE
          createSectionTitle('CONTEXTE'),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            shading: { type: ShadingType.SOLID, color: COLORS.lightBlue },
            children: [
              new TextRun({
                text: 'La plateforme NEXUS UNIKIN est ',
                size: 24,
                font: 'Times New Roman',
              }),
              new TextRun({
                text: 'déjà développée et fonctionnelle',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
              new TextRun({
                text: '. Ce calendrier présente les étapes pour la mettre en ligne, importer les données existantes, et donner accès aux utilisateurs.',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          // SEMAINE 1
          createSectionTitle('SEMAINE 1 : MISE EN LIGNE ET CONFIGURATION'),
          createParagraph('Du Mardi 21 au Lundi 27 Janvier 2026', { bold: true, italic: true }),
          createParagraph('Cette semaine est consacrée à rendre la plateforme accessible sur internet et à préparer toutes les données.'),

          // Lundi 20
          createDayTitle('MARDI 21 JANVIER 2026', 'Mise en ligne de la plateforme', '🚀'),
          createDayScheduleTable([
            { horaire: '8h00 - 10h00', action: 'Publication sur internet', explication: 'La plateforme est mise sur un serveur accessible partout. Comme mettre un livre dans une bibliothèque publique.' },
            { horaire: '10h00 - 12h00', action: 'Adresse web', explication: 'Création de l\'adresse nexus.unikin.ac.cd pour accéder à la plateforme.' },
            { horaire: '14h00 - 16h00', action: 'Sécurisation', explication: 'Installation du "cadenas" (HTTPS) pour protéger les données.' },
            { horaire: '16h00 - 17h00', action: 'Test d\'accès', explication: 'Vérification depuis différents appareils (ordinateur, téléphone).' },
          ]),
          createResultBox('La plateforme est visible sur internet à l\'adresse nexus.unikin.ac.cd'),

          // Mardi 21
          createDayTitle('MERCREDI 22 JANVIER 2026', 'Importation des données étudiants', '👨‍🎓'),
          createDayScheduleTable([
            { horaire: '8h00 - 10h00', action: 'Collecte des listes', explication: 'Récupération des fichiers Excel avec les informations de tous les étudiants.' },
            { horaire: '10h00 - 12h00', action: 'Importation', explication: 'Transfert automatique des données (noms, matricules, facultés, promotions).' },
            { horaire: '14h00 - 16h00', action: 'Création des comptes', explication: 'Génération d\'un identifiant et mot de passe pour chaque étudiant.' },
            { horaire: '16h00 - 17h00', action: 'Vérification', explication: 'Contrôle que tous les étudiants sont correctement enregistrés.' },
          ]),
          createResultBox('Tous les étudiants ont un compte dans la plateforme.'),

          // Mercredi 22
          createDayTitle('JEUDI 23 JANVIER 2026', 'Importation enseignants et cours', '👨‍🏫'),
          createDayScheduleTable([
            { horaire: '8h00 - 10h00', action: 'Liste des enseignants', explication: 'Collecte des informations sur tous les professeurs et assistants.' },
            { horaire: '10h00 - 12h00', action: 'Comptes enseignants', explication: 'Création des comptes avec leurs cours assignés.' },
            { horaire: '14h00 - 15h00', action: 'Importation des cours', explication: 'Enregistrement de tous les cours avec horaires et salles.' },
            { horaire: '15h00 - 17h00', action: 'Emplois du temps', explication: 'Mise en place du calendrier pour chaque promotion.' },
          ]),
          createResultBox('Tous les enseignants et cours sont dans le système.'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // Jeudi 23
          createDayTitle('VENDREDI 24 JANVIER 2026', 'Connexion aux services existants', '🔗'),
          createParagraph('La plateforme sera connectée aux systèmes déjà en place à l\'université :'),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createCell('Service existant', { isHeader: true, width: 25 }),
                  createCell('Type de connexion', { isHeader: true, width: 25 }),
                  createCell('Résultat pour l\'utilisateur', { isHeader: true, width: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Service de caisse', { bold: true, width: 25 }),
                  createCell('Automatique', { width: 25 }),
                  createCell('Les paiements à la caisse apparaissent automatiquement dans le compte de l\'étudiant', { width: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Anciens résultats', { bold: true, width: 25 }),
                  createCell('Importation', { width: 25 }),
                  createCell('L\'historique académique de chaque étudiant est visible', { width: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Email universitaire', { bold: true, width: 25 }),
                  createCell('Intégration', { width: 25 }),
                  createCell('Les notifications sont envoyées sur l\'email universitaire', { width: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Service SMS', { bold: true, width: 25 }),
                  createCell('Connexion', { width: 25 }),
                  createCell('Alertes importantes envoyées par SMS', { width: 50 }),
                ],
              }),
            ],
          }),
          createResultBox('La plateforme communique avec tous les services existants.'),

          // Vendredi 24
          createDayTitle('LUNDI 27 JANVIER 2026', 'Tests finaux', '✅'),
          createDayScheduleTable([
            { horaire: '8h00 - 10h00', action: 'Test rôle étudiant', explication: 'Simulation de toutes les actions d\'un étudiant (notes, emploi du temps).' },
            { horaire: '10h00 - 12h00', action: 'Test rôle enseignant', explication: 'Simulation de toutes les actions d\'un enseignant (saisie notes, appel).' },
            { horaire: '14h00 - 15h00', action: 'Test administration', explication: 'Vérification des fonctions administratives.' },
            { horaire: '15h00 - 17h00', action: 'Préparation identifiants', explication: 'Préparation des listes d\'identifiants à distribuer.' },
          ]),
          createResultBox('Tout est prêt pour l\'ouverture aux utilisateurs !'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // SEMAINE 2
          createSectionTitle('SEMAINE 2 : OUVERTURE AUX UTILISATEURS'),
          createParagraph('Du Mardi 28 au Vendredi 31 Janvier 2026', { bold: true, italic: true }),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            shading: { type: ShadingType.SOLID, color: COLORS.successBg },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '🎉 Les étudiants et enseignants peuvent maintenant accéder à la plateforme !',
                bold: true,
                size: 26,
                color: COLORS.success,
                font: 'Times New Roman',
              }),
            ],
          }),

          // Lundi 27
          createDayTitle('MARDI 28 JANVIER 2026', 'Lancement - Accès Administration', '🎉'),
          createDayScheduleTable([
            { horaire: '8h00 - 9h00', action: 'Activation comptes admin', explication: 'Le personnel administratif reçoit ses identifiants.' },
            { horaire: '9h00 - 12h00', action: 'Formation rapide', explication: 'Démonstration pratique des fonctions principales (30 min/service).' },
            { horaire: '14h00 - 17h00', action: 'Support sur place', explication: 'L\'équipe technique aide en cas de question.' },
          ]),
          createParagraph('Qui peut se connecter : Personnel administratif et secrétaires académiques', { bold: true, color: COLORS.secondary }),

          // Mardi 28
          createDayTitle('MERCREDI 29 JANVIER 2026', 'Accès Enseignants', '👨‍🏫'),
          createDayScheduleTable([
            { horaire: '8h00 - 9h00', action: 'Distribution identifiants', explication: 'Chaque enseignant reçoit son login et mot de passe.' },
            { horaire: '9h00 - 10h00', action: 'Première connexion', explication: 'Accompagnement pour la connexion et changement de mot de passe.' },
            { horaire: '10h00 - 12h00', action: 'Démonstration', explication: 'Comment saisir les notes, faire l\'appel, consulter les listes.' },
            { horaire: '14h00 - 17h00', action: 'Support disponible', explication: 'L\'équipe reste disponible pour toute question.' },
          ]),
          createParagraph('Qui peut se connecter : Administration + Enseignants', { bold: true, color: COLORS.secondary }),

          // Mercredi 29
          createDayTitle('JEUDI 30 JANVIER 2026', 'Accès Étudiants - Phase 1', '👨‍🎓'),
          createParagraph('Distribution des identifiants aux Facultés prioritaires :', { bold: true }),
          createBulletPoint('Faculté de Médecine'),
          createBulletPoint('Faculté de Droit'),
          createBulletPoint('Faculté Polytechnique'),
          createParagraph('Mode de distribution :', { bold: true }),
          createParagraph('• Par les secrétariats de faculté', { indent: 400 }),
          createParagraph('• Par les délégués de promotion', { indent: 400 }),
          createParagraph('• Par affichage avec QR code', { indent: 400 }),

          // Jeudi 30
          createDayTitle('VENDREDI 31 JANVIER 2026', 'Accès Étudiants - Phase 2', '👨‍🎓'),
          createParagraph('Distribution aux autres Facultés :', { bold: true }),
          createBulletPoint('Faculté des Sciences'),
          createBulletPoint('Faculté des Lettres'),
          createBulletPoint('Faculté d\'Économie'),
          createBulletPoint('Faculté des Sciences Sociales'),
          createBulletPoint('Faculté d\'Agronomie'),
          createBulletPoint('Toutes les autres facultés'),

          // Vendredi 31
          createDayTitle('VENDREDI 31 JANVIER 2026', 'Vérification et support', '✅'),
          createDayScheduleTable([
            { horaire: '8h00 - 12h00', action: 'Identifiants manquants', explication: 'Les étudiants sans identifiants peuvent les obtenir.' },
            { horaire: '14h00 - 17h00', action: 'Résolution problèmes', explication: 'Correction de tout problème de connexion signalé.' },
          ]),
          createResultBox('Tous les utilisateurs peuvent accéder à NEXUS UNIKIN !'),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // SEMAINES 3-4
          createSectionTitle('SEMAINES 3-4 : UTILISATION ET SUIVI'),
          createParagraph('Du Lundi 3 au Vendredi 14 Février 2026', { bold: true, italic: true }),
          createParagraph('La plateforme est en fonctionnement normal avec accompagnement.'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createCell('Semaine', { isHeader: true, width: 15 }),
                  createCell('Activités principales', { isHeader: true, width: 85 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Semaine 3', { bold: true, width: 15, bgColor: COLORS.lightGray }),
                  createCell('Les enseignants utilisent le système de présence et saisissent les premières notes. Les étudiants consultent leurs emplois du temps. Support renforcé disponible.', { width: 85 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Semaine 4', { bold: true, width: 15, bgColor: COLORS.lightGray }),
                  createCell('Fonctionnement autonome. Revue des statistiques d\'utilisation. Ajustements selon les retours. Rapport de fin de déploiement.', { width: 85 }),
                ],
              }),
            ],
          }),

          // COMMENT SE CONNECTER
          createSectionTitle('COMMENT SE CONNECTER'),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            shading: { type: ShadingType.SOLID, color: COLORS.headerBg },
            children: [
              new TextRun({
                text: 'Adresse de la plateforme : ',
                size: 26,
                font: 'Times New Roman',
              }),
              new TextRun({
                text: 'https://nexus.unikin.ac.cd',
                bold: true,
                size: 28,
                color: COLORS.primary,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createCell('Utilisateur', { isHeader: true, width: 25 }),
                  createCell('Identifiant', { isHeader: true, width: 35 }),
                  createCell('Mot de passe', { isHeader: true, width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Étudiant', { bold: true, width: 25 }),
                  createCell('Votre matricule (ex: L1-MED-2024-001)', { width: 35 }),
                  createCell('Communiqué avec l\'identifiant (à changer)', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Enseignant', { bold: true, width: 25 }),
                  createCell('Votre email universitaire', { width: 35 }),
                  createCell('Communiqué personnellement (à changer)', { width: 40 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Administration', { bold: true, width: 25 }),
                  createCell('Attribué par le service informatique', { width: 35 }),
                  createCell('Communiqué de manière sécurisée', { width: 40 }),
                ],
              }),
            ],
          }),

          // Page break
          new Paragraph({ children: [new PageBreak()] }),

          // CE QUI SERA DISPONIBLE
          createSectionTitle('CE QUI SERA DISPONIBLE DÈS L\'OUVERTURE'),

          createParagraph('Pour les Étudiants (dès le 30 janvier)', { bold: true, color: COLORS.primary }),
          createBulletPoint('Consulter son emploi du temps'),
          createBulletPoint('Voir ses notes (quand saisies par l\'enseignant)'),
          createBulletPoint('Vérifier sa situation financière'),
          createBulletPoint('Voir son historique académique'),
          createBulletPoint('Recevoir les annonces de l\'université'),
          createBulletPoint('Confirmer sa présence aux cours (code de présence)'),

          createParagraph('Pour les Enseignants (dès le 29 janvier)', { bold: true, color: COLORS.primary }),
          createBulletPoint('Voir la liste de ses cours et étudiants'),
          createBulletPoint('Saisir les notes (TP, TD, Examens)'),
          createBulletPoint('Faire l\'appel numérique'),
          createBulletPoint('Générer un code de présence'),
          createBulletPoint('Communiquer avec ses étudiants'),
          createBulletPoint('Voir les statistiques de sa classe'),

          createParagraph('Pour l\'Administration (dès le 28 janvier)', { bold: true, color: COLORS.primary }),
          createBulletPoint('Gérer les inscriptions'),
          createBulletPoint('Enregistrer les paiements'),
          createBulletPoint('Générer des rapports'),
          createBulletPoint('Publier des annonces'),
          createBulletPoint('Suivre les statistiques en temps réel'),

          // DATES CLÉS
          createSectionTitle('RÉCAPITULATIF DES DATES CLÉS'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  createCell('Date', { isHeader: true, width: 30 }),
                  createCell('Événement', { isHeader: true, width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Mardi 21 Janvier', { bold: true, width: 30 }),
                  createCell('Mise en ligne de la plateforme sur internet', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Mercredi 22 Janvier', { bold: true, width: 30 }),
                  createCell('Importation des données étudiants', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Jeudi 23 Janvier', { bold: true, width: 30 }),
                  createCell('Importation enseignants et cours', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Vendredi 24 Janvier', { bold: true, width: 30 }),
                  createCell('Connexion aux services existants', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Lundi 27 Janvier', { bold: true, width: 30 }),
                  createCell('Tests finaux', { width: 70 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Mardi 28 Janvier', { bold: true, width: 30, bgColor: COLORS.successBg }),
                  createCell('🎉 Ouverture à l\'administration', { width: 70, bgColor: COLORS.successBg }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Mercredi 29 Janvier', { bold: true, width: 30, bgColor: COLORS.successBg }),
                  createCell('🎉 Ouverture aux enseignants', { width: 70, bgColor: COLORS.successBg }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Jeudi 30 Janvier', { bold: true, width: 30, bgColor: COLORS.successBg }),
                  createCell('🎉 Ouverture aux étudiants (Phase 1)', { width: 70, bgColor: COLORS.successBg }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Vendredi 31 Janvier', { bold: true, width: 30, bgColor: COLORS.successBg }),
                  createCell('🎉 Ouverture aux étudiants (Phase 2)', { width: 70, bgColor: COLORS.successBg }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Vendredi 14 Février', { bold: true, width: 30 }),
                  createCell('Fin du déploiement - Fonctionnement normal', { width: 70 }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({ spacing: { before: 400 } }),
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
                text: 'Janvier 2026',
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

  const buffer = await Packer.toBuffer(doc)
  const outputPath = path.join(__dirname, '..', 'contracts', 'CALENDRIER_DEPLOIEMENT_NEXUS.docx')
  fs.writeFileSync(outputPath, buffer)
  console.log('✅ Document Word généré avec succès :', outputPath)
}

generateDocument().catch(console.error)

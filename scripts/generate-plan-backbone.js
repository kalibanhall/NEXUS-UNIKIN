const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const MARGIN = 50;
const PAGE_WIDTH = 495;

const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN }
});

const outputPath = path.join(__dirname, '..', 'contracts', 'PLAN_TRAVAIL_05_FEV_2026_BACKBONE.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// ===== PAGE 1 =====
let y = MARGIN;

// En-tête
doc.font('Times-Bold').fontSize(11).text('UNIVERSITÉ DE KINSHASA', MARGIN, y);
y += 15;
doc.text('Projet NEXUS UNIKIN', MARGIN, y);
y += 30;

// Titre principal
doc.fontSize(20).text('PLAN DE TRAVAIL', MARGIN, y, { width: PAGE_WIDTH, align: 'center' });
y += 28;
doc.fontSize(14).text('RÉUNION BACKBONE UNIKIN × NEXUS UNIKIN', MARGIN, y, { width: PAGE_WIDTH, align: 'center' });
y += 22;
doc.font('Times-Roman').fontSize(12).text('Stratégie de création des identifiants et intégration des données', MARGIN, y, { width: PAGE_WIDTH, align: 'center' });
y += 30;

// Ligne de séparation
doc.moveTo(MARGIN, y).lineTo(545, y).lineWidth(1.5).stroke();
y += 20;

// Informations de la réunion
doc.font('Times-Bold').fontSize(12).text('Date de la réunion : ', MARGIN, y, { continued: true });
doc.font('Times-Roman').text('Jeudi 05 Février 2026');
y += 18;
doc.font('Times-Bold').text('Durée estimée : ', MARGIN, y, { continued: true });
doc.font('Times-Roman').text('2h00 - 2h30');
y += 28;

// Section Participants
doc.font('Times-Bold').fontSize(14).text('PARTICIPANTS', MARGIN, y);
y += 20;

// Table participants
const colP = [130, 210, 155];
const rowH = 24;

// Header
doc.rect(MARGIN, y, colP[0], rowH).fill('#f0f0f0').stroke();
doc.rect(MARGIN + colP[0], y, colP[1], rowH).fill('#f0f0f0').stroke();
doc.rect(MARGIN + colP[0] + colP[1], y, colP[2], rowH).fill('#f0f0f0').stroke();
doc.fillColor('black').font('Times-Bold').fontSize(10);
doc.text('Équipe', MARGIN + 8, y + 7);
doc.text('Responsable', MARGIN + colP[0] + 8, y + 7);
doc.text('Rôle', MARGIN + colP[0] + colP[1] + 8, y + 7);
y += rowH;

// Row 1
doc.rect(MARGIN, y, colP[0], rowH).stroke();
doc.rect(MARGIN + colP[0], y, colP[1], rowH).stroke();
doc.rect(MARGIN + colP[0] + colP[1], y, colP[2], rowH).stroke();
doc.font('Times-Roman').fontSize(10);
doc.text('Backbone UNIKIN', MARGIN + 8, y + 7);
doc.text('M. Alphonse Tamina et équipe', MARGIN + colP[0] + 8, y + 7);
doc.text('Gestion BDD existantes', MARGIN + colP[0] + colP[1] + 8, y + 7);
y += rowH;

// Row 2
doc.rect(MARGIN, y, colP[0], rowH).stroke();
doc.rect(MARGIN + colP[0], y, colP[1], rowH).stroke();
doc.rect(MARGIN + colP[0] + colP[1], y, colP[2], rowH).stroke();
doc.text('NEXUS UNIKIN', MARGIN + 8, y + 7);
doc.text('M. Chris Ngozulu Kasongo et équipe', MARGIN + colP[0] + 8, y + 7);
doc.text('Développement plateforme', MARGIN + colP[0] + colP[1] + 8, y + 7);
y += rowH + 25;

// Section Objectifs
doc.font('Times-Bold').fontSize(14).text('OBJECTIFS DE LA RÉUNION', MARGIN, y);
y += 20;
doc.font('Times-Roman').fontSize(11);
doc.text('1.  Définir la logique de création des identifiants basés sur le matricule', MARGIN + 15, y);
y += 16;
doc.text('2.  Analyser la structure des bases de données existantes', MARGIN + 15, y);
y += 16;
doc.text('3.  Planifier le processus de collecte et d\'encodage des données', MARGIN + 15, y);
y += 16;
doc.text('4.  Établir un calendrier de migration et d\'intégration', MARGIN + 15, y);
y += 28;

// Section Ordre du jour
doc.font('Times-Bold').fontSize(14).text('ORDRE DU JOUR', MARGIN, y);
y += 20;

const colO = [50, 350, 95];

// Header
doc.rect(MARGIN, y, colO[0], rowH).fill('#f0f0f0').stroke();
doc.rect(MARGIN + colO[0], y, colO[1], rowH).fill('#f0f0f0').stroke();
doc.rect(MARGIN + colO[0] + colO[1], y, colO[2], rowH).fill('#f0f0f0').stroke();
doc.fillColor('black').font('Times-Bold').fontSize(10);
doc.text('Bloc', MARGIN + 8, y + 7);
doc.text('Thème', MARGIN + colO[0] + 8, y + 7);
doc.text('Durée', MARGIN + colO[0] + colO[1] + 8, y + 7);
y += rowH;

const blocs = [
    ['1', 'Logique de création des identifiants de connexion', '30 min'],
    ['2', 'Analyse des bases de données existantes', '40 min'],
    ['3', 'Stratégie de collecte et encodage des données', '30 min'],
    ['4', 'Décisions et attribution des tâches', '20 min']
];

doc.font('Times-Roman').fontSize(10);
blocs.forEach(b => {
    doc.rect(MARGIN, y, colO[0], rowH).stroke();
    doc.rect(MARGIN + colO[0], y, colO[1], rowH).stroke();
    doc.rect(MARGIN + colO[0] + colO[1], y, colO[2], rowH).stroke();
    doc.text(b[0], MARGIN + 20, y + 7);
    doc.text(b[1], MARGIN + colO[0] + 8, y + 7);
    doc.text(b[2], MARGIN + colO[0] + colO[1] + 8, y + 7);
    y += rowH;
});

// ===== PAGE 2 =====
doc.addPage();
y = MARGIN;

// Détail des blocs
doc.font('Times-Bold').fontSize(14).text('DÉTAIL DES BLOCS', MARGIN, y);
y += 25;

// Bloc 1
doc.font('Times-Bold').fontSize(12).text('BLOC 1 : CRÉATION DES IDENTIFIANTS (30 min)', MARGIN, y);
y += 18;
doc.font('Times-Roman').fontSize(11);
doc.text('•   Structure et format du numéro matricule existant', MARGIN + 20, y); y += 15;
doc.text('•   Convention de nommage pour les identifiants de connexion', MARGIN + 20, y); y += 15;
doc.text('•   Politique de génération des mots de passe initiaux', MARGIN + 20, y); y += 15;
doc.text('•   Gestion des cas particuliers (doublons, matricules manquants)', MARGIN + 20, y); y += 25;

// Bloc 2
doc.font('Times-Bold').fontSize(12).text('BLOC 2 : ANALYSE DES BASES DE DONNÉES (40 min)', MARGIN, y);
y += 18;
doc.font('Times-Roman').fontSize(11).text('Éléments à examiner :', MARGIN, y);
y += 18;

// Table données
const colD = [247, 248];
doc.rect(MARGIN, y, colD[0], 22).fill('#f0f0f0').stroke();
doc.rect(MARGIN + colD[0], y, colD[1], 22).fill('#f0f0f0').stroke();
doc.fillColor('black').font('Times-Bold').fontSize(10);
doc.text('Données Étudiants', MARGIN + 8, y + 6);
doc.text('Données Enseignants', MARGIN + colD[0] + 8, y + 6);
y += 22;

const donnees = [
    ['Matricule', 'Matricule / ID'],
    ['Nom complet', 'Nom complet'],
    ['Faculté / Département', 'Grade académique'],
    ['Promotion / Niveau', 'Département'],
    ['Contact (téléphone, email)', 'Contact (téléphone, email)']
];

doc.font('Times-Roman').fontSize(10);
donnees.forEach(d => {
    doc.rect(MARGIN, y, colD[0], 20).stroke();
    doc.rect(MARGIN + colD[0], y, colD[1], 20).stroke();
    doc.text(d[0], MARGIN + 8, y + 5);
    doc.text(d[1], MARGIN + colD[0] + 8, y + 5);
    y += 20;
});
y += 20;

// Bloc 3
doc.font('Times-Bold').fontSize(12).text('BLOC 3 : STRATÉGIE DE COLLECTE (30 min)', MARGIN, y);
y += 18;
doc.font('Times-Roman').fontSize(11);
doc.text('•   Import automatique depuis les bases de données Backbone', MARGIN + 20, y); y += 15;
doc.text('•   Import semi-automatique via fichiers Excel/CSV', MARGIN + 20, y); y += 15;
doc.text('•   Saisie manuelle via interface NEXUS', MARGIN + 20, y); y += 25;

// Bloc 4
doc.font('Times-Bold').fontSize(12).text('BLOC 4 : DÉCISIONS ET PROCHAINES ÉTAPES (20 min)', MARGIN, y);
y += 18;
doc.font('Times-Roman').fontSize(11);
doc.text('•   Récapitulatif des décisions prises', MARGIN + 20, y); y += 15;
doc.text('•   Attribution des responsabilités', MARGIN + 20, y); y += 15;
doc.text('•   Définition des échéances', MARGIN + 20, y); y += 30;

// Section Livrables
doc.font('Times-Bold').fontSize(14).text('LIVRABLES ATTENDUS', MARGIN, y);
y += 20;
doc.font('Times-Roman').fontSize(11);
doc.text('[ ]   Convention de nommage des identifiants validée', MARGIN + 20, y); y += 16;
doc.text('[ ]   Liste des champs de données à migrer', MARGIN + 20, y); y += 16;
doc.text('[ ]   Plan d\'action pour la migration', MARGIN + 20, y); y += 16;
doc.text('[ ]   Calendrier d\'intégration défini', MARGIN + 20, y); y += 30;

// Section Préparation
doc.font('Times-Bold').fontSize(14).text('PRÉPARATION REQUISE', MARGIN, y);
y += 22;

doc.font('Times-Bold').fontSize(11).text('Équipe Backbone UNIKIN :', MARGIN, y);
y += 16;
doc.font('Times-Roman').fontSize(11);
doc.text('•   Documentation sur la structure des BDD existantes', MARGIN + 20, y); y += 14;
doc.text('•   Échantillon de données (anonymisé)', MARGIN + 20, y); y += 14;
doc.text('•   Statistiques : nombre d\'étudiants, enseignants, facultés', MARGIN + 20, y); y += 22;

doc.font('Times-Bold').fontSize(11).text('Équipe NEXUS UNIKIN :', MARGIN, y);
y += 16;
doc.font('Times-Roman').fontSize(11);
doc.text('•   Schéma de la base de données NEXUS', MARGIN + 20, y); y += 14;
doc.text('•   Interface d\'import de données prête', MARGIN + 20, y); y += 14;
doc.text('•   Démonstration du processus de création de compte', MARGIN + 20, y); y += 30;

// Pied de page
doc.moveTo(MARGIN, y).lineTo(545, y).stroke();
y += 12;
doc.font('Times-Roman').fontSize(10).text('Document préparé le 04 février 2026 - Projet NEXUS UNIKIN', MARGIN, y, { width: PAGE_WIDTH, align: 'center' });

doc.end();
console.log('PDF Backbone généré : ' + outputPath);

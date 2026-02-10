const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ 
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    autoFirstPage: false,
    bufferPages: false
});

const outputPath = path.join(__dirname, '..', 'contracts', 'PLAN_TRAVAIL_05_FEV_2026_EQUIPE_NEXUS.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const M = 50;
const W = 495;

// Fonction pour dessiner un bloc de code sans utiliser doc.text avec position auto
function codeBlock(yStart, lines) {
    const lineH = 12;
    const h = (lines.length * lineH) + 30;
    doc.rect(M, yStart, W, h).fill('#1e1e1e');
    doc.rect(M, yStart, W, 18).fill('#333333');
    doc.fillColor('#888').font('Helvetica').fontSize(8).text('workflow.txt', M + 10, yStart + 4, { lineBreak: false });
    
    let cy = yStart + 24;
    doc.font('Courier').fontSize(8);
    lines.forEach((line, i) => {
        doc.fillColor('#666').text(String(i+1).padStart(2, ' '), M + 6, cy, { lineBreak: false });
        doc.fillColor('#d4d4d4').text(line, M + 28, cy, { lineBreak: false });
        cy += lineH;
    });
    doc.fillColor('black');
    return yStart + h + 10;
}

// PAGE 1
doc.addPage();
doc.font('Times-Bold').fontSize(10).text('UNIVERSITÉ DE KINSHASA - Projet NEXUS UNIKIN - DOCUMENT INTERNE', M, 50, { lineBreak: false });
doc.moveTo(M, 68).lineTo(545, 68).lineWidth(2).stroke('#2c5282');

doc.fillColor('#1a365d').font('Times-Bold').fontSize(18).text('DOSSIER DE PRÉPARATION', M, 80, { align: 'center', width: W });
doc.fillColor('#2b6cb0').fontSize(13).text('Réunion Backbone UNIKIN - 05 Février 2026', M, 102, { align: 'center', width: W });
doc.fillColor('black').font('Times-Roman').fontSize(11).text('Document confidentiel - Équipe NEXUS UNIKIN', M, 120, { align: 'center', width: W });
doc.moveTo(M, 138).lineTo(545, 138).lineWidth(1).stroke();

doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('CONTEXTE ET ENJEUX', M, 150, { lineBreak: false });
doc.fillColor('black').font('Times-Roman').fontSize(10).text('La réunion avec Backbone est cruciale pour établir la stratégie d\'intégration des données dans NEXUS.', M, 168, { width: W });

doc.font('Times-Bold').fontSize(11).text('Points critiques :', M, 188, { lineBreak: false });
doc.font('Times-Roman').fontSize(10);
doc.text('• Comprendre la structure des matricules UNIKIN', M + 15, 202, { lineBreak: false });
doc.text('• Évaluer la qualité et la complétude des données', M + 15, 214, { lineBreak: false });
doc.text('• Identifier les contraintes d\'interopérabilité', M + 15, 226, { lineBreak: false });
doc.text('• Négocier un accès aux données ou un mécanisme d\'export', M + 15, 238, { lineBreak: false });

doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('SECTION 1 : CRÉATION DES IDENTIFIANTS', M, 260, { lineBreak: false });
doc.moveTo(M, 275).lineTo(545, 275).stroke('#ccc');

doc.fillColor('black').font('Times-Bold').fontSize(11).text('1.1 Structure probable du matricule UNIKIN', M, 285, { lineBreak: false });
doc.font('Times-Roman').fontSize(10).text('Format: ANNÉE-FACULTÉ-NUMÉRO (ex: 2024-SC-00125)', M, 300, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('1.2 Scénarios d\'identifiants proposés', M, 320, { lineBreak: false });

// Scénario A
doc.rect(M, 335, W, 50).fill('#e6fffa').stroke('#ccc');
doc.fillColor('#1a365d').font('Times-Bold').fontSize(10).text('SCÉNARIO A : Matricule comme identifiant direct', M + 8, 342, { lineBreak: false });
doc.fillColor('black').font('Times-Roman').fontSize(9);
doc.text('Identifiant = Matricule (ex: 2024-SC-00125) | Mot de passe initial: Date de naissance', M + 8, 356, { lineBreak: false });
doc.text('Avantages: Simple, familier | Inconvénients: Peut révéler des informations', M + 8, 368, { lineBreak: false });

// Scénario B
doc.rect(M, 390, W, 50).fill('#fef3c7').stroke('#ccc');
doc.fillColor('#1a365d').font('Times-Bold').fontSize(10).text('SCÉNARIO B : Email institutionnel basé sur matricule', M + 8, 397, { lineBreak: false });
doc.fillColor('black').font('Times-Roman').fontSize(9);
doc.text('Identifiant = matricule@unikin.ac.cd | Mot de passe initial: 8 premiers caractères nom + année', M + 8, 411, { lineBreak: false });
doc.text('Avantages: Format email standard | Inconvénients: Nécessite gestion du domaine', M + 8, 423, { lineBreak: false });

// Scénario C
doc.rect(M, 445, W, 50).fill('#fed7e2').stroke('#ccc');
doc.fillColor('#1a365d').font('Times-Bold').fontSize(10).text('SCÉNARIO C : Identifiant hybride avec préfixe de rôle', M + 8, 452, { lineBreak: false });
doc.fillColor('black').font('Times-Roman').fontSize(9);
doc.text('Identifiant = ETU-[matricule] ou ENS-[matricule] | Mot de passe: Généré + SMS/Email', M + 8, 466, { lineBreak: false });
doc.text('Avantages: Identification immédiate du rôle | Inconvénients: Plus long à saisir', M + 8, 478, { lineBreak: false });

doc.fillColor('black').font('Times-Bold').fontSize(11).text('1.3 Questions à poser à Backbone', M, 510, { lineBreak: false });
doc.font('Times-Roman').fontSize(10);
doc.text('1. Le matricule est-il unique et jamais réutilisé ?', M + 15, 525, { lineBreak: false });
doc.text('2. Y a-t-il des étudiants/enseignants sans matricule ?', M + 15, 538, { lineBreak: false });
doc.text('3. Le format du matricule a-t-il changé au fil des années ?', M + 15, 551, { lineBreak: false });
doc.text('4. Comment sont gérés les transferts entre facultés ?', M + 15, 564, { lineBreak: false });

doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('SECTION 2 : BASES DE DONNÉES', M, 590, { lineBreak: false });
doc.moveTo(M, 605).lineTo(545, 605).stroke('#ccc');

doc.fillColor('black').font('Times-Bold').fontSize(11).text('2.1 Structure BDD NEXUS', M, 615, { lineBreak: false });
doc.font('Times-Roman').fontSize(9);
doc.text('• users: email, password, role, first_name, last_name (email UNIQUE)', M + 10, 630, { lineBreak: false });
doc.text('• students: user_id, matricule, promotion_id, status (matricule UNIQUE)', M + 10, 643, { lineBreak: false });
doc.text('• teachers: user_id, matricule, grade, department_id (matricule UNIQUE)', M + 10, 656, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('2.2 Mapping Backbone → NEXUS', M, 676, { lineBreak: false });
doc.font('Times-Roman').fontSize(9);
doc.text('matricule → students.matricule | nom,prénom → users.last_name, first_name', M + 10, 691, { lineBreak: false });
doc.text('date_naissance → birth_date | code_faculté → faculties.code (FK) | téléphone → users.phone', M + 10, 704, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('2.3 Points de vigilance', M, 724, { lineBreak: false });
doc.font('Times-Roman').fontSize(9);
doc.text('! Encodage UTF-8  ! Format dates  ! Valeurs nulles  ! Doublons  ! Codes facultés', M + 10, 739, { lineBreak: false });

// PAGE 2
doc.addPage();
doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('SECTION 3 : SCÉNARIOS DE MIGRATION', M, 50, { lineBreak: false });
doc.moveTo(M, 65).lineTo(545, 65).stroke('#ccc');

doc.fillColor('black').font('Times-Bold').fontSize(11).text('3.1 Workflow A : Migration directe (connexion BDD)', M, 78, { lineBreak: false });

codeBlock(93, [
    '+-------------+    SQL/API    +-------------+    Transform    +-------------+',
    '|    BDD      | ------------> |   Script    | --------------> |   NEXUS     |',
    '|  Backbone   |               |  Migration  |                 |    BDD      |',
    '+-------------+               +-------------+                 +-------------+'
]);

doc.font('Times-Roman').fontSize(9);
doc.text('Avantages: Automatisé, rapide, données à jour', M, 175, { lineBreak: false });
doc.text('Inconvénients: Nécessite accès direct à leur BDD, risques sécurité', M, 187, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('3.2 Workflow B : Import par fichiers (Excel/CSV)', M, 207, { lineBreak: false });

codeBlock(222, [
    '+----------+  Export   +--------+  Upload  +-----------+  Import  +-------+',
    '| Backbone | --------> | Fichier| -------> | Interface | -------> | NEXUS |',
    '|   BDD    |  Manuel   | CSV    |          |   NEXUS   |   Auto   |  BDD  |',
    '+----------+           +--------+          +-----------+          +-------+'
]);

doc.font('Times-Roman').fontSize(9);
doc.text('Avantages: Pas d\'accès direct nécessaire, contrôle manuel', M, 304, { lineBreak: false });
doc.text('Inconvénients: Processus manuel, données potentiellement obsolètes', M, 316, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('3.3 Workflow C : Synchronisation API (temps réel)', M, 336, { lineBreak: false });

codeBlock(351, [
    '+-------------+             +-------------+             +-------------+',
    '|  Backbone   |<----------->|     API     |<----------->|   NEXUS     |',
    '|   Système   |   REST/     |   Gateway   |    REST/    |   Système   |',
    '+-------------+   SOAP      +-------------+    JSON     +-------------+'
]);

doc.font('Times-Roman').fontSize(9);
doc.text('Avantages: Données toujours synchronisées, bidirectionnel', M, 421, { lineBreak: false });
doc.text('Inconvénients: Complexe, nécessite développement API côté Backbone', M, 433, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('3.4 Workflow D : Hybride progressif (RECOMMANDÉ)', M, 453, { lineBreak: false });

codeBlock(468, [
    '  PHASE 1 (Immédiat)        PHASE 2 (Court terme)       PHASE 3 (Long terme)',
    '+-------------------+     +-------------------+     +---------------------+',
    '| Import Excel/CSV  |---->| Script migration  |---->| API bidirectionnelle|',
    '| données initiales |     | périodique        |     | temps réel          |',
    '+-------------------+     +-------------------+     +---------------------+'
]);

doc.font('Times-Roman').fontSize(9);
doc.text('Avantages: Démarrage rapide, évolution progressive', M, 556, { lineBreak: false });
doc.text('Prérequis: Template Excel + planification des phases', M, 568, { lineBreak: false });

doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('SECTION 4 : COLLECTE DES DONNÉES', M, 595, { lineBreak: false });
doc.moveTo(M, 610).lineTo(545, 610).stroke('#ccc');

doc.fillColor('black').font('Times-Bold').fontSize(11).text('4.1 Disponibilité des données (estimation)', M, 623, { lineBreak: false });
doc.font('Times-Roman').fontSize(9);
doc.text('Matricule: 100% | Nom: 100% | Date naissance: ~80% | Email: ~30% | Téléphone: ~50% | Photo: ~10%', M + 10, 638, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('4.2 Plan de collecte des données manquantes', M, 658, { lineBreak: false });
doc.font('Times-Roman').fontSize(9);
doc.text('Option 1: Formulaire en ligne via portail NEXUS', M + 10, 673, { lineBreak: false });
doc.text('Option 2: Campagne de collecte sur site (stands facultés)', M + 10, 686, { lineBreak: false });
doc.text('Option 3: Collecte progressive lors de la première connexion', M + 10, 699, { lineBreak: false });
doc.text('Option 4: Intégration avec le processus d\'inscription', M + 10, 712, { lineBreak: false });

// PAGE 3
doc.addPage();
doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('SECTION 5 : CHECKLIST DE PRÉPARATION', M, 50, { lineBreak: false });
doc.moveTo(M, 65).lineTo(545, 65).stroke('#ccc');

doc.fillColor('black').font('Times-Bold').fontSize(11).text('5.1 AVANT la réunion - À préparer', M, 78, { lineBreak: false });
doc.font('Times-Roman').fontSize(10);
doc.text('[ ] Schéma de la BDD NEXUS (tables users, students, teachers)', M + 15, 95, { lineBreak: false });
doc.text('[ ] Interface de démo pour import de données', M + 15, 110, { lineBreak: false });
doc.text('[ ] Template Excel vide pour import', M + 15, 125, { lineBreak: false });
doc.text('[ ] Liste des questions à poser à Backbone', M + 15, 140, { lineBreak: false });
doc.text('[ ] Proposition écrite des 3 scénarios d\'identifiants', M + 15, 155, { lineBreak: false });
doc.text('[ ] Calendrier prévisionnel de migration', M + 15, 170, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('5.2 PENDANT la réunion - Points à valider', M, 195, { lineBreak: false });
doc.font('Times-Roman').fontSize(10);
doc.text('[ ] Format exact du matricule étudiant', M + 15, 212, { lineBreak: false });
doc.text('[ ] Format exact du matricule/ID enseignant', M + 15, 227, { lineBreak: false });
doc.text('[ ] Structure des tables Backbone (champs disponibles)', M + 15, 242, { lineBreak: false });
doc.text('[ ] Volume de données (nombre d\'étudiants, enseignants)', M + 15, 257, { lineBreak: false });
doc.text('[ ] Possibilité d\'export CSV/Excel ou accès direct BDD', M + 15, 272, { lineBreak: false });
doc.text('[ ] Fréquence de mise à jour souhaitée', M + 15, 287, { lineBreak: false });
doc.text('[ ] Responsable technique côté Backbone', M + 15, 302, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('5.3 APRÈS la réunion - Livrables', M, 327, { lineBreak: false });
doc.font('Times-Roman').fontSize(10);
doc.text('[ ] Compte-rendu de réunion', M + 15, 344, { lineBreak: false });
doc.text('[ ] Convention de nommage validée', M + 15, 359, { lineBreak: false });
doc.text('[ ] Spécification technique du mapping de données', M + 15, 374, { lineBreak: false });
doc.text('[ ] Script de migration ou Template Excel final', M + 15, 389, { lineBreak: false });
doc.text('[ ] Calendrier de migration avec jalons', M + 15, 404, { lineBreak: false });

doc.fillColor('#1a365d').font('Times-Bold').fontSize(14).text('SECTION 6 : ARGUMENTAIRE ET NÉGOCIATION', M, 435, { lineBreak: false });
doc.moveTo(M, 450).lineTo(545, 450).stroke('#ccc');

doc.fillColor('black').font('Times-Bold').fontSize(11).text('6.1 Arguments pour obtenir l\'accès aux données', M, 463, { lineBreak: false });
doc.font('Times-Roman').fontSize(10);
doc.text('• Éviter la double saisie et les erreurs de transcription', M + 15, 480, { lineBreak: false });
doc.text('• Garantir la cohérence des données entre systèmes', M + 15, 495, { lineBreak: false });
doc.text('• Réduire la charge de travail des secrétariats', M + 15, 510, { lineBreak: false });
doc.text('• Permettre un déploiement rapide de NEXUS', M + 15, 525, { lineBreak: false });
doc.text('• Assurer la traçabilité académique des étudiants', M + 15, 540, { lineBreak: false });

doc.font('Times-Bold').fontSize(11).text('6.2 Réponses aux objections possibles', M, 565, { lineBreak: false });

doc.font('Times-Bold').fontSize(10).text('Objection: "Les données sont confidentielles"', M, 585, { lineBreak: false });
doc.font('Times-Roman').fontSize(10).text('→ Nous signerons un accord de confidentialité. Les données restent à l\'UNIKIN.', M + 15, 600, { lineBreak: false });

doc.font('Times-Bold').fontSize(10).text('Objection: "Notre système est incompatible"', M, 625, { lineBreak: false });
doc.font('Times-Roman').fontSize(10).text('→ Un simple export Excel suffit pour démarrer. Nous nous adaptons à tout format.', M + 15, 640, { lineBreak: false });

doc.font('Times-Bold').fontSize(10).text('Objection: "Nous n\'avons pas le temps"', M, 665, { lineBreak: false });
doc.font('Times-Roman').fontSize(10).text('→ Un export ponctuel de 2h nous permet de démarrer. La suite sera progressive.', M + 15, 680, { lineBreak: false });

// Pied de page
doc.moveTo(M, 730).lineTo(545, 730).lineWidth(2).stroke('#2c5282');
doc.fillColor('#1a365d').font('Times-Bold').fontSize(10).text('DOCUMENT CONFIDENTIEL - ÉQUIPE NEXUS UNIKIN', M, 745, { align: 'center', width: W });
doc.fillColor('black').font('Times-Roman').fontSize(9).text('Préparé le 04 février 2026 - M. Chris Ngozulu Kasongo et son équipe', M, 760, { align: 'center', width: W });

doc.end();

stream.on('finish', function() {
    console.log('PDF NEXUS généré (3 pages avec workflows): ' + outputPath);
});

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============================================================
// NEXUS UNIKIN — Plan d'Action Délibération
// Faculté des Sciences Pharmaceutiques
// 19 Février 2026
// ============================================================

// Couleurs
const BLUE_DARK = '#1e3a5f';
const BLUE_MED = '#2c5282';
const BLUE_LIGHT = '#e8f0fe';
const GREEN = '#48bb78';
const ORANGE = '#ed8936';
const RED = '#e53e3e';
const GRAY = '#718096';
const BLACK = '#000000';
const WHITE = '#ffffff';

function addHeader(doc, text) {
  if (doc.y > 680) doc.addPage();
  doc.fontSize(16).fillColor(BLUE_DARK).font('Helvetica-Bold').text(text, { underline: false }).moveDown(0.4);
  // Ligne décorative
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BLUE_DARK).lineWidth(2).stroke();
  doc.moveDown(0.5);
}

function addSubheader(doc, text) {
  if (doc.y > 700) doc.addPage();
  doc.fontSize(13).fillColor(BLUE_MED).font('Helvetica-Bold').text(text).moveDown(0.3);
}

function addText(doc, text, opts = {}) {
  doc.fontSize(10).fillColor(BLACK).font('Helvetica').text(text, opts).moveDown(0.2);
}

function addBoldText(doc, text, opts = {}) {
  doc.fontSize(10).fillColor(BLACK).font('Helvetica-Bold').text(text, opts).moveDown(0.2);
}

function addBullet(doc, text, level = 0) {
  const indent = 60 + (level * 20);
  const bullet = level === 0 ? '•' : '–';
  doc.fontSize(10).fillColor(BLACK).font('Helvetica');
  doc.text(`${bullet}  ${text}`, indent, doc.y, { width: 545 - indent - 10 });
  doc.moveDown(0.15);
}

function addTable(doc, headers, rows, columnWidths) {
  const startX = 50;
  let currentY = doc.y;
  const rowHeight = 22;
  const headerHeight = 26;

  // Vérifier espace
  const totalHeight = headerHeight + (rows.length * rowHeight) + 10;
  if (currentY + totalHeight > 740) doc.addPage();
  currentY = doc.y;

  // En-têtes
  let currentX = startX;
  headers.forEach((header, i) => {
    doc.rect(currentX, currentY, columnWidths[i], headerHeight).fill(BLUE_DARK);
    doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
       .text(header, currentX + 4, currentY + 7, { width: columnWidths[i] - 8, align: 'left' });
    currentX += columnWidths[i];
  });
  currentY += headerHeight;

  // Lignes
  doc.font('Helvetica').fontSize(8);
  rows.forEach((row, ri) => {
    if (currentY + rowHeight > 740) {
      doc.addPage();
      currentY = 50;
      // Re-dessiner en-têtes
      currentX = startX;
      headers.forEach((header, i) => {
        doc.rect(currentX, currentY, columnWidths[i], headerHeight).fill(BLUE_DARK);
        doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
           .text(header, currentX + 4, currentY + 7, { width: columnWidths[i] - 8, align: 'left' });
        currentX += columnWidths[i];
      });
      currentY += headerHeight;
      doc.font('Helvetica').fontSize(8);
    }

    currentX = startX;
    const bg = ri % 2 === 0 ? '#f7fafc' : WHITE;
    row.forEach((cell, i) => {
      doc.rect(currentX, currentY, columnWidths[i], rowHeight).fill(bg).stroke('#e2e8f0');
      doc.fillColor(BLACK).text(String(cell), currentX + 4, currentY + 6, { width: columnWidths[i] - 8, align: 'left' });
      currentX += columnWidths[i];
    });
    currentY += rowHeight;
  });
  doc.y = currentY + 8;
}

function addStatusBadge(doc, text, color) {
  const x = doc.x;
  const y = doc.y;
  const w = doc.widthOfString(text) + 12;
  doc.roundedRect(x, y, w, 16, 3).fill(color);
  doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold').text(text, x + 6, y + 4);
  doc.y = y + 20;
}

async function generatePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'NEXUS UNIKIN — Plan d\'Action Première Délibération',
      Author: 'Chris NGOZULU KASONGO',
      Subject: 'Plan d\'action pour la première délibération — Faculté des Sciences Pharmaceutiques'
    }
  });

  const outputPath = path.join(__dirname, '..', 'output', 'plan-action-deliberation-pharmacie-19-fevrier-2026.pdf');
  const outputStream = fs.createWriteStream(outputPath);
  doc.pipe(outputStream);

  // ========================================
  // PAGE DE GARDE
  // ========================================
  doc.moveDown(3);

  // Logo / Titre principal
  doc.rect(40, 120, 515, 120).fill(BLUE_DARK);
  doc.fontSize(28).fillColor(WHITE).font('Helvetica-Bold')
     .text('NEXUS UNIKIN', 50, 140, { align: 'center', width: 495 });
  doc.fontSize(12).fillColor('#b0c4de').font('Helvetica')
     .text('Plateforme de Gestion Universitaire Intégrée', 50, 175, { align: 'center', width: 495 });
  doc.fontSize(10).fillColor('#b0c4de')
     .text('Université de Kinshasa', 50, 195, { align: 'center', width: 495 });

  doc.moveDown(5);
  doc.fontSize(22).fillColor(BLUE_DARK).font('Helvetica-Bold')
     .text('PLAN D\'ACTION', { align: 'center' });
  doc.fontSize(16).fillColor(BLUE_MED).font('Helvetica-Bold')
     .text('Première Délibération via la Plateforme', { align: 'center' });
  doc.moveDown(0.5);

  // Encadré faculté
  const fBoxY = doc.y;
  doc.rect(120, fBoxY, 310, 45).fill(BLUE_LIGHT).stroke(BLUE_MED);
  doc.fontSize(14).fillColor(BLUE_DARK).font('Helvetica-Bold')
     .text('Faculté des Sciences Pharmaceutiques', 130, fBoxY + 8, { align: 'center', width: 290 });
  doc.fontSize(10).fillColor(GRAY).font('Helvetica')
     .text('(FSPHAR)', 130, fBoxY + 28, { align: 'center', width: 290 });
  doc.y = fBoxY + 60;

  doc.moveDown(2);
  doc.fontSize(11).fillColor(BLACK).font('Helvetica')
     .text('Date du document : 19 Février 2026', { align: 'center' });
  doc.text('Responsable technique : Chris NGOZULU KASONGO', { align: 'center' });
  doc.text('Contact : +243 832 313 105', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(9).fillColor(GRAY).font('Helvetica')
     .text('Document confidentiel — Usage interne uniquement', { align: 'center' });


  // ========================================
  // PAGE 2 : ÉTAT ACTUEL
  // ========================================
  doc.addPage();
  addHeader(doc, '1. ÉTAT ACTUEL DE LA PLATEFORME');
  doc.moveDown(0.3);

  addSubheader(doc, '1.1 — Données en base (Faculté des Sciences Pharmaceutiques)');
  addTable(doc,
    ['Élément', 'Quantité', 'Statut'],
    [
      ['Étudiants intégrés', '1 197', '✓ Complet'],
      ['Départements', '2', '✓ Complet'],
      ['Promotions', '18', '✓ Complet'],
      ['Paiements historiques', 'Importés', '✓ Complet'],
      ['Enseignants', '0', '✗ MANQUANT'],
      ['Cours', '0', '✗ MANQUANT'],
      ['Notes', '0', '✗ MANQUANT'],
      ['Jury de délibération', '0', '✗ MANQUANT'],
      ['Personnel administratif', '0', '✗ MANQUANT'],
    ],
    [250, 120, 125]
  );
  doc.moveDown(0.5);

  addSubheader(doc, '1.2 — État des fonctionnalités (audit détaillé)');
  addTable(doc,
    ['Fonctionnalité', 'API Backend', 'Interface', 'État'],
    [
      ['Saisie notes (enseignant)', 'Fonctionnel', 'Fonctionnel', '90%'],
      ['Activation comptes étudiants', 'Fonctionnel', 'Fonctionnel', '95%'],
      ['Évaluations / Examens', 'Fonctionnel', 'Fonctionnel', '85%'],
      ['Gestion délibérations', 'Fonctionnel', 'MOCK data', '50%'],
      ['Présences (étudiant)', 'Fonctionnel', 'Fonctionnel', '80%'],
      ['Présences (enseignant)', 'Fonctionnel', 'Déconnecté', '40%'],
      ['Documents (employé)', 'Fonctionnel', 'MOCK data', '40%'],
      ['Paiements (employé)', 'Fonctionnel', 'MOCK data', '40%'],
      ['Upload reçu paiement', 'Métadonnées', 'Faux upload', '30%'],
      ['Réinit. mot de passe', 'Inexistant', 'Inexistant', '0%'],
      ['Notifications', 'Fonctionnel', 'Fonctionnel', '60%'],
    ],
    [160, 100, 100, 55]
  );

  // ========================================
  // PAGE 3 : PHASE 1 — COLLECTE
  // ========================================
  doc.addPage();
  addHeader(doc, '2. PHASE 1 : COLLECTE DE DONNÉES');
  
  doc.fontSize(10).fillColor(GRAY).font('Helvetica-Oblique')
     .text('Priorité immédiate — Responsable : Secrétariat de la Faculté des Sciences Pharmaceutiques')
     .text('Durée estimée : 1 à 2 semaines')
     .text('Outil : Fichier Excel « COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx »')
     .moveDown(0.5);

  addSubheader(doc, '2.1 — Données à collecter');
  addTable(doc,
    ['Donnée', 'Source', 'Feuille Excel', 'Criticité'],
    [
      ['Enseignants (noms, grades, depts, tél.)', 'Secrétariat faculté', 'ENSEIGNANTS', 'CRITIQUE'],
      ['Catalogue cours par promotion', 'Secrétariat acad.', 'COURS', 'CRITIQUE'],
      ['Composition jury délibération', 'Doyen / Vice-Doyen', 'JURY', 'CRITIQUE'],
      ['Critères délibération (seuils)', 'Doyen', 'CRITÈRES', 'CRITIQUE'],
      ['Personnel administratif', 'Administration', 'EMPLOYÉS', 'Recommandé'],
      ['Notes existantes (si papier)', 'Enseignants', 'NOTES', 'Optionnel'],
    ],
    [155, 105, 105, 80]
  );
  doc.moveDown(0.3);

  addSubheader(doc, '2.2 — Processus de collecte');
  addBullet(doc, 'Remettre le fichier Excel au secrétaire académique de la Faculté');
  addBullet(doc, 'Le secrétariat remplit les feuilles ENSEIGNANTS, COURS et JURY');
  addBullet(doc, 'Le Doyen valide et signe la feuille CRITÈRES DÉLIBÉRATION');
  addBullet(doc, 'Le fichier rempli est renvoyé à l\'équipe technique');
  addBullet(doc, 'L\'équipe technique exécute le script d\'importation automatique');
  doc.moveDown(0.3);

  addSubheader(doc, '2.3 — Effectifs par département');
  doc.moveDown(0.2);
  addBoldText(doc, 'Département de Pharmacie — 11 promotions, 1 129 étudiants');
  addBullet(doc, 'B1 (382), B2 (189), B3 (96), L1 LMD (203), L2 LMD (18), L3 LMD (5)');
  addBullet(doc, 'P1 (95), P2 (115), P3 (22), G3 (2), M1 (2)');
  doc.moveDown(0.2);
  addBoldText(doc, 'Département Licence et Techniques Pharmaceutiques — 6 promotions, 68 étudiants');
  addBullet(doc, 'B1 (4), B2 (5), B3 (1), L1 LMD (30), L2 LMD (23), L3 LMD (5)');

  // ========================================
  // PAGE 4 : PHASE 2 — CORRECTIONS TECHNIQUES
  // ========================================
  doc.addPage();
  addHeader(doc, '3. PHASE 2 : CORRECTIONS TECHNIQUES');
  
  doc.fontSize(10).fillColor(GRAY).font('Helvetica-Oblique')
     .text('Responsable : Équipe technique — Durée estimée : 1 à 2 semaines (en parallèle avec Phase 1)')
     .moveDown(0.5);

  // 3.1 Password reset
  addSubheader(doc, '3.1 — Réinitialisation de mot de passe (à créer de zéro)');
  doc.moveDown(0.2);
  addBoldText(doc, 'État actuel : INEXISTANT (0%)');
  addText(doc, 'Le lien « Mot de passe oublié » de la page de connexion pointe vers une page qui n\'existe pas. Aucune API, aucune table en base.');
  doc.moveDown(0.2);
  addBoldText(doc, 'Ce qui doit être développé :');
  addBullet(doc, 'Page de demande de réinitialisation (formulaire matricule + téléphone)');
  addBullet(doc, 'API backend pour enregistrer la demande en base');
  addBullet(doc, 'Table « password_reset_requests » à créer en base');
  addBullet(doc, 'Section admin pour voir les demandes et générer un mot de passe temporaire');
  addBullet(doc, 'Notification à l\'utilisateur du nouveau mot de passe');
  addBullet(doc, 'Forcer le changement de mot de passe à la première connexion');
  doc.moveDown(0.2);
  addBoldText(doc, 'Workflow :');
  addBullet(doc, '1. L\'utilisateur clique « Mot de passe oublié » → entre son matricule et téléphone');
  addBullet(doc, '2. La demande est enregistrée avec statut PENDING');
  addBullet(doc, '3. L\'admin voit la demande dans son tableau de bord');
  addBullet(doc, '4. L\'admin génère un mot de passe temporaire');
  addBullet(doc, '5. L\'utilisateur se connecte et est forcé de changer son mot de passe');
  doc.moveDown(0.3);
  addText(doc, 'Effort estimé : 2 à 3 jours de développement.');

  // 3.2 Délibérations
  doc.moveDown(0.3);
  if (doc.y > 620) doc.addPage();
  addSubheader(doc, '3.2 — Interface admin délibérations (connecter aux vraies APIs)');
  addBoldText(doc, 'État actuel : API fonctionnelle, interface avec données MOCK (50%)');
  addText(doc, 'L\'API backend calcule correctement les décisions (ADMIS, AJOURNÉ, REFUSÉ, etc.) mais la page admin affiche des données fictives hardcodées.');
  doc.moveDown(0.2);
  addBoldText(doc, 'Modifications requises :');
  addBullet(doc, 'Remplacer les données MOCK par des appels réels à GET /api/deliberations');
  addBullet(doc, 'Connecter les boutons « Délibérer » et « Valider » aux vraies APIs');
  addBullet(doc, 'Ajouter des filtres : faculté → département → promotion');
  addBullet(doc, 'Ajouter l\'interface secrétaire (modification notes par promotion)');
  addBullet(doc, 'Ajouter la notification au président quand un département est terminé');
  doc.moveDown(0.2);
  addText(doc, 'Effort estimé : 2 à 3 jours de développement.');

  // 3.3 Présences
  doc.addPage();
  addSubheader(doc, '3.3 — Système de présences enseignant (reconnecter au backend)');
  addBoldText(doc, 'État actuel : L\'API est prête, l\'interface enseignant ne l\'utilise pas (40%)');
  addText(doc, 'Le code de présence est généré localement (Math.random) et n\'est jamais envoyé au serveur. Les étudiants ne peuvent donc pas valider leur présence.');
  doc.moveDown(0.2);
  addBoldText(doc, 'Modification requise :');
  addBullet(doc, 'Appeler POST /api/attendance-codes au lieu de générer un code local');
  addBullet(doc, 'Afficher le code retourné par l\'API avec un timer d\'expiration');
  addBullet(doc, 'Charger la liste des étudiants du cours en temps réel');
  doc.moveDown(0.2);
  addText(doc, 'Effort estimé : 0,5 jour de développement.');

  // 3.4 Documents employé
  doc.moveDown(0.3);
  addSubheader(doc, '3.4 — Pages employé documents (connecter aux APIs)');
  addBoldText(doc, 'État actuel : API complète, interface avec données fictives (40%)');
  addText(doc, 'L\'API supporte GET/POST/PATCH/PUT pour les demandes de documents mais la page employé affiche un tableau hardcodé de 4 entrées.');
  doc.moveDown(0.2);
  addBoldText(doc, 'Modifications requises :');
  addBullet(doc, 'Remplacer les données MOCK par fetch(\'/api/documents\')');
  addBullet(doc, 'Implémenter les boutons Approuver / Rejeter avec appels API');
  addBullet(doc, 'Ajouter un modal de rejet avec champ « raison »');
  addBullet(doc, 'Connecter les statistiques en temps réel');
  doc.moveDown(0.2);
  addText(doc, 'Effort estimé : 1 jour de développement.');

  // 3.5 Upload paiement
  doc.moveDown(0.3);
  addSubheader(doc, '3.5 — Upload de reçus de paiement (créer le vrai upload)');
  addBoldText(doc, 'État actuel : Les métadonnées sont enregistrées mais le fichier n\'est pas uploadé (30%)');
  addText(doc, 'L\'étudiant peut remplir un formulaire de reçu et choisir un fichier, mais le fichier n\'est jamais envoyé au serveur. L\'URL générée est fictive.');
  doc.moveDown(0.2);
  addBoldText(doc, 'Ce qui doit être développé :');
  addBullet(doc, 'Endpoint d\'upload (POST /api/upload) qui accepte multipart/form-data');
  addBullet(doc, 'Stockage des fichiers sur le serveur (ou bucket S3)');
  addBullet(doc, 'Mise à jour de la page étudiant pour envoyer le fichier réel');
  addBullet(doc, 'Connexion de la page employé paiements aux vraies APIs');
  doc.moveDown(0.2);
  addText(doc, 'Effort estimé : 1 jour de développement.');

  // 3.6 Script import
  doc.moveDown(0.3);
  if (doc.y > 650) doc.addPage();
  addSubheader(doc, '3.6 — Script d\'importation des données Excel');
  addBoldText(doc, 'État : CRÉÉ — scripts/import-excel-pharmacie.js');
  addText(doc, 'Le script est prêt et attend le fichier Excel rempli. Il importera automatiquement :');
  addBullet(doc, 'Les comptes utilisateurs et profils enseignants');
  addBullet(doc, 'Le catalogue des cours avec les bonnes promotions');
  addBullet(doc, 'Les membres du jury de délibération');
  addBullet(doc, 'Les comptes employés administratifs');
  addBullet(doc, 'Les notes existantes (si disponibles)');
  addBullet(doc, 'L\'inscription automatique des étudiants aux cours de leur promotion');

  // ========================================
  // WORKFLOW DÉLIBÉRATION
  // ========================================
  doc.addPage();
  addHeader(doc, '4. WORKFLOW COMPLET DE DÉLIBÉRATION');
  doc.moveDown(0.3);

  addSubheader(doc, '4.1 — Processus de pré-délibération automatique');
  addText(doc, 'La plateforme calcule automatiquement les résultats préliminaires :');
  addBullet(doc, 'Calcul des moyennes : 30% TP + 70% Examen = note finale sur 20');
  addBullet(doc, 'Calcul des crédits acquis par étudiant');
  addBullet(doc, 'Attribution des décisions préliminaires selon les critères validés :');
  addBullet(doc, 'ADMIS : moyenne ≥ 10/20 et crédits acquis ≥ 80%', 1);
  addBullet(doc, 'ADMIS AVEC DETTE : moyenne ≥ 10/20 et crédits ≥ 60%', 1);
  addBullet(doc, 'AJOURNÉ : moyenne ≥ 8/20 et crédits ≥ 50%', 1);
  addBullet(doc, 'REFUSÉ : moyenne < 8/20 ou crédits < 50%', 1);
  addBullet(doc, 'BLOQUÉ : paiement insuffisant (< 70%)', 1);
  addBullet(doc, 'Signalement automatique des cas particuliers');
  doc.moveDown(0.3);

  addSubheader(doc, '4.2 — Rôles dans la délibération');
  doc.moveDown(0.2);

  // Tableau des rôles
  addTable(doc,
    ['Rôle', 'Responsabilités'],
    [
      ['PRÉSIDENT DU JURY', 'Programme les sessions, valide et publie les résultats, reçoit les notifications'],
      ['SECRÉTAIRE DU JURY', 'Accède à la pré-délibération par promotion, modifie les notes (traçabilité), signale les promotions terminées'],
      ['MEMBRES DU JURY', 'Participent aux discussions, votent les décisions de repêchage'],
      ['ENSEIGNANT', 'Se connecte, saisit les notes TP + Examen, valide avant la date limite'],
      ['EMPLOYÉ', 'Reçoit/traite demandes de documents, vérifie paiements'],
      ['ÉTUDIANT', 'Active son compte, upload reçu paiement, consulte résultats'],
      ['ADMIN', 'Réinitialise mots de passe, supervise le processus'],
    ],
    [140, 355]
  );

  doc.moveDown(0.3);
  addSubheader(doc, '4.3 — Étapes séquentielles');
  addBullet(doc, '1. Le PRÉSIDENT programme la délibération (date, heure, promotions)');
  addBullet(doc, '2. La plateforme PRÉ-DÉLIBÈRE automatiquement (calculs + décisions)');
  addBullet(doc, '3. Le SECRÉTAIRE revoit par promotion : ajuste notes si nécessaire');
  addBullet(doc, '4. Chaque modification est tracée (ancien/nouveau, auteur, justification)');
  addBullet(doc, '5. Le SECRÉTAIRE signale quand un département est terminé');
  addBullet(doc, '6. Le PRÉSIDENT est notifié, revoit les résultats et modifications');
  addBullet(doc, '7. Le PRÉSIDENT valide → résultats publiés et visibles par les étudiants');

  // ========================================
  // PHASE 3 : TEST ET VALIDATION
  // ========================================
  doc.addPage();
  addHeader(doc, '5. PHASE 3 : TEST ET VALIDATION');
  
  doc.fontSize(10).fillColor(GRAY).font('Helvetica-Oblique')
     .text('Responsable : Équipe technique + Doyen des Sciences Pharmaceutiques')
     .text('Durée estimée : 3 à 5 jours')
     .moveDown(0.5);

  addSubheader(doc, '5.1 — Tests par étape');
  addTable(doc,
    ['Étape', 'Action', 'Validation'],
    [
      ['1', 'Import des données Excel', 'Enseignants, cours et jury bien créés en base'],
      ['2', 'Test login enseignant', '1 enseignant se connecte et voit ses cours'],
      ['3', 'Saisie de notes test', 'L\'enseignant saisit 5-10 notes sur 1 cours'],
      ['4', 'Pré-délibération', 'Le système calcule correctement les résultats'],
      ['5', 'Revue secrétaire', 'Le secrétaire modifie 1-2 notes, traçage vérifié'],
      ['6', 'Validation président', 'Le président valide, publication vérifiée'],
      ['7', 'Consultation étudiant', 'L\'étudiant voit son résultat (si paiement OK)'],
    ],
    [40, 200, 255]
  );
  doc.moveDown(0.3);

  addSubheader(doc, '5.2 — Promotion pilote recommandée');
  addBullet(doc, 'B1 PHARMACIE (382 étudiants) — la plus grande promotion');
  addBullet(doc, 'Ou L1 LMD PHARMACIE (203 étudiants) — taille intermédiaire');
  doc.moveDown(0.3);

  addSubheader(doc, '5.3 — Checklist avant la première vraie délibération');
  const checklist = [
    'Tous les enseignants de la promotion ont un compte actif',
    'Tous les cours de la promotion sont créés avec les bons crédits',
    'Tous les cours ont un enseignant titulaire assigné',
    'Toutes les notes de tous les cours sont saisies',
    'Le jury est composé (président + secrétaire + membres)',
    'Les critères sont validés par le Doyen',
    'La pré-délibération est lancée sans erreurs',
    'Le secrétaire a accès pour modifier les notes',
    'Le président peut valider et publier',
    'Les étudiants voient leurs résultats après publication',
  ];
  checklist.forEach(item => {
    doc.fontSize(10).fillColor(BLACK).font('Helvetica')
       .text(`☐  ${item}`, 60);
    doc.moveDown(0.15);
  });

  // ========================================
  // PLANNING
  // ========================================
  doc.moveDown(0.5);
  if (doc.y > 550) doc.addPage();
  addHeader(doc, '6. PLANNING ESTIMÉ');
  doc.moveDown(0.3);

  addTable(doc,
    ['Semaine', 'Phase', 'Actions principales'],
    [
      ['S1', 'Collecte + Dev', 'Donner l\'Excel à la faculté / Développer password reset / Connecter page délibérations'],
      ['S2', 'Collecte + Dev', 'Recevoir l\'Excel rempli / Corriger présences / Connecter pages employé / Upload paiement'],
      ['S3', 'Import + Test', 'Importer les données Excel / Tests complets avec 1 promotion / Formation Doyen + Secrétaire'],
      ['S4', 'Délibération', 'Saisie notes par enseignants / Première délibération pilote via la plateforme'],
    ],
    [60, 95, 340]
  );

  // ========================================
  // RÉCAPITULATIF EFFORTS
  // ========================================
  doc.moveDown(0.5);
  if (doc.y > 500) doc.addPage();
  addHeader(doc, '7. RÉCAPITULATIF DES EFFORTS DE DÉVELOPPEMENT');
  doc.moveDown(0.3);

  addTable(doc,
    ['Chantier', 'Priorité', 'Effort estimé', 'Dépendance'],
    [
      ['Réinitialisation mot de passe', 'CRITIQUE', '2-3 jours', 'Aucune'],
      ['Interface admin délibérations', 'CRITIQUE', '2-3 jours', 'Données importées'],
      ['Workflow secrétaire / président', 'CRITIQUE', '2-3 jours', 'Délibérations connectées'],
      ['Présences enseignant', 'IMPORTANT', '0,5 jour', 'Aucune'],
      ['Pages employé documents', 'IMPORTANT', '1 jour', 'Aucune'],
      ['Upload reçu paiement', 'IMPORTANT', '1 jour', 'Aucune'],
      ['Script d\'importation Excel', 'PRÊT', 'Créé', 'Fichier Excel rempli'],
    ],
    [155, 75, 80, 155]
  );

  doc.moveDown(0.5);
  addBoldText(doc, 'Effort total estimé : 9 à 12 jours de développement');
  addText(doc, '(En parallèle avec la collecte des données, soit environ 3-4 semaines au total)');

  // ========================================
  // CONTACTS
  // ========================================
  doc.moveDown(0.8);
  if (doc.y > 650) doc.addPage();
  
  const contactY = doc.y;
  doc.rect(50, contactY, 495, 80).fill(BLUE_LIGHT).stroke(BLUE_MED);
  doc.fontSize(12).fillColor(BLUE_DARK).font('Helvetica-Bold')
     .text('CONTACTS', 60, contactY + 10);
  doc.fontSize(10).fillColor(BLACK).font('Helvetica')
     .text('Responsable technique : Chris NGOZULU KASONGO — +243 832 313 105', 60, contactY + 30)
     .text('Faculté des Sciences Pharmaceutiques : Doyen (à confirmer)', 60, contactY + 45)
     .text('Secrétaire académique : (à confirmer)', 60, contactY + 60);

  doc.y = contactY + 100;
  doc.moveDown(1);
  doc.fontSize(9).fillColor(GRAY).font('Helvetica')
     .text('Document généré le 19 février 2026 — NEXUS UNIKIN', { align: 'center' });
  doc.text('Confidentiel — Usage interne', { align: 'center' });

  // Finaliser
  doc.end();

  return new Promise((resolve, reject) => {
    outputStream.on('finish', () => {
      console.log('✅ PDF généré avec succès !');
      console.log(`📄 ${outputPath}`);
      resolve();
    });
    outputStream.on('error', reject);
  });
}

generatePDF().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

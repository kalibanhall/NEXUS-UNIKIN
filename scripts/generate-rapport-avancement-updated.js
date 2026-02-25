const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Fonctions utilitaires
function addHeader(doc, text) {
  doc.fontSize(18).fillColor('#1e3a5f').font('Helvetica-Bold').text(text, { underline: true }).moveDown(0.5);
}

function addSubheader(doc, text) {
  doc.fontSize(14).fillColor('#2c5282').font('Helvetica-Bold').text(text).moveDown(0.3);
}

function addText(doc, text, options = {}) {
  doc.fontSize(11).fillColor('#000000').font('Helvetica').text(text, options).moveDown(0.3);
}

function addBullet(doc, text, level = 0) {
  const indent = 40 + (level * 20);
  doc.fontSize(10).fillColor('#000000').font('Helvetica');
  const bulletY = doc.y;
  doc.text('•', indent, bulletY);
  doc.text(text, indent + 15, bulletY, { width: 450 - (level * 20) });
  doc.moveDown(0.2);
}

function addTable(doc, headers, rows, columnWidths) {
  const startX = 50;
  let currentY = doc.y;
  const rowHeight = 25;
  const headerHeight = 30;

  // Check page
  if (currentY + headerHeight + rowHeight * rows.length > doc.page.height - 60) {
    doc.addPage();
    currentY = doc.y;
  }

  doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold');
  let currentX = startX;
  headers.forEach((header, i) => {
    doc.rect(currentX, currentY, columnWidths[i], headerHeight).fill('#1e3a5f');
    doc.fillColor('#ffffff').text(header, currentX + 5, currentY + 8, { width: columnWidths[i] - 10, align: 'left' });
    currentX += columnWidths[i];
  });
  currentY += headerHeight;

  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, rowIndex) => {
    if (currentY + rowHeight > doc.page.height - 50) {
      doc.addPage();
      currentY = 50;
    }
    currentX = startX;
    const bgColor = rowIndex % 2 === 0 ? '#f7fafc' : '#ffffff';
    row.forEach((cell, i) => {
      doc.rect(currentX, currentY, columnWidths[i], rowHeight).fill(bgColor).stroke('#e2e8f0');
      doc.fillColor('#000000').text(String(cell), currentX + 5, currentY + 8, { width: columnWidths[i] - 10, align: 'left' });
      currentX += columnWidths[i];
    });
    currentY += rowHeight;
  });

  doc.y = currentY + 10;
}

function addStatusSection(doc, title, status) {
  doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold').text(title, { continued: true })
     .fontSize(10).fillColor(status === 'Fait' ? '#48bb78' : status === 'En cours' ? '#ed8936' : '#718096').text(` [${status}]`).moveDown(0.3);
}

async function generatePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'NEXUS UNIKIN - Rapport d\'Avancement',
      Author: 'Chris NGOZULU KASONGO',
      Subject: 'État d\'avancement du projet au 25 février 2026'
    }
  });

  const outputPath = path.join(__dirname, '..', 'output', 'rapport-avancement-nexus-25-fevrier-2026.pdf');
  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const outputStream = fs.createWriteStream(outputPath);
  doc.pipe(outputStream);

  // ===== PAGE DE GARDE =====
  doc.fontSize(28).fillColor('#1e3a5f').font('Helvetica-Bold').text('NEXUS UNIKIN', { align: 'center' }).moveDown(0.5);
  doc.fontSize(20).fillColor('#2c5282').text('RAPPORT D\'AVANCEMENT', { align: 'center' }).moveDown(0.3);
  doc.fontSize(14).fillColor('#4a5568').font('Helvetica').text('Système de Gestion Universitaire', { align: 'center' }).moveDown(2);
  doc.fontSize(12).fillColor('#000000')
    .text('Université de Kinshasa (UNIKIN)', { align: 'center' }).moveDown(0.5)
    .text('État d\'avancement au 25 Février 2026', { align: 'center' }).moveDown(4);

  // Box informations clés
  const boxY = doc.y;
  doc.rect(100, boxY, 400, 160).fillAndStroke('#e6f2ff', '#1e3a5f');
  doc.fontSize(11).fillColor('#000000').font('Helvetica-Bold')
    .text('Informations du projet', 120, boxY + 20)
    .font('Helvetica').moveDown(0.5)
    .text('Date de début effectif : 30 janvier 2026', 120)
    .text('Date du rapport : 25 février 2026', 120)
    .text('Durée écoulée : 26 jours', 120)
    .text('Échéance finale : 30 avril 2026', 120)
    .text('Plateforme : http://94.72.97.228', 120)
    .text('Faculté pilote : Sciences Pharmaceutiques', 120);

  doc.addPage();

  // ===== TABLE DES MATIÈRES =====
  addHeader(doc, 'TABLE DES MATIÈRES');
  addText(doc, '1. Résumé Exécutif ..................................................... 3');
  addText(doc, '2. État d\'Avancement par Phase ...................................... 4');
  addText(doc, '3. Phase 4 : Faculté Pilote Pharmacie .............................. 6');
  addText(doc, '4. Statistiques de la Base de Données .............................. 7');
  addText(doc, '5. Détail des 15 Facultés ........................................... 8');
  addText(doc, '6. Modules Fonctionnels Déployés .................................... 9');
  addText(doc, '7. Prochaines Étapes ................................................ 10');
  addText(doc, '8. Recommandations .................................................. 11');

  doc.addPage();

  // ===== 1. RÉSUMÉ EXÉCUTIF =====
  addHeader(doc, '1. RÉSUMÉ EXÉCUTIF');

  addText(doc, 'Le projet NEXUS UNIKIN a démarré effectivement le 30 janvier 2026 avec pour objectif la mise en place d\'une plateforme complète de gestion universitaire pour l\'Université de Kinshasa.');
  addText(doc, 'En 26 jours, le projet a franchi des étapes majeures, culminant avec l\'intégration complète de la Faculté des Sciences Pharmaceutiques comme faculté pilote.');

  addSubheader(doc, '1.1 Points clés');
  addBullet(doc, 'Plateforme déployée en ligne et accessible via http://94.72.97.228');
  addBullet(doc, 'Plus de 2 000 étudiants encodés et ajoutés dans la plateforme');
  addBullet(doc, '1 131 enseignants intégrés (toutes facultés UNIKIN) avec grades académiques');
  addBullet(doc, '15 facultés, 134+ départements, 503+ promotions encodés');
  addBullet(doc, 'Faculté de Pharmacie entièrement configurée : 136 cours, 9 jurys, critères de délibération');
  addBullet(doc, 'Infrastructure technique : Next.js 14, PostgreSQL, PM2, Nginx, 20 tables');
  addBullet(doc, 'Système d\'activation opérationnel (étudiants + enseignants)');

  addSubheader(doc, '1.2 État d\'avancement global');
  addText(doc, 'Phase 1 (Infrastructure) : 100% complète ✓');
  addText(doc, 'Phase 2 (Intégration données initiales) : 100% complète ✓');
  addText(doc, 'Phase 3 (Modules fonctionnels) : 100% complète ✓');
  addText(doc, 'Phase 4 (Faculté pilote Pharmacie) : 100% complète ✓');
  addText(doc, 'Phase 5 (Tests situation réelle) : Prévu 27 février 2026');
  addText(doc, 'Phase 6 (Formation académique) : Prévu 3 mars 2026');

  doc.addPage();

  // ===== 2. ÉTAT D'AVANCEMENT PAR PHASE =====
  addHeader(doc, '2. ÉTAT D\'AVANCEMENT PAR PHASE');

  addStatusSection(doc, 'Phase 1 : Infrastructure et mise en ligne', 'Fait');
  addBullet(doc, 'Serveur VPS provisionné (IP 94.72.97.228, Ubuntu, 32 Go RAM)');
  addBullet(doc, 'Plateforme déployée en ligne (Next.js 14 + PostgreSQL)');
  addBullet(doc, 'Base de données configurée (20 tables, schéma complet)');
  addBullet(doc, 'Système d\'authentification JWT fonctionnel');
  addBullet(doc, 'Compte Super Admin créé et opérationnel');
  addBullet(doc, 'Configuration PM2 pour la gestion des processus');
  addBullet(doc, 'Configuration Nginx comme reverse proxy');
  addText(doc, 'Date d\'achèvement : 2 février 2026', { indent: 20 });
  doc.moveDown(0.5);

  addStatusSection(doc, 'Phase 2 : Intégration des données initiales', 'Fait');
  addBullet(doc, 'Plus de 2 000 étudiants importés depuis fichiers Excel');
  addBullet(doc, '15 facultés encodées (toutes les facultés UNIKIN)');
  addBullet(doc, '134 départements créés et rattachés aux facultés');
  addBullet(doc, '503 promotions créées (L0 à D4, tous niveaux)');
  addBullet(doc, 'Paiements importés (USD + CDF, 2023-2024, 2024-2025 et 2025-2026)');
  addBullet(doc, '3 années académiques configurées');
  addBullet(doc, 'Identifiants attribués (email: matricule@unikin.ac.cd)');
  addBullet(doc, 'Passerelle d\'activation opérationnelle');
  addText(doc, 'Date d\'achèvement : 12 février 2026', { indent: 20 });
  doc.moveDown(0.5);

  addStatusSection(doc, 'Phase 3 : Modules fonctionnels', 'Fait');
  addBullet(doc, 'Tableau de bord étudiant avec données réelles');
  addBullet(doc, 'Tableau de bord enseignant');
  addBullet(doc, 'Tableau de bord administrateur');
  addBullet(doc, 'Gestion des finances avec grille tarifaire dynamique');
  addBullet(doc, 'Gestion des notes et délibérations');
  addBullet(doc, 'Système de présences avec codes de validation');
  addBullet(doc, 'Gestion des évaluations');
  addBullet(doc, 'Emploi du temps');
  addBullet(doc, 'Messagerie interne');
  addBullet(doc, 'Bibliothèque numérique');
  addBullet(doc, '11 corrections UI/UX déployées');
  addText(doc, 'Date d\'achèvement : 13 février 2026', { indent: 20 });

  doc.addPage();

  // ===== 3. PHASE 4 : FACULTÉ PILOTE PHARMACIE =====
  addHeader(doc, '3. PHASE 4 : FACULTÉ PILOTE — SCIENCES PHARMACEUTIQUES');

  addText(doc, 'Depuis le mercredi 18 février 2026, l\'équipe technique a procédé à l\'intégration complète des données de la Faculté des Sciences Pharmaceutiques, désignée comme faculté pilote pour valider le workflow complet de NEXUS.');

  addSubheader(doc, '3.1 Personnel académique intégré');
  addBullet(doc, '1 131 enseignants de toutes les facultés UNIKIN importés avec leurs grades (données 2023-2024)');
  addBullet(doc, 'Grades : Professeur Ordinaire, Professeur, Professeur Associé, Chef de Travaux, Assistant');
  addBullet(doc, '89 enseignants de Pharmacie ont reçu leurs matricules ESU vérifiés');
  addBullet(doc, 'Emails enseignants migrés vers le format matricule@unikin.ac.cd');
  addBullet(doc, 'Système d\'activation enseignants par matricule + date de naissance opérationnel');

  addSubheader(doc, '3.2 Cours et programme');

  const coursHeaders = ['Programme', 'Niveaux', 'Nb Cours', 'Détails'];
  const coursRows = [
    ['PharmD (Doctorat)', 'B1-B3, P1-P3', '88', 'Cours obligatoires et optionnels'],
    ['LTP - PTP', 'L1-L3', '~25', 'Pharmacie Traditionnelle et Plantes Médicinales'],
    ['LTP - PIP', 'L1-L3', '~23', 'Pratiques et Industries Pharmaceutiques'],
    ['TOTAL', '', '136+', '7 départements, 19 promotions']
  ];
  addTable(doc, coursHeaders, coursRows, [120, 80, 70, 220]);

  addSubheader(doc, '3.3 Jurys de délibération');
  addText(doc, '9 jurys de délibération ont été configurés avec la composition complète :');

  const juryHeaders = ['Jury', 'Programme', 'Président', 'Secrétaire', 'Membre'];
  const juryRows = [
    ['B1 PharmD', 'Doctorat', '✓', '✓', '✓'],
    ['B2 PharmD', 'Doctorat', '✓', '✓', '✓'],
    ['B3 PharmD', 'Doctorat', '✓', '✓', '✓'],
    ['P1 PharmD', 'Doctorat', '✓', '✓', '✓'],
    ['P2 PharmD', 'Doctorat', '✓', '✓', '✓'],
    ['P3 PharmD', 'Doctorat', '✓', '✓', '✓'],
    ['L1 LTP', 'Licence', '✓', '✓', '✓'],
    ['L2 LTP', 'Licence', '✓', '✓', '✓'],
    ['L3 LTP', 'Licence', '✓', '✓', '✓']
  ];
  addTable(doc, juryHeaders, juryRows, [80, 80, 100, 100, 100]);

  addSubheader(doc, '3.4 Critères de délibération');
  addBullet(doc, 'Moyenne minimale de passage, passage avec dette, reprise et échec définis');
  addBullet(doc, 'Pourcentage de crédits requis pour passage et passage avec dette');
  addBullet(doc, 'Pondérations TP/TD/Examen configurées');
  addBullet(doc, 'Système de mentions (distinction, grande distinction, plus grande distinction) avec seuils');
  addBullet(doc, 'Règles spéciales : note éliminatoire, nombre max de dettes, étudiants bloqués');

  doc.addPage();

  addSubheader(doc, '3.5 Mise à jour étudiants Pharmacie');
  addBullet(doc, '1 141+ étudiants Pharmacie mis à jour avec données de paiement');
  addBullet(doc, 'Inscriptions et affectations aux promotions vérifiées');
  addBullet(doc, 'Données cohérentes entre paiements, inscriptions et promotions');

  addSubheader(doc, '3.6 Nouvelles fonctionnalités techniques');
  addBullet(doc, '3 nouvelles tables de base de données : deliberation_juries, deliberation_jury_members, deliberation_criteria');
  addBullet(doc, 'API d\'activation enseignants avec vérification par date de naissance');
  addBullet(doc, 'Interface d\'activation universelle (étudiants et enseignants)');
  addBullet(doc, 'Support des filières multiples (PharmD + LTP avec options PTP/PIP)');

  doc.moveDown(1);

  // ===== 4. STATISTIQUES =====
  addHeader(doc, '4. STATISTIQUES DE LA BASE DE DONNÉES');

  addSubheader(doc, '4.1 Vue d\'ensemble au 25 février 2026');

  const statsHeaders = ['Catégorie', 'Nombre'];
  const statsRows = [
    ['Étudiants encodés', 'Plus de 2 000'],
    ['Enseignants intégrés', '1 131'],
    ['Facultés actives', '15'],
    ['Départements actifs', '134+'],
    ['Promotions', '503+'],
    ['Cours créés (Pharmacie)', '136+'],
    ['Jurys de délibération', '9'],
    ['Membres de jury', '27'],
    ['Tables base de données', '20'],
    ['Années académiques', '3'],
    ['Paiements enregistrés', '66 435+']
  ];
  addTable(doc, statsHeaders, statsRows, [350, 150]);

  addSubheader(doc, '4.2 Évolution depuis le dernier rapport (17 février)');
  addBullet(doc, 'NOUVEAU : 1 131 enseignants toutes facultés (était 0)');
  addBullet(doc, 'NOUVEAU : 136+ cours Pharmacie (PharmD + LTP)');
  addBullet(doc, 'NOUVEAU : 9 jurys de délibération configurés');
  addBullet(doc, 'NOUVEAU : Critères de délibération définis');
  addBullet(doc, 'NOUVEAU : Activation enseignants (matricule + date de naissance)');
  addBullet(doc, 'NOUVEAU : Données de l\'année académique 2023-2024 importées (personnel académique, enseignants, étudiants)');
  addBullet(doc, 'NOUVEAU : 3 années académiques configurées (2023-2024, 2024-2025, 2025-2026)');
  addBullet(doc, 'NOUVEAU : Support filières multiples (PharmD + LTP)');

  doc.addPage();

  // ===== 5. DÉTAIL DES 15 FACULTÉS =====
  addHeader(doc, '5. DÉTAIL DES 15 FACULTÉS');

  addText(doc, 'Toutes les 15 facultés de l\'UNIKIN sont encodées dans le système :');
  doc.moveDown(0.5);

  const facultiesHeaders = ['#', 'Faculté', 'Dép.', 'Prom.', 'Statut données'];
  const facultiesRows = [
    ['1', 'Droit', '8', '29', 'Étudiants intégrés'],
    ['2', 'Sciences Éco. et Gestion', '21', '59', 'Étudiants intégrés'],
    ['3', 'Médecine', '7', '30', 'Étudiants intégrés'],
    ['4', 'Sciences et Technologies', '13', '48', 'Étudiants intégrés'],
    ['5', 'Psychologie et Éducation', '6', '23', 'Étudiants intégrés'],
    ['6', 'Sciences Sociales et Admin.', '5', '19', 'Étudiants intégrés'],
    ['7', 'Lettres et Sciences Humaines', '26', '67', 'Étudiants intégrés'],
    ['8', 'Médecine Dentaire', '3', '21', 'Étudiants intégrés'],
    ['9', 'Sciences Agronomiques', '16', '68', 'Étudiants intégrés'],
    ['10', 'Sciences Pharmaceutiques', '7', '19', 'COMPLET (pilote)'],
    ['11', 'Pétrole, Gaz et Énergies', '8', '65', 'Étudiants intégrés'],
    ['12', 'Polytechnique', '12', '34', 'Étudiants intégrés'],
    ['13', 'Médecine Vétérinaire', '5', '20', 'Étudiants intégrés'],
    ['14', 'École Sc. Population', '2', '2', 'Étudiants intégrés'],
    ['15', 'Sciences', '0', '0', 'Restructurée']
  ];
  addTable(doc, facultiesHeaders, facultiesRows, [30, 190, 50, 50, 170]);

  doc.moveDown(0.5);
  addText(doc, 'La Faculté des Sciences Pharmaceutiques (ligne 10) est la seule faculté avec l\'intégration complète : enseignants avec matricules ESU, cours, jurys de délibération et critères.');

  doc.addPage();

  // ===== 6. MODULES FONCTIONNELS DÉPLOYÉS =====
  addHeader(doc, '6. MODULES FONCTIONNELS DÉPLOYÉS');

  addSubheader(doc, '6.1 Module Étudiant');
  addBullet(doc, 'Consultation des données personnelles et académiques');
  addBullet(doc, 'Visualisation des paiements effectués (historique complet)');
  addBullet(doc, 'Consultation du statut financier en temps réel');
  addBullet(doc, 'Accès aux notes et relevés');
  addBullet(doc, 'Emploi du temps personnalisé');
  addBullet(doc, 'Messagerie interne');

  addSubheader(doc, '6.2 Module Enseignant');
  addBullet(doc, 'Gestion des présences avec système de codes de validation');
  addBullet(doc, 'Saisie et modification des notes (TP, TD, Examen)');
  addBullet(doc, 'Consultation des listes d\'étudiants par cours');
  addBullet(doc, 'Gestion des évaluations');
  addBullet(doc, 'Communication avec les étudiants');
  addBullet(doc, 'Activation par matricule + date de naissance (NOUVEAU)');

  addSubheader(doc, '6.3 Module Administrateur');
  addBullet(doc, 'Tableau de bord avec statistiques en temps réel');
  addBullet(doc, 'Gestion complète des utilisateurs');
  addBullet(doc, 'Gestion des facultés, départements et promotions');
  addBullet(doc, 'Gestion des années académiques');
  addBullet(doc, 'Suivi des paiements et finances');
  addBullet(doc, 'Système de délibérations avec jurys configurables (NOUVEAU)');
  addBullet(doc, 'Critères de délibération paramétrables (NOUVEAU)');
  addBullet(doc, 'Génération de rapports');

  addSubheader(doc, '6.4 Modules Transversaux');
  addBullet(doc, 'Système d\'authentification sécurisé (JWT)');
  addBullet(doc, 'Gestion des rôles et permissions');
  addBullet(doc, 'Bibliothèque numérique');
  addBullet(doc, 'Système de notifications');
  addBullet(doc, 'Chatbot IA pour assistance');

  doc.addPage();

  // ===== 7. PROCHAINES ÉTAPES =====
  addHeader(doc, '7. PROCHAINES ÉTAPES');

  addSubheader(doc, '7.1 Vendredi 27 Février : Tests en situation réelle');
  addText(doc, 'Premiers tests avec une promotion réelle de la Faculté de Pharmacie :');
  addBullet(doc, 'Activation des comptes étudiants et enseignants en conditions réelles');
  addBullet(doc, 'Test du workflow complet : présences, consultation notes, paiements');
  addBullet(doc, 'Collecte des retours et identification des bugs');
  addBullet(doc, 'Priorisation des correctifs');
  addText(doc, 'Objectif : Valider le processus complet avant la formation', { indent: 20 });

  addSubheader(doc, '7.2 Mardi 3 Mars : Formation personnel académique Pharmacie');
  addText(doc, 'Journée de formation complète pour le personnel de la Faculté de Pharmacie :');
  addBullet(doc, 'Formation Doyen et Vice-Doyens : vue d\'ensemble et rapports');
  addBullet(doc, 'Formation enseignants : saisie des notes, présences, codes de validation');
  addBullet(doc, 'Formation secrétariat : bordereaux, paiements, listes étudiants');
  addBullet(doc, 'Formation jury de délibération : processus numérique');
  addText(doc, 'Objectif : Personnel académique Pharmacie autonome sur NEXUS', { indent: 20 });

  addSubheader(doc, '7.3 Semaines 7-10 (Mars) : Déploiement par vagues');
  addBullet(doc, 'Vague 1 (S7) : Droit, FSEG, Médecine — les 3 plus grandes facultés');
  addBullet(doc, 'Vague 2 (S8) : FST, FPSE, FSSAP');
  addBullet(doc, 'Vague 3 (S9) : FLSH, FMEDD, FSAE, FPGER');
  addBullet(doc, 'Vague 4 (S10) : FPOLY, FMEDV, ESPD, FSC — dernières facultés + consolidation');
  addText(doc, 'Pour chaque vague : intégration données enseignants/cours, formation, activation', { indent: 20 });
  addText(doc, 'Note : Le déploiement par vagues commence après les délibérations de toutes les promotions de la Faculté des Sciences Pharmaceutiques, prévues durant le mois de mars.', { indent: 20 });

  addSubheader(doc, '7.4 Semaines 11-13 (Avril) : Finalisation');
  addBullet(doc, 'Modules avancés et intégrations (notifications)');
  addBullet(doc, 'Tests finaux (charge, sécurité)');
  addBullet(doc, 'Documentation et formation des formateurs');
  addBullet(doc, 'Cérémonie de lancement officiel avec le Recteur');
  addBullet(doc, 'Transfert de compétences à l\'équipe informatique UNIKIN');
  addBullet(doc, 'Livraison définitive le 30 avril 2026');

  doc.addPage();

  // ===== 8. RECOMMANDATIONS =====
  addHeader(doc, '8. RECOMMANDATIONS');

  addSubheader(doc, '8.1 Stratégie validée : « Test puis Déploiement »');
  addText(doc, 'L\'approche choisie a été validée avec succès :');
  addBullet(doc, '1. Intégrer complètement une faculté pilote (Pharmacie) ✓');
  addBullet(doc, '2. Tester en situation réelle (27 février)');
  addBullet(doc, '3. Former le personnel académique (3 mars)');
  addBullet(doc, '4. Déployer progressivement aux autres facultés');
  doc.moveDown(0.3);
  addText(doc, 'Cette approche garantit que chaque faculté bénéficie d\'une expérience complète dès le premier jour.');

  addSubheader(doc, '8.2 Préparation des tests du 27 février');
  addBullet(doc, 'Sélectionner une promotion avec un nombre gérable d\'étudiants');
  addBullet(doc, 'Préparer les scénarios de test couvrant tous les modules');
  addBullet(doc, 'Avoir un plan de secours en cas de problème technique');
  addBullet(doc, 'Documenter tous les retours pour correction rapide');

  addSubheader(doc, '8.3 Préparation de la formation du 3 mars');
  addBullet(doc, 'Préparer les supports de formation (guides imprimés, présentations)');
  addBullet(doc, 'Organiser la salle et les équipements (connexion internet stable)');
  addBullet(doc, 'Prévoir des sessions pratiques avec manipulation directe');
  addBullet(doc, 'Former en priorité les membres des jurys de délibération');

  addSubheader(doc, '8.4 Collecte de données pour les autres facultés');
  addText(doc, 'Pour accélérer le déploiement, commencer dès maintenant la collecte des données pour les prochaines vagues :');
  addBullet(doc, 'Listes d\'enseignants avec matricules, grades et coordonnées');
  addBullet(doc, 'Catalogues de cours avec crédits, semestres et responsables');
  addBullet(doc, 'Composition des jurys de délibération');
  addBullet(doc, 'Critères de délibération spécifiques à chaque faculté');

  doc.moveDown(2);

  // ===== CONCLUSION =====
  doc.fontSize(12).fillColor('#1e3a5f').font('Helvetica-Bold').text('CONCLUSION', { underline: true }).moveDown(0.5);

  doc.fontSize(11).fillColor('#000000').font('Helvetica')
    .text('Le projet NEXUS UNIKIN a accompli des progrès remarquables en 26 jours :').moveDown(0.3);

  addBullet(doc, '100% de l\'infrastructure technique déployée et fonctionnelle');
  addBullet(doc, 'Plus de 2 000 étudiants encodés dans la plateforme');
  addBullet(doc, '1 131 enseignants intégrés avec grades académiques');
  addBullet(doc, '100% des modules fonctionnels développés et testés');
  addBullet(doc, 'Faculté de Pharmacie entièrement configurée comme pilote (136 cours, 9 jurys, critères)');

  doc.moveDown(0.5);
  addText(doc, 'Les prochaines étapes critiques sont les tests en situation réelle le 27 février et la formation du personnel académique de Pharmacie le 3 mars. Ces deux jalons valideront le système avant le déploiement massif aux autres facultés.');

  doc.moveDown(0.5);
  addText(doc, 'Le calendrier de 3 mois (30 janvier - 30 avril 2026) reste parfaitement tenable, avec une avance significative sur l\'intégration des données grâce au travail accompli sur la faculté pilote. Les données de l\'année académique 2023-2024 ont également été intégrées (personnel académique et enseignants). La délibération de la faculté pilote sera effective durant le mois de mars, après quoi le déploiement par vagues aux autres facultés pourra commencer.');

  doc.addPage();

  // ===== ANNEXES =====
  addHeader(doc, 'ANNEXES');

  addSubheader(doc, 'A. Accès à la plateforme');
  addText(doc, 'URL : http://94.72.97.228');
  addText(doc, 'Super Admin : admin@unikin.ac.cd');
  doc.moveDown(0.5);

  addSubheader(doc, 'B. Processus d\'activation pour les étudiants');
  addText(doc, '1. Aller sur http://94.72.97.228/auth/activate');
  addText(doc, '2. Entrer son matricule (ex: 2201773)');
  addText(doc, '3. Confirmer son identité (nom affiché)');
  addText(doc, '4. Créer un mot de passe sécurisé');
  addText(doc, '5. Se connecter avec matricule@unikin.ac.cd + mot de passe');
  doc.moveDown(0.5);

  addSubheader(doc, 'C. Processus d\'activation pour les enseignants');
  addText(doc, '1. Aller sur http://94.72.97.228/auth/activate');
  addText(doc, '2. Entrer son matricule');
  addText(doc, '3. Confirmer sa date de naissance');
  addText(doc, '4. Confirmer son identité');
  addText(doc, '5. Créer un mot de passe sécurisé');
  addText(doc, '6. Se connecter avec matricule@unikin.ac.cd + mot de passe');
  doc.moveDown(0.5);

  addSubheader(doc, 'D. Documents de référence');
  addText(doc, '• Contrat de prestation de services');
  addText(doc, '• Calendrier de déploiement mis à jour (25 février 2026)');
  addText(doc, '• Architecture des rôles NEXUS');
  addText(doc, '• Plan de travail détaillé');
  doc.moveDown(1);

  // Pied de page final
  doc.fontSize(10).fillColor('#718096').font('Helvetica')
    .text('_______________________________________________', { align: 'center' }).moveDown(0.3)
    .text('Rapport émis le 25 février 2026', { align: 'center' })
    .text('NEXUS UNIKIN — Système de Gestion Universitaire', { align: 'center' })
    .text('Chris NGOZULU KASONGO', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    outputStream.on('finish', () => {
      console.log('✅ PDF généré avec succès !');
      console.log(`📄 Fichier : ${outputPath}`);
      resolve(outputPath);
    });
    outputStream.on('error', reject);
  });
}

generatePDF().then(p => {
  console.log(`\n🎉 Rapport d'avancement généré : ${p}`);
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

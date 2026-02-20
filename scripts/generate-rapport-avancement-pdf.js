const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Fonction pour ajouter un en-tête
function addHeader(doc, text) {
  doc.fontSize(18)
     .fillColor('#1e3a5f')
     .font('Helvetica-Bold')
     .text(text, { underline: true })
     .moveDown(0.5);
}

// Fonction pour ajouter un sous-titre
function addSubheader(doc, text) {
  doc.fontSize(14)
     .fillColor('#2c5282')
     .font('Helvetica-Bold')
     .text(text)
     .moveDown(0.3);
}

// Fonction pour ajouter du texte normal
function addText(doc, text, options = {}) {
  doc.fontSize(11)
     .fillColor('#000000')
     .font('Helvetica')
     .text(text, options)
     .moveDown(0.3);
}

// Fonction pour ajouter une liste à puces
function addBullet(doc, text, level = 0) {
  const indent = 40 + (level * 20);
  doc.fontSize(10)
     .fillColor('#000000')
     .font('Helvetica')
     .text('•', indent)
     .text(text, indent + 15, doc.y - 10)
     .moveDown(0.2);
}

// Fonction pour créer un tableau
function addTable(doc, headers, rows, columnWidths) {
  const startX = 50;
  let currentY = doc.y;
  const rowHeight = 25;
  const headerHeight = 30;
  
  // En-têtes
  doc.fontSize(9)
     .fillColor('#ffffff')
     .font('Helvetica-Bold');
  
  let currentX = startX;
  headers.forEach((header, i) => {
    doc.rect(currentX, currentY, columnWidths[i], headerHeight)
       .fill('#1e3a5f');
    doc.fillColor('#ffffff')
       .text(header, currentX + 5, currentY + 8, {
         width: columnWidths[i] - 10,
         align: 'left'
       });
    currentX += columnWidths[i];
  });
  
  currentY += headerHeight;
  
  // Lignes
  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, rowIndex) => {
    currentX = startX;
    const bgColor = rowIndex % 2 === 0 ? '#f7fafc' : '#ffffff';
    
    row.forEach((cell, i) => {
      doc.rect(currentX, currentY, columnWidths[i], rowHeight)
         .fill(bgColor)
         .stroke('#e2e8f0');
      
      doc.fillColor('#000000')
         .text(String(cell), currentX + 5, currentY + 8, {
           width: columnWidths[i] - 10,
           align: i === 0 && rowIndex < rows.length ? 'left' : 'left'
         });
      currentX += columnWidths[i];
    });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 10;
}

// Fonction pour ajouter une section avec badge de statut
function addStatusSection(doc, title, status) {
  doc.fontSize(12)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text(title, { continued: true })
     .fontSize(10)
     .fillColor(status === 'Fait' ? '#48bb78' : status === 'En cours' ? '#ed8936' : '#718096')
     .text(` [${status}]`)
     .moveDown(0.3);
}

async function generatePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'NEXUS UNIKIN - Rapport d\'Avancement',
      Author: 'Chris NGOZULU KASONGO',
      Subject: 'État d\'avancement du projet au 17 février 2026'
    }
  });

  const outputPath = path.join(__dirname, '..', 'output', 'rapport-avancement-nexus-17-fevrier-2026.pdf');
  const outputStream = fs.createWriteStream(outputPath);
  doc.pipe(outputStream);

  // ===== PAGE DE GARDE =====
  doc.fontSize(28)
     .fillColor('#1e3a5f')
     .font('Helvetica-Bold')
     .text('NEXUS UNIKIN', { align: 'center' })
     .moveDown(0.5);

  doc.fontSize(20)
     .fillColor('#2c5282')
     .text('RAPPORT D\'AVANCEMENT', { align: 'center' })
     .moveDown(0.3);

  doc.fontSize(14)
     .fillColor('#4a5568')
     .font('Helvetica')
     .text('Système de Gestion Universitaire', { align: 'center' })
     .moveDown(2);

  doc.fontSize(12)
     .fillColor('#000000')
     .text('Université de Kinshasa (UNIKIN)', { align: 'center' })
     .moveDown(0.5)
     .text('État d\'avancement au 17 Février 2026', { align: 'center' })
     .moveDown(4);

  // Box avec informations clés
  const boxY = doc.y;
  doc.rect(100, boxY, 400, 140)
     .fillAndStroke('#e6f2ff', '#1e3a5f');

  doc.fontSize(11)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('Informations du projet', 120, boxY + 20)
     .font('Helvetica')
     .moveDown(0.5)
     .text('Date de début effectif : 30 janvier 2026', 120)
     .text('Date du rapport : 17 février 2026', 120)
     .text('Durée écoulée : 18 jours', 120)
     .text('Échéance finale : 30 avril 2026', 120)
     .text('Plateforme : http://94.72.97.228', 120);

  doc.addPage();

  // ===== TABLE DES MATIÈRES =====
  addHeader(doc, 'TABLE DES MATIÈRES');
  addText(doc, '1. Résumé Exécutif ..................................................... 3');
  addText(doc, '2. État d\'Avancement par Phase ...................................... 4');
  addText(doc, '3. Statistiques de la Base de Données .............................. 6');
  addText(doc, '4. Analyse des Étudiants (Doublons) ................................ 7');
  addText(doc, '5. Détail des 15 Facultés ........................................... 8');
  addText(doc, '6. Modules Fonctionnels Déployés .................................... 9');
  addText(doc, '7. Ce Qui Reste à Faire ............................................ 10');
  addText(doc, '8. Recommandations .................................................. 11');

  doc.addPage();

  // ===== 1. RÉSUMÉ EXÉCUTIF =====
  addHeader(doc, '1. RÉSUMÉ EXÉCUTIF');
  
  addText(doc, 'Le projet NEXUS UNIKIN a démarré effectivement le 30 janvier 2026 avec pour objectif la mise en place d\'une plateforme complète de gestion universitaire pour l\'Université de Kinshasa.');
  
  addSubheader(doc, '1.1 Points clés');
  addBullet(doc, 'Plateforme déployée en ligne et accessible via http://94.72.97.228');
  addBullet(doc, '50 407 étudiants intégrés dans le système avec matricules uniques (aucun doublon)');
  addBullet(doc, '93 349 paiements importés et historisés');
  addBullet(doc, '15 facultés, 134 départements, 503 promotions encodés');
  addBullet(doc, 'Infrastructure technique : Next.js 14, PostgreSQL, PM2, Nginx');
  addBullet(doc, 'Système d\'activation des comptes opérationnel');
  addBullet(doc, 'Seulement 2 comptes activés à ce jour (campagne non lancée)');
  
  addSubheader(doc, '1.2 État d\'avancement global');
  addText(doc, 'Phase 1 (Infrastructure) : 100% complète ✓');
  addText(doc, 'Phase 2 (Intégration données) : 100% complète ✓');
  addText(doc, 'Phase 3 (Modules fonctionnels) : 100% complète ✓');
  addText(doc, 'Phase 4 (Campagne activation) : 0% - À lancer');
  
  doc.addPage();

  // ===== 2. ÉTAT D'AVANCEMENT PAR PHASE =====
  addHeader(doc, '2. ÉTAT D\'AVANCEMENT PAR PHASE');
  
  addStatusSection(doc, 'Phase 1 : Infrastructure et mise en ligne', 'Fait');
  addBullet(doc, 'Serveur VPS provisionné (IP 94.72.97.228, Ubuntu, 3 Go RAM)');
  addBullet(doc, 'Plateforme déployée en ligne (Next.js 14 + PostgreSQL)');
  addBullet(doc, 'Base de données configurée (16 tables, schéma complet)');
  addBullet(doc, 'Système d\'authentification JWT fonctionnel');
  addBullet(doc, 'Compte Super Admin créé et opérationnel');
  addBullet(doc, 'Configuration PM2 pour la gestion des processus');
  addBullet(doc, 'Configuration Nginx comme reverse proxy');
  addText(doc, 'Date d\'achèvement : 2 février 2026', { indent: 20 });
  doc.moveDown(0.5);
  
  addStatusSection(doc, 'Phase 2 : Intégration des données', 'Fait');
  addBullet(doc, '50 407 étudiants importés depuis fichiers Excel');
  addBullet(doc, '15 facultés encodées (toutes les facultés UNIKIN)');
  addBullet(doc, '134 départements créés et rattachés aux facultés');
  addBullet(doc, '503 promotions créées (L0 à D4, tous niveaux)');
  addBullet(doc, '93 349 paiements importés (USD + CDF, 2024-2025 et 2025-2026)');
  addBullet(doc, '2 années académiques configurées');
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
  
  addStatusSection(doc, 'Phase 4 : Campagne d\'activation', 'Non démarrée');
  addBullet(doc, 'Formation des points focaux - Prévu semaine du 16-20 février');
  addBullet(doc, 'Formation des enseignants - Prévu semaine du 16-20 février');
  addBullet(doc, 'Lancement campagne activation étudiants - Prévu 19 février');
  addBullet(doc, 'Activation progressive par vagues de facultés');
  addBullet(doc, 'Objectif : 48 000+ comptes activés d\'ici fin mars');
  addText(doc, 'Statut actuel : 2 comptes activés sur 50 407', { indent: 20 });
  doc.moveDown(1);

  // ===== 3. STATISTIQUES DE LA BASE DE DONNÉES =====
  addHeader(doc, '3. STATISTIQUES DE LA BASE DE DONNÉES');
  
  addSubheader(doc, '3.1 Vue d\'ensemble');
  
  const statsHeaders = ['Catégorie', 'Nombre'];
  const statsRows = [
    ['Total utilisateurs créés', '50 408'],
    ['Étudiants', '50 407'],
    ['Super Admin', '1'],
    ['Facultés actives', '15'],
    ['Départements actifs', '134'],
    ['Promotions', '503'],
    ['Paiements enregistrés', '93 349'],
    ['Années académiques', '2'],
    ['Comptes activés', '2'],
    ['Comptes non activés', '50 406']
  ];
  
  addTable(doc, statsHeaders, statsRows, [350, 150]);
  
  doc.addPage();

  // ===== 4. ANALYSE DES ÉTUDIANTS (DOUBLONS) =====
  addHeader(doc, '4. ANALYSE DES ÉTUDIANTS (DOUBLONS)');
  
  addSubheader(doc, '4.1 Vérification des doublons');
  addText(doc, 'Une analyse approfondie a été effectuée pour identifier tout doublon potentiel dans la base de données étudiants.');
  
  doc.moveDown(0.5);
  
  const duplicatesHeaders = ['Indicateur', 'Valeur'];
  const duplicatesRows = [
    ['Total étudiants enregistrés', '50 407'],
    ['Matricules uniques', '50 407'],
    ['Différence (doublons)', '0'],
    ['Pourcentage de doublons', '0.00%']
  ];
  
  addTable(doc, duplicatesHeaders, duplicatesRows, [350, 150]);
  
  addSubheader(doc, '4.2 Conclusion');
  addText(doc, '✓ AUCUN DOUBLON DÉTECTÉ : Les 50 407 étudiants recensés correspondent à 50 407 matricules uniques.');
  addText(doc, 'Le chiffre de "50 000 et quelques étudiants" est exact et justifié. Il n\'y a pas de doublons dans le système.');
  
  doc.moveDown(0.5);
  addText(doc, 'Méthodologie de vérification :');
  addBullet(doc, 'Requête SQL : SELECT matricule, COUNT(*) FROM students GROUP BY matricule');
  addBullet(doc, 'Recherche de matricules en double : 0 résultat');
  addBullet(doc, 'Comparaison total vs uniques : correspondance parfaite');
  
  doc.addPage();

  // ===== 5. DÉTAIL DES 15 FACULTÉS =====
  addHeader(doc, '5. DÉTAIL DES 15 FACULTÉS');
  
  addText(doc, 'Répartition complète des étudiants, départements et promotions par faculté :');
  doc.moveDown(0.5);
  
  const facultiesHeaders = ['#', 'Faculté', 'Dép.', 'Prom.', 'Étudiants'];
  const facultiesRows = [
    ['1', 'Droit', '8', '29', '10 823'],
    ['2', 'Sciences Éco. et Gestion', '21', '59', '8 530'],
    ['3', 'Médecine', '7', '30', '6 525'],
    ['4', 'Sciences et Technologies', '13', '48', '4 758'],
    ['5', 'Psychologie et Éducation', '6', '23', '3 005'],
    ['6', 'Sciences Sociales et Admin.', '5', '19', '2 990'],
    ['7', 'Lettres et Sciences Humaines', '26', '67', '2 268'],
    ['8', 'Médecine Dentaire', '3', '21', '1 554'],
    ['9', 'Sciences Agronomiques', '16', '68', '1 510'],
    ['10', 'Sciences Pharmaceutiques', '2', '18', '1 197'],
    ['11', 'Pétrole, Gaz et Énergies', '8', '65', '850'],
    ['12', 'Polytechnique', '12', '34', '744'],
    ['13', 'Médecine Vétérinaire', '5', '20', '170'],
    ['14', 'École Sc. Population', '2', '2', '12'],
    ['15', 'Sciences (vide)', '0', '0', '0']
  ];
  
  addTable(doc, facultiesHeaders, facultiesRows, [30, 250, 50, 50, 70]);
  
  doc.fontSize(10)
     .fillColor('#2c5282')
     .font('Helvetica-Bold')
     .text('TOTAL : 134 départements, 503 promotions, 50 407 étudiants', 50);
  
  doc.moveDown(1);
  addText(doc, 'Note : La Faculté des Sciences apparaît vide car elle a probablement été restructurée en "Faculté des Sciences et Technologies".');
  
  doc.addPage();

  // ===== 6. MODULES FONCTIONNELS DÉPLOYÉS =====
  addHeader(doc, '6. MODULES FONCTIONNELS DÉPLOYÉS');
  
  addSubheader(doc, '6.1 Module Étudiant');
  addBullet(doc, 'Consultation des données personnelles et académiques');
  addBullet(doc, 'Visualisation des paiements effectués (historique complet)');
  addBullet(doc, 'Consultation du statut financier en temps réel');
  addBullet(doc, 'Accès aux notes et relevés (une fois publiés)');
  addBullet(doc, 'Emploi du temps personnalisé');
  addBullet(doc, 'Messagerie interne');
  
  addSubheader(doc, '6.2 Module Enseignant');
  addBullet(doc, 'Gestion des présences avec système de codes de validation');
  addBullet(doc, 'Saisie et modification des notes (TP, TD, Examen)');
  addBullet(doc, 'Consultation des listes d\'étudiants par cours');
  addBullet(doc, 'Gestion des évaluations');
  addBullet(doc, 'Communication avec les étudiants');
  
  addSubheader(doc, '6.3 Module Administrateur');
  addBullet(doc, 'Tableau de bord avec statistiques en temps réel');
  addBullet(doc, 'Gestion complète des utilisateurs (ajout, modification, suppression)');
  addBullet(doc, 'Gestion des facultés, départements et promotions');
  addBullet(doc, 'Gestion des années académiques');
  addBullet(doc, 'Suivi des paiements et finances');
  addBullet(doc, 'Système de délibérations');
  addBullet(doc, 'Génération de rapports');
  
  addSubheader(doc, '6.4 Modules Transversaux');
  addBullet(doc, 'Système d\'authentification sécurisé (JWT)');
  addBullet(doc, 'Gestion des rôles et permissions');
  addBullet(doc, 'Bibliothèque numérique');
  addBullet(doc, 'Système de notifications');
  addBullet(doc, 'Chatbot IA pour assistance');
  
  doc.addPage();

  // ===== 7. CE QUI RESTE À FAIRE =====
  addHeader(doc, '7. CE QUI RESTE À FAIRE');
  
  addSubheader(doc, '7.1 Priorité 1 : Collecte et intégration des données enseignants');
  addBullet(doc, 'Collecter les listes d\'enseignants de la Faculté de Pharmacie (première faculté pilote)');
  addBullet(doc, 'Créer les comptes enseignants avec matricules et informations');
  addBullet(doc, 'Importer les cours du semestre avec crédits, horaires et salles');
  addBullet(doc, 'Affecter les enseignants à leurs cours respectifs');
  addBullet(doc, 'Créer les inscriptions (enrollments) reliant étudiants aux cours');
  addText(doc, 'Objectif : Avoir une base complète pour une faculté avant activation', { indent: 20 });
  
  addSubheader(doc, '7.2 Priorité 2 : Création du jury de délibération');
  addBullet(doc, 'Identifier le président du jury pour la Faculté de Pharmacie');
  addBullet(doc, 'Identifier le secrétaire du jury');
  addBullet(doc, 'Identifier les membres du jury (minimum 3-5 personnes)');
  addBullet(doc, 'Créer les comptes et attribuer les rôles dans le système');
  addBullet(doc, 'Former le jury sur le processus de délibération numérique');
  addText(doc, 'Requis pour : Réaliser la première délibération test', { indent: 20 });
  
  addSubheader(doc, '7.3 Priorité 3 : Test avec première délibération');
  addBullet(doc, 'Saisie des notes par les enseignants (TP, TD, Examen)');
  addBullet(doc, 'Compilation des résultats par le secrétaire du jury');
  addBullet(doc, 'Session de délibération avec ajustements si nécessaire');
  addBullet(doc, 'Validation par le président du jury');
  addBullet(doc, 'Publication des résultats pour une promotion test');
  addBullet(doc, 'Documentation du processus et identification des bugs');
  addText(doc, 'Cette étape valide le workflow complet avant déploiement massif', { indent: 20 });
  
  doc.addPage();
  
  addSubheader(doc, '7.4 Priorité 4 : Activation massive des comptes (après validation)');
  addBullet(doc, 'Formation des points focaux (1 par département)');
  addBullet(doc, 'Formation des enseignants par vagues de facultés');
  addBullet(doc, 'Stands d\'assistance dans les facultés');
  addBullet(doc, 'Distribution du matériel (affiches, dépliants avec QR codes)');
  addBullet(doc, 'Déploiement progressif : 3 facultés par semaine');
  addText(doc, 'Période prévue : Mars 2026 (après validation de la première délibération)', { indent: 20 });
  
  addSubheader(doc, '7.5 Extension aux autres facultés');
  addBullet(doc, 'Répliquer le processus pour les 14 autres facultés');
  addBullet(doc, 'Import des enseignants, cours et jurys faculté par faculté');
  addBullet(doc, 'Formation progressive des acteurs académiques');
  addBullet(doc, 'Déploiement échelonné selon le calendrier');
  addText(doc, 'Période prévue : Mars - Avril 2026', { indent: 20 });
  
  addSubheader(doc, '7.6 Modules avancés et intégrations');
  addBullet(doc, 'Configuration du système de notifications (email/SMS)');
  addBullet(doc, 'Intégration paiement mobile (Mobile Money)');
  addBullet(doc, 'Module analytics avancé pour le rectorat');
  addBullet(doc, 'Tests de charge (5 000+ connexions simultanées)');
  addBullet(doc, 'Tests de sécurité et audit des vulnérabilités');
  addText(doc, 'Période prévue : Avril 2026', { indent: 20 });

  // ===== 8. RECOMMANDATIONS =====
  addHeader(doc, '8. RECOMMANDATIONS');
  
  addSubheader(doc, '8.1 Phase 1 : Collecte des données (PRIORITÉ ABSOLUE)');
  addText(doc, 'Avant toute campagne d\'activation massive, il est impératif de compléter la base de données :');
  doc.moveDown(0.3);
  addBullet(doc, 'Collecter et importer les données des enseignants de la Faculté de Pharmacie');
  addBullet(doc, 'Créer les comptes enseignants avec leurs matricules et coordonnées');
  addBullet(doc, 'Importer les cours du semestre en cours avec crédits et horaires');
  addBullet(doc, 'Affecter les enseignants à leurs cours respectifs');
  addBullet(doc, 'Créer les inscriptions (enrollments) reliant étudiants et cours');
  addBullet(doc, 'Importer les notes existantes si disponibles');
  addBullet(doc, 'Désigner et créer les comptes du jury de délibération');
  addText(doc, 'Durée estimée : 1-2 semaines', { indent: 20 });
  doc.moveDown(0.5);
  
  addSubheader(doc, '8.2 Phase 2 : Test avec la première délibération');
  addText(doc, 'Objectif : Réaliser la première délibération complète via la plateforme avec la Faculté de Pharmacie');
  doc.moveDown(0.3);
  addBullet(doc, 'Former le président du jury, le secrétaire et les membres');
  addBullet(doc, 'Tester la saisie des notes par les enseignants');
  addBullet(doc, 'Compiler les résultats et calculer les moyennes');
  addBullet(doc, 'Effectuer les ajustements en session de délibération');
  addBullet(doc, 'Valider et publier les résultats pour une promotion test');
  addBullet(doc, 'Documenter le processus et identifier les améliorations nécessaires');
  addText(doc, 'Cette phase valide le workflow complet avant le déploiement massif', { indent: 20 });
  doc.moveDown(0.5);
  
  addSubheader(doc, '8.3 Phase 3 : Activation massive des comptes');
  addText(doc, 'Une fois le système validé avec la Faculté de Pharmacie, lancer la campagne d\'activation :');
  doc.moveDown(0.3);
  addBullet(doc, 'Former les points focaux (1 par département)');
  addBullet(doc, 'Former les enseignants par vagues de facultés');
  addBullet(doc, 'Installer des stands d\'assistance dans les facultés');
  addBullet(doc, 'Distribuer le matériel de communication (affiches, QR codes)');
  addBullet(doc, 'Déployer progressivement les autres facultés (3 par semaine)');
  addText(doc, 'Période prévue : Mars 2026', { indent: 20 });
  doc.moveDown(0.5);
  
  addSubheader(doc, '8.4 Phase 4 : Extension et optimisation');
  addBullet(doc, 'Étendre les données aux autres facultés (enseignants, cours, jurys)');
  addBullet(doc, 'Activer les modules avancés (notifications, paiement mobile)');
  addBullet(doc, 'Optimiser les performances pour 5 000+ utilisateurs simultanés');
  addBullet(doc, 'Effectuer les tests de sécurité et charge');
  addBullet(doc, 'Organiser la cérémonie de lancement officiel avec le Recteur');
  addText(doc, 'Période prévue : Avril 2026', { indent: 20 });
  doc.moveDown(0.5);
  
  addSubheader(doc, '8.5 Stratégie recommandée : "Test puis Déploiement"');
  doc.fontSize(10)
     .fillColor('#d97706')
     .font('Helvetica-Bold')
     .text('⚠️ IMPORTANT : Ne pas activer massivement les comptes avant d\'avoir validé le workflow complet', 50)
     .font('Helvetica')
     .fillColor('#000000')
     .moveDown(0.3);
  addText(doc, 'Raisons stratégiques :');
  addBullet(doc, 'Les étudiants activés verront des tableaux de bord vides (pas de cours, pas de notes)');
  addBullet(doc, 'Frustration et perte de confiance si la plateforme n\'offre pas de valeur immédiate');
  addBullet(doc, 'Difficulté à corriger les problèmes avec 50 000 utilisateurs actifs simultanément');
  addBullet(doc, 'Besoin de valider le processus critique (délibération) avant déploiement massif');
  doc.moveDown(0.3);
  addText(doc, 'La réussite de la première délibération démontre la maturité du système et justifie l\'activation massive.');
  
  doc.moveDown(2);
  
  // ===== CONCLUSION =====
  doc.fontSize(12)
     .fillColor('#1e3a5f')
     .font('Helvetica-Bold')
     .text('CONCLUSION', { underline: true })
     .moveDown(0.5);
  
  doc.fontSize(11)
     .fillColor('#000000')
     .font('Helvetica')
     .text('Le projet NEXUS UNIKIN a accompli des progrès significatifs en 19 jours avec :')
     .moveDown(0.3);
  
  addBullet(doc, '100% de l\'infrastructure technique déployée et fonctionnelle');
  addBullet(doc, '100% des données étudiants intégrées (50 407 étudiants, 0 doublon)');
  addBullet(doc, '100% des modules fonctionnels développés et testés');
  addBullet(doc, '93 349 paiements historiques importés et disponibles');
  
  doc.moveDown(0.5);
  addText(doc, 'La prochaine étape critique est la collecte des données enseignants et la validation du workflow complet avec la Faculté de Pharmacie.');
  
  doc.moveDown(0.5);
  addText(doc, 'Stratégie recommandée : D\'abord valider le système avec une première délibération réussie, puis lancer l\'activation massive des 50 407 comptes. Cette approche garantit une expérience utilisateur optimale dès le premier jour.');
  
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
  
  addSubheader(doc, 'C. Documents de référence');
  addText(doc, '• Contrat de prestation de services');
  addText(doc, '• Calendrier de déploiement mis à jour (13 février 2026)');
  addText(doc, '• Architecture des rôles NEXUS');
  addText(doc, '• Plan de travail détaillé');
  doc.moveDown(1);
  
  // Pied de page final
  doc.fontSize(10)
     .fillColor('#718096')
     .font('Helvetica')
     .text('_______________________________________________', { align: 'center' })
     .moveDown(0.3)
     .text('Rapport émis le 17 février 2026', { align: 'center' })
     .text('NEXUS UNIKIN - Système de Gestion Universitaire', { align: 'center' })
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

// Exécution
generatePDF()
  .then(path => {
    console.log(`\n🎉 Rapport d'avancement généré : ${path}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur lors de la génération du PDF:', error);
    process.exit(1);
  });

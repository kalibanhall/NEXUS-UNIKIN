const XLSX = require('xlsx');
const path = require('path');

// ============================================
// NEXUS UNIKIN - Tableur de collecte de données
// Faculté des Sciences Pharmaceutiques (Pilote)
// ============================================

function createWorkbook() {
  const wb = XLSX.utils.book_new();

  // ============================================
  // FEUILLE 1: ENSEIGNANTS
  // ============================================
  const enseignantsHeaders = [
    'N°',
    'Nom de famille*',
    'Prénom*',
    'Post-nom',
    'Sexe (M/F)*',
    'Matricule enseignant',
    'Grade académique*\n(ASSISTANT, CHEF_TRAVAUX, PROFESSEUR_ASSOCIE, PROFESSEUR, PROFESSEUR_ORDINAIRE)',
    'Département*\n(Pharmacie / Licence et techniques pharmaceutiques)',
    'Spécialisation',
    'Téléphone*',
    'Email personnel',
    'Date d\'engagement\n(JJ/MM/AAAA)',
    'Permanent (Oui/Non)',
    'Rôle délibération\n(PRESIDENT_JURY / SECRETAIRE_JURY / MEMBRE_JURY / aucun)',
    'Observations'
  ];
  
  // Exemples
  const enseignantsData = [
    enseignantsHeaders,
    ['1', 'EXEMPLE', 'Jean', 'KASA', 'M', 'ENS-001', 'PROFESSEUR', 'Pharmacie', 'Pharmacologie', '+243 999 123 456', 'jean.exemple@email.com', '01/09/2010', 'Oui', 'PRESIDENT_JURY', ''],
    ['2', 'EXEMPLE', 'Marie', 'BULA', 'F', 'ENS-002', 'CHEF_TRAVAUX', 'Pharmacie', 'Chimie pharmaceutique', '+243 888 654 321', '', '15/03/2015', 'Oui', 'SECRETAIRE_JURY', ''],
    ['3', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['4', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['5', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['6', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['7', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['8', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['9', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['10', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['11', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['12', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['13', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['14', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['15', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['16', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['17', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['18', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['19', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['20', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['21', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['22', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['23', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['24', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['25', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['26', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['27', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['28', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['29', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['30', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['31', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['32', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['33', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['34', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['35', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['36', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['37', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['38', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['39', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['40', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['41', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['42', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['43', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['44', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['45', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['46', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['47', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['48', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['49', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['50', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const wsEnseignants = XLSX.utils.aoa_to_sheet(enseignantsData);
  wsEnseignants['!cols'] = [
    { wch: 5 },   // N°
    { wch: 20 },  // Nom
    { wch: 15 },  // Prénom
    { wch: 15 },  // Post-nom
    { wch: 8 },   // Sexe
    { wch: 18 },  // Matricule
    { wch: 25 },  // Grade
    { wch: 40 },  // Département
    { wch: 25 },  // Spécialisation
    { wch: 20 },  // Téléphone
    { wch: 30 },  // Email
    { wch: 15 },  // Date engagement
    { wch: 12 },  // Permanent
    { wch: 25 },  // Rôle délibération
    { wch: 25 },  // Observations
  ];
  XLSX.utils.book_append_sheet(wb, wsEnseignants, 'ENSEIGNANTS');

  // ============================================
  // FEUILLE 2: COURS PAR PROMOTION
  // ============================================
  const coursHeaders = [
    'N°',
    'Code du cours*\n(ex: PHAR101)',
    'Intitulé du cours*',
    'Promotion*\n(voir feuille PROMOTIONS)',
    'Semestre*\n(1 ou 2)',
    'Crédits*',
    'Heures CM\n(Cours Magistral)',
    'Heures TD\n(Travaux Dirigés)',
    'Heures TP\n(Travaux Pratiques)',
    'Enseignant titulaire*\n(Nom + Prénom)',
    'Type\n(OBLIGATOIRE / OPTIONNEL)',
    'Observations'
  ];
  
  const coursData = [
    coursHeaders,
    ['1', 'PHAR101', 'Introduction à la pharmacologie', 'B1 PHARMACIE', '1', '4', '30', '15', '10', 'EXEMPLE Jean', 'OBLIGATOIRE', ''],
    ['2', 'PHAR102', 'Chimie générale pharmaceutique', 'B1 PHARMACIE', '1', '3', '25', '10', '15', 'EXEMPLE Marie', 'OBLIGATOIRE', ''],
    ['3', '', '', '', '', '', '', '', '', '', '', ''],
    ['4', '', '', '', '', '', '', '', '', '', '', ''],
    ['5', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  // Add 95 more empty rows
  for (let i = 6; i <= 100; i++) {
    coursData.push([String(i), '', '', '', '', '', '', '', '', '', '', '']);
  }
  
  const wsCours = XLSX.utils.aoa_to_sheet(coursData);
  wsCours['!cols'] = [
    { wch: 5 },   // N°
    { wch: 15 },  // Code
    { wch: 40 },  // Intitulé
    { wch: 45 },  // Promotion
    { wch: 10 },  // Semestre
    { wch: 8 },   // Crédits
    { wch: 10 },  // CM
    { wch: 10 },  // TD
    { wch: 10 },  // TP
    { wch: 25 },  // Enseignant
    { wch: 15 },  // Type
    { wch: 25 },  // Observations
  ];
  XLSX.utils.book_append_sheet(wb, wsCours, 'COURS');

  // ============================================
  // FEUILLE 3: JURY DE DÉLIBÉRATION
  // ============================================
  const juryHeaders = [
    'N°',
    'Département*',
    'Promotion concernée*',
    'Rôle dans le jury*\n(PRESIDENT / SECRETAIRE / MEMBRE)',
    'Nom de famille*',
    'Prénom*',
    'Grade académique',
    'Téléphone',
    'Email',
    'Observations'
  ];
  
  const juryData = [
    juryHeaders,
    ['1', 'Pharmacie', 'Toutes promotions', 'PRESIDENT', '', '', '', '', '', ''],
    ['2', 'Pharmacie', 'Toutes promotions', 'SECRETAIRE', '', '', '', '', '', ''],
    ['3', 'Pharmacie', 'B1 PHARMACIE', 'MEMBRE', '', '', '', '', '', ''],
    ['4', 'Pharmacie', 'B2 PHARMACIE', 'MEMBRE', '', '', '', '', '', ''],
    ['5', 'Pharmacie', 'B3 PHARMACIE', 'MEMBRE', '', '', '', '', '', ''],
    ['6', 'Licence et techniques pharmaceutiques', 'Toutes promotions', 'PRESIDENT', '', '', '', '', '', ''],
    ['7', 'Licence et techniques pharmaceutiques', 'Toutes promotions', 'SECRETAIRE', '', '', '', '', '', ''],
    ['8', 'Licence et techniques pharmaceutiques', 'B1 LTP', 'MEMBRE', '', '', '', '', '', ''],
  ];
  
  // Add more empty rows
  for (let i = 9; i <= 25; i++) {
    juryData.push([String(i), '', '', '', '', '', '', '', '', '']);
  }
  
  const wsJury = XLSX.utils.aoa_to_sheet(juryData);
  wsJury['!cols'] = [
    { wch: 5 },   // N°
    { wch: 40 },  // Département
    { wch: 45 },  // Promotion
    { wch: 25 },  // Rôle
    { wch: 20 },  // Nom
    { wch: 15 },  // Prénom
    { wch: 25 },  // Grade
    { wch: 20 },  // Téléphone
    { wch: 30 },  // Email
    { wch: 25 },  // Observations
  ];
  XLSX.utils.book_append_sheet(wb, wsJury, 'JURY DÉLIBÉRATION');

  // ============================================
  // FEUILLE 4: PERSONNEL ADMINISTRATIF (EMPLOYÉS)
  // ============================================
  const employesHeaders = [
    'N°',
    'Nom de famille*',
    'Prénom*',
    'Post-nom',
    'Sexe (M/F)',
    'Fonction/Poste*\n(ex: Secrétaire académique)',
    'Service*\n(ex: Scolarité, Caisse, Secrétariat)',
    'Département/Faculté',
    'Téléphone*',
    'Email',
    'Type contrat\n(PERMANENT / CONTRACT / TEMPORARY)',
    'Observations'
  ];
  
  const employesData = [
    employesHeaders,
    ['1', '', '', '', '', 'Secrétaire académique', 'Scolarité', 'Fac. Pharmacie', '', '', 'PERMANENT', ''],
    ['2', '', '', '', '', 'Agent de caisse', 'Caisse', 'Fac. Pharmacie', '', '', '', ''],
    ['3', '', '', '', '', '', '', '', '', '', '', ''],
    ['4', '', '', '', '', '', '', '', '', '', '', ''],
    ['5', '', '', '', '', '', '', '', '', '', '', ''],
    ['6', '', '', '', '', '', '', '', '', '', '', ''],
    ['7', '', '', '', '', '', '', '', '', '', '', ''],
    ['8', '', '', '', '', '', '', '', '', '', '', ''],
    ['9', '', '', '', '', '', '', '', '', '', '', ''],
    ['10', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  const wsEmployes = XLSX.utils.aoa_to_sheet(employesData);
  wsEmployes['!cols'] = [
    { wch: 5 },   // N°
    { wch: 20 },  // Nom
    { wch: 15 },  // Prénom
    { wch: 15 },  // Post-nom
    { wch: 8 },   // Sexe
    { wch: 30 },  // Poste
    { wch: 20 },  // Service
    { wch: 25 },  // Département
    { wch: 20 },  // Téléphone
    { wch: 30 },  // Email
    { wch: 15 },  // Contrat
    { wch: 25 },  // Observations
  ];
  XLSX.utils.book_append_sheet(wb, wsEmployes, 'EMPLOYÉS ADMINISTRATIFS');

  // ============================================
  // FEUILLE 5: NOTES EXISTANTES (si disponibles)
  // ============================================
  const notesHeaders = [
    'N°',
    'Matricule étudiant*',
    'Nom étudiant',
    'Prénom étudiant',
    'Promotion*',
    'Code du cours*',
    'Intitulé du cours',
    'Note TP\n(sur 20)',
    'Note TD\n(sur 20)',
    'Note Examen\n(sur 20)',
    'Année académique*\n(ex: 2025-2026)',
    'Semestre\n(1 ou 2)',
    'Observations'
  ];
  
  const notesData = [
    notesHeaders,
    ['1', '2201773', 'EXEMPLE', 'Pierre', 'B1 PHARMACIE', 'PHAR101', 'Introduction à la pharmacologie', '14', '', '12', '2025-2026', '1', ''],
    ['2', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['3', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['4', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['5', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  
  for (let i = 6; i <= 200; i++) {
    notesData.push([String(i), '', '', '', '', '', '', '', '', '', '', '', '']);
  }
  
  const wsNotes = XLSX.utils.aoa_to_sheet(notesData);
  wsNotes['!cols'] = [
    { wch: 5 },   // N°
    { wch: 18 },  // Matricule
    { wch: 20 },  // Nom
    { wch: 15 },  // Prénom
    { wch: 35 },  // Promotion
    { wch: 12 },  // Code cours
    { wch: 40 },  // Intitulé
    { wch: 10 },  // TP
    { wch: 10 },  // TD
    { wch: 12 },  // Examen
    { wch: 15 },  // Année
    { wch: 10 },  // Semestre
    { wch: 25 },  // Observations
  ];
  XLSX.utils.book_append_sheet(wb, wsNotes, 'NOTES (si disponibles)');

  // ============================================
  // FEUILLE 6: RÉFÉRENTIEL DES PROMOTIONS (info)
  // ============================================
  const promoData = [
    ['RÉFÉRENTIEL DES PROMOTIONS — Faculté des Sciences Pharmaceutiques'],
    ['', '', '', ''],
    ['Département', 'Code promotion', 'Nom complet', 'Niveau', 'Nombre d\'étudiants'],
    ['Pharmacie', 'B1_38', 'B1 PHARMACIE', 'B1', '382'],
    ['Pharmacie', 'B2_38', 'B2 PHARMACIE', 'B2', '189'],
    ['Pharmacie', 'B3_38', 'B3 PHARMACIE', 'B3', '96'],
    ['Pharmacie', 'L1_38', 'L1 LMD PHARMACIE', 'L1', '203'],
    ['Pharmacie', 'L2_38', 'L2 LMD PHARMACIE', 'L2', '18'],
    ['Pharmacie', 'L3_38', 'L3 LMD PHARMACIE', 'L3', '5'],
    ['Pharmacie', 'P1_38', 'P1 PHARMACIE', 'P1', '95'],
    ['Pharmacie', 'P2_38', 'P2 PHARMACIE', 'P2', '115'],
    ['Pharmacie', 'P3_38', 'P3 PHARMACIE', 'P3', '22'],
    ['Pharmacie', 'G3_38', 'G3 PHARMACIE', 'G3', '2'],
    ['Pharmacie', 'M1_38', 'M1 PHARMACIE', 'M1', '2'],
    ['Pharmacie', 'DP_38', 'DP PHARMACIE', 'DP', '0'],
    ['', '', '', '', ''],
    ['Licence et techn. pharmaceutiques', 'B1_107', 'B1 LICENCE ET TECHNIQUES PHARMACEUTIQUES', 'B1', '4'],
    ['Licence et techn. pharmaceutiques', 'B2_107', 'B2 LICENCE ET TECHNIQUES PHARMACEUTIQUES', 'B2', '5'],
    ['Licence et techn. pharmaceutiques', 'B3_107', 'B3 LICENCE ET TECHNIQUES PHARMACEUTIQUES', 'B3', '1'],
    ['Licence et techn. pharmaceutiques', 'L1_107', 'L1 LMD LICENCE ET TECHNIQUES PHARMACEUTIQUES', 'L1', '30'],
    ['Licence et techn. pharmaceutiques', 'L2_107', 'L2 LMD LICENCE ET TECHNIQUES PHARMACEUTIQUES', 'L2', '23'],
    ['Licence et techn. pharmaceutiques', 'L3_107', 'L3 LMD LICENCE ET TECHNIQUES PHARMACEUTIQUES', 'L3', '5'],
    ['', '', '', '', ''],
    ['TOTAL', '', '', '', '1 197 étudiants'],
    ['', '', '', '', ''],
    ['IMPORTANT : Utiliser les noms exacts des promotions dans les autres feuilles'],
  ];
  
  const wsPromo = XLSX.utils.aoa_to_sheet(promoData);
  wsPromo['!cols'] = [
    { wch: 35 },  // Département
    { wch: 12 },  // Code
    { wch: 50 },  // Nom complet
    { wch: 8 },   // Niveau
    { wch: 18 },  // Étudiants
  ];
  XLSX.utils.book_append_sheet(wb, wsPromo, 'RÉFÉRENTIEL PROMOTIONS');

  // ============================================
  // FEUILLE 7: CRITÈRES DE DÉLIBÉRATION
  // ============================================
  const criteresData = [
    ['CRITÈRES ET EXIGENCES DE DÉLIBÉRATION — À remplir/valider par le Doyen'],
    [''],
    ['Paramètre', 'Valeur par défaut', 'Valeur souhaitée', 'Observations'],
    ['Moyenne minimale pour ADMIS', '10/20', '', ''],
    ['Moyenne minimale pour ADMIS AVEC DETTE', '10/20 (60%+ crédits)', '', ''],
    ['Moyenne minimale pour AJOURNÉ (repêchable)', '8/20', '', ''],
    ['Moyenne en dessous de laquelle REFUSÉ', '< 8/20', '', ''],
    ['Pourcentage de crédits pour ADMIS', '80%', '', ''],
    ['Pourcentage de crédits pour ADMIS AVEC DETTE', '60%', '', ''],
    ['Pourcentage minimum paiement pour voir résultats', '70%', '', ''],
    [''],
    ['Pondération des notes', 'Valeur par défaut', 'Valeur souhaitée', ''],
    ['Poids TP dans la note finale', '30%', '', ''],
    ['Poids TD dans la note finale', '0% (inclus dans TP)', '', ''],
    ['Poids Examen dans la note finale', '70%', '', ''],
    [''],
    ['Règles complémentaires', '', '', ''],
    ['L\'étudiant bloqué (paiement) peut-il être délibéré ?', 'Non', '', ''],
    ['Note éliminatoire (note en dessous de laquelle = refusé même si moyenne OK)', 'Aucune', '', ''],
    ['Nombre maximum de cours en dette autorisés', 'Aucune limite', '', ''],
    ['Les mentions sont-elles attribuées ?', 'Oui', '', '(Distinction, Grande dist., La plus grande dist.)'],
    ['Seuil pour Distinction', '14/20', '', ''],
    ['Seuil pour Grande Distinction', '16/20', '', ''],
    ['Seuil pour La Plus Grande Distinction', '18/20', '', ''],
    [''],
    ['VALIDATION'],
    ['Nom du Doyen:', '', '', ''],
    ['Date de validation:', '', '', ''],
    ['Signature:', '', '', ''],
  ];
  
  const wsCriteres = XLSX.utils.aoa_to_sheet(criteresData);
  wsCriteres['!cols'] = [
    { wch: 55 },  // Paramètre
    { wch: 25 },  // Valeur défaut
    { wch: 25 },  // Valeur souhaitée
    { wch: 45 },  // Observations
  ];
  XLSX.utils.book_append_sheet(wb, wsCriteres, 'CRITÈRES DÉLIBÉRATION');

  // ============================================
  // FEUILLE 8: INSTRUCTIONS
  // ============================================
  const instructionsData = [
    ['INSTRUCTIONS DE REMPLISSAGE'],
    [''],
    ['Ce fichier est destiné à collecter les données nécessaires pour le déploiement'],
    ['de la plateforme NEXUS UNIKIN pour la Faculté des Sciences Pharmaceutiques.'],
    [''],
    ['═══════════════════════════════════════════════════════'],
    ['FEUILLES À REMPLIR (par ordre de priorité):'],
    ['═══════════════════════════════════════════════════════'],
    [''],
    ['1. ENSEIGNANTS (OBLIGATOIRE)'],
    ['   → Liste complète des enseignants de la faculté'],
    ['   → Les champs marqués * sont obligatoires'],
    ['   → Le grade doit être exactement: ASSISTANT, CHEF_TRAVAUX,'],
    ['     PROFESSEUR_ASSOCIE, PROFESSEUR ou PROFESSEUR_ORDINAIRE'],
    ['   → Indiquer le rôle dans le jury si applicable'],
    [''],
    ['2. COURS (OBLIGATOIRE)'],
    ['   → Tous les cours dispensés dans chaque promotion'],
    ['   → Utiliser les noms exacts des promotions (voir feuille RÉFÉRENTIEL)'],
    ['   → Indiquer l\'enseignant titulaire pour chaque cours'],
    ['   → Le semestre doit être 1 ou 2'],
    [''],
    ['3. JURY DÉLIBÉRATION (OBLIGATOIRE)'],
    ['   → Président du jury par département (minimum 1)'],
    ['   → Secrétaire du jury par département (minimum 1)'],
    ['   → Membres du jury (3 minimum par département)'],
    ['   → Ces personnes doivent être des enseignants de la faculté'],
    [''],
    ['4. EMPLOYÉS ADMINISTRATIFS (RECOMMANDÉ)'],
    ['   → Personnel de scolarité, caisse, bibliothèque'],
    ['   → Secrétaires académiques de la faculté'],
    ['   → Ils pourront traiter les demandes de documents'],
    [''],
    ['5. NOTES (OPTIONNEL - si disponibles)'],
    ['   → Notes déjà saisies manuellement'],
    ['   → Sinon, les enseignants les saisiront via la plateforme'],
    [''],
    ['6. CRITÈRES DÉLIBÉRATION (OBLIGATOIRE)'],
    ['   → Valider ou modifier les seuils de délibération'],
    ['   → À faire valider par le Doyen'],
    [''],
    ['═══════════════════════════════════════════════════════'],
    ['CONTACT TECHNIQUE: Chris NGOZULU (+243 832 313 105)'],
    ['═══════════════════════════════════════════════════════'],
    [''],
    ['Rappel des données DÉJÀ dans le système:'],
    ['- 1 197 étudiants (tous matriculés et avec comptes créés)'],
    ['- 2 départements (Pharmacie + Licence et techniques pharmaceutiques)'],
    ['- 18 promotions (B1 à P3, L1 à L3, M1, G3, DP)'],
    ['- Historique de paiements importé'],
    [''],
    ['Ce qui MANQUE et doit être collecté via ce fichier:'],
    ['- ❌ Enseignants (0 actuellement)'],
    ['- ❌ Cours (0 actuellement)'],
    ['- ❌ Jury de délibération'],
    ['- ❌ Personnel administratif'],
    ['- ❌ Notes (optionnel si saisie via plateforme)'],
    ['- ❌ Critères de délibération validés par le Doyen'],
  ];
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [
    { wch: 80 },
  ];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'INSTRUCTIONS');

  return wb;
}

// Vérifier si xlsx est disponible
try {
  require('xlsx');
} catch (e) {
  console.log('📦 Installation de la librairie xlsx...');
  require('child_process').execSync('npm install xlsx', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });
}

const wb = createWorkbook();
const outputPath = path.join(__dirname, '..', 'output', 'COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('✅ Fichier Excel généré avec succès!');
console.log('📄 Fichier:', outputPath);
console.log('\nFeuilles créées:');
console.log('  1. ENSEIGNANTS - Liste des enseignants à intégrer');
console.log('  2. COURS - Catalogue des cours par promotion');
console.log('  3. JURY DÉLIBÉRATION - Composition du jury');
console.log('  4. EMPLOYÉS ADMINISTRATIFS - Personnel administratif');
console.log('  5. NOTES (si disponibles) - Notes existantes');
console.log('  6. RÉFÉRENTIEL PROMOTIONS - Info de référence (ne pas modifier)');
console.log('  7. CRITÈRES DÉLIBÉRATION - Seuils à valider par le Doyen');
console.log('  8. INSTRUCTIONS - Guide de remplissage');

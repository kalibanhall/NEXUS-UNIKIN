/**
 * ============================================================================
 * NEXUS UNIKIN — Générateur de Documentation PDF
 * Structure de la Base de Données PostgreSQL
 * ============================================================================
 * 
 * Usage: node scripts/generate-db-documentation.js
 * Output: docs/NEXUS_UNIKIN_Database_Documentation.pdf
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Créer le dossier docs s'il n'existe pas
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const outputPath = path.join(docsDir, 'NEXUS_UNIKIN_Database_Documentation.pdf');
const doc = new PDFDocument({ 
  size: 'A4', 
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ============================================================
// COULEURS & CONSTANTES
// ============================================================
const COLORS = {
  primary: '#1a237e',      // Bleu marine
  secondary: '#0d47a1',   // Bleu foncé
  accent: '#1565c0',      // Bleu moyen
  success: '#2e7d32',     // Vert
  warning: '#e65100',     // Orange
  danger: '#c62828',      // Rouge
  bg_dark: '#1e1e1e',     // Fond terminal
  bg_code: '#263238',     // Fond code
  bg_light: '#f5f5f5',    // Fond clair
  bg_header: '#e3f2fd',   // Fond header table
  text: '#212121',        // Texte principal
  text_light: '#757575',  // Texte secondaire
  text_code: '#e0e0e0',   // Texte code
  green_term: '#4caf50',  // Vert terminal
  blue_term: '#42a5f5',   // Bleu terminal
  yellow_term: '#ffca28', // Jaune terminal
  white: '#ffffff',
  border: '#bdbdbd',
};

const PAGE_WIDTH = 495; // 595 - 50*2
let currentPage = 1;

// ============================================================
// HELPERS
// ============================================================

function addPageNumber() {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8)
       .fillColor(COLORS.text_light)
       .text(
         `NEXUS UNIKIN — Documentation Base de Données  |  Page ${i + 1}/${pages.count}`,
         50, doc.page.height - 35,
         { align: 'center', width: PAGE_WIDTH }
       );
  }
}

function drawLine(y, color = COLORS.border) {
  doc.moveTo(50, y).lineTo(545, y).strokeColor(color).lineWidth(0.5).stroke();
}

function drawThickLine(y, color = COLORS.primary) {
  doc.moveTo(50, y).lineTo(545, y).strokeColor(color).lineWidth(2).stroke();
}

function checkSpace(needed = 120) {
  if (doc.y > doc.page.height - needed - 50) {
    doc.addPage();
  }
}

function terminalBox(x, y, width, height, title = 'Terminal PostgreSQL') {
  // Barre de titre du terminal
  doc.roundedRect(x, y, width, 24, 6)
     .fillAndStroke(COLORS.bg_dark, COLORS.bg_dark);
  
  // Boutons
  doc.circle(x + 14, y + 12, 5).fill('#ff5f56');
  doc.circle(x + 30, y + 12, 5).fill('#ffbd2e');
  doc.circle(x + 46, y + 12, 5).fill('#27c93f');
  
  // Titre terminal
  doc.fontSize(9).fillColor(COLORS.text_code)
     .text(title, x + 60, y + 6, { width: width - 70 });
  
  // Corps du terminal
  doc.rect(x, y + 24, width, height - 24).fill(COLORS.bg_dark);
  
  return y + 30; // Position de départ du texte
}

function codeText(text, x, y, color = COLORS.text_code) {
  doc.font('Courier').fontSize(8.5).fillColor(color).text(text, x + 10, y);
  return doc.y + 2;
}

function sqlKeyword(text) {
  return text;
}

// ============================================================
// PAGE DE COUVERTURE
// ============================================================

function drawCover() {
  // Fond dégradé simulé
  doc.rect(0, 0, 595, 842).fill(COLORS.primary);
  
  // Bande décorative
  doc.rect(0, 280, 595, 4).fill(COLORS.yellow_term);
  doc.rect(0, 550, 595, 4).fill(COLORS.yellow_term);
  
  // Logo zone
  doc.roundedRect(220, 100, 155, 155, 20)
     .fillAndStroke(COLORS.white, COLORS.white);
  
  doc.fontSize(60).font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text('N', 247, 115, { continued: false });
  
  doc.fontSize(14).font('Helvetica')
     .fillColor(COLORS.accent)
     .text('NEXUS UNIKIN', 232, 185, { align: 'left' });
  
  doc.fontSize(8).fillColor(COLORS.text_light)
     .text('Système de Gestion Universitaire', 225, 205);
  
  // Titre principal
  doc.fontSize(32).font('Helvetica-Bold')
     .fillColor(COLORS.white)
     .text('DOCUMENTATION', 0, 310, { align: 'center', width: 595 });
  
  doc.fontSize(28).font('Helvetica-Bold')
     .fillColor(COLORS.yellow_term)
     .text('BASE DE DONNÉES', 0, 350, { align: 'center', width: 595 });
  
  doc.fontSize(20).font('Helvetica')
     .fillColor(COLORS.text_code)
     .text('PostgreSQL — Schéma Complet', 0, 400, { align: 'center', width: 595 });
  
  // Infos
  doc.fontSize(12).font('Helvetica')
     .fillColor(COLORS.white);
  
  const infoY = 570;
  doc.text('Université de Kinshasa', 0, infoY, { align: 'center', width: 595 });
  doc.text('Projet NEXUS — Système Intégré de Gestion', 0, infoY + 22, { align: 'center', width: 595 });
  
  doc.fontSize(11).fillColor(COLORS.text_code);
  doc.text('Version 1.0.0  •  Février 2026', 0, infoY + 55, { align: 'center', width: 595 });
  doc.text('14 Tables  •  16 Index  •  8 Triggers', 0, infoY + 75, { align: 'center', width: 595 });
  
  // Pied de page couverture
  doc.fontSize(9).fillColor(COLORS.text_light)
     .text('Document généré automatiquement — Confidentiel', 0, 780, { align: 'center', width: 595 });
  
  doc.addPage();
}

// ============================================================
// TABLE DES MATIÈRES
// ============================================================

function drawTableOfContents() {
  doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('TABLE DES MATIÈRES', 50, 50);
  
  drawThickLine(85);
  
  const items = [
    { num: '1', title: 'Introduction & Vue d\'ensemble', page: '3' },
    { num: '2', title: 'Architecture de la Base de Données', page: '4' },
    { num: '3', title: 'Diagramme des Relations (ERD)', page: '5' },
    { num: '4', title: 'Tables de Référence', page: '6' },
    { num: '4.1', sub: true, title: 'academic_years — Années Académiques', page: '6' },
    { num: '4.2', sub: true, title: 'users — Utilisateurs', page: '6' },
    { num: '4.3', sub: true, title: 'faculties — Facultés', page: '7' },
    { num: '4.4', sub: true, title: 'departments — Départements', page: '7' },
    { num: '4.5', sub: true, title: 'promotions — Promotions', page: '8' },
    { num: '5', title: 'Tables de Profils', page: '9' },
    { num: '5.1', sub: true, title: 'admins — Administrateurs', page: '9' },
    { num: '5.2', sub: true, title: 'teachers — Enseignants', page: '9' },
    { num: '5.3', sub: true, title: 'students — Étudiants', page: '10' },
    { num: '5.4', sub: true, title: 'employees — Employés', page: '10' },
    { num: '6', title: 'Tables Académiques', page: '11' },
    { num: '6.1', sub: true, title: 'courses — Cours', page: '11' },
    { num: '6.2', sub: true, title: 'course_schedules — Horaires', page: '11' },
    { num: '6.3', sub: true, title: 'enrollments — Inscriptions', page: '12' },
    { num: '6.4', sub: true, title: 'grades — Notes', page: '12' },
    { num: '6.5', sub: true, title: 'attendance — Présences', page: '13' },
    { num: '7', title: 'Tables Opérationnelles', page: '14' },
    { num: '7.1', sub: true, title: 'payments — Paiements', page: '14' },
    { num: '7.2', sub: true, title: 'notifications — Notifications', page: '14' },
    { num: '8', title: 'Index & Performances', page: '15' },
    { num: '9', title: 'Triggers & Fonctions', page: '16' },
    { num: '10', title: 'Comptes par Défaut', page: '17' },
  ];
  
  let y = 105;
  items.forEach(item => {
    const indent = item.sub ? 30 : 0;
    const fontSize = item.sub ? 10 : 12;
    const font = item.sub ? 'Helvetica' : 'Helvetica-Bold';
    
    doc.fontSize(fontSize).font(font).fillColor(COLORS.text);
    doc.text(`${item.num}`, 60 + indent, y, { continued: false, width: 30 });
    doc.text(item.title, 95 + indent, y, { continued: false });
    
    y += item.sub ? 18 : 24;
  });
  
  doc.addPage();
}

// ============================================================
// SECTION 1: INTRODUCTION
// ============================================================

function drawIntroduction() {
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('1. Introduction & Vue d\'ensemble', 50, 50);
  drawThickLine(82);
  
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.text);
  doc.text(
    'NEXUS UNIKIN est un système intégré de gestion universitaire développé pour l\'Université de Kinshasa (UNIKIN). ' +
    'Ce document décrit la structure complète de la base de données PostgreSQL qui soutient l\'ensemble du système.',
    50, 95, { width: PAGE_WIDTH, lineGap: 4 }
  );
  
  doc.moveDown(0.8);
  
  // Encadré tech specs
  const specY = doc.y;
  doc.roundedRect(50, specY, PAGE_WIDTH, 130, 5)
     .fillAndStroke(COLORS.bg_light, COLORS.border);
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text('⚙ Spécifications Techniques', 65, specY + 12);
  
  const specs = [
    ['SGBD', 'PostgreSQL 15+'],
    ['Framework', 'Next.js 14.1.0 (App Router)'],
    ['ORM / Accès', 'pg (node-postgres) — requêtes SQL natives'],
    ['Authentification', 'bcryptjs (hash) + jsonwebtoken (JWT)'],
    ['Tables', '14 tables principales'],
    ['Index', '16 index de performance'],
    ['Triggers', '8 triggers auto updated_at'],
  ];
  
  let sy = specY + 32;
  specs.forEach(([label, value]) => {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.text)
       .text(label + ' :', 75, sy, { continued: false, width: 120 });
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.text_light)
       .text(value, 200, sy);
    sy += 14;
  });
  
  doc.y = specY + 145;
  
  // Fonctionnalités
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text('Modules couverts par la base de données', 50, doc.y);
  doc.moveDown(0.5);
  
  const modules = [
    ['Gestion des utilisateurs', 'Comptes multi-rôles (Admin, Enseignant, Étudiant, Employé) avec authentification sécurisée.'],
    ['Structure académique', 'Facultés → Départements → Promotions — hiérarchie complète de l\'université.'],
    ['Gestion des cours', 'Catalogue de cours avec crédits, horaires, affectation aux enseignants et types (CM/TD/TP).'],
    ['Inscriptions & Notes', 'Suivi des inscriptions par année académique, saisie des notes (TP, TD, Examen) et validation.'],
    ['Suivi des présences', 'Enregistrement quotidien des présences avec statuts (Présent, Absent, Retard, Excusé).'],
    ['Paiements', 'Traçabilité complète des paiements (inscription, frais académiques) par méthode.'],
    ['Notifications', 'Système de notifications en temps réel pour tous les utilisateurs.'],
  ];
  
  modules.forEach(([title, desc]) => {
    checkSpace(50);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.accent)
       .text('► ' + title, 60, doc.y, { width: PAGE_WIDTH - 20 });
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.text_light)
       .text(desc, 75, doc.y, { width: PAGE_WIDTH - 35, lineGap: 2 });
    doc.moveDown(0.4);
  });
  
  doc.addPage();
}

// ============================================================
// SECTION 2: ARCHITECTURE
// ============================================================

function drawArchitecture() {
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('2. Architecture de la Base de Données', 50, 50);
  drawThickLine(82);
  
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.text)
     .text(
       'La base de données suit une architecture relationnelle normalisée (3NF). Les tables sont organisées en 4 catégories logiques :',
       50, 95, { width: PAGE_WIDTH, lineGap: 4 }
     );
  
  doc.moveDown(1);
  
  // Catégories visuelles
  const categories = [
    { 
      name: 'TABLES DE RÉFÉRENCE', 
      color: '#1565c0',
      tables: ['academic_years', 'users', 'faculties', 'departments', 'promotions'],
      desc: 'Données de base qui structurent l\'université. Rarement modifiées après la configuration initiale.'
    },
    { 
      name: 'TABLES DE PROFILS', 
      color: '#2e7d32',
      tables: ['admins', 'teachers', 'students', 'employees'],
      desc: 'Profils spécialisés liés aux utilisateurs. Chaque rôle possède sa propre table avec des champs spécifiques.'
    },
    { 
      name: 'TABLES ACADÉMIQUES', 
      color: '#e65100',
      tables: ['courses', 'course_schedules', 'enrollments', 'grades', 'attendance'],
      desc: 'Cœur du système académique : cours, horaires, inscriptions, notes et présences.'
    },
    { 
      name: 'TABLES OPÉRATIONNELLES', 
      color: '#7b1fa2',
      tables: ['payments', 'notifications'],
      desc: 'Gestion financière et communication. Données à forte volumétrie.'
    },
  ];
  
  categories.forEach(cat => {
    checkSpace(100);
    const catY = doc.y;
    
    // Barre colorée à gauche
    doc.rect(50, catY, 5, 70).fill(cat.color);
    
    // Titre catégorie
    doc.fontSize(12).font('Helvetica-Bold').fillColor(cat.color)
       .text(cat.name, 65, catY + 2);
    
    // Tables
    doc.fontSize(9).font('Courier').fillColor(COLORS.text);
    const tableList = cat.tables.map(t => `[${t}]`).join('  ');
    doc.text(tableList, 65, catY + 20, { width: PAGE_WIDTH - 25 });
    
    // Description
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.text_light)
       .text(cat.desc, 65, catY + 38, { width: PAGE_WIDTH - 25, lineGap: 2 });
    
    doc.y = catY + 80;
  });
  
  doc.moveDown(1);
  
  // Terminal : commande de connexion
  checkSpace(140);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text('Connexion à la base de données', 50, doc.y);
  doc.moveDown(0.5);
  
  const termY = doc.y;
  const termH = 110;
  let ty = terminalBox(50, termY, PAGE_WIDTH, termH, 'Terminal — psql');
  
  ty = codeText('$ psql -h localhost -U postgres -d nexus_unikin', 50, ty, COLORS.green_term);
  ty = codeText('Password: ********', 50, ty, COLORS.text_code);
  ty = codeText('', 50, ty);
  ty = codeText('psql (15.4)', 50, ty, COLORS.text_code);
  ty = codeText('Type "help" for help.', 50, ty, COLORS.text_code);
  ty = codeText('', 50, ty);
  ty = codeText('nexus_unikin=# \\dt', 50, ty, COLORS.yellow_term);
  
  doc.y = termY + termH + 15;
  
  doc.addPage();
}

// ============================================================
// SECTION 3: DIAGRAMME ERD
// ============================================================

function drawERD() {
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('3. Diagramme des Relations (ERD)', 50, 50);
  drawThickLine(82);
  
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.text)
     .text(
       'Voici le diagramme entité-relation simplifié montrant les clés étrangères (FK) entre les tables :',
       50, 95, { width: PAGE_WIDTH, lineGap: 4 }
     );
  
  doc.moveDown(1);
  
  // Diagramme textuel dans un terminal
  const erdY = doc.y;
  const erdH = 400;
  let ey = terminalBox(50, erdY, PAGE_WIDTH, erdH, 'NEXUS UNIKIN — Entity Relationship Diagram');
  
  const erdLines = [
    { text: '                    ┌──────────────────┐', color: COLORS.yellow_term },
    { text: '                    │  academic_years   │', color: COLORS.yellow_term },
    { text: '                    └────────┬─────────┘', color: COLORS.yellow_term },
    { text: '                             │', color: COLORS.text_code },
    { text: '         ┌──────────────┐    │    ┌──────────────┐', color: COLORS.text_code },
    { text: '         │   faculties   │    │    │    users     │', color: COLORS.blue_term },
    { text: '         └──────┬───────┘    │    └──────┬───────┘', color: COLORS.blue_term },
    { text: '                │            │           │', color: COLORS.text_code },
    { text: '         ┌──────┴───────┐    │    ┌──────┴───────────────────┐', color: COLORS.text_code },
    { text: '         │ departments  │    │    │  admins | teachers      │', color: COLORS.green_term },
    { text: '         └──────┬───────┘    │    │  students | employees   │', color: COLORS.green_term },
    { text: '                │            │    └──────┬───────────────────┘', color: COLORS.green_term },
    { text: '         ┌──────┴───────┐    │           │', color: COLORS.text_code },
    { text: '         │  promotions  ├────┘    ┌──────┴───────┐', color: COLORS.yellow_term },
    { text: '         └──────┬───────┘         │  enrollments │', color: COLORS.yellow_term },
    { text: '                │                 └──────┬───────┘', color: COLORS.text_code },
    { text: '         ┌──────┴───────┐                │', color: COLORS.text_code },
    { text: '         │   courses    ├────────────────┘', color: '#ff7043' },
    { text: '         └──┬───┬───┬───┘', color: '#ff7043' },
    { text: '            │   │   │', color: COLORS.text_code },
    { text: '    ┌───────┘   │   └────────┐', color: COLORS.text_code },
    { text: '    │           │            │', color: COLORS.text_code },
    { text: ' ┌──┴──────┐ ┌─┴─────────┐ ┌┴──────────┐', color: COLORS.text_code },
    { text: ' │schedules│ │  grades   │ │attendance │', color: '#ce93d8' },
    { text: ' └─────────┘ └───────────┘ └───────────┘', color: '#ce93d8' },
    { text: '', color: COLORS.text_code },
    { text: '  ┌────────────┐    ┌────────────────┐', color: COLORS.text_code },
    { text: '  │  payments  │    │ notifications  │', color: '#ef5350' },
    { text: '  └────────────┘    └────────────────┘', color: '#ef5350' },
  ];
  
  erdLines.forEach(line => {
    ey = codeText(line.text, 50, ey, line.color);
  });
  
  doc.y = erdY + erdH + 15;
  
  // Légende
  checkSpace(80);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text('Légende des clés étrangères :', 50, doc.y);
  doc.moveDown(0.3);
  
  const fks = [
    'departments.faculty_id       →  faculties.id',
    'promotions.department_id     →  departments.id',
    'promotions.academic_year_id  →  academic_years.id',
    'admins.user_id               →  users.id',
    'teachers.user_id             →  users.id',
    'students.user_id             →  users.id',
    'employees.user_id            →  users.id',
    'courses.promotion_id         →  promotions.id',
    'courses.teacher_id           →  teachers.id',
    'enrollments.student_id       →  students.id',
    'enrollments.course_id        →  courses.id',
    'grades.student_id            →  students.id',
    'grades.course_id             →  courses.id',
    'attendance.student_id        →  students.id',
    'attendance.course_id         →  courses.id',
    'payments.student_id          →  students.id',
    'notifications.user_id        →  users.id',
  ];
  
  doc.fontSize(8).font('Courier').fillColor(COLORS.text);
  fks.forEach(fk => {
    checkSpace(12);
    doc.text('  ' + fk, 60, doc.y);
  });
  
  doc.addPage();
}

// ============================================================
// SECTION 4-7: TABLES DÉTAILLÉES
// ============================================================

function drawTableDetail(tableName, description, columns, comment, sqlCreate) {
  checkSpace(250);
  
  // Titre de table
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text(`${tableName}`, 50, doc.y);
  
  doc.fontSize(9).font('Helvetica').fillColor(COLORS.text_light)
     .text(description, 50, doc.y, { width: PAGE_WIDTH });
  doc.moveDown(0.5);
  
  // Commentaire explicatif
  if (comment) {
    const cmtY = doc.y;
    doc.roundedRect(50, cmtY, PAGE_WIDTH, 40, 3)
       .fillAndStroke('#fff8e1', '#ffe082');
    doc.fontSize(8.5).font('Helvetica').fillColor(COLORS.text)
       .text('💡 ' + comment, 60, cmtY + 8, { width: PAGE_WIDTH - 25, lineGap: 2 });
    doc.y = cmtY + 48;
  }
  
  // En-tête de tableau
  const tableY = doc.y;
  const colWidths = [120, 90, 50, 235];
  const headers = ['Colonne', 'Type', 'NULL', 'Description / Contrainte'];
  
  doc.rect(50, tableY, PAGE_WIDTH, 18).fill(COLORS.bg_header);
  let hx = 50;
  headers.forEach((h, i) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.secondary)
       .text(h, hx + 4, tableY + 4, { width: colWidths[i] });
    hx += colWidths[i];
  });
  
  // Lignes du tableau
  let ry = tableY + 20;
  columns.forEach((col, idx) => {
    checkSpace(18);
    
    // Alternance de couleur
    if (idx % 2 === 0) {
      doc.rect(50, ry - 2, PAGE_WIDTH, 16).fill('#fafafa');
    }
    
    let rx = 50;
    // Nom colonne
    const isPK = col[3] && col[3].includes('PRIMARY KEY');
    const isFK = col[3] && col[3].includes('FK →');
    doc.fontSize(8).font('Courier-Bold')
       .fillColor(isPK ? COLORS.warning : isFK ? COLORS.accent : COLORS.text)
       .text(col[0], rx + 4, ry, { width: colWidths[0] });
    rx += colWidths[0];
    
    // Type
    doc.fontSize(8).font('Courier').fillColor(COLORS.text_light)
       .text(col[1], rx + 4, ry, { width: colWidths[1] });
    rx += colWidths[1];
    
    // Nullable
    doc.fontSize(8).font('Helvetica')
       .fillColor(col[2] === 'NO' ? COLORS.danger : COLORS.success)
       .text(col[2], rx + 4, ry, { width: colWidths[2] });
    rx += colWidths[2];
    
    // Description
    doc.fontSize(7.5).font('Helvetica').fillColor(COLORS.text)
       .text(col[3], rx + 4, ry, { width: colWidths[3] - 8 });
    
    ry = doc.y + 4;
  });
  
  drawLine(ry);
  doc.y = ry + 5;
  
  // SQL dans un terminal
  if (sqlCreate) {
    checkSpace(180);
    doc.moveDown(0.3);
    
    const sqlLines = sqlCreate.split('\n');
    const sqlH = Math.min(sqlLines.length * 11 + 10, 250);
    const sqlY = doc.y;
    let sy = terminalBox(50, sqlY, PAGE_WIDTH, sqlH, `psql — CREATE TABLE ${tableName}`);
    
    sqlLines.forEach(line => {
      // Coloriser les mots-clés SQL
      let color = COLORS.text_code;
      const upper = line.trim().toUpperCase();
      if (upper.startsWith('CREATE') || upper.startsWith('DROP') || upper.startsWith(');')) color = COLORS.yellow_term;
      else if (upper.includes('PRIMARY KEY') || upper.includes('REFERENCES') || upper.includes('UNIQUE') || upper.includes('CHECK')) color = '#ff7043';
      else if (upper.includes('SERIAL') || upper.includes('VARCHAR') || upper.includes('INTEGER') || upper.includes('BOOLEAN') || upper.includes('TIMESTAMP') || upper.includes('DATE') || upper.includes('TEXT') || upper.includes('DECIMAL') || upper.includes('TIME')) color = COLORS.green_term;
      else if (upper.includes('NOT NULL') || upper.includes('DEFAULT')) color = COLORS.blue_term;
      
      sy = codeText(line, 50, sy, color);
    });
    
    doc.y = sqlY + sqlH + 10;
  }
  
  doc.moveDown(0.8);
}

// ============================================================
// DONNÉES DES TABLES
// ============================================================

function drawAllTables() {
  // ===== SECTION 4: Tables de Référence =====
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('4. Tables de Référence', 50, 50);
  drawThickLine(82);
  doc.y = 95;
  
  // --- academic_years ---
  drawTableDetail(
    'academic_years',
    'Gestion des années académiques de l\'université.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY — Identifiant auto-incrémenté'],
      ['name', 'VARCHAR(20)', 'NO', 'Nom unique : "2024-2025" (UNIQUE)'],
      ['start_date', 'DATE', 'NO', 'Date de début de l\'année'],
      ['end_date', 'DATE', 'NO', 'Date de fin de l\'année'],
      ['is_current', 'BOOLEAN', 'YES', 'DEFAULT FALSE — Marque l\'année en cours'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP — Trigger auto'],
    ],
    'Une seule année peut avoir is_current = TRUE à la fois. Cette table est référencée par promotions, enrollments, grades et payments.',
    `CREATE TABLE academic_years (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(20) NOT NULL UNIQUE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_current  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  );
  
  // --- users ---
  drawTableDetail(
    'users',
    'Table centrale — tous les comptes utilisateurs du système.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY — Identifiant auto-incrémenté'],
      ['email', 'VARCHAR(255)', 'NO', 'Email unique de connexion (UNIQUE)'],
      ['password', 'VARCHAR(255)', 'NO', 'Hash bcrypt du mot de passe (60 chars)'],
      ['first_name', 'VARCHAR(100)', 'NO', 'Prénom de l\'utilisateur'],
      ['last_name', 'VARCHAR(100)', 'NO', 'Nom de famille'],
      ['phone', 'VARCHAR(20)', 'YES', 'Numéro de téléphone (+243...)'],
      ['address', 'TEXT', 'YES', 'Adresse physique'],
      ['photo_url', 'TEXT', 'YES', 'URL de la photo de profil'],
      ['role', 'VARCHAR(20)', 'NO', 'CHECK: SUPER_ADMIN|ADMIN|TEACHER|STUDENT|EMPLOYEE'],
      ['is_active', 'BOOLEAN', 'YES', 'DEFAULT TRUE — Compte actif/inactif'],
      ['last_login', 'TIMESTAMP', 'YES', 'Dernière date de connexion'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP — Trigger auto'],
    ],
    'Table parent de admins, teachers, students et employees. Le rôle détermine vers quelle table-profil chercher. Le mot de passe est hashé avec bcrypt (coût 10).',
    `CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    photo_url   TEXT,
    role        VARCHAR(20) NOT NULL CHECK (role IN
      ('SUPER_ADMIN','ADMIN','TEACHER','STUDENT','EMPLOYEE')),
    is_active   BOOLEAN DEFAULT TRUE,
    last_login  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  );
  
  // --- faculties ---
  drawTableDetail(
    'faculties',
    'Les facultés de l\'université (niveau organisationnel le plus haut).',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['code', 'VARCHAR(10)', 'NO', 'Code unique : FSEG, FSI, FDROIT... (UNIQUE)'],
      ['name', 'VARCHAR(255)', 'NO', 'Nom complet de la faculté'],
      ['description', 'TEXT', 'YES', 'Description de la formation'],
      ['dean_id', 'INTEGER', 'YES', 'FK → users.id — Doyen de la faculté'],
      ['is_active', 'BOOLEAN', 'YES', 'DEFAULT TRUE'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'Hiérarchie : Faculté → Département → Promotion. Le dean_id référence un utilisateur avec le rôle TEACHER ou ADMIN.',
    `CREATE TABLE faculties (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    dean_id     INTEGER REFERENCES users(id),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  );
  
  // --- departments ---
  drawTableDetail(
    'departments',
    'Les départements, rattachés chacun à une faculté.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['code', 'VARCHAR(10)', 'NO', 'Code unique : INFO, ECO, GEST... (UNIQUE)'],
      ['name', 'VARCHAR(255)', 'NO', 'Nom complet du département'],
      ['description', 'TEXT', 'YES', 'Description'],
      ['faculty_id', 'INTEGER', 'NO', 'FK → faculties.id — ON DELETE CASCADE'],
      ['head_id', 'INTEGER', 'YES', 'FK → users.id — Chef de département'],
      ['is_active', 'BOOLEAN', 'YES', 'DEFAULT TRUE'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'La suppression d\'une faculté entraîne la suppression en cascade de ses départements (ON DELETE CASCADE).',
    `CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    faculty_id  INTEGER NOT NULL
      REFERENCES faculties(id) ON DELETE CASCADE,
    head_id     INTEGER REFERENCES users(id),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  );
  
  // --- promotions ---
  drawTableDetail(
    'promotions',
    'Les promotions (niveaux d\'étude) au sein des départements.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['code', 'VARCHAR(20)', 'NO', 'Code de la promotion'],
      ['name', 'VARCHAR(255)', 'NO', 'Ex: "L1 Informatique"'],
      ['level', 'VARCHAR(10)', 'NO', 'CHECK: L1|L2|L3|M1|M2|D1|D2|D3'],
      ['department_id', 'INTEGER', 'NO', 'FK → departments.id — ON DELETE CASCADE'],
      ['academic_year_id', 'INTEGER', 'NO', 'FK → academic_years.id'],
      ['is_active', 'BOOLEAN', 'YES', 'DEFAULT TRUE'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'UNIQUE(code, academic_year_id) — une promotion est unique par année. Les niveaux vont de L1 (Licence 1) à D3 (Doctorat 3).',
    `CREATE TABLE promotions (
    id               SERIAL PRIMARY KEY,
    code             VARCHAR(20) NOT NULL,
    name             VARCHAR(255) NOT NULL,
    level            VARCHAR(10) NOT NULL CHECK
      (level IN ('L1','L2','L3','M1','M2','D1','D2','D3')),
    department_id    INTEGER NOT NULL
      REFERENCES departments(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL
      REFERENCES academic_years(id),
    is_active        BOOLEAN DEFAULT TRUE,
    UNIQUE(code, academic_year_id)
);`
  );
  
  // ===== SECTION 5: Tables de Profils =====
  doc.addPage();
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('5. Tables de Profils', 50, 50);
  drawThickLine(82);
  doc.y = 95;
  
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
     .text(
       'Chaque rôle utilisateur possède une table-profil dédiée, liée par user_id (1:1). Cela permet de stocker les attributs spécifiques à chaque type d\'utilisateur sans encombrer la table users.',
       50, doc.y, { width: PAGE_WIDTH, lineGap: 3 }
     );
  doc.moveDown(0.8);
  
  // --- admins ---
  drawTableDetail(
    'admins',
    'Profil administrateur — SUPER_ADMIN, FACULTY_ADMIN ou DEPARTMENT_ADMIN.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'NO', 'FK → users.id — UNIQUE, ON DELETE CASCADE'],
      ['admin_type', 'VARCHAR(20)', 'NO', 'CHECK: SUPER_ADMIN|FACULTY_ADMIN|DEPARTMENT_ADMIN'],
      ['faculty_id', 'INTEGER', 'YES', 'FK → faculties.id — Pour FACULTY_ADMIN'],
      ['department_id', 'INTEGER', 'YES', 'FK → departments.id — Pour DEPARTMENT_ADMIN'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'SUPER_ADMIN a accès global (faculty_id et department_id à NULL). FACULTY_ADMIN gère une faculté spécifique. DEPARTMENT_ADMIN gère un département.',
    `CREATE TABLE admins (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL UNIQUE
      REFERENCES users(id) ON DELETE CASCADE,
    admin_type    VARCHAR(20) NOT NULL CHECK (admin_type IN
      ('SUPER_ADMIN','FACULTY_ADMIN','DEPARTMENT_ADMIN')),
    faculty_id    INTEGER REFERENCES faculties(id),
    department_id INTEGER REFERENCES departments(id)
);`
  );
  
  // --- teachers ---
  drawTableDetail(
    'teachers',
    'Profil enseignant — grade académique et spécialisation.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'NO', 'FK → users.id — UNIQUE, ON DELETE CASCADE'],
      ['matricule', 'VARCHAR(50)', 'NO', 'Matricule unique : PROF-2024-001 (UNIQUE)'],
      ['grade', 'VARCHAR(50)', 'NO', 'CHECK: ASSISTANT → PROFESSEUR_ORDINAIRE'],
      ['specialization', 'VARCHAR(255)', 'YES', 'Domaine de spécialisation'],
      ['department_id', 'INTEGER', 'YES', 'FK → departments.id'],
      ['hire_date', 'DATE', 'YES', 'Date d\'embauche'],
      ['is_permanent', 'BOOLEAN', 'YES', 'DEFAULT TRUE — Permanent ou vacataire'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'Grades hiérarchiques : ASSISTANT < CHEF_TRAVAUX < PROFESSEUR_ASSOCIE < PROFESSEUR < PROFESSEUR_ORDINAIRE.',
    `CREATE TABLE teachers (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL UNIQUE
      REFERENCES users(id) ON DELETE CASCADE,
    matricule      VARCHAR(50) NOT NULL UNIQUE,
    grade          VARCHAR(50) NOT NULL CHECK (grade IN
      ('ASSISTANT','CHEF_TRAVAUX','PROFESSEUR_ASSOCIE',
       'PROFESSEUR','PROFESSEUR_ORDINAIRE')),
    specialization VARCHAR(255),
    department_id  INTEGER REFERENCES departments(id),
    hire_date      DATE,
    is_permanent   BOOLEAN DEFAULT TRUE
);`
  );
  
  // --- students ---
  drawTableDetail(
    'students',
    'Profil étudiant — inscription, paiement et informations personnelles.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'NO', 'FK → users.id — UNIQUE, ON DELETE CASCADE'],
      ['matricule', 'VARCHAR(50)', 'NO', 'Matricule unique : ETU-2024-001 (UNIQUE)'],
      ['promotion_id', 'INTEGER', 'NO', 'FK → promotions.id — Niveau actuel'],
      ['enrollment_date', 'DATE', 'NO', 'Date de première inscription'],
      ['status', 'VARCHAR(20)', 'YES', 'CHECK: ACTIVE|SUSPENDED|GRADUATED|DROPPED'],
      ['payment_status', 'VARCHAR(20)', 'YES', 'CHECK: PAID|PARTIAL|UNPAID|BLOCKED'],
      ['birth_date', 'DATE', 'YES', 'Date de naissance'],
      ['birth_place', 'VARCHAR(255)', 'YES', 'Lieu de naissance'],
      ['nationality', 'VARCHAR(100)', 'YES', 'DEFAULT "Congolaise"'],
      ['gender', 'VARCHAR(10)', 'YES', 'CHECK: M ou F'],
      ['parent_name', 'VARCHAR(255)', 'YES', 'Nom du parent/tuteur'],
      ['parent_phone', 'VARCHAR(20)', 'YES', 'Téléphone du parent'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'Le payment_status (PAID/PARTIAL/UNPAID/BLOCKED) conditionne l\'accès aux fonctionnalités. Un étudiant BLOCKED ne peut pas consulter ses notes.',
    `CREATE TABLE students (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE
      REFERENCES users(id) ON DELETE CASCADE,
    matricule       VARCHAR(50) NOT NULL UNIQUE,
    promotion_id    INTEGER NOT NULL
      REFERENCES promotions(id),
    enrollment_date DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE'
      CHECK (status IN ('ACTIVE','SUSPENDED',
        'GRADUATED','DROPPED')),
    payment_status  VARCHAR(20) DEFAULT 'UNPAID'
      CHECK (payment_status IN ('PAID','PARTIAL',
        'UNPAID','BLOCKED')),
    birth_date      DATE,
    nationality     VARCHAR(100) DEFAULT 'Congolaise',
    gender          VARCHAR(10) CHECK (gender IN ('M','F'))
);`
  );
  
  // --- employees ---
  drawTableDetail(
    'employees',
    'Profil employé — personnel administratif et technique.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'NO', 'FK → users.id — UNIQUE, ON DELETE CASCADE'],
      ['matricule', 'VARCHAR(50)', 'NO', 'Matricule unique : EMP-2024-001 (UNIQUE)'],
      ['position', 'VARCHAR(255)', 'NO', 'Poste occupé'],
      ['department', 'VARCHAR(255)', 'YES', 'Service/département'],
      ['service', 'VARCHAR(255)', 'YES', 'Service spécifique'],
      ['hire_date', 'DATE', 'YES', 'Date d\'embauche'],
      ['contract_type', 'VARCHAR(20)', 'YES', 'CHECK: PERMANENT|CONTRACT|TEMPORARY'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'Le champ department ici est un VARCHAR libre (pas une FK), car les employés peuvent appartenir à des services non-académiques (ex: Comptabilité, Maintenance).',
    `CREATE TABLE employees (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL UNIQUE
      REFERENCES users(id) ON DELETE CASCADE,
    matricule     VARCHAR(50) NOT NULL UNIQUE,
    position      VARCHAR(255) NOT NULL,
    department    VARCHAR(255),
    service       VARCHAR(255),
    hire_date     DATE,
    contract_type VARCHAR(20) CHECK (contract_type IN
      ('PERMANENT','CONTRACT','TEMPORARY'))
);`
  );
  
  // ===== SECTION 6: Tables Académiques =====
  doc.addPage();
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('6. Tables Académiques', 50, 50);
  drawThickLine(82);
  doc.y = 95;
  
  // --- courses ---
  drawTableDetail(
    'courses',
    'Catalogue des cours dispensés dans chaque promotion.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['code', 'VARCHAR(20)', 'NO', 'Code du cours : INFO101, TEL101...'],
      ['name', 'VARCHAR(255)', 'NO', 'Nom du cours'],
      ['description', 'TEXT', 'YES', 'Description du contenu'],
      ['credits', 'INTEGER', 'NO', 'DEFAULT 3 — Nombre de crédits ECTS'],
      ['hours_cm', 'INTEGER', 'YES', 'DEFAULT 0 — Heures de cours magistral'],
      ['hours_td', 'INTEGER', 'YES', 'DEFAULT 0 — Heures de travaux dirigés'],
      ['hours_tp', 'INTEGER', 'YES', 'DEFAULT 0 — Heures de travaux pratiques'],
      ['promotion_id', 'INTEGER', 'NO', 'FK → promotions.id — ON DELETE CASCADE'],
      ['teacher_id', 'INTEGER', 'YES', 'FK → teachers.id — Enseignant titulaire'],
      ['semester', 'INTEGER', 'NO', 'CHECK: 1 ou 2'],
      ['course_type', 'VARCHAR(20)', 'YES', 'CHECK: OBLIGATOIRE|OPTIONNEL|LIBRE'],
      ['is_active', 'BOOLEAN', 'YES', 'DEFAULT TRUE'],
    ],
    'UNIQUE(code, promotion_id) — un même code de cours ne peut apparaître qu\'une fois par promotion. Les heures CM/TD/TP servent au calcul de l\'emploi du temps.',
    `CREATE TABLE courses (
    id            SERIAL PRIMARY KEY,
    code          VARCHAR(20) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    credits       INTEGER NOT NULL DEFAULT 3,
    hours_cm      INTEGER DEFAULT 0,
    hours_td      INTEGER DEFAULT 0,
    hours_tp      INTEGER DEFAULT 0,
    promotion_id  INTEGER NOT NULL
      REFERENCES promotions(id) ON DELETE CASCADE,
    teacher_id    INTEGER REFERENCES teachers(id),
    semester      INTEGER NOT NULL CHECK (semester IN (1, 2)),
    course_type   VARCHAR(20) DEFAULT 'OBLIGATOIRE',
    UNIQUE(code, promotion_id)
);`
  );
  
  // --- course_schedules ---
  drawTableDetail(
    'course_schedules',
    'Horaires hebdomadaires de chaque cours.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['course_id', 'INTEGER', 'NO', 'FK → courses.id — ON DELETE CASCADE'],
      ['day_of_week', 'INTEGER', 'NO', 'CHECK: 0-6 (0=Lundi, 6=Dimanche)'],
      ['start_time', 'TIME', 'NO', 'Heure de début'],
      ['end_time', 'TIME', 'NO', 'Heure de fin'],
      ['room', 'VARCHAR(50)', 'YES', 'Salle de cours (ex: "A201")'],
      ['schedule_type', 'VARCHAR(10)', 'YES', 'CHECK: CM|TD|TP — DEFAULT CM'],
    ],
    'Un cours peut avoir plusieurs créneaux horaires (ex: CM le lundi et TP le mercredi). day_of_week suit la convention ISO (0=Lundi).',
    `CREATE TABLE course_schedules (
    id            SERIAL PRIMARY KEY,
    course_id     INTEGER NOT NULL
      REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week   INTEGER NOT NULL
      CHECK (day_of_week BETWEEN 0 AND 6),
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    room          VARCHAR(50),
    schedule_type VARCHAR(10) DEFAULT 'CM'
      CHECK (schedule_type IN ('CM','TD','TP'))
);`
  );
  
  // --- enrollments ---
  drawTableDetail(
    'enrollments',
    'Inscriptions des étudiants aux cours par année académique.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'NO', 'FK → students.id — ON DELETE CASCADE'],
      ['course_id', 'INTEGER', 'NO', 'FK → courses.id — ON DELETE CASCADE'],
      ['academic_year_id', 'INTEGER', 'NO', 'FK → academic_years.id'],
      ['enrollment_date', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['status', 'VARCHAR(20)', 'YES', 'CHECK: ENROLLED|DROPPED|COMPLETED'],
    ],
    'UNIQUE(student_id, course_id, academic_year_id) — un étudiant ne peut s\'inscrire qu\'une fois au même cours par année.',
    `CREATE TABLE enrollments (
    id               SERIAL PRIMARY KEY,
    student_id       INTEGER NOT NULL
      REFERENCES students(id) ON DELETE CASCADE,
    course_id        INTEGER NOT NULL
      REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL
      REFERENCES academic_years(id),
    status           VARCHAR(20) DEFAULT 'ENROLLED'
      CHECK (status IN ('ENROLLED','DROPPED','COMPLETED')),
    UNIQUE(student_id, course_id, academic_year_id)
);`
  );
  
  // --- grades ---
  drawTableDetail(
    'grades',
    'Notes des étudiants — TP, TD, Examen et note finale.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'NO', 'FK → students.id — ON DELETE CASCADE'],
      ['course_id', 'INTEGER', 'NO', 'FK → courses.id — ON DELETE CASCADE'],
      ['academic_year_id', 'INTEGER', 'NO', 'FK → academic_years.id'],
      ['tp_score', 'DECIMAL(5,2)', 'YES', 'Note de TP (0-100)'],
      ['td_score', 'DECIMAL(5,2)', 'YES', 'Note de TD (0-100)'],
      ['exam_score', 'DECIMAL(5,2)', 'YES', 'Note d\'examen (0-100)'],
      ['final_score', 'DECIMAL(5,2)', 'YES', 'Note finale calculée'],
      ['grade_letter', 'VARCHAR(2)', 'YES', 'A, B, C, D, E ou F'],
      ['is_validated', 'BOOLEAN', 'YES', 'DEFAULT FALSE — Validé par le jury'],
      ['validated_by', 'INTEGER', 'YES', 'FK → users.id — Qui a validé'],
      ['validated_at', 'TIMESTAMP', 'YES', 'Date de validation'],
      ['remarks', 'TEXT', 'YES', 'Remarques éventuelles'],
    ],
    'UNIQUE(student_id, course_id, academic_year_id). La note finale est calculée selon la formule : final = (TP×20% + TD×20% + Exam×60%). La validation (is_validated) verrouille la note.',
    `CREATE TABLE grades (
    id               SERIAL PRIMARY KEY,
    student_id       INTEGER NOT NULL
      REFERENCES students(id) ON DELETE CASCADE,
    course_id        INTEGER NOT NULL
      REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL
      REFERENCES academic_years(id),
    tp_score         DECIMAL(5,2),
    td_score         DECIMAL(5,2),
    exam_score       DECIMAL(5,2),
    final_score      DECIMAL(5,2),
    grade_letter     VARCHAR(2),
    is_validated     BOOLEAN DEFAULT FALSE,
    validated_by     INTEGER REFERENCES users(id),
    UNIQUE(student_id, course_id, academic_year_id)
);`
  );
  
  // --- attendance ---
  drawTableDetail(
    'attendance',
    'Suivi quotidien des présences par cours.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'NO', 'FK → students.id — ON DELETE CASCADE'],
      ['course_id', 'INTEGER', 'NO', 'FK → courses.id — ON DELETE CASCADE'],
      ['schedule_id', 'INTEGER', 'YES', 'FK → course_schedules.id'],
      ['attendance_date', 'DATE', 'NO', 'Date du relevé de présence'],
      ['status', 'VARCHAR(20)', 'YES', 'CHECK: PRESENT|ABSENT|LATE|EXCUSED'],
      ['remarks', 'TEXT', 'YES', 'Remarques (justificatif, etc.)'],
      ['recorded_by', 'INTEGER', 'YES', 'FK → users.id — Enregistré par'],
    ],
    'Le schedule_id permet de lier la présence à un créneau horaire spécifique (CM, TD ou TP). Le statut EXCUSED nécessite un justificatif.',
    `CREATE TABLE attendance (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL
      REFERENCES students(id) ON DELETE CASCADE,
    course_id       INTEGER NOT NULL
      REFERENCES courses(id) ON DELETE CASCADE,
    schedule_id     INTEGER
      REFERENCES course_schedules(id),
    attendance_date DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'PRESENT'
      CHECK (status IN
        ('PRESENT','ABSENT','LATE','EXCUSED')),
    recorded_by     INTEGER REFERENCES users(id)
);`
  );
  
  // ===== SECTION 7: Tables Opérationnelles =====
  doc.addPage();
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('7. Tables Opérationnelles', 50, 50);
  drawThickLine(82);
  doc.y = 95;
  
  // --- payments ---
  drawTableDetail(
    'payments',
    'Enregistrement de tous les paiements effectués par les étudiants.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'NO', 'FK → students.id — ON DELETE CASCADE'],
      ['academic_year_id', 'INTEGER', 'NO', 'FK → academic_years.id'],
      ['amount', 'DECIMAL(15,2)', 'NO', 'Montant en USD'],
      ['payment_type', 'VARCHAR(50)', 'NO', 'CHECK: INSCRIPTION|FRAIS_ACADEMIQUES|MINERVAL|AUTRES'],
      ['payment_date', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['payment_method', 'VARCHAR(20)', 'YES', 'CHECK: CASH|BANK|MOBILE_MONEY|CHECK'],
      ['reference', 'VARCHAR(100)', 'YES', 'Référence transaction (Mobile Money, etc.)'],
      ['receipt_number', 'VARCHAR(100)', 'YES', 'Numéro de reçu : REC-2026-00001'],
      ['status', 'VARCHAR(20)', 'YES', 'CHECK: PENDING|COMPLETED|CANCELLED|REFUNDED'],
      ['recorded_by', 'INTEGER', 'YES', 'FK → users.id — Enregistré par'],
      ['remarks', 'TEXT', 'YES', 'Remarques additionnelles'],
    ],
    'Les paiements sont liés à une année académique pour le suivi financier annuel. Le receipt_number sert de preuve de paiement physique.',
    `CREATE TABLE payments (
    id               SERIAL PRIMARY KEY,
    student_id       INTEGER NOT NULL
      REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL
      REFERENCES academic_years(id),
    amount           DECIMAL(15,2) NOT NULL,
    payment_type     VARCHAR(50) NOT NULL CHECK
      (payment_type IN ('INSCRIPTION',
       'FRAIS_ACADEMIQUES','FRAIS_MINERVAL','AUTRES')),
    payment_method   VARCHAR(20) CHECK (payment_method IN
      ('CASH','BANK','MOBILE_MONEY','CHECK')),
    reference        VARCHAR(100),
    receipt_number   VARCHAR(100),
    status           VARCHAR(20) DEFAULT 'PENDING'
      CHECK (status IN ('PENDING','COMPLETED',
        'CANCELLED','REFUNDED')),
    recorded_by      INTEGER REFERENCES users(id)
);`
  );
  
  // --- notifications ---
  drawTableDetail(
    'notifications',
    'Système de notifications pour tous les utilisateurs.',
    [
      ['id', 'SERIAL', 'NO', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'NO', 'FK → users.id — ON DELETE CASCADE'],
      ['title', 'VARCHAR(255)', 'NO', 'Titre de la notification'],
      ['message', 'TEXT', 'NO', 'Contenu du message'],
      ['type', 'VARCHAR(20)', 'YES', 'CHECK: INFO|WARNING|SUCCESS|ERROR'],
      ['is_read', 'BOOLEAN', 'YES', 'DEFAULT FALSE — Lue ou non'],
      ['link', 'VARCHAR(255)', 'YES', 'URL de redirection (optionnel)'],
      ['created_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'YES', 'DEFAULT CURRENT_TIMESTAMP'],
    ],
    'Les notifications sont personnelles (par user_id). Le type détermine l\'icône et la couleur dans l\'interface. Le champ link permet de rediriger vers une page spécifique.',
    `CREATE TABLE notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    type       VARCHAR(20) DEFAULT 'INFO'
      CHECK (type IN ('INFO','WARNING','SUCCESS','ERROR')),
    is_read    BOOLEAN DEFAULT FALSE,
    link       VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  );
}

// ============================================================
// SECTION 8: INDEX
// ============================================================

function drawIndexes() {
  doc.addPage();
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('8. Index & Performances', 50, 50);
  drawThickLine(82);
  
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
     .text(
       'Les index suivants sont créés pour accélérer les requêtes les plus fréquentes. Chaque index cible les colonnes utilisées dans les clauses WHERE, JOIN et ORDER BY.',
       50, 95, { width: PAGE_WIDTH, lineGap: 3 }
     );
  doc.moveDown(0.8);
  
  const indexes = [
    { name: 'idx_users_email', table: 'users', col: 'email', reason: 'Recherche par email lors du login (WHERE email = $1)' },
    { name: 'idx_users_role', table: 'users', col: 'role', reason: 'Filtrage par rôle dans la gestion des utilisateurs' },
    { name: 'idx_students_matricule', table: 'students', col: 'matricule', reason: 'Recherche d\'étudiant par matricule' },
    { name: 'idx_students_promotion', table: 'students', col: 'promotion_id', reason: 'Liste des étudiants par promotion (JOIN fréquent)' },
    { name: 'idx_students_status', table: 'students', col: 'status', reason: 'Filtrage par statut (ACTIVE, SUSPENDED, etc.)' },
    { name: 'idx_teachers_matricule', table: 'teachers', col: 'matricule', reason: 'Recherche d\'enseignant par matricule' },
    { name: 'idx_teachers_department', table: 'teachers', col: 'department_id', reason: 'Liste des enseignants par département' },
    { name: 'idx_courses_promotion', table: 'courses', col: 'promotion_id', reason: 'Liste des cours par promotion' },
    { name: 'idx_courses_teacher', table: 'courses', col: 'teacher_id', reason: 'Cours assignés à un enseignant' },
    { name: 'idx_grades_student', table: 'grades', col: 'student_id', reason: 'Relevé de notes d\'un étudiant' },
    { name: 'idx_grades_course', table: 'grades', col: 'course_id', reason: 'Notes par cours (pour le PV)' },
    { name: 'idx_attendance_student', table: 'attendance', col: 'student_id', reason: 'Historique de présence d\'un étudiant' },
    { name: 'idx_attendance_date', table: 'attendance', col: 'attendance_date', reason: 'Présences par date (relevé journalier)' },
    { name: 'idx_payments_student', table: 'payments', col: 'student_id', reason: 'Historique de paiements d\'un étudiant' },
    { name: 'idx_notifications_user', table: 'notifications', col: 'user_id', reason: 'Notifications d\'un utilisateur' },
    { name: 'idx_notifications_read', table: 'notifications', col: 'is_read', reason: 'Comptage des notifications non lues' },
  ];
  
  // Terminal avec les CREATE INDEX
  const termY = doc.y;
  const termH = indexes.length * 11 + 15;
  let ty = terminalBox(50, termY, PAGE_WIDTH, termH, 'psql — CREATE INDEX');
  
  indexes.forEach(idx => {
    ty = codeText(`CREATE INDEX ${idx.name} ON ${idx.table}(${idx.col});`, 50, ty, COLORS.green_term);
  });
  
  doc.y = termY + termH + 15;
  
  // Tableau explicatif
  checkSpace(200);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text('Justification des index', 50, doc.y);
  doc.moveDown(0.5);
  
  indexes.forEach((idx, i) => {
    checkSpace(20);
    if (i % 2 === 0) {
      doc.rect(50, doc.y - 2, PAGE_WIDTH, 15).fill('#fafafa');
    }
    doc.fontSize(7.5).font('Courier-Bold').fillColor(COLORS.accent)
       .text(idx.name, 55, doc.y, { continued: false, width: 180 });
    doc.fontSize(7.5).font('Helvetica').fillColor(COLORS.text)
       .text(idx.reason, 240, doc.y - 10, { width: 300 });
    doc.moveDown(0.1);
  });
}

// ============================================================
// SECTION 9: TRIGGERS
// ============================================================

function drawTriggers() {
  doc.addPage();
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('9. Triggers & Fonctions', 50, 50);
  drawThickLine(82);
  
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
     .text(
       'Un trigger automatique met à jour le champ updated_at à chaque modification d\'un enregistrement. Cela garantit la traçabilité sans intervention du code applicatif.',
       50, 95, { width: PAGE_WIDTH, lineGap: 3 }
     );
  doc.moveDown(0.8);
  
  // Fonction PL/pgSQL
  const funcY = doc.y;
  const funcH = 90;
  let fy = terminalBox(50, funcY, PAGE_WIDTH, funcH, 'psql — Fonction PL/pgSQL');
  
  fy = codeText('CREATE OR REPLACE FUNCTION update_updated_at_column()', 50, fy, COLORS.yellow_term);
  fy = codeText('RETURNS TRIGGER AS $$', 50, fy, COLORS.yellow_term);
  fy = codeText('BEGIN', 50, fy, COLORS.blue_term);
  fy = codeText('    NEW.updated_at = CURRENT_TIMESTAMP;', 50, fy, COLORS.green_term);
  fy = codeText('    RETURN NEW;', 50, fy, COLORS.green_term);
  fy = codeText('END;', 50, fy, COLORS.blue_term);
  fy = codeText("$$ language 'plpgsql';", 50, fy, COLORS.yellow_term);
  
  doc.y = funcY + funcH + 15;
  
  // Triggers
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.secondary)
     .text('Triggers appliqués', 50, doc.y);
  doc.moveDown(0.5);
  
  const triggers = [
    'users', 'faculties', 'departments', 'promotions',
    'students', 'teachers', 'courses', 'grades'
  ];
  
  const trigY = doc.y;
  const trigH = triggers.length * 11 + 15;
  let tty = terminalBox(50, trigY, PAGE_WIDTH, trigH, 'psql — CREATE TRIGGER');
  
  triggers.forEach(table => {
    tty = codeText(
      `CREATE TRIGGER update_${table}_updated_at BEFORE UPDATE ON ${table}`,
      50, tty, COLORS.green_term
    );
  });
  
  doc.y = trigY + trigH + 15;
  
  // Explication
  const expY = doc.y;
  doc.roundedRect(50, expY, PAGE_WIDTH, 60, 3)
     .fillAndStroke('#e8f5e9', '#a5d6a7');
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.success)
     .text('Fonctionnement :', 65, expY + 8);
  doc.fontSize(9).font('Helvetica').fillColor(COLORS.text)
     .text(
       '• Le trigger se déclenche BEFORE UPDATE sur chaque ligne modifiée.\n' +
       '• Il remplace automatiquement updated_at par CURRENT_TIMESTAMP.\n' +
       '• Aucune action côté code n\'est nécessaire — la valeur est toujours à jour.',
       65, expY + 22, { width: PAGE_WIDTH - 30, lineGap: 3 }
     );
}

// ============================================================
// SECTION 10: COMPTES PAR DÉFAUT
// ============================================================

function drawDefaultAccounts() {
  doc.addPage();
  doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('10. Comptes par Défaut', 50, 50);
  drawThickLine(82);
  
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
     .text(
       'Le système est initialisé avec les comptes suivants pour le test et le développement. En production, ces comptes doivent être modifiés.',
       50, 95, { width: PAGE_WIDTH, lineGap: 3 }
     );
  doc.moveDown(0.8);
  
  const accounts = [
    { role: 'SUPER_ADMIN', email: 'admin@unikin.ac.cd', password: 'Admin@2026', name: 'Jean-Pierre Mbeki' },
    { role: 'TEACHER', email: 'prof.kabongo@unikin.ac.cd', password: 'Prof@2026', name: 'François Kabongo' },
    { role: 'TEACHER', email: 'prof.mukendi@unikin.ac.cd', password: 'Prof@2026', name: 'Joseph Mukendi' },
    { role: 'TEACHER', email: 'prof.lukusa@unikin.ac.cd', password: 'Prof@2026', name: 'Thérèse Lukusa' },
    { role: 'TEACHER', email: 'jeanpierre.kabongo1@unikin.ac.cd', password: 'Prof@2026', name: 'Jean-Pierre Kabongo' },
    { role: 'STUDENT', email: '2111188338@unikin.ac.cd', password: 'Etudiant@2026', name: 'Chris Ngozulu' },
    { role: 'STUDENT', email: '2122340977@unikin.ac.cd', password: 'Etudiant@2026', name: 'Étudiant 2122340977' },
    { role: 'STUDENT', email: 'etudiant.kasongo@student.unikin.ac.cd', password: 'Etudiant@2026', name: 'Marie Kasongo' },
    { role: 'STUDENT', email: 'grace.mbala@student.unikin.ac.cd', password: 'Etudiant@2026', name: 'Grace Mbala' },
    { role: 'EMPLOYEE', email: 'employe.mutombo@unikin.ac.cd', password: 'Employe@2026', name: 'Pierre Mutombo' },
  ];
  
  // En-tête du tableau
  const tableY = doc.y;
  doc.rect(50, tableY, PAGE_WIDTH, 18).fill(COLORS.bg_header);
  
  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.secondary);
  doc.text('Rôle', 55, tableY + 4, { width: 80 });
  doc.text('Nom', 135, tableY + 4, { width: 110 });
  doc.text('Email', 245, tableY + 4, { width: 180 });
  doc.text('Mot de passe', 425, tableY + 4, { width: 120 });
  
  let ry = tableY + 22;
  accounts.forEach((acc, i) => {
    if (i % 2 === 0) {
      doc.rect(50, ry - 2, PAGE_WIDTH, 15).fill('#fafafa');
    }
    
    let roleColor = COLORS.text;
    if (acc.role === 'SUPER_ADMIN') roleColor = COLORS.danger;
    else if (acc.role === 'TEACHER') roleColor = COLORS.accent;
    else if (acc.role === 'STUDENT') roleColor = COLORS.success;
    else if (acc.role === 'EMPLOYEE') roleColor = '#7b1fa2';
    
    doc.fontSize(7.5).font('Courier-Bold').fillColor(roleColor)
       .text(acc.role, 55, ry, { width: 80 });
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text)
       .text(acc.name, 135, ry, { width: 110 });
    doc.fontSize(7).font('Courier').fillColor(COLORS.text_light)
       .text(acc.email, 245, ry, { width: 180 });
    doc.fontSize(8).font('Courier-Bold').fillColor(COLORS.warning)
       .text(acc.password, 425, ry, { width: 120 });
    
    ry += 16;
  });
  
  doc.y = ry + 10;
  
  // Warning box
  const warnY = doc.y;
  doc.roundedRect(50, warnY, PAGE_WIDTH, 45, 3)
     .fillAndStroke('#fce4ec', '#ef9a9a');
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.danger)
     .text('ATTENTION — Sécurité', 65, warnY + 8);
  doc.fontSize(8.5).font('Helvetica').fillColor(COLORS.text)
     .text(
       'Ces mots de passe sont des valeurs par défaut pour le développement. En production : changez tous les mots de passe, activez le 2FA et configurez les politiques de sécurité.',
       65, warnY + 22, { width: PAGE_WIDTH - 30, lineGap: 2 }
     );
}

// ============================================================
// GÉNÉRATION FINALE
// ============================================================

console.log('📄 Génération de la documentation PDF...');

drawCover();
drawTableOfContents();
drawIntroduction();
drawArchitecture();
drawERD();
drawAllTables();
drawIndexes();
drawTriggers();
drawDefaultAccounts();

// Numérotation des pages
addPageNumber();

doc.end();

stream.on('finish', () => {
  console.log(`✅ PDF généré avec succès : ${outputPath}`);
  console.log(`📊 Taille : ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
});

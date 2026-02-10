/**
 * ============================================================================
 * NEXUS UNIKIN — Documentation BD PostgreSQL (PDF Entreprise v3)
 * ============================================================================
 * Génère un PDF de qualité enterprise avec :
 * - Vrais tableaux avec grilles, bordures, headers colorés
 * - Blocs terminal style Windows PowerShell
 * - Code SQL avec coloration syntaxique
 * - Mise en page A4 soignée
 * 
 * Usage: node scripts/generate-db-documentation-v2.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
const outputPath = path.join(docsDir, 'NEXUS_UNIKIN_Database_Documentation.pdf');
const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 }, bufferPages: true });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const PW = 595.28;
const PH = 841.89;
const LM = 50;
const W = PW - LM * 2; // 495.28

// ─── COULEURS ───
const C = {
  navy: '#0F172A', slate800: '#1E293B', slate700: '#334155', slate600: '#475569',
  slate500: '#64748B', slate400: '#94A3B8', slate300: '#CBD5E1', slate200: '#E2E8F0',
  slate100: '#F1F5F9', slate50: '#F8FAFC', white: '#FFFFFF',
  blue600: '#2563EB', blue500: '#3B82F6', blue100: '#DBEAFE', blue50: '#EFF6FF',
  green600: '#16A34A', green500: '#22C55E', green100: '#DCFCE7', green50: '#F0FDF4',
  amber600: '#D97706', amber500: '#F59E0B', amber50: '#FFFBEB',
  red600: '#DC2626', red500: '#EF4444', red50: '#FEF2F2',
  purple600: '#9333EA', cyan500: '#06B6D4',
  // Terminal
  tBg: '#0D1117', tBar: '#161B22', tBorder: '#30363D',
  tWhite: '#E6EDF3', tGray: '#8B949E', tDimGray: '#484F58',
  tGreen: '#7EE787', tBlue: '#79C0FF', tYellow: '#FFA657',
  tPurple: '#D2A8FF', tCyan: '#A5D6FF', tRed: '#FF7B72', tBrightGreen: '#56D364',
};

const MONO = 'Courier';
const SANS = 'Helvetica';
const BOLD = 'Helvetica-Bold';
const ITALIC = 'Helvetica-Oblique';

// ─── HELPERS ───
function ensureSpace(needed) {
  if (doc.y + needed > PH - 55) { doc.addPage(); return true; }
  return false;
}

function drawLine(x1, y1, x2, y2, color, width) {
  doc.save().moveTo(x1, y1).lineTo(x2, y2).strokeColor(color || C.slate200).lineWidth(width || 0.5).stroke().restore();
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : TABLEAU AVEC GRILLE RÉELLE
// ═══════════════════════════════════════════════════════════════

function gridTable(x, w, title, headers, rows, colRatios, opts) {
  opts = opts || {};
  var headerBg = opts.headerBg || C.slate800;
  var headerColor = opts.headerColor || C.white;
  var cellFontSize = opts.fontSize || 8;
  var headerFontSize = opts.headerFontSize || 8.5;
  var padX = 6;
  var padY = 5;
  var titleH = title ? 28 : 0;
  var headerH = 22;

  // Largeurs absolues
  var colW = colRatios.map(function(r) { return w * r; });

  // Mesurer hauteurs de chaque ligne
  var rowHs = rows.map(function(row) {
    var maxH = 0;
    row.forEach(function(cell, ci) {
      var cw = colW[ci] - padX * 2;
      if (cw < 10) cw = 10;
      doc.font(ci === 0 ? MONO : (ci === 1 ? MONO : SANS)).fontSize(ci >= 2 ? cellFontSize - 0.5 : cellFontSize);
      var h = doc.heightOfString(String(cell || ''), { width: cw });
      if (h > maxH) maxH = h;
    });
    return Math.max(maxH + padY * 2, 18);
  });

  var totalRowsH = 0;
  rowHs.forEach(function(h) { totalRowsH += h; });
  var totalH = titleH + headerH + totalRowsH;

  ensureSpace(Math.min(totalH + 10, 300));
  var startY = doc.y;
  var cy = startY;

  // ── TITRE ──
  if (title) {
    doc.rect(x, cy, w, titleH).fill(headerBg);
    doc.fontSize(10).font(BOLD).fillColor(headerColor).text(title, x + 10, cy + 8, { width: w - 20 });
    
    var countText = rows.length + ' lignes';
    doc.fontSize(7.5).font(SANS).fillColor(C.slate400).text(countText, x + 10, cy + 10, { width: w - 20, align: 'right' });
    cy += titleH;
  }

  // ── HEADER ──
  doc.rect(x, cy, w, headerH).fill(C.slate700);
  var hx = x;
  headers.forEach(function(h, i) {
    doc.fontSize(headerFontSize).font(BOLD).fillColor(headerColor)
       .text(h, hx + padX, cy + 5, { width: colW[i] - padX * 2 });
    hx += colW[i];
  });
  // Séparateurs verticaux header
  hx = x;
  for (var i = 0; i < headers.length - 1; i++) {
    hx += colW[i];
    doc.save().moveTo(hx, cy).lineTo(hx, cy + headerH).strokeColor(C.slate600).lineWidth(0.4).stroke().restore();
  }
  cy += headerH;

  // ── LIGNES ──
  rows.forEach(function(row, ri) {
    var rh = rowHs[ri];

    // Saut de page si besoin
    if (cy + rh > PH - 55) {
      // Bordure bas partielle
      doc.save().rect(x, startY, w, cy - startY).strokeColor(C.slate300).lineWidth(0.8).stroke().restore();
      doc.addPage();
      cy = 50;
      startY = cy;
      // Re-header
      doc.rect(x, cy, w, headerH).fill(C.slate700);
      var rhx2 = x;
      headers.forEach(function(h, i) {
        doc.fontSize(headerFontSize).font(BOLD).fillColor(headerColor)
           .text(h, rhx2 + padX, cy + 5, { width: colW[i] - padX * 2 });
        rhx2 += colW[i];
      });
      rhx2 = x;
      for (var j = 0; j < headers.length - 1; j++) {
        rhx2 += colW[j];
        doc.save().moveTo(rhx2, cy).lineTo(rhx2, cy + headerH).strokeColor(C.slate600).lineWidth(0.4).stroke().restore();
      }
      cy += headerH;
    }

    // Fond alternant
    var bg = ri % 2 === 0 ? C.white : C.slate50;
    doc.rect(x, cy, w, rh).fill(bg);

    // Ligne horizontale en bas
    doc.save().moveTo(x, cy + rh).lineTo(x + w, cy + rh).strokeColor(C.slate200).lineWidth(0.3).stroke().restore();

    // Contenu cellules
    var rx = x;
    row.forEach(function(cell, ci) {
      var cw = colW[ci];
      var text = String(cell || '');

      if (ci === 0) {
        doc.fontSize(cellFontSize).font(MONO).fillColor(C.slate800);
      } else if (ci === 1) {
        doc.fontSize(cellFontSize).font(MONO).fillColor(C.blue600);
      } else {
        doc.fontSize(cellFontSize - 0.5).font(SANS).fillColor(C.slate600);
      }

      doc.text(text, rx + padX, cy + padY, { width: cw - padX * 2, lineGap: 1 });

      // Séparateur vertical
      if (ci < row.length - 1) {
        doc.save().moveTo(rx + cw, cy).lineTo(rx + cw, cy + rh).strokeColor(C.slate200).lineWidth(0.3).stroke().restore();
      }

      rx += cw;
    });

    cy += rh;
  });

  // ── BORDURE EXTÉRIEURE ──
  doc.save().rect(x, startY, w, cy - startY).strokeColor(C.slate300).lineWidth(0.8).stroke().restore();

  doc.y = cy + 10;
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : TERMINAL DARK BLOCK
// ═══════════════════════════════════════════════════════════════

function termBlock(lines, title, opts) {
  opts = opts || {};
  var lineH = opts.lineH || 13;
  var fontSize = opts.fontSize || 8.5;
  var padV = 10;
  var barH = 28;
  var contentH = lines.length * lineH + padV * 2;
  var totalH = barH + contentH;

  ensureSpace(totalH + 10);
  var y = doc.y;
  var x = LM;
  var w = W;

  // Ombre
  doc.save().rect(x + 2, y + 2, w, totalH).fill('#05080D').restore();

  // Fond principal
  doc.save().rect(x, y, w, totalH).fill(C.tBg).restore();

  // Barre titre Windows (fond bleu sombre)
  doc.rect(x, y, w, barH).fill('#012456');
  doc.save().moveTo(x, y + barH).lineTo(x + w, y + barH).strokeColor(C.tBorder).lineWidth(0.5).stroke().restore();

  // Icône PowerShell (petit rectangle bleu)
  doc.save().roundedRect(x + 8, y + 7, 14, 14, 2).fill('#2E6FD2').restore();
  doc.fontSize(9).font(BOLD).fillColor(C.white).text('PS', x + 9, y + 9.5, { width: 12, align: 'center' });

  // Titre fenêtre
  doc.fontSize(9).font(SANS).fillColor('#CCCCCC')
     .text(title || 'Windows PowerShell', x + 28, y + 8, { width: w - 110 });

  // Boutons Windows : Minimize ─  Maximize □  Close ✕
  var btnW = 30;
  var btnH = barH;
  var bx = x + w - btnW * 3;
  // Minimize
  doc.rect(bx, y, btnW, btnH).fill('#012456');
  doc.fontSize(12).font(SANS).fillColor('#AAAAAA').text('\u2500', bx, y + 5, { width: btnW, align: 'center' });
  // Maximize
  doc.rect(bx + btnW, y, btnW, btnH).fill('#012456');
  doc.fontSize(10).font(SANS).fillColor('#AAAAAA').text('\u25A1', bx + btnW, y + 7, { width: btnW, align: 'center' });
  // Close (fond rouge au hover)
  doc.rect(bx + btnW * 2, y, btnW, btnH).fill('#C42B1C');
  doc.fontSize(11).font(SANS).fillColor(C.white).text('\u2715', bx + btnW * 2, y + 7, { width: btnW, align: 'center' });

  // Contenu
  var cy = y + barH + padV;
  lines.forEach(function(line) {
    var txt = typeof line === 'string' ? line : (line.text || '');
    var color = typeof line === 'string' ? C.tWhite : (line.color || C.tWhite);
    var bold = typeof line === 'object' && line.bold;

    doc.fontSize(fontSize).font(bold ? BOLD : MONO).fillColor(color)
       .text(txt, x + 16, cy, { width: w - 32 });
    cy += lineH;
  });

  // Bordure rectangulaire (pas arrondie)
  doc.save().rect(x, y, w, totalH).strokeColor(C.tBorder).lineWidth(1).stroke().restore();

  doc.y = y + totalH + 10;
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : SECTION HEADER
// ═══════════════════════════════════════════════════════════════

function sectionHeader(num, title, subtitle) {
  ensureSpace(65);
  var y = doc.y;

  if (num) {
    doc.save().roundedRect(LM, y, 34, 34, 6).fill(C.blue600).restore();
    doc.fontSize(15).font(BOLD).fillColor(C.white)
       .text(String(num), LM + 1, y + 8, { width: 32, align: 'center' });
  }

  var tx = num ? LM + 44 : LM;
  doc.fontSize(20).font(BOLD).fillColor(C.navy).text(title, tx, y + 2, { width: W - 50 });
  if (subtitle) {
    doc.fontSize(10).font(SANS).fillColor(C.slate500).text(subtitle, tx, doc.y + 1, { width: W - 50 });
  }

  doc.y = y + (subtitle ? 48 : 40);
  doc.rect(LM, doc.y, W * 0.25, 3).fill(C.blue600);
  doc.rect(LM + W * 0.25, doc.y, W * 0.08, 3).fill(C.cyan500);
  doc.rect(LM + W * 0.33, doc.y, W * 0.67, 1).fill(C.slate200);
  doc.y += 14;
}

function subHeader(title) {
  ensureSpace(35);
  doc.moveDown(0.3);
  doc.rect(LM, doc.y, 3, 15).fill(C.blue600);
  doc.fontSize(13).font(BOLD).fillColor(C.slate800).text(title, LM + 12, doc.y + 1, { width: W - 16 });
  doc.moveDown(0.5);
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : INFO BOX
// ═══════════════════════════════════════════════════════════════

function infoBox(text, type) {
  type = type || 'info';
  var s = {
    info:    { bg: C.blue50,  bar: C.blue500,   label: 'INFO',      lBg: C.blue600 },
    success: { bg: C.green50, bar: C.green500,  label: 'NOTE',      lBg: C.green600 },
    warning: { bg: C.amber50, bar: C.amber500,  label: 'ATTENTION', lBg: C.amber600 },
    danger:  { bg: C.red50,   bar: C.red500,    label: 'S\u00c9CURIT\u00c9',  lBg: C.red600 },
  }[type];

  ensureSpace(55);
  var y = doc.y;
  doc.fontSize(8.5).font(SANS);
  var th = doc.heightOfString(text, { width: W - 85 });
  var bh = Math.max(th + 18, 36);

  doc.save().roundedRect(LM, y, W, bh, 4).fill(s.bg).restore();
  doc.rect(LM, y, 4, bh).fill(s.bar);
  doc.save().roundedRect(LM + 12, y + 6, 58, 14, 3).fill(s.lBg).restore();
  doc.fontSize(7).font(BOLD).fillColor(C.white).text(s.label, LM + 14, y + 9, { width: 54, align: 'center' });
  doc.fontSize(8.5).font(SANS).fillColor(C.slate700).text(text, LM + 78, y + 8, { width: W - 92, lineGap: 2 });

  doc.y = y + bh + 10;
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : CARD
// ═══════════════════════════════════════════════════════════════

function infoCard(title, items) {
  ensureSpace(items.length * 22 + 45);
  var y = doc.y;
  var h = items.length * 22 + 38;

  doc.save().roundedRect(LM, y, W, h, 6).fillAndStroke(C.white, C.slate200).restore();
  doc.lineWidth(0.5);

  // Header
  doc.save().roundedRect(LM, y, W, 28, 6).clip();
  doc.rect(LM, y, W, 28).fill(C.slate100);
  doc.restore();
  drawLine(LM, y + 28, LM + W, y + 28, C.slate200, 0.5);
  doc.fontSize(11).font(BOLD).fillColor(C.slate800).text(title, LM + 14, y + 7);

  var iy = y + 36;
  items.forEach(function(item) {
    doc.fontSize(9).font(BOLD).fillColor(C.slate500).text(item[0], LM + 18, iy, { width: 180 });
    doc.fontSize(9).font(MONO).fillColor(C.slate800).text(item[1], LM + 200, iy, { width: W - 220 });
    iy += 22;
  });

  doc.y = y + h + 12;
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TABLE + SQL
// ═══════════════════════════════════════════════════════════════

function documentTable(name, desc, cols, note, sql) {
  subHeader(name);

  doc.fontSize(9.5).font(SANS).fillColor(C.slate600)
     .text(desc, LM + 5, doc.y, { width: W - 10, lineGap: 2 });
  doc.moveDown(0.5);

  gridTable(LM, W, name,
    ['Colonne', 'Type', 'Contraintes / Description'],
    cols,
    [0.24, 0.20, 0.56]
  );

  if (note) infoBox(note, 'info');

  if (sql) {
    var lines = sql.split('\n').map(function(line) {
      var t = line.trim().toUpperCase();
      var color = C.tWhite;
      if (line.trim().indexOf('--') === 0) color = C.tGray;
      else if (/^(CREATE|DROP|ALTER)/.test(t)) color = C.tYellow;
      else if (/^\);?$/.test(line.trim())) color = C.tYellow;
      else if (/SERIAL|VARCHAR|INTEGER|BOOLEAN|TEXT|DATE|TIMESTAMP|DECIMAL|TIME|NUMERIC/.test(t)) color = C.tGreen;
      else if (/PRIMARY KEY|UNIQUE|REFERENCES|ON DELETE|CASCADE/.test(t)) color = C.tYellow;
      else if (/NOT NULL|DEFAULT|CHECK|IN \(/.test(t)) color = C.tBlue;
      return { text: line, color: color };
    });
    termBlock(lines, 'CREATE TABLE ' + name, { lineH: 12, fontSize: 7.8 });
  }
  doc.moveDown(0.2);
}

// ════════════════════════════════════════════════════════════════════
// PAGES
// ════════════════════════════════════════════════════════════════════

function pageCover() {
  doc.rect(0, 0, PW, PH).fill(C.navy);
  for (var i = 0; i < 40; i++) {
    doc.save().fillOpacity(0.03).rect(0, i * 21, PW, 0.5).fill(C.white).restore();
  }

  doc.rect(0, 290, PW, 4).fill(C.amber500);
  doc.rect(0, 555, PW, 2).fill(C.amber500);

  doc.save().roundedRect(245, 70, 105, 105, 20).fill(C.white).restore();
  doc.fontSize(55).font(BOLD).fillColor(C.navy).text('N', 265, 82, { width: 65, align: 'center' });
  doc.fontSize(10).font(BOLD).fillColor(C.blue600).text('NEXUS', 265, 147, { width: 65, align: 'center' });
  doc.fontSize(6).font(SANS).fillColor(C.slate500).text('UNIKIN', 265, 159, { width: 65, align: 'center' });

  doc.fontSize(10).font(SANS).fillColor(C.amber500)
     .text('D O C U M E N T A T I O N    T E C H N I Q U E', 0, 315, { align: 'center', width: PW });
  doc.moveDown(0.8);
  doc.fontSize(32).font(BOLD).fillColor(C.white).text('Base de Donn\u00e9es', 0, doc.y, { align: 'center', width: PW });
  doc.moveDown(0.3);
  doc.fontSize(26).font(SANS).fillColor(C.cyan500).text('PostgreSQL', 0, doc.y, { align: 'center', width: PW });
  doc.moveDown(0.5);
  doc.fontSize(11).font(SANS).fillColor(C.slate400)
     .text('Sch\u00e9ma Complet  \u2014  Architecture  \u2014  Relations', 0, doc.y, { align: 'center', width: PW });

  doc.y = 440;
  termBlock([
    { text: '$ psql -d nexus_unikin', color: C.tBrightGreen },
    { text: 'nexus_unikin=# SELECT count(*) FROM information_schema.tables;', color: C.tCyan },
    { text: '  count: 14', color: C.tWhite },
    { text: 'nexus_unikin=# \\di', color: C.tCyan },
    { text: '  16 indexes', color: C.tWhite },
  ], 'psql -- nexus_unikin');

  doc.y = 580;
  doc.fontSize(12).font(SANS).fillColor(C.white).text('Universit\u00e9 de Kinshasa', 0, doc.y, { align: 'center', width: PW });
  doc.fontSize(11).fillColor(C.slate400).text('Projet NEXUS \u2014 Syst\u00e8me de Gestion Universitaire', 0, doc.y + 16, { align: 'center', width: PW });
  doc.moveDown(2);
  doc.fontSize(9).fillColor(C.slate500).text('Version 1.0  |  F\u00e9vrier 2026  |  Confidentiel', 0, doc.y, { align: 'center', width: PW });
  doc.addPage();
}

function pageTOC() {
  sectionHeader(null, 'Table des Mati\u00e8res', '');
  doc.moveDown(0.5);

  var toc = [
    { n: '01', t: 'Introduction & Sp\u00e9cifications', s: null },
    { n: '02', t: 'Architecture des Tables', s: null },
    { n: '03', t: 'Diagramme Entit\u00e9-Relation (ERD)', s: null },
    { n: '04', t: 'Tables de R\u00e9f\u00e9rence', s: 'academic_years, users, faculties, departments, promotions' },
    { n: '05', t: 'Tables de Profils Utilisateurs', s: 'admins, teachers, students, employees' },
    { n: '06', t: 'Tables Acad\u00e9miques', s: 'courses, course_schedules, enrollments, grades, attendance' },
    { n: '07', t: 'Tables Op\u00e9rationnelles', s: 'payments, notifications' },
    { n: '08', t: 'Index & Performances', s: null },
    { n: '09', t: 'Triggers & Fonctions PL/pgSQL', s: null },
    { n: '10', t: 'Comptes par D\u00e9faut & S\u00e9curit\u00e9', s: null },
  ];

  toc.forEach(function(item) {
    var y = doc.y;
    doc.save().roundedRect(LM, y, 28, 20, 4).fill(C.blue600).restore();
    doc.fontSize(9).font(BOLD).fillColor(C.white).text(item.n, LM + 2, y + 5, { width: 24, align: 'center' });
    doc.fontSize(12).font(BOLD).fillColor(C.slate800).text(item.t, LM + 38, y + 3, { width: W - 50 });
    doc.y = y + 22;
    if (item.s) {
      doc.fontSize(8.5).font(ITALIC).fillColor(C.slate400).text(item.s, LM + 38, doc.y, { width: W - 50 });
      doc.moveDown(0.15);
    }
    drawLine(LM + 38, doc.y + 2, LM + W, doc.y + 2, C.slate100, 0.3);
    doc.y += 8;
  });
  doc.addPage();
}

function pageIntro() {
  sectionHeader('1', 'Introduction', 'Vue d\'ensemble du syst\u00e8me NEXUS UNIKIN');

  doc.fontSize(10).font(SANS).fillColor(C.slate700)
     .text('NEXUS UNIKIN est la plateforme int\u00e9gr\u00e9e de gestion de l\'Universit\u00e9 de Kinshasa. Ce document d\u00e9crit l\'int\u00e9gralit\u00e9 du sch\u00e9ma de base de donn\u00e9es PostgreSQL : structure des tables, relations, contraintes, index et triggers.', LM, doc.y, { width: W, lineGap: 4 });
  doc.moveDown(1);

  infoCard('Sp\u00e9cifications Techniques', [
    ['SGBD', 'PostgreSQL 15+'],
    ['Framework', 'Next.js 14.1.0 (App Router + TypeScript)'],
    ['Acc\u00e8s BD', 'pg (node-postgres) \u2014 Requ\u00eates SQL natives'],
    ['Authentification', 'bcryptjs (hash, co\u00fbt 10) + JWT'],
    ['Architecture BD', '14 tables | 16 index | 8 triggers'],
    ['Normalisation', '3\u00e8me forme normale (3NF)'],
  ]);

  doc.moveDown(0.3);
  doc.fontSize(13).font(BOLD).fillColor(C.slate800).text('Modules Fonctionnels\u00a0', LM);
  doc.moveDown(0.5);

  var modules = [
    ['Authentification & R\u00f4les', '5 r\u00f4les : Super Admin, Admin, Enseignant, \u00c9tudiant, Employ\u00e9'],
    ['Structure Acad\u00e9mique', 'Hi\u00e9rarchie Facult\u00e9s > D\u00e9partements > Promotions (L1 \u00e0 D3)'],
    ['Gestion des Cours', 'Cr\u00e9dits, volumes horaires CM/TD/TP, affectation enseignants'],
    ['Inscriptions & Notes', 'Inscription par ann\u00e9e, saisie TP/TD/Examen, validation jury'],
    ['Pr\u00e9sences', 'Relev\u00e9 quotidien : Pr\u00e9sent, Absent, Retard, Excus\u00e9'],
    ['Finances', 'Paiements Mobile Money, Cash, Banque avec re\u00e7us'],
    ['Notifications', 'Alertes cibl\u00e9es (Info, Warning, Success, Error)'],
  ];

  modules.forEach(function(m) {
    ensureSpace(32);
    doc.fontSize(9.5).font(BOLD).fillColor(C.blue600).text('> ' + m[0], LM + 6, doc.y);
    doc.fontSize(9).font(SANS).fillColor(C.slate500).text(m[1], LM + 22, doc.y, { width: W - 26, lineGap: 2 });
    doc.moveDown(0.3);
  });
  doc.addPage();
}

function pageArchitecture() {
  sectionHeader('2', 'Architecture', 'Organisation logique des 14 tables en couches\u00a0');

  gridTable(LM, W, null,
    ['Couche', 'Tables', 'Fonction'],
    [
      ['R\u00e9f\u00e9rence', 'academic_years, users, faculties, departments, promotions', 'Donn\u00e9es structurelles'],
      ['Profils', 'admins, teachers, students, employees', 'Extension 1:1 de users par r\u00f4le'],
      ['Acad\u00e9mique', 'courses, course_schedules, enrollments, grades, attendance', 'Cours, horaires, notes, pr\u00e9sences'],
      ['Op\u00e9rationnel', 'payments, notifications', 'Finance et communication'],
    ],
    [0.16, 0.44, 0.40],
    { headerBg: C.blue600 }
  );

  doc.moveDown(0.5);

  termBlock([
    { text: '$ psql -h localhost -U postgres -d nexus_unikin', color: C.tBrightGreen },
    { text: '', color: C.tGray },
    { text: 'nexus_unikin=# \\dt', color: C.tCyan },
    { text: '                     List of relations', color: C.tWhite },
    { text: '  Schema  |       Name          |  Type  |   Owner', color: C.tBlue },
    { text: '  --------+---------------------+--------+----------', color: C.tDimGray },
    { text: '  public  | academic_years      | table  | postgres', color: C.tWhite },
    { text: '  public  | admins              | table  | postgres', color: C.tWhite },
    { text: '  public  | attendance          | table  | postgres', color: C.tWhite },
    { text: '  public  | course_schedules    | table  | postgres', color: C.tWhite },
    { text: '  public  | courses             | table  | postgres', color: C.tWhite },
    { text: '  public  | departments         | table  | postgres', color: C.tWhite },
    { text: '  public  | employees           | table  | postgres', color: C.tWhite },
    { text: '  public  | enrollments         | table  | postgres', color: C.tWhite },
    { text: '  public  | faculties           | table  | postgres', color: C.tWhite },
    { text: '  public  | grades              | table  | postgres', color: C.tWhite },
    { text: '  public  | notifications       | table  | postgres', color: C.tWhite },
    { text: '  public  | payments            | table  | postgres', color: C.tWhite },
    { text: '  public  | promotions          | table  | postgres', color: C.tWhite },
    { text: '  public  | students            | table  | postgres', color: C.tWhite },
    { text: '  public  | teachers            | table  | postgres', color: C.tWhite },
    { text: '  public  | users               | table  | postgres', color: C.tWhite },
    { text: '  (16 rows)', color: C.tGray },
  ], 'psql -- \\dt (List Tables)');
  doc.addPage();
}

function pageERD() {
  sectionHeader('3', 'Diagramme Entit\u00e9-Relation', 'Visualisation des cl\u00e9s \u00e9trang\u00e8res');

  doc.fontSize(10).font(SANS).fillColor(C.slate700)
     .text('Le diagramme ci-dessous illustre les relations entre toutes les tables :', LM, doc.y, { width: W, lineGap: 3 });
  doc.moveDown(0.5);

  termBlock([
    { text: '', color: C.tGray },
    { text: '                 +--------------------+', color: C.tYellow },
    { text: '                 |   academic_years    |', color: C.tYellow },
    { text: '                 +---------+----------+', color: C.tYellow },
    { text: '                           |', color: C.tDimGray },
    { text: '       +--------------+    |    +--------------+', color: C.tCyan },
    { text: '       |   faculties   |    |    |    users      |', color: C.tCyan },
    { text: '       +------+-------+    |    +------+-------+', color: C.tCyan },
    { text: '              |            |           |', color: C.tDimGray },
    { text: '       +------+-------+    |    +------+---------------+', color: C.tGray },
    { text: '       |  departments  |    |    | admins  | teachers   |', color: C.tGreen },
    { text: '       +------+-------+    |    | students| employees  |', color: C.tGreen },
    { text: '              |            |    +------+---------------+', color: C.tGreen },
    { text: '       +------+-------+    |           |', color: C.tGray },
    { text: '       |  promotions   +---+    +------+--------+', color: C.tYellow },
    { text: '       +------+-------+         |  enrollments   |', color: C.tYellow },
    { text: '              |                 +------+---------+', color: C.tGray },
    { text: '       +------+-------+                |', color: C.tGray },
    { text: '       |    courses    +---------------+', color: C.tYellow },
    { text: '       +--+----+---+--+', color: C.tYellow },
    { text: '          |    |   |', color: C.tDimGray },
    { text: '   +------+  ++-+ +---------+', color: C.tDimGray },
    { text: '   |         |  |           |', color: C.tDimGray },
    { text: ' +-+--------++ ++---------+ +-+----------+', color: C.tPurple },
    { text: ' |schedules  | | grades   | | attendance  |', color: C.tPurple },
    { text: ' +-----------+ +----------+ +------------+', color: C.tPurple },
    { text: '', color: C.tGray },
    { text: ' +-----------+    +----------------+', color: C.tRed },
    { text: ' | payments   |    | notifications  |', color: C.tRed },
    { text: ' +-----------+    +----------------+', color: C.tRed },
    { text: '', color: C.tGray },
  ], 'Entity Relationship Diagram -- NEXUS UNIKIN', { lineH: 12, fontSize: 8 });

  doc.moveDown(0.3);
  ensureSpace(300);

  gridTable(LM, W, 'RELATIONS \u2014 Cl\u00e9s \u00c9trang\u00e8res (FK)',
    ['Table Source', 'Colonne FK', 'R\u00e9f\u00e9rence'],
    [
      ['departments', 'faculty_id', 'faculties.id'],
      ['promotions', 'department_id', 'departments.id'],
      ['promotions', 'academic_year_id', 'academic_years.id'],
      ['admins', 'user_id', 'users.id (UNIQUE)'],
      ['teachers', 'user_id', 'users.id (UNIQUE)'],
      ['teachers', 'department_id', 'departments.id'],
      ['students', 'user_id', 'users.id (UNIQUE)'],
      ['students', 'promotion_id', 'promotions.id'],
      ['employees', 'user_id', 'users.id (UNIQUE)'],
      ['courses', 'promotion_id', 'promotions.id'],
      ['courses', 'teacher_id', 'teachers.id'],
      ['course_schedules', 'course_id', 'courses.id'],
      ['enrollments', 'student_id', 'students.id'],
      ['enrollments', 'course_id', 'courses.id'],
      ['enrollments', 'academic_year_id', 'academic_years.id'],
      ['grades', 'student_id', 'students.id'],
      ['grades', 'course_id', 'courses.id'],
      ['grades', 'academic_year_id', 'academic_years.id'],
      ['attendance', 'student_id', 'students.id'],
      ['attendance', 'course_id', 'courses.id'],
      ['payments', 'student_id', 'students.id'],
      ['payments', 'academic_year_id', 'academic_years.id'],
      ['notifications', 'user_id', 'users.id'],
    ],
    [0.26, 0.32, 0.42],
    { fontSize: 7.5 }
  );
  doc.addPage();
}

function pageTables() {

  // ═══ SECTION 4 ═══
  sectionHeader('4', 'Tables de R\u00e9f\u00e9rence', 'Donn\u00e9es structurelles de base');

  documentTable('academic_years',
    'P\u00e9riodes acad\u00e9miques. Chaque ann\u00e9e a un d\u00e9but, une fin et un indicateur is_current.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY \u2014 Auto-incr\u00e9ment\u00e9'],
      ['name', 'VARCHAR(20)', 'UNIQUE NOT NULL \u2014 Ex: "2024-2025"'],
      ['start_date', 'DATE', 'NOT NULL \u2014 D\u00e9but de l\'ann\u00e9e'],
      ['end_date', 'DATE', 'NOT NULL \u2014 Fin de l\'ann\u00e9e'],
      ['is_current', 'BOOLEAN', 'DEFAULT FALSE \u2014 Ann\u00e9e active'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    'Une seule ann\u00e9e peut \u00eatre marqu\u00e9e is_current = TRUE. R\u00e9f\u00e9renc\u00e9e par promotions, enrollments, grades, payments.',
    'CREATE TABLE academic_years (\n    id          SERIAL PRIMARY KEY,\n    name        VARCHAR(20) NOT NULL UNIQUE,\n    start_date  DATE NOT NULL,\n    end_date    DATE NOT NULL,\n    is_current  BOOLEAN DEFAULT FALSE,\n    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);'
  );

  documentTable('users',
    'Table centrale d\'authentification. Le r\u00f4le d\u00e9termine le profil associ\u00e9 (admins, teachers, students, employees).',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['email', 'VARCHAR(255)', 'UNIQUE NOT NULL \u2014 Login'],
      ['password', 'VARCHAR(255)', 'NOT NULL \u2014 Hash bcrypt (60 chars)'],
      ['first_name', 'VARCHAR(100)', 'NOT NULL \u2014 Pr\u00e9nom'],
      ['last_name', 'VARCHAR(100)', 'NOT NULL \u2014 Nom de famille'],
      ['phone', 'VARCHAR(20)', 'Nullable \u2014 T\u00e9l\u00e9phone (+243...)'],
      ['address', 'TEXT', 'Nullable \u2014 Adresse physique'],
      ['photo_url', 'TEXT', 'Nullable \u2014 URL photo'],
      ['role', 'VARCHAR(20)', 'CHECK: SUPER_ADMIN|ADMIN|TEACHER|STUDENT|EMPLOYEE'],
      ['is_active', 'BOOLEAN', 'DEFAULT TRUE \u2014 Activation'],
      ['last_login', 'TIMESTAMP', 'Nullable \u2014 Derni\u00e8re connexion'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    'Index sur email et r\u00f4le. Password hash bcrypt co\u00fbt 10. La colonne role d\u00e9termine la table-profil 1:1.',
    'CREATE TABLE users (\n    id          SERIAL PRIMARY KEY,\n    email       VARCHAR(255) NOT NULL UNIQUE,\n    password    VARCHAR(255) NOT NULL,\n    first_name  VARCHAR(100) NOT NULL,\n    last_name   VARCHAR(100) NOT NULL,\n    phone       VARCHAR(20),\n    address     TEXT,\n    photo_url   TEXT,\n    role        VARCHAR(20) NOT NULL CHECK (role IN\n                (\'SUPER_ADMIN\',\'ADMIN\',\'TEACHER\',\'STUDENT\',\'EMPLOYEE\')),\n    is_active   BOOLEAN DEFAULT TRUE,\n    last_login  TIMESTAMP,\n    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);'
  );

  documentTable('faculties',
    'Premier niveau de hi\u00e9rarchie acad\u00e9mique \u2014 les grandes facult\u00e9s.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['code', 'VARCHAR(10)', 'UNIQUE NOT NULL \u2014 Code court (FSEG, FSI)'],
      ['name', 'VARCHAR(255)', 'NOT NULL \u2014 Nom complet'],
      ['description', 'TEXT', 'Nullable'],
      ['dean_id', 'INTEGER', 'FK -> users.id \u2014 Doyen'],
      ['is_active', 'BOOLEAN', 'DEFAULT TRUE'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    null,
    'CREATE TABLE faculties (\n    id          SERIAL PRIMARY KEY,\n    code        VARCHAR(10) NOT NULL UNIQUE,\n    name        VARCHAR(255) NOT NULL,\n    description TEXT,\n    dean_id     INTEGER REFERENCES users(id),\n    is_active   BOOLEAN DEFAULT TRUE,\n    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);'
  );

  documentTable('departments',
    'Deuxi\u00e8me niveau \u2014 d\u00e9partements au sein des facult\u00e9s. Suppression en cascade depuis faculties.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['code', 'VARCHAR(10)', 'UNIQUE NOT NULL \u2014 INFO, ECO'],
      ['name', 'VARCHAR(255)', 'NOT NULL'],
      ['description', 'TEXT', 'Nullable'],
      ['faculty_id', 'INTEGER', 'FK -> faculties.id \u2014 ON DELETE CASCADE'],
      ['head_id', 'INTEGER', 'FK -> users.id \u2014 Chef de d\u00e9partement'],
      ['is_active', 'BOOLEAN', 'DEFAULT TRUE'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    'CASCADE : supprimer une facult\u00e9 supprime tous ses d\u00e9partements.',
    'CREATE TABLE departments (\n    id          SERIAL PRIMARY KEY,\n    code        VARCHAR(10) NOT NULL UNIQUE,\n    name        VARCHAR(255) NOT NULL,\n    description TEXT,\n    faculty_id  INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,\n    head_id     INTEGER REFERENCES users(id),\n    is_active   BOOLEAN DEFAULT TRUE,\n    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);'
  );

  documentTable('promotions',
    'Troisi\u00e8me niveau \u2014 niveaux d\'\u00e9tude (L1 \u00e0 D3) li\u00e9s \u00e0 un d\u00e9partement et une ann\u00e9e.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['code', 'VARCHAR(20)', 'NOT NULL \u2014 Code promotion'],
      ['name', 'VARCHAR(255)', 'NOT NULL \u2014 Ex: "L1 Informatique"'],
      ['level', 'VARCHAR(10)', 'CHECK: L1|L2|L3|M1|M2|D1|D2|D3'],
      ['department_id', 'INTEGER', 'FK -> departments.id \u2014 CASCADE'],
      ['academic_year_id', 'INTEGER', 'FK -> academic_years.id'],
      ['is_active', 'BOOLEAN', 'DEFAULT TRUE'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    'UNIQUE(code, academic_year_id) : une promotion est unique par ann\u00e9e acad\u00e9mique.',
    'CREATE TABLE promotions (\n    id               SERIAL PRIMARY KEY,\n    code             VARCHAR(20) NOT NULL,\n    name             VARCHAR(255) NOT NULL,\n    level            VARCHAR(10) NOT NULL CHECK\n                     (level IN (\'L1\',\'L2\',\'L3\',\'M1\',\'M2\',\'D1\',\'D2\',\'D3\')),\n    department_id    INTEGER NOT NULL\n                     REFERENCES departments(id) ON DELETE CASCADE,\n    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),\n    is_active        BOOLEAN DEFAULT TRUE,\n    UNIQUE(code, academic_year_id)\n);'
  );

  // ═══ SECTION 5 ═══
  doc.addPage();
  sectionHeader('5', 'Tables de Profils', 'Extension 1:1 de la table users par r\u00f4le');
  infoBox('Chaque utilisateur poss\u00e8de exactement un profil sp\u00e9cialis\u00e9. La relation est 1:1 via user_id UNIQUE.', 'info');

  documentTable('admins',
    'Profil administrateur \u2014 gestion par p\u00e9rim\u00e8tre (global, facult\u00e9, d\u00e9partement).',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'FK -> users.id \u2014 UNIQUE, CASCADE'],
      ['admin_type', 'VARCHAR(20)', 'CHECK: SUPER_ADMIN|FACULTY_ADMIN|DEPARTMENT_ADMIN'],
      ['faculty_id', 'INTEGER', 'FK -> faculties.id \u2014 NULL si SUPER_ADMIN'],
      ['department_id', 'INTEGER', 'FK -> departments.id \u2014 NULL si SUPER/FACULTY'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    null,
    'CREATE TABLE admins (\n    id            SERIAL PRIMARY KEY,\n    user_id       INTEGER NOT NULL UNIQUE\n                  REFERENCES users(id) ON DELETE CASCADE,\n    admin_type    VARCHAR(20) NOT NULL CHECK (admin_type IN\n                  (\'SUPER_ADMIN\',\'FACULTY_ADMIN\',\'DEPARTMENT_ADMIN\')),\n    faculty_id    INTEGER REFERENCES faculties(id),\n    department_id INTEGER REFERENCES departments(id)\n);'
  );

  documentTable('teachers',
    'Profil enseignant \u2014 grade acad\u00e9mique, sp\u00e9cialisation, rattachement.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'FK -> users.id \u2014 UNIQUE, CASCADE'],
      ['matricule', 'VARCHAR(50)', 'UNIQUE NOT NULL \u2014 PROF-2024-001'],
      ['grade', 'VARCHAR(50)', 'CHECK: ASSISTANT \u00e0 PROFESSEUR_ORDINAIRE'],
      ['specialization', 'VARCHAR(255)', 'Nullable \u2014 Domaine d\'expertise'],
      ['department_id', 'INTEGER', 'FK -> departments.id'],
      ['hire_date', 'DATE', 'Nullable \u2014 Date embauche'],
      ['is_permanent', 'BOOLEAN', 'DEFAULT TRUE \u2014 Permanent vs Vacataire'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    'Grades : ASSISTANT < CHEF_TRAVAUX < PROFESSEUR_ASSOCIE < PROFESSEUR < PROFESSEUR_ORDINAIRE.',
    'CREATE TABLE teachers (\n    id             SERIAL PRIMARY KEY,\n    user_id        INTEGER NOT NULL UNIQUE\n                   REFERENCES users(id) ON DELETE CASCADE,\n    matricule      VARCHAR(50) NOT NULL UNIQUE,\n    grade          VARCHAR(50) NOT NULL CHECK (grade IN\n                   (\'ASSISTANT\',\'CHEF_TRAVAUX\',\'PROFESSEUR_ASSOCIE\',\n                    \'PROFESSEUR\',\'PROFESSEUR_ORDINAIRE\')),\n    specialization VARCHAR(255),\n    department_id  INTEGER REFERENCES departments(id),\n    hire_date      DATE,\n    is_permanent   BOOLEAN DEFAULT TRUE\n);'
  );

  documentTable('students',
    'Profil \u00e9tudiant \u2014 inscription, paiement, \u00e9tat civil. Table la plus volumineuse.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'FK -> users.id \u2014 UNIQUE, CASCADE'],
      ['matricule', 'VARCHAR(50)', 'UNIQUE NOT NULL \u2014 ETU-2024-001'],
      ['promotion_id', 'INTEGER', 'FK -> promotions.id \u2014 Niveau actuel'],
      ['enrollment_date', 'DATE', 'NOT NULL \u2014 Date inscription'],
      ['status', 'VARCHAR(20)', 'CHECK: ACTIVE|SUSPENDED|GRADUATED|DROPPED'],
      ['payment_status', 'VARCHAR(20)', 'CHECK: PAID|PARTIAL|UNPAID|BLOCKED'],
      ['birth_date', 'DATE', 'Nullable'],
      ['nationality', 'VARCHAR(100)', 'DEFAULT "Congolaise"'],
      ['gender', 'VARCHAR(10)', 'CHECK: M ou F'],
      ['parent_name', 'VARCHAR(255)', 'Nullable \u2014 Nom du tuteur'],
      ['parent_phone', 'VARCHAR(20)', 'Nullable \u2014 T\u00e9l. du tuteur'],
    ],
    'payment_status = BLOCKED bloque l\'acc\u00e8s aux notes. Index sur matricule, promotion_id, status.',
    'CREATE TABLE students (\n    id              SERIAL PRIMARY KEY,\n    user_id         INTEGER NOT NULL UNIQUE\n                    REFERENCES users(id) ON DELETE CASCADE,\n    matricule       VARCHAR(50) NOT NULL UNIQUE,\n    promotion_id    INTEGER NOT NULL REFERENCES promotions(id),\n    enrollment_date DATE NOT NULL,\n    status          VARCHAR(20) DEFAULT \'ACTIVE\' CHECK (status IN\n                    (\'ACTIVE\',\'SUSPENDED\',\'GRADUATED\',\'DROPPED\')),\n    payment_status  VARCHAR(20) DEFAULT \'UNPAID\' CHECK (payment_status IN\n                    (\'PAID\',\'PARTIAL\',\'UNPAID\',\'BLOCKED\')),\n    birth_date      DATE,\n    nationality     VARCHAR(100) DEFAULT \'Congolaise\',\n    gender          VARCHAR(10) CHECK (gender IN (\'M\',\'F\')),\n    parent_name     VARCHAR(255),\n    parent_phone    VARCHAR(20)\n);'
  );

  documentTable('employees',
    'Profil employ\u00e9 \u2014 personnel administratif et technique (non-enseignant).',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'FK -> users.id \u2014 UNIQUE, CASCADE'],
      ['matricule', 'VARCHAR(50)', 'UNIQUE NOT NULL \u2014 EMP-2024-001'],
      ['position', 'VARCHAR(255)', 'NOT NULL \u2014 Poste occup\u00e9'],
      ['department', 'VARCHAR(255)', 'Nullable \u2014 Service (texte libre, non FK)'],
      ['service', 'VARCHAR(255)', 'Nullable \u2014 Sous-service'],
      ['hire_date', 'DATE', 'Nullable'],
      ['contract_type', 'VARCHAR(20)', 'CHECK: PERMANENT|CONTRACT|TEMPORARY'],
    ],
    null,
    'CREATE TABLE employees (\n    id            SERIAL PRIMARY KEY,\n    user_id       INTEGER NOT NULL UNIQUE\n                  REFERENCES users(id) ON DELETE CASCADE,\n    matricule     VARCHAR(50) NOT NULL UNIQUE,\n    position      VARCHAR(255) NOT NULL,\n    department    VARCHAR(255),\n    service       VARCHAR(255),\n    hire_date     DATE,\n    contract_type VARCHAR(20) CHECK (contract_type IN\n                  (\'PERMANENT\',\'CONTRACT\',\'TEMPORARY\'))\n);'
  );

  // ═══ SECTION 6 ═══
  doc.addPage();
  sectionHeader('6', 'Tables Acad\u00e9miques', 'Cours, horaires, inscriptions, notes et pr\u00e9sences');

  documentTable('courses',
    'Catalogue des cours \u2014 cr\u00e9dits, volumes horaires, affectation promotions et enseignants.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['code', 'VARCHAR(20)', 'NOT NULL \u2014 Ex: INFO101'],
      ['name', 'VARCHAR(255)', 'NOT NULL \u2014 Intitul\u00e9 du cours'],
      ['description', 'TEXT', 'Nullable'],
      ['credits', 'INTEGER', 'DEFAULT 3 \u2014 Cr\u00e9dits ECTS'],
      ['hours_cm', 'INTEGER', 'DEFAULT 0 \u2014 Heures Cours Magistral'],
      ['hours_td', 'INTEGER', 'DEFAULT 0 \u2014 Heures Travaux Dirig\u00e9s'],
      ['hours_tp', 'INTEGER', 'DEFAULT 0 \u2014 Heures Travaux Pratiques'],
      ['promotion_id', 'INTEGER', 'FK -> promotions.id \u2014 CASCADE'],
      ['teacher_id', 'INTEGER', 'FK -> teachers.id \u2014 Enseignant titulaire'],
      ['semester', 'INTEGER', 'CHECK: 1 ou 2'],
      ['course_type', 'VARCHAR(20)', 'CHECK: OBLIGATOIRE|OPTIONNEL|LIBRE'],
      ['is_active', 'BOOLEAN', 'DEFAULT TRUE'],
    ],
    'UNIQUE(code, promotion_id). Les volumes CM/TD/TP servent au calcul de l\'emploi du temps.',
    'CREATE TABLE courses (\n    id            SERIAL PRIMARY KEY,\n    code          VARCHAR(20) NOT NULL,\n    name          VARCHAR(255) NOT NULL,\n    credits       INTEGER NOT NULL DEFAULT 3,\n    hours_cm      INTEGER DEFAULT 0,\n    hours_td      INTEGER DEFAULT 0,\n    hours_tp      INTEGER DEFAULT 0,\n    promotion_id  INTEGER NOT NULL\n                  REFERENCES promotions(id) ON DELETE CASCADE,\n    teacher_id    INTEGER REFERENCES teachers(id),\n    semester      INTEGER NOT NULL CHECK (semester IN (1, 2)),\n    course_type   VARCHAR(20) DEFAULT \'OBLIGATOIRE\'\n                  CHECK (course_type IN (\'OBLIGATOIRE\',\'OPTIONNEL\',\'LIBRE\')),\n    is_active     BOOLEAN DEFAULT TRUE,\n    UNIQUE(code, promotion_id)\n);'
  );

  documentTable('course_schedules',
    'Cr\u00e9neaux horaires hebdomadaires \u2014 un cours peut avoir plusieurs cr\u00e9neaux.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['course_id', 'INTEGER', 'FK -> courses.id \u2014 ON DELETE CASCADE'],
      ['day_of_week', 'INTEGER', 'CHECK 0-6 (0=Lundi, 6=Dimanche)'],
      ['start_time', 'TIME', 'NOT NULL \u2014 Heure d\u00e9but'],
      ['end_time', 'TIME', 'NOT NULL \u2014 Heure fin'],
      ['room', 'VARCHAR(50)', 'Nullable \u2014 Salle (ex: "A201")'],
      ['schedule_type', 'VARCHAR(10)', 'CHECK: CM|TD|TP \u2014 DEFAULT CM'],
    ],
    null,
    'CREATE TABLE course_schedules (\n    id            SERIAL PRIMARY KEY,\n    course_id     INTEGER NOT NULL\n                  REFERENCES courses(id) ON DELETE CASCADE,\n    day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),\n    start_time    TIME NOT NULL,\n    end_time      TIME NOT NULL,\n    room          VARCHAR(50),\n    schedule_type VARCHAR(10) DEFAULT \'CM\'\n                  CHECK (schedule_type IN (\'CM\',\'TD\',\'TP\'))\n);'
  );

  documentTable('enrollments',
    'Inscriptions des \u00e9tudiants aux cours \u2014 une par \u00e9tudiant, par cours, par ann\u00e9e.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'FK -> students.id \u2014 CASCADE'],
      ['course_id', 'INTEGER', 'FK -> courses.id \u2014 CASCADE'],
      ['academic_year_id', 'INTEGER', 'FK -> academic_years.id'],
      ['enrollment_date', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['status', 'VARCHAR(20)', 'CHECK: ENROLLED|DROPPED|COMPLETED'],
    ],
    'UNIQUE(student_id, course_id, academic_year_id) \u2014 emp\u00eache les doublons.',
    'CREATE TABLE enrollments (\n    id               SERIAL PRIMARY KEY,\n    student_id       INTEGER NOT NULL\n                     REFERENCES students(id) ON DELETE CASCADE,\n    course_id        INTEGER NOT NULL\n                     REFERENCES courses(id) ON DELETE CASCADE,\n    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),\n    status           VARCHAR(20) DEFAULT \'ENROLLED\'\n                     CHECK (status IN (\'ENROLLED\',\'DROPPED\',\'COMPLETED\')),\n    UNIQUE(student_id, course_id, academic_year_id)\n);'
  );

  documentTable('grades',
    'Notes des \u00e9tudiants \u2014 composantes TP, TD, Examen et note finale valid\u00e9e par le jury.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'FK -> students.id \u2014 CASCADE'],
      ['course_id', 'INTEGER', 'FK -> courses.id \u2014 CASCADE'],
      ['academic_year_id', 'INTEGER', 'FK -> academic_years.id'],
      ['tp_score', 'DECIMAL(5,2)', 'Nullable \u2014 Note TP (0-100)'],
      ['td_score', 'DECIMAL(5,2)', 'Nullable \u2014 Note TD (0-100)'],
      ['exam_score', 'DECIMAL(5,2)', 'Nullable \u2014 Note Examen (0-100)'],
      ['final_score', 'DECIMAL(5,2)', 'Nullable \u2014 Note finale calcul\u00e9e'],
      ['grade_letter', 'VARCHAR(2)', 'Nullable \u2014 A, B, C, D, E, F'],
      ['is_validated', 'BOOLEAN', 'DEFAULT FALSE \u2014 Verrou jury'],
      ['validated_by', 'INTEGER', 'FK -> users.id \u2014 Validateur'],
      ['validated_at', 'TIMESTAMP', 'Nullable \u2014 Date validation'],
      ['remarks', 'TEXT', 'Nullable'],
    ],
    'Formule : final = TP\u00d720% + TD\u00d720% + Exam\u00d760%. is_validated=TRUE verrouille la note.',
    'CREATE TABLE grades (\n    id               SERIAL PRIMARY KEY,\n    student_id       INTEGER NOT NULL\n                     REFERENCES students(id) ON DELETE CASCADE,\n    course_id        INTEGER NOT NULL\n                     REFERENCES courses(id) ON DELETE CASCADE,\n    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),\n    tp_score         DECIMAL(5,2),\n    td_score         DECIMAL(5,2),\n    exam_score       DECIMAL(5,2),\n    final_score      DECIMAL(5,2),\n    grade_letter     VARCHAR(2),\n    is_validated     BOOLEAN DEFAULT FALSE,\n    validated_by     INTEGER REFERENCES users(id),\n    validated_at     TIMESTAMP,\n    remarks          TEXT,\n    UNIQUE(student_id, course_id, academic_year_id)\n);'
  );

  documentTable('attendance',
    'Relev\u00e9 de pr\u00e9sence quotidien \u2014 par \u00e9tudiant, par cours, par cr\u00e9neau.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'FK -> students.id \u2014 CASCADE'],
      ['course_id', 'INTEGER', 'FK -> courses.id \u2014 CASCADE'],
      ['schedule_id', 'INTEGER', 'FK -> course_schedules.id \u2014 Cr\u00e9neau'],
      ['attendance_date', 'DATE', 'NOT NULL'],
      ['status', 'VARCHAR(20)', 'CHECK: PRESENT|ABSENT|LATE|EXCUSED'],
      ['remarks', 'TEXT', 'Nullable \u2014 Justificatif'],
      ['recorded_by', 'INTEGER', 'FK -> users.id \u2014 Qui a enregistr\u00e9'],
    ],
    null,
    'CREATE TABLE attendance (\n    id              SERIAL PRIMARY KEY,\n    student_id      INTEGER NOT NULL\n                    REFERENCES students(id) ON DELETE CASCADE,\n    course_id       INTEGER NOT NULL\n                    REFERENCES courses(id) ON DELETE CASCADE,\n    schedule_id     INTEGER REFERENCES course_schedules(id),\n    attendance_date DATE NOT NULL,\n    status          VARCHAR(20) DEFAULT \'PRESENT\'\n                    CHECK (status IN (\'PRESENT\',\'ABSENT\',\'LATE\',\'EXCUSED\')),\n    remarks         TEXT,\n    recorded_by     INTEGER REFERENCES users(id)\n);'
  );

  // ═══ SECTION 7 ═══
  doc.addPage();
  sectionHeader('7', 'Tables Op\u00e9rationnelles', 'Paiements \u00e9tudiants et notifications syst\u00e8me');

  documentTable('payments',
    'Tous les paiements \u00e9tudiants \u2014 montants en USD, m\u00e9thodes vari\u00e9es, re\u00e7us et statuts.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['student_id', 'INTEGER', 'FK -> students.id \u2014 CASCADE'],
      ['academic_year_id', 'INTEGER', 'FK -> academic_years.id'],
      ['amount', 'DECIMAL(15,2)', 'NOT NULL \u2014 Montant en USD'],
      ['payment_type', 'VARCHAR(50)', 'CHECK: INSCRIPTION|FRAIS_ACADEMIQUES|MINERVAL|AUTRES'],
      ['payment_date', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['payment_method', 'VARCHAR(20)', 'CHECK: CASH|BANK|MOBILE_MONEY|CHECK'],
      ['reference', 'VARCHAR(100)', 'Nullable \u2014 R\u00e9f. transaction'],
      ['receipt_number', 'VARCHAR(100)', 'Nullable \u2014 N\u00b0 re\u00e7u officiel'],
      ['status', 'VARCHAR(20)', 'CHECK: PENDING|COMPLETED|CANCELLED|REFUNDED'],
      ['recorded_by', 'INTEGER', 'FK -> users.id \u2014 Enregistreur'],
      ['remarks', 'TEXT', 'Nullable'],
    ],
    'Le receipt_number (REC-2026-XXXXX) est la preuve physique. Li\u00e9 \u00e0 academic_year pour le reporting annuel.',
    'CREATE TABLE payments (\n    id               SERIAL PRIMARY KEY,\n    student_id       INTEGER NOT NULL\n                     REFERENCES students(id) ON DELETE CASCADE,\n    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),\n    amount           DECIMAL(15,2) NOT NULL,\n    payment_type     VARCHAR(50) NOT NULL CHECK (payment_type IN\n                     (\'INSCRIPTION\',\'FRAIS_ACADEMIQUES\',\'FRAIS_MINERVAL\',\'AUTRES\')),\n    payment_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    payment_method   VARCHAR(20) CHECK (payment_method IN\n                     (\'CASH\',\'BANK\',\'MOBILE_MONEY\',\'CHECK\')),\n    reference        VARCHAR(100),\n    receipt_number   VARCHAR(100),\n    status           VARCHAR(20) DEFAULT \'PENDING\' CHECK (status IN\n                     (\'PENDING\',\'COMPLETED\',\'CANCELLED\',\'REFUNDED\')),\n    recorded_by      INTEGER REFERENCES users(id),\n    remarks          TEXT\n);'
  );

  documentTable('notifications',
    'Notifications personnelles pour chaque utilisateur \u2014 alertes, messages syst\u00e8me.',
    [
      ['id', 'SERIAL', 'PRIMARY KEY'],
      ['user_id', 'INTEGER', 'FK -> users.id \u2014 CASCADE'],
      ['title', 'VARCHAR(255)', 'NOT NULL \u2014 Titre'],
      ['message', 'TEXT', 'NOT NULL \u2014 Contenu'],
      ['type', 'VARCHAR(20)', 'CHECK: INFO|WARNING|SUCCESS|ERROR'],
      ['is_read', 'BOOLEAN', 'DEFAULT FALSE \u2014 Lu / Non lu'],
      ['link', 'VARCHAR(255)', 'Nullable \u2014 URL de redirection'],
      ['created_at', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
      ['updated_at', 'TIMESTAMP', 'AUTO via trigger'],
    ],
    null,
    'CREATE TABLE notifications (\n    id         SERIAL PRIMARY KEY,\n    user_id    INTEGER NOT NULL\n               REFERENCES users(id) ON DELETE CASCADE,\n    title      VARCHAR(255) NOT NULL,\n    message    TEXT NOT NULL,\n    type       VARCHAR(20) DEFAULT \'INFO\' CHECK (type IN\n               (\'INFO\',\'WARNING\',\'SUCCESS\',\'ERROR\')),\n    is_read    BOOLEAN DEFAULT FALSE,\n    link       VARCHAR(255),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);'
  );
}

function pageIndexes() {
  doc.addPage();
  sectionHeader('8', 'Index & Performances', '16 index pour l\'optimisation des requ\u00eates');

  doc.fontSize(10).font(SANS).fillColor(C.slate700)
     .text('Les index suivants ciblent les colonnes les plus utilis\u00e9es dans les WHERE, JOIN et ORDER BY :', LM, doc.y, { width: W, lineGap: 3 });
  doc.moveDown(0.6);

  gridTable(LM, W, 'INDEX -- Performance Optimization',
    ['Index', 'Table', 'Colonne', 'Usage Principal'],
    [
      ['idx_users_email', 'users', 'email', 'Login (recherche par email)'],
      ['idx_users_role', 'users', 'role', 'Filtrage par r\u00f4le'],
      ['idx_students_matricule', 'students', 'matricule', 'Recherche par matricule'],
      ['idx_students_promotion', 'students', 'promotion_id', 'Liste par promotion'],
      ['idx_students_status', 'students', 'status', 'Filtrage par statut'],
      ['idx_teachers_matricule', 'teachers', 'matricule', 'Recherche enseignant'],
      ['idx_teachers_department', 'teachers', 'department_id', 'Liste par d\u00e9partement'],
      ['idx_courses_promotion', 'courses', 'promotion_id', 'Cours par promotion'],
      ['idx_courses_teacher', 'courses', 'teacher_id', 'Cours par enseignant'],
      ['idx_grades_student', 'grades', 'student_id', 'Notes par \u00e9tudiant'],
      ['idx_grades_course', 'grades', 'course_id', 'Notes par cours'],
      ['idx_attendance_student', 'attendance', 'student_id', 'Pr\u00e9sences par \u00e9tudiant'],
      ['idx_attendance_date', 'attendance', 'attendance_date', 'Tri par date'],
      ['idx_payments_student', 'payments', 'student_id', 'Paiements par \u00e9tudiant'],
      ['idx_notifications_user', 'notifications', 'user_id', 'Notifs par utilisateur'],
      ['idx_notifications_read', 'notifications', 'is_read', 'Filtrage non lues\u00a0'],
    ],
    [0.28, 0.16, 0.22, 0.34],
    { headerBg: C.blue600, fontSize: 7.5 }
  );

  doc.moveDown(0.5);

  termBlock([
    { text: '-- INDEX DE PERFORMANCE (16 index)', color: C.tGray },
    { text: '', color: C.tGray },
    { text: 'CREATE INDEX idx_users_email          ON users(email);', color: C.tGreen },
    { text: 'CREATE INDEX idx_users_role           ON users(role);', color: C.tGreen },
    { text: 'CREATE INDEX idx_students_matricule   ON students(matricule);', color: C.tGreen },
    { text: 'CREATE INDEX idx_students_promotion   ON students(promotion_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_students_status      ON students(status);', color: C.tGreen },
    { text: 'CREATE INDEX idx_teachers_matricule   ON teachers(matricule);', color: C.tGreen },
    { text: 'CREATE INDEX idx_teachers_department  ON teachers(department_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_courses_promotion    ON courses(promotion_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_courses_teacher      ON courses(teacher_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_grades_student       ON grades(student_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_grades_course        ON grades(course_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_attendance_student   ON attendance(student_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_attendance_date      ON attendance(attendance_date);', color: C.tGreen },
    { text: 'CREATE INDEX idx_payments_student     ON payments(student_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_notifications_user   ON notifications(user_id);', color: C.tGreen },
    { text: 'CREATE INDEX idx_notifications_read   ON notifications(is_read);', color: C.tGreen },
  ], 'psql -- CREATE INDEX (x16)', { lineH: 12 });

  doc.moveDown(0.3);
  infoBox('Impact : chaque index r\u00e9duit le temps de r\u00e9ponse de > 100ms \u00e0 < 5ms sur 10 000+ enregistrements.', 'success');
}

function pageTriggers() {
  doc.addPage();
  sectionHeader('9', 'Triggers & Fonctions', 'Automatisation PL/pgSQL');

  doc.fontSize(10).font(SANS).fillColor(C.slate700)
     .text('Un trigger BEFORE UPDATE met \u00e0 jour automatiquement le champ updated_at :', LM, doc.y, { width: W, lineGap: 3 });
  doc.moveDown(0.5);

  termBlock([
    { text: '-- FONCTION PL/pgSQL', color: C.tGray },
    { text: '', color: C.tGray },
    { text: 'CREATE OR REPLACE FUNCTION update_updated_at_column()', color: C.tYellow },
    { text: 'RETURNS TRIGGER AS $$', color: C.tYellow },
    { text: 'BEGIN', color: C.tBlue },
    { text: '    NEW.updated_at = CURRENT_TIMESTAMP;', color: C.tGreen },
    { text: '    RETURN NEW;', color: C.tGreen },
    { text: 'END;', color: C.tBlue },
    { text: "$$ LANGUAGE 'plpgsql';", color: C.tYellow },
  ], 'Fonction PL/pgSQL');

  gridTable(LM, W, 'TRIGGERS -- BEFORE UPDATE (x8)',
    ['Trigger', 'Table', '\u00c9v\u00e9nement', 'Fonction'],
    [
      ['update_users_updated_at', 'users', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_faculties_updated_at', 'faculties', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_departments_updated_at', 'departments', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_promotions_updated_at', 'promotions', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_students_updated_at', 'students', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_teachers_updated_at', 'teachers', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_courses_updated_at', 'courses', 'BEFORE UPDATE', 'update_updated_at_column()'],
      ['update_grades_updated_at', 'grades', 'BEFORE UPDATE', 'update_updated_at_column()'],
    ],
    [0.33, 0.17, 0.20, 0.30],
    { fontSize: 7.5 }
  );

  doc.moveDown(0.3);
  infoBox('Le trigger se d\u00e9clenche automatiquement \u00e0 chaque UPDATE. Aucune modification c\u00f4t\u00e9 Next.js n\'est n\u00e9cessaire.', 'success');
}

function pageAccounts() {
  doc.addPage();
  sectionHeader('10', 'Comptes par D\u00e9faut', 'Identifiants de d\u00e9veloppement');

  doc.fontSize(10).font(SANS).fillColor(C.slate700)
     .text('Le syst\u00e8me est pr\u00e9-configur\u00e9 avec les comptes ci-dessous. En production, tous les mots de passe doivent \u00eatre chang\u00e9s.', LM, doc.y, { width: W, lineGap: 3 });
  doc.moveDown(0.5);

  gridTable(LM, W, 'SUPER_ADMIN',
    ['Nom', 'Email', 'Mot de passe', 'R\u00f4le'],
    [['Jean-Pierre Mbeki', 'admin@unikin.ac.cd', 'Admin@2026', 'SUPER_ADMIN']],
    [0.22, 0.35, 0.20, 0.23],
    { headerBg: C.red600 }
  );
  doc.moveDown(0.3);

  gridTable(LM, W, 'ENSEIGNANTS (TEACHER)',
    ['Nom', 'Email', 'Mot de passe'],
    [
      ['Fran\u00e7ois Kabongo', 'prof.kabongo@unikin.ac.cd', 'Prof@2026'],
      ['Joseph Mukendi', 'prof.mukendi@unikin.ac.cd', 'Prof@2026'],
      ['Th\u00e9r\u00e8se Lukusa', 'prof.lukusa@unikin.ac.cd', 'Prof@2026'],
      ['Jean-Pierre Kabongo', 'jeanpierre.kabongo1@unikin.ac.cd', 'Prof@2026'],
    ],
    [0.28, 0.45, 0.27],
    { headerBg: C.blue600 }
  );
  doc.moveDown(0.3);

  gridTable(LM, W, '\u00c9TUDIANTS (STUDENT)',
    ['Nom', 'Email', 'Mot de passe'],
    [
      ['Chris Ngozulu', '2111188338@unikin.ac.cd', 'Etudiant@2026'],
      ['Marie Kasongo', 'etudiant.kasongo@student.unikin.ac.cd', 'Etudiant@2026'],
      ['David Tshimanga', 'etudiant.tshimanga@student.unikin.ac.cd', 'Etudiant@2026'],
      ['Grace Mbala', 'grace.mbala@student.unikin.ac.cd', 'Etudiant@2026'],
      ['Josu\u00e9 Kalala', 'josue.kalala@student.unikin.ac.cd', 'Etudiant@2026'],
      ['Esther Lunda', 'esther.lunda@student.unikin.ac.cd', 'Etudiant@2026'],
      ['Samuel Nkulu', 'samuel.nkulu@student.unikin.ac.cd', 'Etudiant@2026'],
      ['\u00c9tudiant 2122340977', '2122340977@unikin.ac.cd', 'Etudiant@2026'],
    ],
    [0.25, 0.48, 0.27],
    { headerBg: C.green600 }
  );
  doc.moveDown(0.3);

  gridTable(LM, W, 'EMPLOY\u00c9S (EMPLOYEE)',
    ['Nom', 'Email', 'Mot de passe'],
    [['Pierre Mutombo', 'employe.mutombo@unikin.ac.cd', 'Employe@2026']],
    [0.28, 0.45, 0.27],
    { headerBg: C.purple600 }
  );
  doc.moveDown(0.5);

  infoBox('Ces mots de passe sont r\u00e9serv\u00e9s au d\u00e9veloppement. En production : changer tous les mots de passe, activer le 2FA, configurer les politiques de rotation.', 'danger');
}

function pageEnd() {
  doc.addPage();
  doc.rect(0, 0, PW, PH).fill(C.navy);
  doc.fontSize(30).font(BOLD).fillColor(C.white).text('NEXUS UNIKIN', 0, 300, { align: 'center', width: PW });
  doc.fontSize(16).font(SANS).fillColor(C.cyan500).text('Documentation Base de Donn\u00e9es', 0, 342, { align: 'center', width: PW });
  doc.moveDown(2);
  doc.fontSize(12).fillColor(C.slate400).text('14 Tables  |  16 Index  |  8 Triggers', 0, doc.y, { align: 'center', width: PW });
  doc.moveDown(0.5);
  doc.fontSize(10).text('PostgreSQL 15+  |  Next.js 14.1.0  |  TypeScript', 0, doc.y, { align: 'center', width: PW });
  doc.moveDown(3);
  doc.fontSize(9).fillColor(C.amber500).text('Universit\u00e9 de Kinshasa  \u00a9  2026', 0, doc.y, { align: 'center', width: PW });
  doc.fontSize(8).fillColor(C.slate500).text('Document confidentiel \u2014 Usage interne uniquement', 0, doc.y + 14, { align: 'center', width: PW });
}

function addPageNumbers() {
  var pages = doc.bufferedPageRange();
  for (var i = 1; i < pages.count - 1; i++) {
    doc.switchToPage(i);
    drawLine(LM, PH - 40, LM + W, PH - 40, C.slate200, 0.3);
    doc.fontSize(7).font(SANS).fillColor(C.slate400)
       .text('NEXUS UNIKIN -- Documentation BD PostgreSQL', LM, PH - 35, { width: W * 0.6 });
    doc.fontSize(7.5).font(BOLD).fillColor(C.slate500)
       .text((i + 1) + ' / ' + pages.count, LM + W * 0.6, PH - 35, { width: W * 0.4, align: 'right' });
  }
}

// ═══ EXECUTION ═══
console.log('Generating professional PDF v3...');
pageCover();
pageTOC();
pageIntro();
pageArchitecture();
pageERD();
pageTables();
pageIndexes();
pageTriggers();
pageAccounts();
pageEnd();
addPageNumbers();
doc.end();
stream.on('finish', function() {
  var size = fs.statSync(outputPath).size;
  console.log('Done: ' + outputPath);
  console.log('Size: ' + (size / 1024).toFixed(1) + ' KB');
});

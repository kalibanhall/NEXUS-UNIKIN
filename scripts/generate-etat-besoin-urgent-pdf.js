const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Configuration: 12pt = 12, 1.5 interligne
const FONT_SIZE = 12;
const LINE_HEIGHT = 1.5;
const MARGIN = 50;

const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true
});

const outputPath = path.join(__dirname, '..', 'contracts', 'ETAT_DE_BESOIN_URGENT_NEXUS.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Fonctions utilitaires
function setFont(bold = false, size = FONT_SIZE) {
    doc.font(bold ? 'Times-Bold' : 'Times-Roman').fontSize(size);
}

function writeLine(text, options = {}) {
    const { bold = false, size = FONT_SIZE, align = 'left', indent = 0 } = options;
    setFont(bold, size);
    doc.text(text, MARGIN + indent, undefined, { 
        align, 
        lineGap: FONT_SIZE * (LINE_HEIGHT - 1),
        width: 495 - indent
    });
}

function addSpace(lines = 1) {
    doc.moveDown(lines * LINE_HEIGHT);
}

function drawTable(headers, rows, colWidths) {
    const startX = MARGIN;
    const cellPadding = 5;
    const rowHeight = 25;
    let currentY = doc.y;
    
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    
    // En-têtes
    setFont(true, 10);
    let x = startX;
    headers.forEach((header, i) => {
        doc.rect(x, currentY, colWidths[i], rowHeight).stroke();
        doc.text(header, x + cellPadding, currentY + cellPadding, {
            width: colWidths[i] - cellPadding * 2,
            height: rowHeight - cellPadding * 2,
            align: 'left'
        });
        x += colWidths[i];
    });
    currentY += rowHeight;
    
    // Lignes
    setFont(false, 10);
    rows.forEach(row => {
        x = startX;
        const isBold = row.bold || false;
        const cells = row.cells || row;
        
        cells.forEach((cell, i) => {
            doc.rect(x, currentY, colWidths[i], rowHeight).stroke();
            setFont(isBold, 10);
            doc.text(cell, x + cellPadding, currentY + cellPadding, {
                width: colWidths[i] - cellPadding * 2,
                height: rowHeight - cellPadding * 2,
                align: 'left'
            });
            x += colWidths[i];
        });
        currentY += rowHeight;
    });
    
    doc.y = currentY + 10;
}

// ============== CONTENU DU DOCUMENT ==============

// TITRE
setFont(true, 18);
doc.text('ÉTAT DE BESOIN URGENT', MARGIN, MARGIN, { align: 'center', width: 495 });
addSpace(0.5);

setFont(true, 14);
doc.text('PROJET NEXUS UNIKIN - DÉMARRAGE IMMÉDIAT', { align: 'center', width: 495 });
addSpace(0.5);

// Ligne séparatrice
doc.moveTo(MARGIN, doc.y).lineTo(545, doc.y).stroke();
addSpace(0.5);

// Informations document
setFont(true, FONT_SIZE);
doc.text('Document N°: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('UNIKIN/NEXUS/EB-URG/2026/001');

setFont(true, FONT_SIZE);
doc.text('Date d\'établissement: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('15 janvier 2026');

setFont(true, FONT_SIZE);
doc.text('Référence contrat: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('UNIKIN/INFRA-NUM/2026/001');

setFont(true, FONT_SIZE);
doc.text('Priorité: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('URGENTE - Phase de démarrage');

addSpace(1);

// PRÉAMBULE
setFont(true, 14);
doc.text('PRÉAMBULE', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(false, FONT_SIZE);
doc.text('Le présent document définit les besoins essentiels et urgents nécessaires au démarrage immédiat du projet NEXUS UNIKIN. Cette liste représente le strict minimum pour lancer les opérations. Les autres éléments suivront dans une phase ultérieure.', {
    lineGap: FONT_SIZE * (LINE_HEIGHT - 1),
    width: 495
});

addSpace(1);

// SECTION 1
setFont(true, 14);
doc.text('SECTION 1 : ÉQUIPEMENTS INFORMATIQUES ESSENTIELS', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('1.1 Ordinateurs Portables (Performance optimale / Coût réduit)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Désignation', 'Spécifications', 'Qté', 'Prix unit.', 'Total'],
    [
        ['Laptop Développement', 'AMD Ryzen 5 5500U, 16GB RAM, SSD 512GB, 15.6"', '3', '450 USD', '1 350 USD'],
        ['Laptop Support/Admin', 'AMD Ryzen 3 5300U, 8GB RAM, SSD 256GB, 14"', '2', '320 USD', '640 USD'],
        { cells: ['SOUS-TOTAL LAPTOPS', '', '5', '', '1 990 USD'], bold: true }
    ],
    [100, 200, 35, 65, 75]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('Justification du choix :', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('• Marques recommandées: Lenovo IdeaPad, HP 250 G9, ASUS VivoBook', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });
doc.text('• Processeurs AMD Ryzen: Excellentes performances à moindre coût', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });
doc.text('• Disponibilité locale: Modèles disponibles chez les revendeurs de Kinshasa', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });
doc.text('• Garantie: S\'assurer d\'une garantie locale d\'au moins 1 an', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });

addSpace(1);

// SECTION 2
setFont(true, 14);
doc.text('SECTION 2 : CONNECTIVITÉ INTERNET', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('2.1 Option A : Connexion Fibre Optique (Recommandée si disponible)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Élément', 'Fournisseur', 'Spécification', 'Coût', 'Type'],
    [
        ['Connexion Fibre', 'Vodacom / Airtel', '20-30 Mbps min', '100/mois', 'Mensuel'],
        ['Frais installation', '-', 'Installation', '50', 'Unique'],
        { cells: ['SOUS-TOTAL A', '', '', '150 USD', 'Démarrage'], bold: true }
    ],
    [95, 95, 95, 65, 65]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('2.2 Option B : Solution 4G/LTE (Alternative immédiate)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Élément', 'Fournisseur', 'Spécification', 'Coût', 'Type'],
    [
        ['Routeur 4G/LTE', 'Huawei / TP-Link', 'WiFi, 4 ports ETH', '80', 'Achat'],
        ['Forfait Data', 'Vodacom / Airtel', '100-200GB/mois', '50-80/mois', 'Mensuel'],
        ['SIM supplémentaire', 'Autre opérateur', 'Backup', '30/mois', 'Mensuel'],
        { cells: ['SOUS-TOTAL B', '', '', '160-190 USD', 'Démarrage'], bold: true }
    ],
    [95, 95, 95, 70, 60]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('Recommandation: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('Commencer avec l\'Option B (4G/LTE) pour un démarrage immédiat, puis migrer vers la fibre optique. Garder le routeur 4G comme backup.', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), width: 495 });

// Nouvelle page
doc.addPage();

// SECTION 3
setFont(true, 14);
doc.text('SECTION 3 : ABONNEMENTS PREMIUM ESSENTIELS', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['N°', 'Service', 'Fournisseur', 'Description', 'Coût/mois', 'Coût/an'],
    [
        ['1', 'Hébergement Frontend', 'Vercel', 'Application web', '20 USD', '240 USD'],
        ['2', 'Base de données', 'Supabase', 'PostgreSQL + Auth', '25 USD', '300 USD'],
        ['3', 'Repository Git', 'GitHub', 'Code + CI/CD', '20 USD', '240 USD'],
        ['4', 'Domaine .cd', 'Registrar local', 'nexus-unikin.cd', '4 USD', '50 USD'],
        ['5', 'SSL + CDN', 'Cloudflare', 'Sécurité + Perf.', '20 USD', '240 USD'],
        ['6', 'Email pro', 'Google Workspace', '5 comptes email', '30 USD', '360 USD'],
        ['7', 'Stockage Cloud', 'Supabase', 'Documents (inclus)', '0 USD', '0 USD'],
        { cells: ['', 'TOTAL', '', '', '119 USD', '1 430 USD'], bold: true }
    ],
    [25, 100, 80, 95, 55, 60]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('Notes importantes :', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('• Vercel et Supabase offrent des plans gratuits généreux pour commencer', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });
doc.text('• Les plans gratuits peuvent couvrir les 2-3 premiers mois de développement', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });
doc.text('• Recommandation: Démarrer avec les plans gratuits puis upgrader selon les besoins', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1), indent: 15 });

addSpace(1);

// SECTION 4
setFont(true, 14);
doc.text('SECTION 4 : ACCESSOIRES MINIMUM', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Élément', 'Spécification', 'Qté', 'Prix unit.', 'Total'],
    [
        ['Souris sans fil', 'Logitech M185 ou équivalent', '5', '12 USD', '60 USD'],
        ['Multiprises parafoudre', '6 prises avec protection', '3', '18 USD', '54 USD'],
        ['Câbles Ethernet', 'Cat 6, 2-5m', '5', '5 USD', '25 USD'],
        ['Clés USB', '32GB USB 3.0', '5', '8 USD', '40 USD'],
        ['Casque avec micro', 'Pour réunions en ligne', '2', '20 USD', '40 USD'],
        { cells: ['SOUS-TOTAL ACCESSOIRES', '', '', '', '219 USD'], bold: true }
    ],
    [120, 145, 35, 55, 60]
);

addSpace(1);

// RÉCAPITULATIF
setFont(true, 14);
doc.text('RÉCAPITULATIF GÉNÉRAL - BUDGET URGENT', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Catégorie', 'Montant (USD)'],
    [
        ['1. Laptops (5 unités)', '1 990'],
        ['2. Internet (Option B - 4G/LTE - Setup)', '160'],
        ['3. Abonnements (3 premiers mois)', '357'],
        ['4. Accessoires minimum', '219'],
        { cells: ['TOTAL DÉMARRAGE URGENT', '2 726'], bold: true }
    ],
    [320, 95]
);

addSpace(0.5);
setFont(true, FONT_SIZE);
doc.text('Coûts récurrents mensuels (après démarrage):', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Poste', 'Montant mensuel (USD)'],
    [
        ['Internet (4G/LTE)', '80-110'],
        ['Abonnements Premium', '119'],
        { cells: ['TOTAL MENSUEL', '199-229'], bold: true }
    ],
    [320, 95]
);

addSpace(1);

// PRIORITÉS
setFont(true, 14);
doc.text('PRIORITÉS DE DÉPLOIEMENT', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('Phase 1 : Semaine 1 (Immédiat)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('✓ Acquisition des 5 laptops', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
doc.text('✓ Installation solution Internet 4G/LTE', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
doc.text('✓ Création comptes GitHub, Vercel, Supabase (gratuits)', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('Phase 2 : Semaine 2-3', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('✓ Achat domaine .cd', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
doc.text('✓ Configuration Google Workspace', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
doc.text('✓ Configuration Cloudflare', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('Phase 3 : Mois 2+', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('⏳ Upgrade vers abonnements Premium selon besoins', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
doc.text('⏳ Installation fibre optique (si disponible)', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
doc.text('⏳ Équipements complémentaires', { indent: 15, lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });

addSpace(1);

// SIGNATURES
setFont(true, 14);
doc.text('SIGNATURES', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Fonction', 'Nom', 'Date', 'Signature'],
    [
        ['Demandeur (Chef de projet)', '', '', ''],
        ['Responsable administratif', '', '', ''],
        ['Approbation UNIKIN', '', '', '']
    ],
    [150, 100, 80, 85]
);

addSpace(1);

// Pied de page
doc.moveTo(MARGIN, doc.y).lineTo(545, doc.y).stroke();
addSpace(0.5);

setFont(false, 11);
doc.text('Document établi à Kinshasa, le 15 janvier 2026', { align: 'center', width: 495, italics: true });
addSpace(0.3);
setFont(false, 10);
doc.text('Ce document représente les besoins URGENTS de démarrage. Un état de besoin complet sera soumis ultérieurement pour les équipements et services complémentaires.', { align: 'center', width: 495, italics: true });

// Finaliser
doc.end();

stream.on('finish', () => {
    console.log('Document PDF créé avec succès: ' + outputPath);
});

stream.on('error', (err) => {
    console.error('Erreur:', err);
});

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

const outputPath = path.join(__dirname, '..', 'contracts', 'ETAT_DE_BESOIN_BIBLIOTHEQUE_BIOMETRIQUE.pdf');
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

function checkPageBreak(requiredSpace = 100) {
    if (doc.y > 700 - requiredSpace) {
        doc.addPage();
    }
}

function drawTable(headers, rows, colWidths) {
    const startX = MARGIN;
    const cellPadding = 4;
    const rowHeight = 22;
    let currentY = doc.y;
    
    // Vérifier si on a besoin d'une nouvelle page
    const tableHeight = (rows.length + 1) * rowHeight;
    if (currentY + tableHeight > 750) {
        doc.addPage();
        currentY = doc.y;
    }
    
    // En-têtes
    setFont(true, 9);
    let x = startX;
    headers.forEach((header, i) => {
        doc.rect(x, currentY, colWidths[i], rowHeight).fillAndStroke('#f0f0f0', '#000');
        doc.fillColor('#000').text(header, x + cellPadding, currentY + cellPadding, {
            width: colWidths[i] - cellPadding * 2,
            height: rowHeight - cellPadding * 2,
            align: 'left'
        });
        x += colWidths[i];
    });
    currentY += rowHeight;
    
    // Lignes
    rows.forEach(row => {
        // Nouvelle page si nécessaire
        if (currentY + rowHeight > 750) {
            doc.addPage();
            currentY = MARGIN;
        }
        
        x = startX;
        const isBold = row.bold || false;
        const cells = row.cells || row;
        const bgColor = isBold ? '#e8e8e8' : '#fff';
        
        cells.forEach((cell, i) => {
            doc.rect(x, currentY, colWidths[i], rowHeight).fillAndStroke(bgColor, '#000');
            setFont(isBold, 9);
            doc.fillColor('#000').text(cell, x + cellPadding, currentY + cellPadding, {
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
doc.text('ÉTAT DE BESOIN', MARGIN, MARGIN, { align: 'center', width: 495 });
addSpace(0.3);

setFont(true, 14);
doc.text('SYSTÈME DE GESTION D\'ACCÈS BIOMÉTRIQUE', { align: 'center', width: 495 });
setFont(true, 12);
doc.text('BIBLIOTHÈQUE UNIKIN', { align: 'center', width: 495 });
addSpace(0.5);

// Ligne séparatrice
doc.moveTo(MARGIN, doc.y).lineTo(545, doc.y).stroke();
addSpace(0.5);

// Informations document
setFont(true, FONT_SIZE);
doc.text('Document N°: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('UNIKIN/NEXUS/EB-BIO/2026/001');

setFont(true, FONT_SIZE);
doc.text('Date d\'établissement: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('30 janvier 2026');

setFont(true, FONT_SIZE);
doc.text('Référence projet: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('NEXUS UNIKIN - Module Bibliothèque');

setFont(true, FONT_SIZE);
doc.text('Priorité: ', { continued: true });
setFont(false, FONT_SIZE);
doc.text('HAUTE - Sécurisation des accès');

addSpace(0.8);

// PRÉAMBULE
setFont(true, 14);
doc.text('PRÉAMBULE', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(false, FONT_SIZE);
doc.text('Le présent document définit les besoins matériels, logiciels et les coûts associés au déploiement d\'un système de gestion d\'accès biométrique par empreinte digitale pour la bibliothèque de l\'Université de Kinshasa (UNIKIN).', {
    lineGap: FONT_SIZE * (LINE_HEIGHT - 1),
    width: 495
});
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('Objectifs du système :', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('• Contrôler et sécuriser l\'accès à la bibliothèque universitaire', { indent: 15, lineGap: 4 });
doc.text('• Enregistrer automatiquement les entrées/sorties des utilisateurs', { indent: 15, lineGap: 4 });
doc.text('• Générer des statistiques de fréquentation en temps réel', { indent: 15, lineGap: 4 });
doc.text('• Intégrer les données avec le système NEXUS existant', { indent: 15, lineGap: 4 });
doc.text('• Lutter contre les accès non autorisés', { indent: 15, lineGap: 4 });

addSpace(1);

// SECTION 1 - STACK TECHNOLOGIQUE
setFont(true, 14);
doc.text('SECTION 1 : STACK TECHNOLOGIQUE RECOMMANDÉ', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('1.1 Backend / API', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Composant', 'Technologie', 'Justification'],
    [
        ['Langage serveur', 'Node.js / TypeScript', 'Cohérence avec NEXUS'],
        ['Framework API', 'Next.js API Routes', 'Intégration native frontend'],
        ['Base de données', 'PostgreSQL (Supabase)', 'Déjà en place sur NEXUS'],
        ['Cache', 'Redis', 'Sessions et temps réel'],
        ['ORM', 'Prisma', 'Typage fort et migrations']
    ],
    [100, 130, 185]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('1.2 Frontend / Interface', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Composant', 'Technologie', 'Justification'],
    [
        ['Framework', 'Next.js 14+', 'Cohérence avec NEXUS'],
        ['UI Components', 'Tailwind CSS + shadcn/ui', 'Design system unifié'],
        ['State Management', 'React Query / Zustand', 'Gestion état temps réel'],
        ['WebSocket', 'Socket.io', 'Notifications temps réel']
    ],
    [100, 130, 185]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('1.3 Système Biométrique', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Composant', 'Technologie', 'Justification'],
    [
        ['SDK Empreintes', 'SecuGen SDK', 'Standards industriels'],
        ['Communication', 'WebSocket / REST API', 'Intégration flexible'],
        ['Stockage empreintes', 'Templates chiffrés AES-256', 'Conformité RGPD'],
        ['Algorithme matching', 'ISO/IEC 19794-2', 'Standard international']
    ],
    [100, 130, 185]
);

// Nouvelle page
doc.addPage();

// SECTION 2 - ÉQUIPEMENTS
setFont(true, 14);
doc.text('SECTION 2 : ÉQUIPEMENTS MATÉRIELS', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('2.1 Lecteurs d\'Empreintes Digitales', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Désignation', 'Modèle', 'Qté', 'Prix unit.', 'Total'],
    [
        ['Lecteur entrée principale', 'SecuGen Hamster Pro 20', '2', '89 USD', '178 USD'],
        ['Lecteur sortie', 'SecuGen Hamster Pro 20', '2', '89 USD', '178 USD'],
        ['Lecteur enregistrement', 'SecuGen Hamster IV', '1', '75 USD', '75 USD'],
        ['Lecteur backup', 'SecuGen Hamster Pro 20', '1', '89 USD', '89 USD'],
        { cells: ['SOUS-TOTAL LECTEURS', '', '6', '', '520 USD'], bold: true }
    ],
    [110, 140, 30, 60, 60]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('2.2 Contrôleurs d\'Accès et Tourniquets', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Désignation', 'Spécifications', 'Qté', 'Prix unit.', 'Total'],
    [
        ['Tourniquet tripode', 'Acier inox, motorisé', '2', '450 USD', '900 USD'],
        ['Contrôleur tourniquet', '2 portes, TCP/IP, Wiegand', '2', '120 USD', '240 USD'],
        ['Bouton sortie urgence', 'Bris de glace, NO/NC', '2', '15 USD', '30 USD'],
        ['Alimentation 12V 5A', 'Avec backup batterie', '2', '35 USD', '70 USD'],
        { cells: ['SOUS-TOTAL ACCÈS', '', '', '', '1 240 USD'], bold: true }
    ],
    [110, 140, 30, 60, 60]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('2.3 Équipements Informatiques', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Désignation', 'Spécifications', 'Qté', 'Prix unit.', 'Total'],
    [
        ['Mini PC Serveur local', 'i5/Ryzen 5, 16GB, SSD 256GB', '1', '450 USD', '450 USD'],
        ['Écran tactile accueil', '15.6" Full HD, capacitif', '1', '280 USD', '280 USD'],
        ['Écran monitoring', '24" Full HD surveillance', '1', '150 USD', '150 USD'],
        ['Hub USB 3.0', '7 ports, alimentation externe', '2', '25 USD', '50 USD'],
        ['Onduleur UPS', '1500VA, 900W, 20min', '1', '180 USD', '180 USD'],
        { cells: ['SOUS-TOTAL INFORMATIQUE', '', '', '', '1 110 USD'], bold: true }
    ],
    [110, 140, 30, 60, 60]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('2.4 Réseau et Connectique', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Désignation', 'Spécifications', 'Qté', 'Prix unit.', 'Total'],
    [
        ['Switch PoE', '8 ports Gigabit, 4 PoE', '1', '85 USD', '85 USD'],
        ['Câbles Ethernet Cat6', '10m, blindés', '6', '8 USD', '48 USD'],
        ['Câbles USB 3.0', '3m, actifs', '6', '12 USD', '72 USD'],
        ['Goulottes et fixations', 'Kit complet installation', '1', '50 USD', '50 USD'],
        ['Routeur 4G backup', 'Huawei B535', '1', '80 USD', '80 USD'],
        { cells: ['SOUS-TOTAL RÉSEAU', '', '', '', '335 USD'], bold: true }
    ],
    [110, 140, 30, 60, 60]
);

// Nouvelle page
doc.addPage();

// SECTION 3 - LOGICIELS
setFont(true, 14);
doc.text('SECTION 3 : LOGICIELS ET LICENCES', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('3.1 Licences Logicielles', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Désignation', 'Éditeur', 'Type licence', 'Durée', 'Coût'],
    [
        ['SecuGen SDK', 'SecuGen', 'Dev + Runtime', 'Perpétuelle', '395 USD'],
        ['Windows 11 Pro', 'Microsoft', 'OEM (inclus PC)', 'Perpétuelle', '0 USD'],
        ['Antivirus Endpoint', 'Kaspersky/ESET', 'Business', '1 an', '45 USD'],
        { cells: ['TOTAL LICENCES', '', '', '', '440 USD'], bold: true }
    ],
    [100, 85, 80, 70, 60]
);

addSpace(0.3);
setFont(false, FONT_SIZE);
doc.text('Note: Les services cloud sont déjà couverts par l\'infrastructure NEXUS existante (Vercel, Supabase, Render).', {
    lineGap: FONT_SIZE * (LINE_HEIGHT - 1),
    width: 495
});

addSpace(0.8);

// SECTION 4 - INSTALLATION
setFont(true, 14);
doc.text('SECTION 4 : INSTALLATION ET DÉPLOIEMENT', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('4.1 Travaux d\'Installation', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Prestation', 'Description', 'Coût (USD)'],
    [
        ['Installation électrique', 'Prises dédiées, protection', '150'],
        ['Installation réseau', 'Câblage, goulottes', '100'],
        ['Montage tourniquets', 'Fixation sol, mise à niveau', '200'],
        ['Configuration système', 'Paramétrage complet', '150'],
        ['Formation personnel', '2 sessions de 3h', '100'],
        { cells: ['TOTAL INSTALLATION', '', '700'], bold: true }
    ],
    [150, 180, 85]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('4.2 Main d\'œuvre', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Profil', 'Durée', 'Tarif/jour', 'Total'],
    [
        ['Technicien électricien', '2 jours', '50 USD', '100 USD'],
        ['Technicien réseau', '1 jour', '50 USD', '50 USD'],
        ['Installateur tourniquets', '2 jours', '60 USD', '120 USD'],
        { cells: ['TOTAL MAIN D\'ŒUVRE', '', '', '270 USD'], bold: true }
    ],
    [150, 80, 80, 85]
);

// Nouvelle page
doc.addPage();

// SECTION 5 - RÉCAPITULATIF
setFont(true, 16);
doc.text('SECTION 5 : RÉCAPITULATIF GÉNÉRAL DES COÛTS', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.5);

setFont(true, 14);
doc.text('5.1 Investissement Initial (CAPEX)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Catégorie', 'Montant (USD)'],
    [
        ['1. Lecteurs d\'empreintes (6 unités)', '520'],
        ['2. Contrôleurs et tourniquets', '1 240'],
        ['3. Équipements informatiques', '1 110'],
        ['4. Réseau et connectique', '335'],
        ['5. Licences logicielles', '440'],
        ['6. Installation et travaux', '700'],
        ['7. Main d\'œuvre installation', '270'],
        { cells: ['TOTAL INVESTISSEMENT', '4 615'], bold: true }
    ],
    [300, 115]
);

addSpace(0.5);
setFont(true, 14);
doc.text('5.2 Coûts Récurrents Annuels (OPEX)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Poste', 'Montant annuel (USD)'],
    [
        ['Renouvellement antivirus', '45'],
        ['Maintenance préventive', '150'],
        ['Consommables (nettoyage capteurs)', '30'],
        ['Forfait Internet backup 4G', '360'],
        { cells: ['TOTAL ANNUEL', '585'], bold: true }
    ],
    [300, 115]
);

addSpace(0.5);
setFont(true, 14);
doc.text('5.3 Budget Total Première Année', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Élément', 'Montant (USD)'],
    [
        ['Investissement initial (CAPEX)', '4 615'],
        ['Coûts récurrents année 1 (OPEX)', '585'],
        ['Provision imprévus (10%)', '520'],
        { cells: ['TOTAL BUDGET ANNÉE 1', '5 720'], bold: true }
    ],
    [300, 115]
);

addSpace(1);

// Encadré récapitulatif
doc.rect(MARGIN, doc.y, 495, 80).fillAndStroke('#f5f5f5', '#333');
const boxY = doc.y;
setFont(true, 14);
doc.fillColor('#000').text('BUDGET TOTAL ESTIMÉ', MARGIN + 20, boxY + 15, { align: 'center', width: 455 });
setFont(true, 24);
doc.text('5 720 USD', MARGIN + 20, boxY + 40, { align: 'center', width: 455 });
doc.y = boxY + 90;

// Nouvelle page
doc.addPage();

// SECTION 6 - PLANNING
setFont(true, 14);
doc.text('SECTION 6 : PLANNING DE DÉPLOIEMENT', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('Phase 1 : Acquisition (Semaines 1-2)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('□ Validation budget et commande équipements', { indent: 15, lineGap: 4 });
doc.text('□ Achat lecteurs d\'empreintes', { indent: 15, lineGap: 4 });
doc.text('□ Achat équipements informatiques', { indent: 15, lineGap: 4 });
doc.text('□ Commande tourniquets', { indent: 15, lineGap: 4 });
addSpace(0.5);

setFont(true, FONT_SIZE);
doc.text('Phase 2 : Développement (Semaines 2-5)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('□ Développement API biométrique', { indent: 15, lineGap: 4 });
doc.text('□ Développement interfaces utilisateur', { indent: 15, lineGap: 4 });
doc.text('□ Tests en environnement de développement', { indent: 15, lineGap: 4 });
doc.text('□ Intégration avec NEXUS', { indent: 15, lineGap: 4 });
addSpace(0.5);

setFont(true, FONT_SIZE);
doc.text('Phase 3 : Installation (Semaines 5-6)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('□ Travaux électriques et réseau', { indent: 15, lineGap: 4 });
doc.text('□ Installation tourniquets', { indent: 15, lineGap: 4 });
doc.text('□ Montage et configuration équipements', { indent: 15, lineGap: 4 });
doc.text('□ Tests de fonctionnement', { indent: 15, lineGap: 4 });
addSpace(0.5);

setFont(true, FONT_SIZE);
doc.text('Phase 4 : Mise en Service (Semaine 7)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('□ Enregistrement empreintes personnel bibliothèque', { indent: 15, lineGap: 4 });
doc.text('□ Formation des agents', { indent: 15, lineGap: 4 });
doc.text('□ Période de test (1 semaine)', { indent: 15, lineGap: 4 });
doc.text('□ Mise en production', { indent: 15, lineGap: 4 });
addSpace(0.5);

setFont(true, FONT_SIZE);
doc.text('Phase 5 : Enregistrement Étudiants (Semaines 8-12)', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('□ Campagne d\'enregistrement par faculté', { indent: 15, lineGap: 4 });
doc.text('□ Support et assistance', { indent: 15, lineGap: 4 });
doc.text('□ Ajustements et optimisations', { indent: 15, lineGap: 4 });

addSpace(1);

// SECTION 7 - SPÉCIFICATIONS
setFont(true, 14);
doc.text('SECTION 7 : SPÉCIFICATIONS TECHNIQUES', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('7.1 Lecteur SecuGen Hamster Pro 20', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Caractéristique', 'Spécification'],
    [
        ['Résolution', '500 DPI'],
        ['Zone de capture', '16.26mm x 18.29mm'],
        ['Certification', 'FBI PIV, FIPS 201'],
        ['Interface', 'USB 2.0'],
        ['Protection', 'IP65 (poussière, eau)'],
        ['Température', '0°C à 40°C']
    ],
    [200, 215]
);

addSpace(0.3);
setFont(true, FONT_SIZE);
doc.text('7.2 Performances du Système', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.2);

drawTable(
    ['Paramètre', 'Valeur'],
    [
        ['Taux de faux rejet (FRR)', '< 0.1%'],
        ['Taux de fausse acceptation (FAR)', '< 0.001%'],
        ['Temps de matching 1:1', '< 0.5 seconde'],
        ['Temps de matching 1:N (10,000)', '< 1 seconde'],
        ['Capacité utilisateurs', 'Jusqu\'à 50,000'],
        ['Rétention logs', '5 ans']
    ],
    [200, 215]
);

// Nouvelle page - Signatures
doc.addPage();

// SECTION 8 - SÉCURITÉ
setFont(true, 14);
doc.text('SECTION 8 : SÉCURITÉ ET CONFORMITÉ', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

setFont(true, FONT_SIZE);
doc.text('Mesures de Sécurité :', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('• Chiffrement des templates : AES-256 au repos et en transit', { indent: 15, lineGap: 5 });
doc.text('• Authentification API : JWT avec rotation des clés', { indent: 15, lineGap: 5 });
doc.text('• Logs d\'audit : Traçabilité complète des accès', { indent: 15, lineGap: 5 });
doc.text('• Sauvegarde : Backup quotidien chiffré', { indent: 15, lineGap: 5 });
doc.text('• Anti-spoofing : Détection de faux doigts (silicone, etc.)', { indent: 15, lineGap: 5 });

addSpace(0.5);

setFont(true, FONT_SIZE);
doc.text('Conformité :', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
setFont(false, FONT_SIZE);
doc.text('• RGPD : Consentement explicite, droit à l\'effacement', { indent: 15, lineGap: 5 });
doc.text('• ISO 27001 : Bonnes pratiques sécurité de l\'information', { indent: 15, lineGap: 5 });
doc.text('• ISO/IEC 19794-2 : Format standard templates biométriques', { indent: 15, lineGap: 5 });

addSpace(1);

// SIGNATURES
setFont(true, 14);
doc.text('SECTION 9 : SIGNATURES ET APPROBATIONS', { lineGap: FONT_SIZE * (LINE_HEIGHT - 1) });
addSpace(0.3);

drawTable(
    ['Fonction', 'Nom', 'Date', 'Signature'],
    [
        ['Demandeur (Chef de projet NEXUS)', '', '', ''],
        ['Directeur Bibliothèque', '', '', ''],
        ['Responsable Informatique UNIKIN', '', '', ''],
        ['Responsable Finances UNIKIN', '', '', ''],
        ['Approbation Rectorat', '', '', '']
    ],
    [160, 100, 80, 75]
);

addSpace(1.5);

// Pied de page
doc.moveTo(MARGIN, doc.y).lineTo(545, doc.y).stroke();
addSpace(0.5);

setFont(false, 11);
doc.text('Document établi à Kinshasa, le 30 janvier 2026', { align: 'center', width: 495 });
addSpace(0.3);
setFont(false, 10);
doc.text('Ce document constitue l\'état de besoin pour le déploiement du système de gestion d\'accès biométrique de la bibliothèque universitaire de l\'UNIKIN.', { align: 'center', width: 495 });

// Finaliser
doc.end();

stream.on('finish', () => {
    console.log('✅ Document PDF créé avec succès: ' + outputPath);
});

stream.on('error', (err) => {
    console.error('❌ Erreur:', err);
});

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, convertInchesToTwip, PageBreak, ShadingType, TableLayoutType } = require('docx');
const fs = require('fs');
const path = require('path');

// Configuration
const FONT_SIZE = 24; // 12pt en half-points pour docx
const LINE_SPACING = 360; // 1.5 interligne (240 = 1.0)

async function createWordDocument() {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Times New Roman",
                        size: FONT_SIZE,
                    },
                    paragraph: {
                        spacing: {
                            line: LINE_SPACING,
                        },
                    },
                },
            },
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(0.8),
                        right: convertInchesToTwip(0.8),
                        bottom: convertInchesToTwip(0.8),
                        left: convertInchesToTwip(0.8),
                    },
                },
            },
            children: [
                // TITRE PRINCIPAL
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "ÉTAT DE BESOIN URGENT",
                            bold: true,
                            size: 36,
                            font: "Times New Roman",
                            allCaps: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 150 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "PROJET NEXUS UNIKIN - DÉMARRAGE IMMÉDIAT",
                            bold: true,
                            size: 28,
                            font: "Times New Roman",
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                
                // Ligne séparatrice
                new Paragraph({
                    children: [new TextRun({ text: "─".repeat(60), font: "Times New Roman", size: FONT_SIZE })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                
                // Informations du document
                createInfoParagraph("Document N°:", "UNIKIN/NEXUS/EB-URG/2026/001"),
                createInfoParagraph("Date d'établissement:", "15 janvier 2026"),
                createInfoParagraph("Référence contrat:", "UNIKIN/INFRA-NUM/2026/001"),
                createInfoParagraph("Priorité:", "URGENTE - Phase de démarrage"),
                
                new Paragraph({ children: [new TextRun({ text: "", font: "Times New Roman" })], spacing: { after: 300 } }),
                
                // PRÉAMBULE
                createHeading("PRÉAMBULE"),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Le présent document définit les besoins essentiels et urgents nécessaires au démarrage immédiat du projet NEXUS UNIKIN. Cette liste représente le strict minimum pour lancer les opérations. Les autres éléments suivront dans une phase ultérieure.",
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { line: LINE_SPACING, after: 300 },
                }),
                
                // SECTION 1
                createHeading("SECTION 1 : ÉQUIPEMENTS INFORMATIQUES ESSENTIELS"),
                createSubHeading("1.1 Ordinateurs Portables (Performance optimale / Coût réduit)"),
                
                createLaptopTable(),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Justification du choix :",
                            bold: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { before: 200, after: 100, line: LINE_SPACING },
                }),
                createBulletPoint("Marques recommandées: Lenovo IdeaPad, HP 250 G9, ASUS VivoBook"),
                createBulletPoint("Processeurs AMD Ryzen: Excellentes performances à moindre coût"),
                createBulletPoint("Disponibilité locale: Modèles disponibles chez les revendeurs de Kinshasa"),
                createBulletPoint("Garantie: S'assurer d'une garantie locale d'au moins 1 an"),
                
                // SECTION 2
                createHeading("SECTION 2 : CONNECTIVITÉ INTERNET"),
                createSubHeading("2.1 Option A : Connexion Fibre Optique (Recommandée si disponible)"),
                
                createInternetTableA(),
                
                createSubHeading("2.2 Option B : Solution 4G/LTE (Alternative immédiate)"),
                
                createInternetTableB(),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Recommandation: ",
                            bold: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                        new TextRun({
                            text: "Commencer avec l'Option B (4G/LTE) pour un démarrage immédiat, puis migrer vers la fibre optique une fois installée. Garder le routeur 4G comme backup.",
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { before: 200, after: 300, line: LINE_SPACING },
                }),
                
                // SECTION 3
                createHeading("SECTION 3 : ABONNEMENTS PREMIUM PLATEFORME (1 AN)"),
                createSubHeading("Liste consolidée des services cloud indispensables"),
                
                createAbonnementsTable(),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Notes importantes :",
                            bold: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { before: 200, after: 100, line: LINE_SPACING },
                }),
                createBulletPoint("Ces abonnements sont essentiels au fonctionnement de la plateforme"),
                createBulletPoint("SendGrid: notifications email (inscriptions, alertes)"),
                createBulletPoint("AWS S3: stockage des fichiers et images (photos, documents)"),
                createBulletPoint("Redis Cache: performances optimales pour sessions et données"),
                
                // RÉCAPITULATIF
                createHeading("RÉCAPITULATIF GÉNÉRAL - BUDGET URGENT"),
                
                createRecapTable(),
                
                // COÛTS RÉCURRENTS
                createSubHeading("Coûts récurrents mensuels (après démarrage)"),
                
                createRecurrentTable(),
                
                // PRIORITÉS
                createHeading("PRIORITÉS DE DÉPLOIEMENT"),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Phase 1 : Semaine 1 (Immédiat)",
                            bold: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { before: 200, after: 100, line: LINE_SPACING },
                }),
                createBulletPoint("✅ Acquisition des 5 laptops"),
                createBulletPoint("✅ Installation solution Internet 4G/LTE"),
                createBulletPoint("✅ Souscription aux abonnements Vercel, Supabase, Render"),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Phase 2 : Semaine 2-3",
                            bold: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { before: 200, after: 100, line: LINE_SPACING },
                }),
                createBulletPoint("✅ Achat domaine .cd"),
                createBulletPoint("✅ Configuration Cloudflare (SSL + CDN)"),
                createBulletPoint("✅ Configuration SendGrid"),
                createBulletPoint("✅ Configuration AWS S3 et Cloudinary"),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Phase 3 : Mois 2+",
                            bold: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    spacing: { before: 200, after: 100, line: LINE_SPACING },
                }),
                createBulletPoint("⏳ Monitoring et ajustement des ressources selon la charge"),
                createBulletPoint("⏳ Installation fibre optique (si disponible)"),
                createBulletPoint("⏳ Équipements complémentaires"),
                
                // SIGNATURES
                createHeading("SIGNATURES"),
                
                createSignatureTable(),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Document établi à Kinshasa, le 15 janvier 2026",
                            italics: true,
                            font: "Times New Roman",
                            size: FONT_SIZE,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 200, line: LINE_SPACING },
                }),
                
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Ce document représente les besoins URGENTS de démarrage. Un état de besoin complet sera soumis ultérieurement pour les équipements et services complémentaires.",
                            italics: true,
                            font: "Times New Roman",
                            size: 22,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { line: LINE_SPACING },
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(__dirname, '..', 'contracts', 'ETAT_DE_BESOIN_URGENT_NEXUS.docx'), buffer);
    console.log('Document Word créé avec succès!');
    return buffer;
}

function createInfoParagraph(label, value) {
    return new Paragraph({
        children: [
            new TextRun({
                text: label + " ",
                bold: true,
                font: "Times New Roman",
                size: FONT_SIZE,
            }),
            new TextRun({
                text: value,
                font: "Times New Roman",
                size: FONT_SIZE,
            }),
        ],
        spacing: { line: LINE_SPACING, after: 100 },
    });
}

function createHeading(text) {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: "1a365d",
            }),
        ],
        spacing: { before: 300, after: 150, line: LINE_SPACING },
        border: {
            bottom: { color: "1a365d", space: 1, size: 6, style: BorderStyle.SINGLE },
        },
    });
}

function createSubHeading(text) {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                bold: true,
                font: "Times New Roman",
                size: 22,
            }),
        ],
        spacing: { before: 200, after: 100, line: LINE_SPACING },
    });
}

function createBulletPoint(text) {
    return new Paragraph({
        children: [
            new TextRun({
                text: "• " + text,
                font: "Times New Roman",
                size: 22,
            }),
        ],
        spacing: { line: LINE_SPACING, after: 40 },
        indent: { left: convertInchesToTwip(0.3) },
    });
}

function createTableCell(text, bold = false, width = undefined, isHeader = false) {
    const cellOptions = {
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        bold: bold || isHeader,
                        font: "Times New Roman",
                        size: 20,
                    }),
                ],
                spacing: { line: 260 },
                alignment: AlignmentType.LEFT,
            }),
        ],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "333333" },
        },
        margins: {
            top: convertInchesToTwip(0.05),
            bottom: convertInchesToTwip(0.05),
            left: convertInchesToTwip(0.08),
            right: convertInchesToTwip(0.08),
        },
    };
    if (isHeader) {
        cellOptions.shading = { fill: "e8f0fe", type: ShadingType.CLEAR };
    }
    if (width) {
        cellOptions.width = { size: width, type: WidthType.PERCENTAGE };
    }
    return new TableCell(cellOptions);
}

function createHeaderCell(text) {
    return createTableCell(text, true, undefined, true);
}

function createLaptopTable() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("Désignation"),
                    createHeaderCell("Spécifications techniques"),
                    createHeaderCell("Qté"),
                    createHeaderCell("Prix unit. (USD)"),
                    createHeaderCell("Total (USD)"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Laptop Développement"),
                    createTableCell("Lenovo/HP/ASUS - AMD Ryzen 5 5500U, 16GB RAM, SSD 512GB, 15.6\" FHD"),
                    createTableCell("3"),
                    createTableCell("450"),
                    createTableCell("1 350"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Laptop Support/Admin"),
                    createTableCell("Lenovo/ASUS - AMD Ryzen 3 5300U, 8GB RAM, SSD 256GB, 14\""),
                    createTableCell("2"),
                    createTableCell("320"),
                    createTableCell("640"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("SOUS-TOTAL LAPTOPS", true),
                    createTableCell(""),
                    createTableCell("5", true),
                    createTableCell(""),
                    createTableCell("1 990", true),
                ],
            }),
        ],
    });
}

function createInternetTableA() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("Élément"),
                    createHeaderCell("Fournisseur"),
                    createHeaderCell("Spécification"),
                    createHeaderCell("Coût (USD)"),
                    createHeaderCell("Type"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Connexion Fibre"),
                    createTableCell("Vodacom / Airtel"),
                    createTableCell("20-30 Mbps minimum"),
                    createTableCell("100/mois"),
                    createTableCell("Mensuel"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Frais d'installation"),
                    createTableCell("-"),
                    createTableCell("Installation et activation"),
                    createTableCell("50"),
                    createTableCell("Unique"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("SOUS-TOTAL OPTION A", true),
                    createTableCell(""),
                    createTableCell(""),
                    createTableCell("150", true),
                    createTableCell("Démarrage"),
                ],
            }),
        ],
    });
}

function createInternetTableB() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("Élément"),
                    createHeaderCell("Fournisseur"),
                    createHeaderCell("Spécification"),
                    createHeaderCell("Coût (USD)"),
                    createHeaderCell("Type"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Routeur 4G/LTE"),
                    createTableCell("Huawei B535 / TP-Link"),
                    createTableCell("WiFi intégré, 4 ports Ethernet"),
                    createTableCell("80"),
                    createTableCell("Achat"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Forfait Data"),
                    createTableCell("Vodacom / Airtel / Orange"),
                    createTableCell("100GB - 200GB mensuel"),
                    createTableCell("50-80/mois"),
                    createTableCell("Mensuel"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("SIM supplémentaire"),
                    createTableCell("Autre opérateur"),
                    createTableCell("Backup en cas de panne"),
                    createTableCell("30/mois"),
                    createTableCell("Mensuel"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("SOUS-TOTAL OPTION B", true),
                    createTableCell(""),
                    createTableCell(""),
                    createTableCell("160-190", true),
                    createTableCell("Démarrage"),
                ],
            }),
        ],
    });
}

function createAbonnementsTable() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("N°"),
                    createHeaderCell("Service"),
                    createHeaderCell("Fournisseur"),
                    createHeaderCell("Plan"),
                    createHeaderCell("Coût/mois"),
                    createHeaderCell("Coût/an"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("1"),
                    createTableCell("Hébergement Frontend"),
                    createTableCell("Vercel"),
                    createTableCell("Pro"),
                    createTableCell("20"),
                    createTableCell("240"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("2"),
                    createTableCell("Hébergement Backend/API"),
                    createTableCell("Render"),
                    createTableCell("Pro"),
                    createTableCell("25"),
                    createTableCell("300"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("3"),
                    createTableCell("Base de données PostgreSQL"),
                    createTableCell("Supabase"),
                    createTableCell("Pro"),
                    createTableCell("25"),
                    createTableCell("300"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("4"),
                    createTableCell("Base de données Backup"),
                    createTableCell("Render PostgreSQL"),
                    createTableCell("Standard"),
                    createTableCell("20"),
                    createTableCell("240"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("5"),
                    createTableCell("Stockage fichiers/documents"),
                    createTableCell("AWS S3"),
                    createTableCell("Standard"),
                    createTableCell("25"),
                    createTableCell("300"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("6"),
                    createTableCell("Redis Cache"),
                    createTableCell("Render"),
                    createTableCell("Pro"),
                    createTableCell("15"),
                    createTableCell("180"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("7"),
                    createTableCell("SSL + CDN + DDoS"),
                    createTableCell("Cloudflare"),
                    createTableCell("Pro"),
                    createTableCell("20"),
                    createTableCell("240"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("8"),
                    createTableCell("Email transactionnel"),
                    createTableCell("SendGrid"),
                    createTableCell("Pro"),
                    createTableCell("90"),
                    createTableCell("1 080"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("9"),
                    createTableCell("Nom de domaine .cd"),
                    createTableCell("Registrar local"),
                    createTableCell("Standard"),
                    createTableCell("4"),
                    createTableCell("50"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("", true),
                    createTableCell("TOTAL ABONNEMENTS", true),
                    createTableCell(""),
                    createTableCell(""),
                    createTableCell("244", true),
                    createTableCell("2 930", true),
                ],
            }),
        ],
    });
}

function createRecapTable() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("Catégorie"),
                    createHeaderCell("Montant (USD)"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("1. Laptops (5 unités)"),
                    createTableCell("1 990"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("2. Internet (Option B - 4G/LTE - Setup)"),
                    createTableCell("160"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("3. Abonnements plateforme (1 an)"),
                    createTableCell("2 930"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("TOTAL DÉMARRAGE URGENT", true),
                    createTableCell("5 080", true),
                ],
            }),
        ],
    });
}

function createRecurrentTable() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("Poste"),
                    createHeaderCell("Montant mensuel (USD)"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Internet (4G/LTE)"),
                    createTableCell("80-110"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Abonnements Plateforme"),
                    createTableCell("244"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("TOTAL MENSUEL", true),
                    createTableCell("324-354", true),
                ],
            }),
        ],
    });
}

function createSignatureTable() {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    createHeaderCell("Fonction"),
                    createHeaderCell("Nom"),
                    createHeaderCell("Date"),
                    createHeaderCell("Signature"),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Demandeur (Chef de projet)"),
                    createTableCell(""),
                    createTableCell(""),
                    createTableCell(""),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Responsable administratif"),
                    createTableCell(""),
                    createTableCell(""),
                    createTableCell(""),
                ],
            }),
            new TableRow({
                children: [
                    createTableCell("Approbation UNIKIN"),
                    createTableCell(""),
                    createTableCell(""),
                    createTableCell(""),
                ],
            }),
        ],
    });
}

// Exécution
createWordDocument()
    .then(() => console.log('Génération terminée!'))
    .catch(err => console.error('Erreur:', err));

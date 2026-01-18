# ÉTAT DE BESOIN URGENT
## PROJET NEXUS UNIKIN - DÉMARRAGE IMMÉDIAT

---

**Document N°:** UNIKIN/NEXUS/EB-URG/2026/001

**Date d'établissement:** 15 janvier 2026

**Référence contrat:** UNIKIN/INFRA-NUM/2026/001

**Priorité:** URGENTE - Phase de démarrage

---

## PRÉAMBULE

Le présent document définit les besoins **essentiels et urgents** nécessaires au démarrage immédiat du projet NEXUS UNIKIN. Cette liste représente le strict minimum pour lancer les opérations. Les autres éléments suivront dans une phase ultérieure.

---

# SECTION 1 : ÉQUIPEMENTS INFORMATIQUES ESSENTIELS

## 1.1 Ordinateurs Portables (Performance optimale / Coût réduit)

| Désignation | Spécifications techniques | Qté | Prix unit. (USD) | Total (USD) |
|-------------|---------------------------|-----|------------------|-------------|
| **Laptop Développement** | Lenovo IdeaPad 3 / HP 250 G9 - AMD Ryzen 5 5500U, 16GB RAM, SSD 512GB, Écran 15.6" FHD | 3 | 450 | 1 350 |
| **Laptop Support/Admin** | Lenovo IdeaPad 3 / ASUS VivoBook - AMD Ryzen 3 5300U, 8GB RAM, SSD 256GB, Écran 14" | 2 | 320 | 640 |
| **SOUS-TOTAL LAPTOPS** | | **5** | | **1 990** |

### Justification du choix :
- **Marques recommandées:** Lenovo IdeaPad, HP 250 G9, ASUS VivoBook (meilleur rapport qualité/prix)
- **Processeurs AMD Ryzen:** Excellentes performances à moindre coût par rapport aux Intel équivalents
- **Disponibilité locale:** Ces modèles sont généralement disponibles chez les revendeurs de Kinshasa
- **Garantie:** S'assurer d'une garantie locale d'au moins 1 an

---

# SECTION 2 : CONNECTIVITÉ INTERNET

## 2.1 Option A : Connexion Fibre Optique (Recommandée si disponible)

| Élément | Fournisseur | Spécification | Coût (USD) | Type |
|---------|-------------|---------------|------------|------|
| Connexion Fibre | Vodacom / Airtel | 20-30 Mbps minimum | 100/mois | Mensuel |
| Frais d'installation | - | Installation et activation | 50 | Unique |
| **SOUS-TOTAL OPTION A** | | | **150** | *Démarrage* |

## 2.2 Option B : Solution 4G/LTE (Alternative immédiate)

| Élément | Fournisseur | Spécification | Coût (USD) | Type |
|---------|-------------|---------------|------------|------|
| Routeur 4G/LTE | Huawei B535 / TP-Link | WiFi intégré, 4 ports Ethernet | 80 | Achat |
| Forfait Data | Vodacom / Airtel / Orange | 100GB - 200GB mensuel | 50-80/mois | Mensuel |
| SIM supplémentaire | Autre opérateur | Backup en cas de panne réseau | 30/mois | Mensuel |
| **SOUS-TOTAL OPTION B** | | | **160-190** | *Démarrage* |

### Recommandation :
> **Solution hybride conseillée pour le démarrage :** Commencer avec l'Option B (4G/LTE) pour un démarrage immédiat, puis migrer vers la fibre optique une fois installée. Garder le routeur 4G comme backup.

---

# SECTION 3 : ABONNEMENTS PREMIUM PLATEFORME (1 AN)

## Liste consolidée des services cloud indispensables

| N° | Service | Fournisseur | Plan | Coût mensuel (USD) | Coût annuel (USD) |
|----|---------|-------------|------|-------------------|-------------------|
| 1 | **Hébergement Frontend** | Vercel | Pro | 20 | 240 |
| 2 | **Hébergement Backend/API** | Render | Pro | 25 | 300 |
| 3 | **Base de données PostgreSQL** | Supabase | Pro | 25 | 300 |
| 4 | **Base de données Backup** | Render PostgreSQL | Standard | 20 | 240 |
| 5 | **Stockage fichiers/documents** | AWS S3 | Standard | 25 | 300 |
| 6 | **Redis Cache** | Render | Pro | 15 | 180 |
| 7 | **SSL + CDN + DDoS Protection** | Cloudflare | Pro | 20 | 240 |
| 8 | **Email transactionnel** | SendGrid | Pro | 90 | 1 080 |
| 9 | **Nom de domaine .cd** | Registrar local | Standard | 4 | 50 |
| | **TOTAL ABONNEMENTS** | | | **244** | **2 930** |

### Notes importantes :
- Ces abonnements sont **essentiels au fonctionnement de la plateforme**
- **SendGrid** : nécessaire pour les notifications par email (inscriptions, réinitialisations, alertes)
- **AWS S3** : stockage des fichiers et images (photos étudiants, documents scannés)
- **Redis Cache** : performances optimales pour les sessions et données fréquentes

---

# RÉCAPITULATIF GÉNÉRAL - BUDGET URGENT

## Tableau de synthèse

| Catégorie | Montant (USD) |
|-----------|---------------|
| **1. Laptops (5 unités)** | 1 990 |
| **2. Internet (Option B - 4G/LTE - Setup)** | 160 |
| **3. Abonnements plateforme (1 an)** | 2 930 |
| **TOTAL DÉMARRAGE URGENT** | **5 080** |

---

## Coûts récurrents mensuels (après démarrage)

| Poste | Montant mensuel (USD) |
|-------|----------------------|
| Internet (4G/LTE) | 80-110 |
| Abonnements Plateforme | 244 |
| **TOTAL MENSUEL** | **324-354** |

---

# PRIORITÉS DE DÉPLOIEMENT

## Phase 1 : Semaine 1 (Immédiat)
1. ✅ Acquisition des 5 laptops
2. ✅ Installation solution Internet 4G/LTE
3. ✅ Souscription aux abonnements Vercel, Supabase, Render

## Phase 2 : Semaine 2-3
1. ✅ Achat domaine .cd
2. ✅ Configuration Cloudflare (SSL + CDN)
3. ✅ Configuration SendGrid
4. ✅ Configuration AWS S3

## Phase 3 : Mois 2+
1. ⏳ Monitoring et ajustement des ressources selon la charge
2. ⏳ Installation fibre optique (si disponible)
3. ⏳ Équipements complémentaires

---

## SIGNATURES

| Fonction | Nom | Date | Signature |
|----------|-----|------|-----------|
| **Demandeur (Chef de projet)** | | | |
| **Responsable administratif** | | | |
| **Approbation UNIKIN** | | | |

---

*Document établi à Kinshasa, le 15 janvier 2026*

*Ce document représente les besoins URGENTS de démarrage. Un état de besoin complet sera soumis ultérieurement pour les équipements et services complémentaires.*

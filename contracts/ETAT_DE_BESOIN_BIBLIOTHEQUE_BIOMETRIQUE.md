# ÉTAT DE BESOIN
## SYSTÈME DE GESTION D'ACCÈS BIOMÉTRIQUE - BIBLIOTHÈQUE UNIKIN

---

**Document N°:** UNIKIN/NEXUS/EB-BIO/2026/001

**Date d'établissement:** 30 janvier 2026

**Référence projet:** NEXUS UNIKIN - Module Bibliothèque

**Priorité:** HAUTE - Sécurisation des accès

---

## PRÉAMBULE

Le présent document définit les besoins matériels, logiciels et les coûts associés au déploiement d'un système de gestion d'accès biométrique par empreinte digitale pour la bibliothèque de l'Université de Kinshasa (UNIKIN). Ce système permettra de :

- Contrôler et sécuriser l'accès à la bibliothèque universitaire
- Enregistrer automatiquement les entrées/sorties des utilisateurs
- Générer des statistiques de fréquentation en temps réel
- Intégrer les données avec le système NEXUS existant
- Lutter contre les accès non autorisés

---

# SECTION 1 : ARCHITECTURE TECHNIQUE PROPOSÉE

## 1.1 Stack Technologique Recommandé

### Backend / API
| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Langage serveur** | Node.js / TypeScript | Cohérence avec l'écosystème NEXUS existant |
| **Framework API** | Next.js API Routes | Intégration native avec le frontend |
| **Base de données** | PostgreSQL (Supabase) | Déjà en place sur NEXUS |
| **Cache** | Redis | Sessions et données temps réel |
| **ORM** | Prisma | Typage fort et migrations |

### Frontend / Interface
| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Framework** | Next.js 14+ | Cohérence avec NEXUS |
| **UI Components** | Tailwind CSS + shadcn/ui | Design system unifié |
| **State Management** | React Query / Zustand | Gestion état temps réel |
| **WebSocket** | Socket.io | Notifications temps réel |

### Système Biométrique
| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **SDK Empreintes** | SecuGen SDK / Digital Persona | Standards industriels |
| **Communication** | WebSocket / REST API | Intégration flexible |
| **Stockage empreintes** | Templates chiffrés (AES-256) | Conformité RGPD |
| **Algorithme matching** | ISO/IEC 19794-2 | Standard international |

### Infrastructure
| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Serveur local** | Mini PC industriel | Fiabilité 24/7 |
| **Réseau** | LAN Ethernet + WiFi backup | Redondance |
| **Alimentation** | UPS / Onduleur | Continuité service |

---

# SECTION 2 : ÉQUIPEMENTS MATÉRIELS

## 2.1 Lecteurs d'Empreintes Digitales

| Désignation | Modèle recommandé | Spécifications | Qté | Prix unit. (USD) | Total (USD) |
|-------------|-------------------|----------------|-----|------------------|-------------|
| **Lecteur entrée principale** | SecuGen Hamster Pro 20 | USB, 500 DPI, FBI certified, IP65 | 2 | 89 | 178 |
| **Lecteur sortie** | SecuGen Hamster Pro 20 | USB, 500 DPI, FBI certified, IP65 | 2 | 89 | 178 |
| **Lecteur enregistrement** | SecuGen Hamster IV | USB, 500 DPI, Haute précision | 1 | 75 | 75 |
| **Lecteur backup** | SecuGen Hamster Pro 20 | Spare unit | 1 | 89 | 89 |
| **SOUS-TOTAL LECTEURS** | | | **6** | | **520** |

### Alternatives économiques :
- **ZKTeco ZK4500** : 45-55 USD/unité (qualité acceptable)
- **Futronic FS80H** : 65-70 USD/unité (bon rapport qualité/prix)

## 2.2 Contrôleurs d'Accès et Tourniquets

| Désignation | Spécifications | Qté | Prix unit. (USD) | Total (USD) |
|-------------|----------------|-----|------------------|-------------|
| **Tourniquet tripode** | Acier inox, passage 550mm, motorisé | 2 | 450 | 900 |
| **Contrôleur tourniquet** | 2 portes, TCP/IP, Wiegand | 2 | 120 | 240 |
| **Bouton de sortie urgence** | Bris de glace, NO/NC | 2 | 15 | 30 |
| **Alimentation 12V 5A** | Avec backup batterie | 2 | 35 | 70 |
| **SOUS-TOTAL ACCÈS** | | | | **1 240** |

## 2.3 Équipements Informatiques

| Désignation | Spécifications | Qté | Prix unit. (USD) | Total (USD) |
|-------------|----------------|-----|------------------|-------------|
| **Mini PC Serveur local** | Intel i5/Ryzen 5, 16GB RAM, SSD 256GB, Windows 11 Pro | 1 | 450 | 450 |
| **Écran tactile accueil** | 15.6" Full HD, capacitif, support VESA | 1 | 280 | 280 |
| **Écran monitoring** | 24" Full HD pour poste surveillance | 1 | 150 | 150 |
| **Hub USB 3.0** | 7 ports, alimentation externe | 2 | 25 | 50 |
| **Onduleur UPS** | 1500VA, 900W, autonomie 20min | 1 | 180 | 180 |
| **SOUS-TOTAL INFORMATIQUE** | | | | **1 110** |

## 2.4 Réseau et Connectique

| Désignation | Spécifications | Qté | Prix unit. (USD) | Total (USD) |
|-------------|----------------|-----|------------------|-------------|
| **Switch PoE** | 8 ports Gigabit, 4 PoE | 1 | 85 | 85 |
| **Câbles Ethernet Cat6** | 10m, blindés | 6 | 8 | 48 |
| **Câbles USB 3.0** | 3m, actifs | 6 | 12 | 72 |
| **Goulottes et fixations** | Kit complet installation | 1 | 50 | 50 |
| **Routeur 4G backup** | Huawei B535 | 1 | 80 | 80 |
| **SOUS-TOTAL RÉSEAU** | | | | **335** |

---

# SECTION 3 : LOGICIELS ET LICENCES

## 3.1 Licences Logicielles

| Désignation | Éditeur | Type licence | Durée | Coût (USD) |
|-------------|---------|--------------|-------|------------|
| **SecuGen SDK** | SecuGen | Développeur + Runtime | Perpétuelle | 395 |
| **Windows 11 Pro** | Microsoft | OEM (inclus Mini PC) | Perpétuelle | 0 |
| **Antivirus Endpoint** | Kaspersky/ESET | Business | 1 an | 45 |
| **TOTAL LICENCES** | | | | **440** |

### Note sur les SDK :
- SecuGen offre un SDK gratuit pour le développement
- La licence runtime est nécessaire pour le déploiement commercial
- Alternative open-source : libfprint (Linux uniquement)

## 3.2 Services Cloud (Intégration NEXUS)

| Service | Fournisseur | Description | Coût mensuel (USD) | Coût annuel (USD) |
|---------|-------------|-------------|-------------------|-------------------|
| **API Biométrique** | Hébergé sur Render (existant) | Endpoints dédiés | 0 (inclus) | 0 |
| **Stockage Templates** | Supabase (existant) | Base données chiffrée | 0 (inclus) | 0 |
| **Notifications Push** | Firebase | Alertes temps réel | 0 (gratuit) | 0 |
| **TOTAL CLOUD** | | | **0** | **0** |

*Les services cloud sont déjà couverts par l'infrastructure NEXUS existante.*

---

# SECTION 4 : DÉVELOPPEMENT ET INTÉGRATION

## 4.1 Modules à Développer

| Module | Description | Estimation (jours) |
|--------|-------------|-------------------|
| **API Biométrique** | Endpoints enregistrement, vérification, matching | 5 |
| **Interface Enregistrement** | Capture empreintes, association utilisateur | 3 |
| **Interface Borne** | Écran tactile entrée/sortie | 3 |
| **Dashboard Monitoring** | Statistiques temps réel, alertes | 4 |
| **Module Rapports** | Génération rapports fréquentation | 3 |
| **Intégration NEXUS** | Connexion système existant | 3 |
| **Tests et QA** | Tests unitaires, intégration, UAT | 4 |
| **TOTAL** | | **25 jours** |

## 4.2 Coûts de Développement (Non inclus - Équipe interne NEXUS)

Le développement sera réalisé par l'équipe NEXUS existante dans le cadre du contrat en cours.

---

# SECTION 5 : INSTALLATION ET DÉPLOIEMENT

## 5.1 Travaux d'Installation

| Prestation | Description | Coût (USD) |
|------------|-------------|------------|
| **Installation électrique** | Prises dédiées, protection | 150 |
| **Installation réseau** | Câblage, goulottes | 100 |
| **Montage tourniquets** | Fixation sol, mise à niveau | 200 |
| **Configuration système** | Paramétrage complet | 150 |
| **Formation personnel** | 2 sessions de 3h | 100 |
| **TOTAL INSTALLATION** | | **700** |

## 5.2 Main d'œuvre

| Profil | Durée | Tarif/jour (USD) | Total (USD) |
|--------|-------|------------------|-------------|
| **Technicien électricien** | 2 jours | 50 | 100 |
| **Technicien réseau** | 1 jour | 50 | 50 |
| **Installateur tourniquets** | 2 jours | 60 | 120 |
| **TOTAL MAIN D'ŒUVRE** | | | **270** |

---

# SECTION 6 : RÉCAPITULATIF GÉNÉRAL DES COÛTS

## 6.1 Investissement Initial (CAPEX)

| Catégorie | Montant (USD) |
|-----------|---------------|
| **1. Lecteurs d'empreintes (6 unités)** | 520 |
| **2. Contrôleurs et tourniquets** | 1 240 |
| **3. Équipements informatiques** | 1 110 |
| **4. Réseau et connectique** | 335 |
| **5. Licences logicielles** | 440 |
| **6. Installation et travaux** | 700 |
| **7. Main d'œuvre installation** | 270 |
| **TOTAL INVESTISSEMENT** | **4 615** |

## 6.2 Coûts Récurrents Annuels (OPEX)

| Poste | Montant annuel (USD) |
|-------|---------------------|
| **Renouvellement antivirus** | 45 |
| **Maintenance préventive** | 150 |
| **Consommables (nettoyage capteurs)** | 30 |
| **Forfait Internet backup 4G** | 360 |
| **TOTAL ANNUEL** | **585** |

## 6.3 Budget Total Première Année

| Élément | Montant (USD) |
|---------|---------------|
| **Investissement initial (CAPEX)** | 4 615 |
| **Coûts récurrents année 1 (OPEX)** | 585 |
| **Provision imprévus (10%)** | 520 |
| **TOTAL BUDGET ANNÉE 1** | **5 720** |

---

# SECTION 7 : PLANNING DE DÉPLOIEMENT

## Phase 1 : Acquisition (Semaines 1-2)
- [ ] Validation budget et commande équipements
- [ ] Achat lecteurs d'empreintes
- [ ] Achat équipements informatiques
- [ ] Commande tourniquets

## Phase 2 : Développement (Semaines 2-5)
- [ ] Développement API biométrique
- [ ] Développement interfaces utilisateur
- [ ] Tests en environnement de développement
- [ ] Intégration avec NEXUS

## Phase 3 : Installation (Semaines 5-6)
- [ ] Travaux électriques et réseau
- [ ] Installation tourniquets
- [ ] Montage et configuration équipements
- [ ] Tests de fonctionnement

## Phase 4 : Mise en Service (Semaine 7)
- [ ] Enregistrement empreintes personnel bibliothèque
- [ ] Formation des agents
- [ ] Période de test (1 semaine)
- [ ] Mise en production

## Phase 5 : Enregistrement Étudiants (Semaines 8-12)
- [ ] Campagne d'enregistrement par faculté
- [ ] Support et assistance
- [ ] Ajustements et optimisations

---

# SECTION 8 : SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES

## 8.1 Lecteur SecuGen Hamster Pro 20

| Caractéristique | Spécification |
|-----------------|---------------|
| **Résolution** | 500 DPI |
| **Zone de capture** | 16.26mm x 18.29mm |
| **Surface capteur** | 18mm x 25mm |
| **Certification** | FBI PIV, FIPS 201 |
| **Interface** | USB 2.0 |
| **Protection** | IP65 (poussière, eau) |
| **Température** | 0°C à 40°C |
| **SDK** | Windows, Linux, Android |

## 8.2 Algorithme de Matching

| Paramètre | Valeur |
|-----------|--------|
| **Taux de faux rejet (FRR)** | < 0.1% |
| **Taux de fausse acceptation (FAR)** | < 0.001% |
| **Temps de matching 1:1** | < 0.5 seconde |
| **Temps de matching 1:N (10,000)** | < 1 seconde |
| **Taille template** | 400 bytes |

## 8.3 Capacités du Système

| Métrique | Capacité |
|----------|----------|
| **Utilisateurs enregistrés** | Jusqu'à 50,000 |
| **Empreintes par utilisateur** | 2 (index gauche + droit) |
| **Transactions par jour** | Illimité |
| **Rétention logs** | 5 ans |
| **Backup automatique** | Quotidien |

---

# SECTION 9 : SÉCURITÉ ET CONFORMITÉ

## 9.1 Mesures de Sécurité

- **Chiffrement des templates** : AES-256 au repos et en transit
- **Authentification API** : JWT avec rotation des clés
- **Logs d'audit** : Traçabilité complète des accès
- **Sauvegarde** : Backup quotidien chiffré
- **Anti-spoofing** : Détection de faux doigts (silicone, etc.)

## 9.2 Conformité

- **RGPD** : Consentement explicite, droit à l'effacement
- **ISO 27001** : Bonnes pratiques sécurité de l'information
- **ISO/IEC 19794-2** : Format standard templates biométriques

---

# SECTION 10 : SIGNATURES ET APPROBATIONS

| Fonction | Nom | Date | Signature |
|----------|-----|------|-----------|
| **Demandeur (Chef de projet NEXUS)** | | | |
| **Directeur Bibliothèque** | | | |
| **Responsable Informatique UNIKIN** | | | |
| **Responsable Finances UNIKIN** | | | |
| **Approbation Rectorat** | | | |

---

*Document établi à Kinshasa, le 30 janvier 2026*

*Ce document constitue l'état de besoin pour le déploiement du système de gestion d'accès biométrique de la bibliothèque universitaire de l'UNIKIN.*

---

## ANNEXES

### Annexe A : Schéma d'Architecture
*À joindre séparément*

### Annexe B : Plan d'implantation
*À joindre séparément*

### Annexe C : Références Fournisseurs
- SecuGen : www.secugen.com
- ZKTeco : www.zkteco.com
- Futronic : www.futronic-tech.com

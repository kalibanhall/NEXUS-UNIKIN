# CALENDRIER DE DÉPLOIEMENT MIS À JOUR

## NEXUS UNIKIN — État d'avancement et planification opérationnelle

**Institution :** Université de Kinshasa (UNIKIN)  
**Début effectif du projet :** Jeudi 30 Janvier 2026  
**Date de mise à jour :** Vendredi 13 Février 2026  
**Échéance finale :** Mercredi 30 Avril 2026 (3 mois)  
**Plateforme :** http://94.72.97.228 (VPS en ligne)  

---

## 📊 BILAN AU 13 FÉVRIER 2026 — CE QUI A ÉTÉ ACCOMPLI

### Phase 1 : Infrastructure et mise en ligne ✅ (Semaine 1 — 30 jan. – 2 fév.)

| Élément | Statut | Détail |
|---------|--------|--------|
| Serveur VPS provisionné | ✅ Fait | Serveur IP 94.72.97.228, Ubuntu, 3 Go RAM |
| Plateforme déployée en ligne | ✅ Fait | Next.js 14 + PostgreSQL + PM2 + Nginx |
| Base de données configurée | ✅ Fait | 16 tables, schéma complet opérationnel |
| Système d'authentification | ✅ Fait | JWT, sessions sécurisées, gestion des rôles |
| Compte Super Admin créé | ✅ Fait | Accès total à l'administration |

### Phase 2 : Intégration des données ✅ (Semaines 2-3 — 3 fév. – 12 fév.)

| Élément | Quantité | Statut |
|---------|----------|--------|
| **Étudiants intégrés** | **50 407** | ✅ Importés avec matricules |
| **Facultés encodées** | **15** | ✅ Toutes les facultés UNIKIN |
| **Départements encodés** | **134** | ✅ Tous les départements |
| **Promotions créées** | **503** | ✅ L0 à D4, tous niveaux |
| **Paiements importés** | **93 349** | ✅ USD + CDF, 2024-2025 et 2025-2026 |
| **Années académiques** | **2** | ✅ 2024-2025 et 2025-2026 |
| **Identifiants attribués** | **50 407** | ✅ Email: matricule@unikin.ac.cd |
| **Passerelle d'activation** | **Opérationnelle** | ✅ Activation par matricule + création de mot de passe |
| **Comptes activés à ce jour** | **2** | ⏳ Début campagne S4 |

### Phase 3 : Modules fonctionnels ✅ (Semaines 2-3)

| Module | Statut |
|--------|--------|
| Tableau de bord étudiant (données réelles) | ✅ Fait |
| Tableau de bord enseignant | ✅ Fait |
| Tableau de bord admin | ✅ Fait |
| Gestion des finances (grille tarifaire dynamique) | ✅ Fait |
| Gestion des notes et délibérations | ✅ Fait |
| Système de présences (codes de validation) | ✅ Fait |
| Gestion des évaluations | ✅ Fait |
| Emploi du temps | ✅ Fait |
| Messagerie interne | ✅ Fait |
| Bibliothèque numérique | ✅ Fait |
| 11 corrections UI/UX déployées | ✅ Fait |

---

## 📋 DÉTAIL DES 15 FACULTÉS PAR EFFECTIF

| # | Faculté | Abrév. | Départ. | Promot. | Étudiants | Semaine |
|---|---------|--------|---------|---------|-----------|---------|
| 1 | Faculté de Droit | FDROIT | 8 | 29 | 10 823 | S4 (16-20 fév.) |
| 2 | Faculté des Sciences Économiques et de Gestion | FSEG | 21 | 59 | 8 530 | S4 (16-20 fév.) |
| 3 | Faculté de Médecine | FMED | 7 | 30 | 6 525 | S4 (16-20 fév.) |
| 4 | Faculté des Sciences et Technologies | FST | 13 | 48 | 4 758 | S5 (23-27 fév.) |
| 5 | Faculté de Psychologie et Sciences de l'Éducation | FPSE | 6 | 23 | 3 005 | S5 (23-27 fév.) |
| 6 | Faculté des Sciences Sociales, Admin. et Politiques | FSSAP | 5 | 19 | 2 990 | S5 (23-27 fév.) |
| 7 | Faculté des Lettres et Sciences Humaines | FLSH | 26 | 67 | 2 268 | S6 (2-6 mars) |
| 8 | Faculté de Médecine Dentaire | FMEDD | 3 | 21 | 1 554 | S6 (2-6 mars) |
| 9 | Faculté des Sciences Agronomiques et Environnement | FSAE | 16 | 68 | 1 510 | S6 (2-6 mars) |
| 10 | Faculté des Sciences Pharmaceutiques | FSPHAR | 2 | 18 | 1 197 | S7 (9-13 mars) |
| 11 | Faculté de Pétrole, Gaz et Énergies Renouvelables | FPGER | 8 | 65 | 850 | S7 (9-13 mars) |
| 12 | Faculté Polytechnique | FPOLY | 12 | 34 | 744 | S7 (9-13 mars) |
| 13 | Faculté de Médecine Vétérinaire | FMEDV | 5 | 20 | 170 | S8 (16-18 mars) |
| 14 | École des Sc. de la Population et Développement | ESPD | 2 | 2 | 12 | S8 (16-18 mars) |
| 15 | Faculté des Sciences | FSC | 0 | 0 | 0 | S8 (16-18 mars) |
| | **TOTAL** | | **134** | **503** | **50 407** | |

---

## 🗓️ PLANIFICATION DÉTAILLÉE — SEMAINES 4 À 13

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 4 — Lundi 16 au Vendredi 20 Février 2026
### Facultés : DROIT (10 823) • FSEG (8 530) • MÉDECINE (6 525)
### → 25 878 étudiants concernés (51% du total)
### ═══════════════════════════════════════════════════════

#### 🔵 Lundi 16 Février — Formation des points focaux

| Horaire | Action | Public cible |
|---------|--------|-------------|
| 8h00 – 10h00 | **Briefing d'ouverture** — Présentation de NEXUS aux doyens et vice-doyens des 3 facultés | Doyens, Vice-Doyens (6-9 personnes) |
| 10h00 – 12h00 | **Désignation des points focaux** — 1 point focal par département (36 départements) | Secrétaires académiques |
| 14h00 – 16h30 | **Formation points focaux — Session 1** : Connexion, navigation, gestion des étudiants, consultation des paiements | Points focaux FDROIT (8) + FSEG (21) + FMED (7) = 36 personnes |
| 16h30 – 17h00 | Distribution des guides d'utilisation imprimés | Points focaux |

#### 🔵 Mardi 17 Février — Formation enseignants

| Horaire | Action | Public cible |
|---------|--------|-------------|
| 8h00 – 10h00 | **Formation enseignants FDROIT** : Encodage des notes, gestion des présences, codes de validation | Enseignants Droit |
| 10h00 – 12h00 | **Formation enseignants FSEG** : Même programme | Enseignants Sciences Éco |
| 14h00 – 16h00 | **Formation enseignants FMED** : Même programme | Enseignants Médecine |
| 16h00 – 17h00 | **Formation personnel administratif** : Gestion des bordereaux, vérification des paiements | Secrétariats des 3 facultés |

#### 🔵 Mercredi 18 Février — Formation avancée et préparation activation

| Horaire | Action | Public cible |
|---------|--------|-------------|
| 8h00 – 10h00 | **Session avancée points focaux** : Gestion des délibérations, export de données, rapports | Points focaux |
| 10h00 – 12h00 | **Préparation matériel campagne** : Affiches, dépliants avec QR code et instructions d'activation | Équipe technique |
| 14h00 – 16h00 | **Test grandeur nature** : Simulation complète du workflow (inscription → notes → paiement → consultation) | Points focaux + enseignants volontaires |
| 16h00 – 17h00 | **Collecte des retours** : Identification des problèmes éventuels | Tous |

#### 🟠 Jeudi 19 Février — 🚀 LANCEMENT CAMPAGNE D'ACTIVATION ÉTUDIANTS

| Horaire | Action | Public cible |
|---------|--------|-------------|
| 8h00 – 9h00 | **Affichage dans les amphithéâtres** des 3 facultés : affiches avec instructions d'activation | Équipe logistique |
| 9h00 – 12h00 | **Stands d'assistance FDROIT** : Aide aux étudiants pour activer leurs comptes (matricule → mot de passe) | Étudiants Droit (10 823) |
| 9h00 – 12h00 | **Stands d'assistance FSEG** : Même accompagnement | Étudiants FSEG (8 530) |
| 9h00 – 12h00 | **Stands d'assistance FMED** : Même accompagnement | Étudiants Médecine (6 525) |
| 14h00 – 17h00 | **Continuation des activations** — Suivi en temps réel du nombre d'activations | Points focaux + équipe technique |

> **Processus d'activation pour chaque étudiant :**
> 1. Aller sur http://94.72.97.228/auth/activate
> 2. Entrer son matricule (ex: 2201773)
> 3. Confirmer son identité (nom affiché)
> 4. Créer un mot de passe sécurisé
> 5. Se connecter avec matricule@unikin.ac.cd + mot de passe

#### 🟠 Vendredi 20 Février — Suivi activations et support

| Horaire | Action | Public cible |
|---------|--------|-------------|
| 8h00 – 12h00 | **Poursuite des activations** avec stands permanents dans les 3 facultés | Étudiants retardataires |
| 14h00 – 16h00 | **Bilan S4** : Comptage des activations, identification des blocages | Équipe technique |
| 16h00 – 17h00 | **Correctifs urgents** si nécessaire | Développeur |

**🎯 Objectif fin S4 : 15 000 – 20 000 comptes activés (30-40%)**

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 5 — Lundi 23 au Vendredi 27 Février 2026
### Facultés : FST (4 758) • FPSE (3 005) • FSSAP (2 990)
### + Évaluation et correctifs Vague 1
### → 10 753 nouveaux étudiants concernés
### ═══════════════════════════════════════════════════════

#### 🔵 Lundi 23 Février — Évaluation Vague 1 + Formation points focaux Vague 2

| Horaire | Action |
|---------|--------|
| 8h00 – 10h00 | **Évaluation Vague 1** : Analyse des retours des 3 premières facultés, taux d'activation, problèmes signalés |
| 10h00 – 12h00 | **Définition charge correctifs** : Priorisation des bugs et améliorations demandées |
| 14h00 – 16h30 | **Formation points focaux FST + FPSE + FSSAP** (24 départements, 24 points focaux) |
| 16h30 – 17h00 | Correctifs en cours de déploiement |

#### 🔵 Mardi 24 Février — Formation enseignants Vague 2

| Horaire | Action |
|---------|--------|
| 8h00 – 10h00 | Formation enseignants FST |
| 10h00 – 12h00 | Formation enseignants FPSE |
| 14h00 – 16h00 | Formation enseignants FSSAP |
| 16h00 – 17h00 | Formation personnel administratif des 3 facultés |

#### 🔵 Mercredi 25 Février — Préparation + tests

| Horaire | Action |
|---------|--------|
| 8h00 – 12h00 | Session avancée points focaux + test grandeur nature |
| 14h00 – 17h00 | Déploiement correctifs Vague 1 + préparation campagne activation |

#### 🟠 Jeudi 26 Février — Lancement activation Vague 2

| Horaire | Action |
|---------|--------|
| 8h00 – 12h00 | Stands d'assistance FST + FPSE + FSSAP — activation comptes étudiants |
| 14h00 – 17h00 | Continuation activations + support technique permanent |

#### 🟠 Vendredi 27 Février — Suivi + bilan

| Horaire | Action |
|---------|--------|
| 8h00 – 12h00 | Poursuite activations + support Vague 1 (FDROIT, FSEG, FMED) encore en cours |
| 14h00 – 17h00 | **Bilan S5** : Total activations, correctifs appliqués, préparation S6 |

**🎯 Objectif fin S5 : 28 000 – 33 000 comptes activés (55-65%)**

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 6 — Lundi 2 au Vendredi 6 Mars 2026
### Facultés : FLSH (2 268) • FMEDD (1 554) • FSAE (1 510)
### → 5 332 nouveaux étudiants concernés
### ═══════════════════════════════════════════════════════

#### Lundi 2 Mars — Évaluation Vague 2 + Formation points focaux Vague 3

| Horaire | Action |
|---------|--------|
| 8h00 – 10h00 | Évaluation Vague 2 + bilan correctifs |
| 10h00 – 12h00 | Charge de travail restante et planning |
| 14h00 – 16h30 | Formation points focaux FLSH (26 dépt.) + FMEDD (3 dépt.) + FSAE (16 dépt.) = 45 points focaux |

#### Mardi 3 Mars — Formation enseignants Vague 3

| Horaire | Action |
|---------|--------|
| 8h00 – 10h00 | Formation enseignants FLSH |
| 10h00 – 12h00 | Formation enseignants FMEDD |
| 14h00 – 16h00 | Formation enseignants FSAE |
| 16h00 – 17h00 | Personnel administratif |

#### Mercredi 4 Mars — Tests + préparation

| Horaire | Action |
|---------|--------|
| 8h00 – 17h00 | Session avancée, tests, préparation campagne, correctifs |

#### Jeudi 5 Mars — Activation Vague 3

| Horaire | Action |
|---------|--------|
| 8h00 – 17h00 | Stands activation FLSH + FMEDD + FSAE |

#### Vendredi 6 Mars — Suivi + bilan

| Horaire | Action |
|---------|--------|
| 8h00 – 17h00 | Activations, support, bilan S6 |

**🎯 Objectif fin S6 : 38 000 – 42 000 comptes activés (75-83%)**

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 7 — Lundi 9 au Vendredi 13 Mars 2026
### Facultés : FSPHAR (1 197) • FPGER (850) • FPOLY (744)
### → 2 791 nouveaux étudiants concernés
### ═══════════════════════════════════════════════════════

| Jour | Action principale |
|------|-------------------|
| Lundi 9 | Évaluation Vague 3 + Formation points focaux FSPHAR + FPGER + FPOLY (22 dépt.) |
| Mardi 10 | Formation enseignants des 3 facultés + personnel administratif |
| Mercredi 11 | Session avancée + tests + correctifs |
| Jeudi 12 | 🚀 Activation comptes étudiants FSPHAR + FPGER + FPOLY |
| Vendredi 13 | Suivi activations + bilan S7 |

**🎯 Objectif fin S7 : 44 000 – 47 000 comptes activés (87-93%)**

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 8 — Lundi 16 au Mercredi 18 Mars 2026
### Facultés : FMEDV (170) • ESPD (12) • FSC (0)
### → Dernières facultés (182 étudiants restants)
### ═══════════════════════════════════════════════════════

| Jour | Action principale |
|------|-------------------|
| Lundi 16 | Formation points focaux + enseignants FMEDV + ESPD + FSC |
| Mardi 17 | Activation comptes FMEDV + ESPD |
| Mercredi 18 | **Bilan final des activations — Toutes les 15 facultés couvertes** |

> **Jeudi 19 – Vendredi 20 Mars** : Rattrapage et support pour les étudiants des vagues précédentes n'ayant pas encore activé.

**🎯 Objectif fin S8 : 48 000+ comptes activés (95%+)**

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 9 — Lundi 23 au Vendredi 27 Mars 2026
### CONSOLIDATION ET CORRECTIFS GLOBAUX
### ═══════════════════════════════════════════════════════

| Jour | Action |
|------|--------|
| Lundi 23 | **Audit global** : État de chaque faculté, taux d'adoption, problèmes récurrents |
| Mardi 24 | **Sprint correctifs** : Résolution de tous les bugs signalés pendant les 5 semaines de déploiement |
| Mercredi 25 | **Optimisation performance** : Amélioration des temps de chargement, cache, requêtes DB |
| Jeudi 26 | **Formation de rappel** pour les points focaux des facultés à faible adoption |
| Vendredi 27 | **Campagne de rattrapage** : Stands d'activation dans les facultés < 90% d'activation |

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 10 — Lundi 30 Mars au Vendredi 3 Avril 2026
### IMPORT DES DONNÉES COMPLÉMENTAIRES
### ═══════════════════════════════════════════════════════

| Jour | Action |
|------|--------|
| Lundi 30 | Import des **enseignants** : récupération des listes, création des comptes, affectation aux cours |
| Mardi 31 | Import des **cours** : catalogues, crédits, semestres, affectation aux promotions |
| Mercredi 1 | Import des **emplois du temps** : horaires, salles, fréquences |
| Jeudi 2 | Import des **notes historiques** : résultats des années précédentes si disponibles |
| Vendredi 3 | **Activation comptes enseignants** + formation complémentaire à distance |

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 11 — Lundi 6 au Vendredi 10 Avril 2026
### MODULES AVANCÉS ET INTÉGRATIONS
### ═══════════════════════════════════════════════════════

| Jour | Action |
|------|--------|
| Lundi 6 | Configuration du **système de notification** (email/SMS pour notes, annonces, rappels) |
| Mardi 7 | Mise en place du **chatbot IA** pour l'assistance étudiante |
| Mercredi 8 | Intégration **paiement mobile** (Mobile Money, banques partenaires) |
| Jeudi 9 | Module **analytics avancé** pour le rectorat (tableaux de bord décisionnels) |
| Vendredi 10 | Tests d'intégration globaux |

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 12 — Lundi 13 au Vendredi 17 Avril 2026
### TESTS FINAUX ET DOCUMENTATION
### ═══════════════════════════════════════════════════════

| Jour | Action |
|------|--------|
| Lundi 13 | **Test de charge** : Simulation de 5 000+ connexions simultanées |
| Mardi 14 | **Test de sécurité** : Audit des vulnérabilités, test de pénétration |
| Mercredi 15 | **Documentation finale** : Guides utilisateurs (étudiant, enseignant, admin, point focal) |
| Jeudi 16 | **Formation des formateurs** : Les points focaux deviennent autonomes pour former les nouveaux |
| Vendredi 17 | **Remise officielle** des accès et documentation au rectorat |

---

### ═══════════════════════════════════════════════════════
### 📌 SEMAINE 13 — Lundi 20 au Mercredi 30 Avril 2026
### LANCEMENT OFFICIEL ET TRANSITION
### ═══════════════════════════════════════════════════════

| Jour | Action |
|------|--------|
| Lundi 20 | **Cérémonie de lancement officiel** avec le Recteur |
| Mardi 21 – Vendredi 24 | **Période de rodage** : Support intensif, corrections en temps réel |
| Lundi 27 – Mercredi 30 Avril | **Transfert de compétences** final à l'équipe informatique UNIKIN |
| **Mercredi 30 Avril** | **🏁 FIN DU PROJET — Livraison définitive** |

---

## 📈 JALONS ET INDICATEURS DE SUIVI

| Jalon | Date | Indicateur de réussite |
|-------|------|----------------------|
| Plateforme en ligne | ✅ 30 Jan. 2026 | Accessible via IP publique |
| 50 407 étudiants intégrés | ✅ 12 Fév. 2026 | Base de données complète |
| 93 349 paiements importés | ✅ 12 Fév. 2026 | Historique financier disponible |
| Passerelle activation opérationnelle | ✅ 12 Fév. 2026 | Processus testé et fonctionnel |
| Vague 1 — 3 premières facultés | 20 Fév. 2026 | 15 000+ activations |
| Vague 2 — 6 facultés cumulées | 27 Fév. 2026 | 30 000+ activations |
| Vague 3 — 9 facultés cumulées | 6 Mars 2026 | 40 000+ activations |
| Vague 4 — 12 facultés cumulées | 13 Mars 2026 | 46 000+ activations |
| Vague 5 — 15/15 facultés couvertes | 18 Mars 2026 | 48 000+ activations |
| Consolidation + correctifs | 27 Mars 2026 | 95%+ d'adoption |
| Import enseignants + cours | 3 Avril 2026 | Workflows complets opérationnels |
| Tests finaux + documentation | 17 Avril 2026 | Plateforme validée |
| **Lancement officiel** | **20 Avril 2026** | **Cérémonie avec le Recteur** |
| **Livraison définitive** | **30 Avril 2026** | **Transfert de compétences achevé** |

---

## 📊 SYNTHÈSE VISUELLE

```
JANVIER                   FÉVRIER                              MARS                                AVRIL
  30 31   1  2  3  4  5   6  7  8  9 10 11 12  13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
  |==|==|  |==============|===========|         |              |              |              |
  S1-S2    S3 Intégration   S3 fin     S4       S5             S6             S7           S8
  Infra    50407 étudiants  Modules    DROIT    FST            FLSH           FSPHAR       FMEDV
  VPS      93349 paiements  UI/UX      FSEG     FPSE           FMEDD          FPGER        ESPD
  Deploy   134 départements Finances   FMED     FSSAP          FSAE           FPOLY        FSC
           Activation                  ↓                                                     ↓
           ████████████████  ←FAIT→    🚀 LANCEMENT FACULTÉS (3/semaine) ──────────────────→ ✅

  MARS (suite)                              AVRIL
  23 24 25 26 27  30 31 1  2  3   6  7  8  9 10  13 14 15 16 17  20 ... 30
  |==============| |==============| |==============| |==============| |=====|
  S9 Consolid.     S10 Import       S11 Modules      S12 Tests        S13
  Correctifs       Enseignants      Avancés          Documentation    LANCEMENT
  Audit adoption   Cours            Notifications    Guides           OFFICIEL
  Rattrapage       Emploi du temps  Paiement mobile  Formation form.  🏁 FIN
```

---

## ⚡ RESSOURCES NÉCESSAIRES PAR SEMAINE DE DÉPLOIEMENT FACULTÉ

| Ressource | Quantité | Rôle |
|-----------|----------|------|
| Développeur/Technicien | 1 | Support technique, correctifs, monitoring |
| Formateur principal | 1 | Animation des sessions de formation |
| Assistants stands | 2-4 par faculté | Aide aux étudiants pour l'activation |
| Matériel imprimé | ~500 dépliants/faculté | Instructions d'activation avec QR code |
| Salle de formation | 1 | Pour les sessions points focaux et enseignants |
| Connexion internet | Stable | Indispensable pour les activations en masse |

---

## 📝 NOTES IMPORTANTES

1. **Les 3 plus grosses facultés (Droit, Éco, Médecine) représentent 51% des étudiants** → Traitées en priorité S4
2. **Le rythme de 3 facultés/semaine** est soutenable car les formations sont standardisées
3. **Le jeudi est le jour de lancement des activations** pour chaque vague, laissant vendredi pour le suivi
4. **Les correctifs sont déployés en continu** — pas besoin d'attendre une fenêtre de maintenance
5. **La semaine 9 est un tampon** pour absorber tout retard et consolider avant la phase finale
6. **Délai respecté** : 30 janvier → 30 avril = exactement 3 mois (13 semaines)

---

*Document généré le 13 Février 2026 — NEXUS UNIKIN*  
*Prochaine mise à jour : Vendredi 20 Février 2026 (Bilan S4)*

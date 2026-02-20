# 📋 PLAN D'ACTION — Première Délibération via NEXUS UNIKIN
## Faculté des Sciences Pharmaceutiques (FSPHAR)
### Date du document : 19 Février 2026

---

## 🔴 ÉTAT ACTUEL DE LA PLATEFORME

### Données en base (Faculté des Sciences Pharmaceutiques)
| Élément | Quantité | Statut |
|---------|----------|--------|
| Étudiants intégrés | 1 197 | ✅ Complet |
| Départements | 2 | ✅ Complet |
| Promotions | 18 | ✅ Complet |
| Paiements historiques | Importés | ✅ Complet |
| **Enseignants** | **0** | ❌ **MANQUANT** |
| **Cours** | **0** | ❌ **MANQUANT** |
| **Notes** | **0** | ❌ **MANQUANT** |
| **Jury délibération** | **0** | ❌ **MANQUANT** |
| **Personnel administratif** | **0** | ❌ **MANQUANT** |

### État des fonctionnalités (audit détaillé)

| Fonctionnalité | API Backend | Interface Frontend | État global |
|----------------|-------------|-------------------|-------------|
| Saisie notes (enseignant) | ✅ Fonctionnel | ✅ Fonctionnel | **90%** |
| Activation comptes étudiants | ✅ Fonctionnel | ✅ Fonctionnel | **95%** |
| Évaluations/Examens | ✅ Fonctionnel | ✅ Fonctionnel | **85%** |
| Gestion délibérations | ✅ Fonctionnel | ⚠️ MOCK data | **50%** |
| Présences (étudiant) | ✅ Fonctionnel | ✅ Fonctionnel | **80%** |
| Présences (enseignant) | ✅ Fonctionnel | ❌ Déconnecté du backend | **40%** |
| Documents (employé) | ✅ Fonctionnel | ⚠️ MOCK data | **40%** |
| Paiements (employé) | ✅ Fonctionnel | ⚠️ MOCK data | **40%** |
| Upload reçu paiement | ⚠️ Métadonnées only | ⚠️ Faux upload fichier | **30%** |
| Réinitialisation mot de passe | ❌ Inexistant | ❌ Inexistant | **0%** |
| Notifications automatiques | ✅ Fonctionnel | ✅ Fonctionnel | **60%** |

---

## 📊 CE QUI DOIT ÊTRE FAIT — 3 PHASES

---

## PHASE 1 : COLLECTE DE DONNÉES (Priorité immédiate)
> **Responsable :** Secrétariat de la Faculté des Sciences Pharmaceutiques  
> **Durée estimée :** 1-2 semaines  
> **Outil :** Fichier Excel `COLLECTE_DONNEES_PHARMACIE_NEXUS.xlsx`

### 1.1 — Données à collecter

| Donnée | Source | Feuille Excel | Criticité |
|--------|--------|---------------|-----------|
| Liste enseignants (noms, grades, départements, téléphones) | Secrétariat faculté | ENSEIGNANTS | 🔴 Critique |
| Catalogue des cours par promotion | Secrétariat académique | COURS | 🔴 Critique |
| Composition du jury de délibération | Doyen/Vice-Doyen | JURY DÉLIBÉRATION | 🔴 Critique |
| Critères de délibération (seuils, pondérations) | Doyen | CRITÈRES DÉLIBÉRATION | 🔴 Critique |
| Personnel administratif | Administration | EMPLOYÉS ADMINISTRATIFS | 🟡 Recommandé |
| Notes existantes (si saisies sur papier) | Enseignants | NOTES | 🟢 Optionnel |

### 1.2 — Processus de collecte
1. Remettre le fichier Excel au secrétaire académique de la Faculté
2. Le secrétariat remplit les feuilles ENSEIGNANTS, COURS et JURY
3. Le Doyen valide et signe la feuille CRITÈRES DÉLIBÉRATION
4. Le fichier rempli est renvoyé à l'équipe technique
5. L'équipe technique exécute le script d'importation

### 1.3 — Informations clés pour le remplissage
- **Département de Pharmacie (ID: 38)** : 11 promotions, 1 129 étudiants
  - B1 (382), B2 (189), B3 (96), L1 (203), L2 (18), L3 (5)
  - P1 (95), P2 (115), P3 (22), G3 (2), M1 (2)
- **Département Licence et techniques pharmaceutiques (ID: 107)** : 6 promotions, 68 étudiants
  - B1 (4), B2 (5), B3 (1), L1 (30), L2 (23), L3 (5)

---

## PHASE 2 : CORRECTIONS TECHNIQUES (Développement)
> **Responsable :** Équipe technique  
> **Durée estimée :** 1-2 semaines (en parallèle avec Phase 1)

### 2.1 — 🔴 Réinitialisation mot de passe (INEXISTANT → à créer)

**État actuel :** Lien "Mot de passe oublié" dans la page de connexion pointe vers `/auth/forgot-password` qui n'existe pas.

**Fichiers à créer :**
```
app/auth/forgot-password/page.tsx          → Formulaire de demande (matricule/email)
app/api/auth/reset-password/route.ts       → API: POST (demande), PUT (reset par admin)
app/api/auth/reset-password/requests/route.ts → API: GET liste des demandes pour admin
```

**Workflow :**
1. L'utilisateur clique "Mot de passe oublié" sur la page de connexion
2. Il entre son matricule et/ou téléphone
3. La demande est enregistrée en base (`password_reset_requests` table à créer)
4. L'admin voit la liste des demandes dans son dashboard
5. L'admin génère un nouveau mot de passe temporaire
6. L'utilisateur se connecte avec le mot de passe temporaire
7. (Optionnel) L'utilisateur est forcé de changer son mot de passe à la première connexion

**Tables à créer :**
```sql
CREATE TABLE password_reset_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    matricule VARCHAR(50),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    new_password_hash VARCHAR(255),
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 — 🔴 Page admin délibérations (MOCK → connecter aux vraies APIs)

**État actuel :** `app/admin/deliberations/page.tsx` affiche des données MOCK hardcodées. L'API backend à `app/api/deliberations/route.ts` est fonctionnelle et calcule les décisions.

**Modifications requises sur `app/admin/deliberations/page.tsx` :**
- Ligne ~92 : Remplacer les données mock par `fetch('/api/deliberations?promotionId=...')`
- Ligne ~147 : Remplacer les résultats mock par les vrais résultats API
- Bouton "Délibérer" : Appeler `POST /api/deliberations` au lieu du `setTimeout`
- Bouton "Valider" : Appeler `PUT /api/deliberations/[id]` pour publier
- Ajouter filtres par : faculté → département → promotion
- Ajouter interface secrétaire (modification notes par promotion)
- Ajouter notification au président quand un département est terminé

**Workflow délibération complet :**
```
1. PRÉSIDENT programme la délibération (date, heure, promotions concernées)
2. Plateforme PRÉ-DÉLIBÈRE automatiquement :
   - Calcule les moyennes (30% TP + 70% Examen)
   - Calcule les crédits acquis
   - Attribue les décisions préliminaires (ADMIS/AJOURNÉ/REFUSÉ)
   - Signale les cas bloqués (paiement insuffisant)
3. SECRÉTAIRE accède à la pré-délibération par promotion
   - Peut ajuster les notes (cas de repêchage, erreurs matérielles)
   - Peut changer la décision (avec justification)
   - Chaque modification est tracée (grade_modifications)
4. PRÉSIDENT est notifié quand un département est terminé
5. PRÉSIDENT valide la délibération
6. Résultats publiés (visibles par les étudiants)
```

### 2.3 — 🟡 Présences enseignant (UI déconnectée du backend)

**État actuel :** `app/teacher/attendance/page.tsx` génère un code aléatoire en local (`Math.random()`) sans appeler `POST /api/attendance-codes`.

**Modification requise :**
- `generateAttendanceCode()` (ligne ~73) : Appeler `POST /api/attendance-codes` avec `teacherId` et `courseId`
- Afficher le code retourné par l'API (au lieu du code local)
- Ajouter un timer de compte à rebours pour l'expiration
- Charger la liste des étudiants du cours sélectionné

### 2.4 — 🟡 Pages employé documents (MOCK → connecter aux APIs)

**État actuel :** `app/employee/documents/page.tsx` affiche un tableau `mockDocuments` hardcodé (4 entrées). L'API `app/api/documents/route.ts` est complète (GET/POST/PATCH/PUT).

**Modifications requises :**
- Remplacer `mockDocuments` par `fetch('/api/documents')`
- Implémenter les boutons Approuver/Rejeter → `PUT /api/documents`
- Ajouter un modal de rejet avec raison
- Connecter les stats en temps réel depuis l'API

### 2.5 — 🟡 Upload de reçus de paiement (faux upload → vrai upload)

**État actuel :** `app/student/finances/page.tsx` crée une URL fictive `/uploads/${selectedFile.name}` sans télécharger le fichier.

**Fichiers à créer :**
```
app/api/upload/route.ts                    → Endpoint multipart pour fichiers
public/uploads/                             → Dossier de stockage (ou S3)
```

**Modifications requises :**
- Créer endpoint d'upload qui accepte les fichiers (multipart/form-data)
- Stocker les fichiers dans `/public/uploads/receipts/` ou un bucket S3
- Renvoyer l'URL réelle du fichier stocké
- Mettre à jour `app/student/finances/page.tsx` pour appeler l'endpoint d'upload
- Connecter `app/employee/payments/page.tsx` aux vraies APIs (actuellement MOCK)

### 2.6 — 🟢 Script d'importation des données Excel

**Fichier à créer :** `scripts/import-excel-pharmacie.js`

**Fonctionnalités :**
1. Lire le fichier Excel rempli
2. Créer les comptes utilisateurs (users) pour chaque enseignant
3. Créer les entrées dans la table `teachers`
4. Créer les cours dans la table `courses` avec les bonnes `promotion_id`
5. Affecter les cours aux enseignants (`course_teachers`)
6. Créer les membres du jury (`jury_members`)
7. Créer les comptes employés (users + employees)
8. Importer les notes existantes (si fournies) dans `grades`
9. Configurer les paramètres de délibération

---

## PHASE 3 : TEST ET VALIDATION (Délibération pilote)
> **Responsable :** Équipe technique + Doyen des Sciences Pharmaceutiques  
> **Durée estimée :** 3-5 jours

### 3.1 — Tests par étape

| Étape | Action | Validation |
|-------|--------|------------|
| 1 | Import des données Excel | Vérifier: enseignants, cours et jury bien créés |
| 2 | Test login enseignant | 1 enseignant se connecte et voit ses cours |
| 3 | Saisie de notes test | L'enseignant saisit 5-10 notes sur 1 cours |
| 4 | Pré-délibération | Le système calcule correctement les résultats |
| 5 | Revue secrétaire | Le secrétaire modifie 1-2 notes, vérifier le traçage |
| 6 | Validation président | Le président valide, vérifier la publication |
| 7 | Consultation étudiant | L'étudiant voit son résultat (si paiement OK) |

### 3.2 — Promotion pilote recommandée
- **B1 PHARMACIE** (382 étudiants) — la plus grande promotion
- Ou **L1 LMD PHARMACIE** (203 étudiants) — taille intermédiaire

### 3.3 — Checklist avant la première vraie délibération

- [ ] Tous les enseignants de la promotion ont un compte actif
- [ ] Tous les cours de la promotion sont créés avec les bons crédits
- [ ] Tous les cours ont un enseignant titulaire assigné
- [ ] Toutes les notes de tous les cours de la promotion sont saisies
- [ ] Le jury de délibération est composé (président + secrétaire + membres)
- [ ] Les critères de délibération sont validés par le Doyen
- [ ] La pré-délibération est lancée sans erreurs
- [ ] Le secrétaire a accès pour modifier les notes
- [ ] Le président peut valider et publier
- [ ] Les étudiants voient leurs résultats après publication

---

## 📐 ARCHITECTURE DES RÔLES POUR LA DÉLIBÉRATION

```
┌─────────────────────────────────────────────────────────┐
│                     WORKFLOW COMPLET                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ENSEIGNANT                                              │
│  ├── Se connecte avec matricule + mot de passe           │
│  ├── Voit la liste de ses cours                          │
│  ├── Saisit les notes (TP + Examen) pour chaque cours    │
│  ├── Génère des codes de présence                        │
│  └── Valide les notes avant la date limite               │
│                                                          │
│  SECRÉTAIRE DU JURY                                      │
│  ├── Accède à la pré-délibération par promotion          │
│  ├── Voit le calcul automatique (moyennes, crédits)      │
│  ├── Peut modifier des notes (cas de repêchage)          │
│  ├── Chaque modification est tracée                      │
│  └── Signal quand une promotion est terminée             │
│                                                          │
│  PRÉSIDENT DU JURY                                       │
│  ├── Programme les sessions de délibération              │
│  ├── Reçoit notification quand un département est prêt   │
│  ├── Revoit les résultats et les modifications           │
│  ├── Valide la délibération                              │
│  └── Autorise la publication des résultats               │
│                                                          │
│  EMPLOYÉ ADMINISTRATIF                                   │
│  ├── Reçoit les demandes de documents                    │
│  ├── Traite les demandes (approuver/rejeter)             │
│  ├── Vérifie les paiements étudiants                     │
│  └── Consulte les informations étudiants                 │
│                                                          │
│  ÉTUDIANT                                                │
│  ├── Active son compte (matricule + téléphone)           │
│  ├── Scanne/upload le reçu de paiement                  │
│  ├── Consulte ses résultats (si paiement ≥ 70%)         │
│  ├── Demande des documents                               │
│  └── Saisit les codes de présence                        │
│                                                          │
│  ADMIN                                                   │
│  ├── Gère les demandes de réinitialisation mot de passe  │
│  ├── Supervise le processus de délibération              │
│  └── Accède à toutes les données et statistiques         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⏱️ PLANNING ESTIMÉ

| Semaine | Phase | Actions |
|---------|-------|---------|
| S1 | Collecte + Dev | - Donner l'Excel à la faculté<br>- Développer password reset<br>- Connecter page admin délibérations |
| S2 | Collecte + Dev | - Recevoir l'Excel rempli<br>- Corriger présences enseignant<br>- Connecter pages employé<br>- Upload paiement |
| S3 | Import + Test | - Importer les données Excel<br>- Tests complets avec 1 promotion<br>- Formation Doyen + Secrétaire |
| S4 | Délibération | - Saisie notes par enseignants<br>- Première délibération pilote |

---

## 📞 CONTACTS

| Rôle | Nom | Contact |
|------|-----|---------|
| Responsable technique | Chris NGOZULU | +243 832 313 105 |
| Faculté des Sc. Pharmaceutiques | (Doyen) | À confirmer |
| Secrétaire académique | (À confirmer) | À confirmer |

---

*Document généré le 19 février 2026 — NEXUS UNIKIN*

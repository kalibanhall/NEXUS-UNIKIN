# ARCHITECTURE DES RÔLES ET PERMISSIONS

## NEXUS UNIKIN - Système de Gestion des Accès Hiérarchique

**Version :** 1.0  
**Date :** Janvier 2026

---

## 1. STRUCTURE HIÉRARCHIQUE DE L'UNIKIN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NIVEAU CENTRAL (RECTORAT)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   RECTEUR   │  │    SGA      │  │    SGAD     │  │     AB      │        │
│  │  (Super)    │  │(Sec.Gén.   │  │(Sec.Gén.   │  │(Admin.     │        │
│  │             │  │ Académique) │  │ Admin.)    │  │ Budget)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NIVEAU FACULTÉ                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   DOYEN     │  │ VICE-DOYEN  │  │ VICE-DOYEN  │  │ SECRÉTAIRE  │        │
│  │             │  │ ENSEIGNEMENT│  │  RECHERCHE  │  │ ACADÉMIQUE  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NIVEAU DÉPARTEMENT                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    CHEF     │  │ PRÉSIDENT   │  │ SECRÉTAIRE  │  │  MEMBRES    │        │
│  │ DÉPARTEMENT │  │   DU JURY   │  │   DU JURY   │  │   DU JURY   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NIVEAU ENSEIGNEMENT                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │ PROFESSEUR  │  │CHEF TRAVAUX │  │  ASSISTANT  │                         │
│  │  ORDINAIRE  │  │             │  │             │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NIVEAU ÉTUDIANT                                   │
│  ┌─────────────┐  ┌─────────────┐                                          │
│  │  ÉTUDIANT   │  │  DÉLÉGUÉ    │                                          │
│  │             │  │  PROMOTION  │                                          │
│  └─────────────┘  └─────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DÉFINITION DES RÔLES

### 2.1 NIVEAU CENTRAL (RECTORAT)

#### 🔴 SUPER_ADMIN (Recteur)
**Portée :** Université entière

| Permission | Description |
|------------|-------------|
| Accès total | Toutes les données de toutes les facultés |
| Gestion utilisateurs | Créer/modifier/supprimer tous les comptes |
| Rapports globaux | Statistiques université complètes |
| Paramètres système | Configuration générale de la plateforme |
| Validation finale | Approuver délibérations finales, promotions |

---

#### 🔴 SGA - Secrétaire Général Académique
**Portée :** Affaires académiques - Université entière

| Permission | Description |
|------------|-------------|
| Notes & résultats | Accès lecture/validation toutes facultés |
| Délibérations | Superviser toutes les délibérations |
| Programmes | Valider programmes et curricula |
| Calendrier académique | Définir dates officielles |
| Documents officiels | Signer attestations, diplômes |

---

#### 🔴 SGAD - Secrétaire Général Administratif
**Portée :** Affaires administratives - Université entière

| Permission | Description |
|------------|-------------|
| Personnel | Gestion de tous les employés |
| Finances globales | Superviser tous les paiements |
| Logistique | Gestion salles, équipements |
| Rapports administratifs | Statistiques RH et finances |

---

#### 🔴 AB - Administrateur du Budget
**Portée :** Finances - Université entière

| Permission | Description |
|------------|-------------|
| Budget | Allocation budgétaire par faculté |
| Paiements | Valider transactions importantes |
| Rapports financiers | Tous les rapports de recettes |
| Audit | Contrôle financier global |

---

### 2.2 NIVEAU FACULTÉ

#### 🟠 DOYEN
**Portée :** Une faculté (tous les départements)

| Permission | Description |
|------------|-------------|
| Vue faculté | Accès complet à sa faculté uniquement |
| Notes | Voir toutes les notes de la faculté |
| Enseignants | Gérer les enseignants de sa faculté |
| Étudiants | Consulter tous les étudiants de sa faculté |
| Délibérations | Valider délibérations au niveau faculté |
| Rapports | Statistiques de sa faculté |
| **Restriction** | Pas d'accès aux autres facultés |

---

#### 🟠 VICE_DOYEN_ENSEIGNEMENT
**Portée :** Affaires académiques d'une faculté

| Permission | Description |
|------------|-------------|
| Notes | Superviser les notes de la faculté |
| Emplois du temps | Valider planning des cours |
| Enseignants | Affecter cours aux enseignants |
| Programmes | Gérer les programmes d'enseignement |
| Délibérations | Participer aux délibérations |

---

#### 🟠 VICE_DOYEN_RECHERCHE
**Portée :** Recherche d'une faculté

| Permission | Description |
|------------|-------------|
| Recherche | Gérer projets de recherche |
| Publications | Superviser publications faculté |
| Mémoires/Thèses | Suivre travaux de fin d'études |
| Partenariats | Gérer collaborations recherche |

---

#### 🟠 SECRETAIRE_ACADEMIQUE_FACULTE
**Portée :** Administration académique d'une faculté

| Permission | Description |
|------------|-------------|
| Inscriptions | Valider inscriptions étudiants |
| Documents | Générer attestations faculté |
| Notes | Compiler résultats de la faculté |
| Étudiants | Gérer dossiers étudiants |
| Emplois du temps | Éditer planning des cours |

---

### 2.3 NIVEAU DÉPARTEMENT

#### 🟡 CHEF_DEPARTEMENT
**Portée :** Un département uniquement

| Permission | Description |
|------------|-------------|
| Vue département | Accès complet à son département |
| Enseignants | Gérer enseignants du département |
| Cours | Affecter cours aux enseignants |
| Étudiants | Consulter étudiants du département |
| Rapports | Statistiques du département |
| **Restriction** | Pas d'accès aux autres départements |

---

#### 🟡 PRESIDENT_JURY
**Portée :** Jury de délibération d'un département/promotion

| Permission | Description |
|------------|-------------|
| Notes | Voir toutes les notes de son jury |
| Délibération | Présider session de délibération |
| Validation | **Valider délibération finale** |
| Ajustements | Approuver modifications de notes |
| Publication | Autoriser publication des résultats |

**Workflow spécial :**
```
Notes saisies → Compilation → Revue Jury → [PRÉSIDENT VALIDE] → Publication étudiants
```

---

#### 🟡 SECRETAIRE_JURY
**Portée :** Jury de délibération d'un département/promotion

| Permission | Description |
|------------|-------------|
| Notes | Accès à toutes les notes des enseignants |
| Compilation | Compiler notes pour délibération |
| **Ajustement** | Modifier notes (avec notification) |
| PV | Rédiger procès-verbal de délibération |
| Rapports | Générer statistiques du jury |

**Workflow spécial - Ajustement de notes :**
```
Secrétaire modifie note 
    → Notification automatique à l'enseignant concerné
    → Notification au Président du Jury
    → Historique de modification enregistré
    → Justification obligatoire
```

---

#### 🟡 MEMBRE_JURY
**Portée :** Participation aux délibérations

| Permission | Description |
|------------|-------------|
| Notes | Voir notes de son jury (lecture seule) |
| Délibération | Participer aux discussions |
| Vote | Voter sur cas litigieux |

---

### 2.4 NIVEAU ENSEIGNEMENT

#### 🟢 PROFESSEUR_ORDINAIRE
**Grade le plus élevé**

| Permission | Description |
|------------|-------------|
| Cours | Gérer ses propres cours |
| Notes | Saisir notes de ses étudiants |
| Présences | Faire l'appel de ses cours |
| Mémoires | Diriger travaux de fin d'études |
| Ressources | Publier supports de cours |

---

#### 🟢 CHEF_TRAVAUX
**Encadrement pratique**

| Permission | Description |
|------------|-------------|
| Cours | Gérer ses cours (TP, TD) |
| Notes | Saisir notes TP/TD |
| Présences | Faire l'appel |
| Supervision | Encadrer assistants |

---

#### 🟢 ASSISTANT
**Niveau débutant**

| Permission | Description |
|------------|-------------|
| Cours | Assister aux cours magistraux |
| Notes | Saisir notes TP (sous supervision) |
| Présences | Faire l'appel |
| **Restriction** | Notes validées par Chef de Travaux |

---

### 2.5 NIVEAU ÉTUDIANT

#### 🔵 ETUDIANT
**Utilisateur standard**

| Permission | Description |
|------------|-------------|
| Notes | Voir ses propres notes |
| Emploi du temps | Consulter son planning |
| Finances | Voir sa situation financière |
| Documents | Demander attestations |
| Messages | Communiquer avec enseignants |

---

#### 🔵 DELEGUE_PROMOTION
**Représentant étudiant**

| Permission | Description |
|------------|-------------|
| *Toutes permissions ETUDIANT* | + |
| Annonces | Relayer informations à sa promotion |
| Liste | Voir liste des étudiants de sa promotion |
| Représentation | Participer aux réunions pédagogiques |

---

### 2.6 SERVICES ADMINISTRATIFS

#### 🟣 EMPLOYE_CAISSE
**Service financier**

| Permission | Description |
|------------|-------------|
| Paiements | Enregistrer paiements |
| Reçus | Générer reçus |
| Étudiants | Rechercher situation financière |
| Rapports | Rapports de caisse journaliers |
| **Restriction** | Pas d'accès aux notes |

---

#### 🟣 EMPLOYE_SCOLARITE
**Service des inscriptions**

| Permission | Description |
|------------|-------------|
| Inscriptions | Enregistrer nouveaux étudiants |
| Documents | Générer attestations |
| Étudiants | Gérer dossiers administratifs |
| **Restriction** | Pas d'accès aux notes détaillées |

---

## 3. MATRICE DE PERMISSIONS DÉTAILLÉE

### 3.1 Accès aux Notes

| Rôle | Ses notes | Dept. | Faculté | Université | Modifier |
|------|-----------|-------|---------|------------|----------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| SGA | ✅ | ✅ | ✅ | ✅ | ❌ |
| DOYEN | ✅ | ✅ | ✅ | ❌ | ❌ |
| VICE_DOYEN_ENS | ✅ | ✅ | ✅ | ❌ | ❌ |
| CHEF_DEPT | ✅ | ✅ | ❌ | ❌ | ❌ |
| PRESIDENT_JURY | ✅ | ✅ | ❌ | ❌ | ✅* |
| SECRETAIRE_JURY | ✅ | ✅ | ❌ | ❌ | ✅** |
| ENSEIGNANT | ✅ | ❌ | ❌ | ❌ | ✅*** |
| ETUDIANT | ✅ | ❌ | ❌ | ❌ | ❌ |

*Validation uniquement | **Avec notification | ***Ses cours uniquement

---

### 3.2 Accès aux Étudiants

| Rôle | Ses étudiants | Dept. | Faculté | Université |
|------|---------------|-------|---------|------------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ |
| DOYEN | ✅ | ✅ | ✅ | ❌ |
| CHEF_DEPT | ✅ | ✅ | ❌ | ❌ |
| ENSEIGNANT | ✅ | ❌ | ❌ | ❌ |
| EMPLOYE_SCOLARITE | ✅ | ✅ | ✅ | ✅ |

---

### 3.3 Gestion des Délibérations

| Rôle | Voir | Compiler | Ajuster | Valider | Publier |
|------|------|----------|---------|---------|---------|
| SGA | ✅ | ❌ | ❌ | ✅ | ✅ |
| DOYEN | ✅ | ❌ | ❌ | ✅* | ✅* |
| PRESIDENT_JURY | ✅ | ❌ | ✅ | ✅ | ✅ |
| SECRETAIRE_JURY | ✅ | ✅ | ✅ | ❌ | ❌ |
| MEMBRE_JURY | ✅ | ❌ | ❌ | ❌ | ❌ |

*Au niveau faculté uniquement

---

## 4. WORKFLOW DE DÉLIBÉRATION

```
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: SAISIE DES NOTES                                        │
│  ─────────────────────────                                        │
│  • Enseignants saisissent notes TP, TD, Examens                   │
│  • Date limite de saisie imposée par le système                   │
│  • Notifications automatiques de rappel                           │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: COMPILATION PAR LE SECRÉTAIRE DU JURY                   │
│  ──────────────────────────────────────────────                   │
│  • Secrétaire compile toutes les notes                            │
│  • Calcul automatique des moyennes                                │
│  • Identification des cas particuliers (repêchage, échec, etc.)   │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: AJUSTEMENTS (si nécessaire)                             │
│  ─────────────────────────────────────                            │
│  • Secrétaire peut ajuster une note                               │
│     → NOTIFICATION AUTOMATIQUE à l'enseignant concerné            │
│     → NOTIFICATION au Président du Jury                           │
│     → Justification OBLIGATOIRE                                   │
│     → Historique complet conservé                                 │
│  • Enseignant peut contester (délai 48h)                          │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: SESSION DE DÉLIBÉRATION                                 │
│  ────────────────────────────────                                 │
│  • Présidée par le Président du Jury                              │
│  • Examen des cas litigieux                                       │
│  • Votes sur décisions (repêchage, etc.)                          │
│  • Procès-verbal rédigé par le Secrétaire                         │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: VALIDATION PAR LE PRÉSIDENT DU JURY                     │
│  ─────────────────────────────────────────────                    │
│  • Président valide la délibération                               │
│  • Signature électronique du PV                                   │
│  • Statut: "EN ATTENTE DE PUBLICATION"                            │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  ÉTAPE 6: PUBLICATION                                             │
│  ────────────────────                                             │
│  • Validation finale par Doyen ou SGA                             │
│  • Résultats visibles par les étudiants                           │
│  • Notifications envoyées aux étudiants                           │
│  • Génération automatique des relevés de notes                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. NOTIFICATIONS AUTOMATIQUES

### 5.1 Notifications de modification de notes

Quand le Secrétaire du Jury modifie une note :

```json
{
  "destinataires": [
    "enseignant_concerné",
    "president_jury",
    "chef_departement"
  ],
  "message": "La note de [ÉTUDIANT] pour le cours [COURS] a été modifiée",
  "details": {
    "ancienne_note": "12/20",
    "nouvelle_note": "14/20",
    "modifié_par": "Secrétaire du Jury",
    "justification": "Erreur de report",
    "date_modification": "2026-01-18 14:30"
  },
  "actions": [
    "Voir détails",
    "Contester (48h)"
  ]
}
```

### 5.2 Notifications de délibération

| Événement | Destinataires |
|-----------|---------------|
| Notes à saisir (rappel) | Enseignants |
| Compilation terminée | Président Jury, Membres Jury |
| Délibération planifiée | Tous les membres du jury |
| Délibération validée | Doyen, SGA |
| Résultats publiés | Étudiants concernés |

---

## 6. STRUCTURE DE LA BASE DE DONNÉES - RÔLES

### 6.1 Table `user_roles`

```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    role_type VARCHAR(50) NOT NULL,
    -- Portée du rôle
    scope_type VARCHAR(20), -- 'UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'COURSE'
    scope_id INT,           -- ID de la faculté, département, ou cours
    -- Rôle supplémentaire (jury)
    jury_role VARCHAR(30),  -- 'PRESIDENT', 'SECRETARY', 'MEMBER'
    academic_year_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 Table `grade_modifications`

```sql
CREATE TABLE grade_modifications (
    id SERIAL PRIMARY KEY,
    grade_id INT REFERENCES grades(id),
    student_id INT REFERENCES students(id),
    course_id INT REFERENCES courses(id),
    -- Valeurs
    old_value DECIMAL(5,2),
    new_value DECIMAL(5,2),
    -- Traçabilité
    modified_by INT REFERENCES users(id),
    modification_reason TEXT NOT NULL,
    -- Statut
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'CONTESTED', 'APPROVED'
    contested_by INT REFERENCES users(id),
    contest_reason TEXT,
    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 Table `deliberations`

```sql
CREATE TABLE deliberations (
    id SERIAL PRIMARY KEY,
    academic_year_id INT,
    department_id INT REFERENCES departments(id),
    promotion_id INT REFERENCES promotions(id),
    session VARCHAR(20), -- 'NORMALE', 'RATTRAPAGE'
    -- Responsables
    president_id INT REFERENCES users(id),
    secretary_id INT REFERENCES users(id),
    -- Statut
    status VARCHAR(30) DEFAULT 'DRAFT',
    -- 'DRAFT', 'COMPILED', 'IN_SESSION', 'VALIDATED', 'PUBLISHED'
    compiled_at TIMESTAMP,
    validated_at TIMESTAMP,
    validated_by INT REFERENCES users(id),
    published_at TIMESTAMP,
    published_by INT REFERENCES users(id),
    -- Métadonnées
    pv_document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.4 Table `jury_members`

```sql
CREATE TABLE jury_members (
    id SERIAL PRIMARY KEY,
    deliberation_id INT REFERENCES deliberations(id),
    user_id INT REFERENCES users(id),
    role VARCHAR(20), -- 'PRESIDENT', 'SECRETARY', 'MEMBER'
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. FACULTÉS ET DÉPARTEMENTS DE L'UNIKIN

### Liste des Facultés

| Code | Faculté | Départements |
|------|---------|--------------|
| DROIT | Faculté de Droit | Droit Public, Droit Privé, Droit Économique |
| MED | Faculté de Médecine | Médecine Interne, Chirurgie, Pédiatrie, Gynécologie, etc. |
| PHARM | Faculté de Pharmacie | Pharmacie Galénique, Pharmacologie, etc. |
| SCI | Faculté des Sciences | Mathématiques, Physique, Chimie, Biologie |
| POLY | Faculté Polytechnique | Génie Civil, Génie Électrique, Génie Mécanique |
| AGRO | Faculté d'Agronomie | Productions Végétales, Productions Animales |
| LETT | Faculté des Lettres | Français, Anglais, Langues Africaines, Histoire |
| ECON | Faculté d'Économie | Économie, Gestion, Finance |
| SSAP | Faculté des Sciences Sociales | Sociologie, Anthropologie, Science Politique |
| PSY | Faculté de Psychologie | Psychologie Clinique, Psychologie Sociale |
| MEDVET | Faculté de Médecine Vétérinaire | Clinique, Reproduction, Hygiène |
| PETGAZ | Faculté de Pétrole et Gaz | Exploration, Production, Raffinage |

---

## 8. EXEMPLE DE SCÉNARIO

### Scénario : Ajustement de note par le Secrétaire du Jury

**Contexte :** L'étudiant MUKENDI Jean a obtenu 8/20 en Droit Civil I. Lors de la compilation, le Secrétaire du Jury découvre une erreur de report.

**Actions :**

1. **Secrétaire du Jury** se connecte
2. Accède à la délibération de L1 Droit
3. Modifie la note de 8/20 → 12/20
4. Saisit justification : "Erreur de report depuis la feuille d'examen"

**Système automatique :**

```
✅ Note modifiée avec succès

📧 Notifications envoyées :
   → Prof. MBALA (Enseignant Droit Civil I) : "Votre note pour MUKENDI Jean a été modifiée"
   → Prof. KASONGO (Président du Jury) : "Une note a été ajustée"
   
📝 Historique enregistré :
   - Modification #1234
   - Par: Secrétaire LUNDA
   - Le: 18/01/2026 à 14:30
   - Raison: "Erreur de report depuis la feuille d'examen"
```

**L'enseignant Prof. MBALA :**
- Reçoit la notification
- Peut consulter l'historique
- Peut contester dans les 48h si désaccord

---

## 9. RÉSUMÉ DES PORTÉES

| Niveau | Rôle | Voit | Ne voit pas |
|--------|------|------|-------------|
| Université | RECTEUR, SGA | Tout | - |
| Faculté | DOYEN | Sa faculté | Autres facultés |
| Département | CHEF DEPT | Son département | Autres départements |
| Cours | ENSEIGNANT | Ses cours | Autres cours |
| Personnel | ÉTUDIANT | Son dossier | Autres étudiants |

---

**Document préparé pour le projet NEXUS UNIKIN**  
**Janvier 2026**

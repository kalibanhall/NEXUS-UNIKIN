# 📋 PLAN DE TRAVAIL - RÉUNION BACKBONE UNIKIN

**Date :** Jeudi 05 Février 2026  
**Objet :** Stratégie de création des identifiants de connexion et intégration des données  
**Participants :** Équipe NEXUS × Équipe Backbone UNIKIN  
**Durée estimée :** 2h00 - 2h30

---

## 🎯 OBJECTIFS DE LA RÉUNION

1. Définir la logique de création des identifiants basés sur le numéro matricule
2. Analyser les bases de données existantes (étudiants & enseignants)
3. Planifier le processus de collecte et d'encodage des données

---

## 📅 ORDRE DU JOUR

### **BLOC 1 : LOGIQUE DE CRÉATION DES IDENTIFIANTS** (30 min)

| Durée | Point à discuter |
|-------|------------------|
| 10 min | **1.1** Structure du numéro matricule existant (format, composition, unicité) |
| 10 min | **1.2** Proposition de format d'identifiant de connexion |
| 10 min | **1.3** Validation et consensus sur la convention adoptée |

**Questions clés à résoudre :**
- [ ] Le matricule est-il unique et fiable pour tous les utilisateurs ?
- [ ] Faut-il un préfixe selon le type d'utilisateur (ETU-, ENS-, ADM-) ?
- [ ] Quelle politique pour les mots de passe initiaux ?
- [ ] Gestion des cas particuliers (doublons, matricules manquants)

**Proposition de format :**
```
Étudiants  : [MATRICULE]@student.unikin.ac.cd
Enseignants: [MATRICULE]@staff.unikin.ac.cd
Personnel  : [MATRICULE]@admin.unikin.ac.cd
```

---

### **BLOC 2 : ANALYSE DES BASES DE DONNÉES EXISTANTES** (40 min)

| Durée | Point à discuter |
|-------|------------------|
| 15 min | **2.1** Présentation des BDD existantes par Backbone (structure, champs disponibles) |
| 15 min | **2.2** Identification des données essentielles pour NEXUS |
| 10 min | **2.3** Évaluation de la qualité et complétude des données |

**Données à vérifier pour les ÉTUDIANTS :**
| Champ | Disponible ? | Qualité |
|-------|--------------|---------|
| Matricule | ☐ | |
| Nom complet | ☐ | |
| Date de naissance | ☐ | |
| Faculté/Département | ☐ | |
| Promotion/Niveau | ☐ | |
| Email/Téléphone | ☐ | |
| Photo | ☐ | |

**Données à vérifier pour les ENSEIGNANTS :**
| Champ | Disponible ? | Qualité |
|-------|--------------|---------|
| Matricule/ID | ☐ | |
| Nom complet | ☐ | |
| Grade académique | ☐ | |
| Département | ☐ | |
| Spécialité | ☐ | |
| Contact | ☐ | |

---

### **BLOC 3 : STRATÉGIE DE COLLECTE ET ENCODAGE** (30 min)

| Durée | Point à discuter |
|-------|------------------|
| 10 min | **3.1** Processus d'importation des données existantes |
| 10 min | **3.2** Mécanisme de collecte des données manquantes |
| 10 min | **3.3** Workflow de validation et activation des comptes |

**Options d'importation à évaluer :**
1. **Import automatique** - Migration directe depuis les BDD Backbone
2. **Import semi-automatique** - Fichiers Excel/CSV fournis par les facultés
3. **Saisie manuelle** - Interface d'encodage dans NEXUS

**Workflow proposé :**
```
[BDD Backbone] → [Extraction] → [Nettoyage] → [Import NEXUS] → [Génération ID] → [Activation compte]
```

---

### **BLOC 4 : DÉCISIONS ET PROCHAINES ÉTAPES** (20 min)

| Durée | Point à discuter |
|-------|------------------|
| 10 min | **4.1** Récapitulatif des décisions prises |
| 10 min | **4.2** Attribution des tâches et échéances |

---

## ✅ LIVRABLES ATTENDUS DE LA RÉUNION

- [ ] Convention de nommage des identifiants validée
- [ ] Liste des champs de données à migrer
- [ ] Identification des gaps de données
- [ ] Plan d'action pour la collecte/encodage
- [ ] Calendrier de migration défini

---

## 📝 PRÉPARATION REQUISE

**Équipe Backbone UNIKIN doit apporter :**
- Documentation sur la structure des BDD existantes
- Échantillon de données (anonymisé si nécessaire)
- Statistiques sur le volume de données (nb étudiants, enseignants)

**Équipe NEXUS doit préparer :**
- Schéma de la base de données NEXUS (tables users, students, teachers)
- Interface d'import/export de données
- Démo du processus de création de compte

---

## 🗂️ ANNEXE : STRUCTURE BDD NEXUS (Référence)

### Table `users`
```sql
- id (UUID)
- email (identifiant de connexion)
- password_hash
- role (student, teacher, admin, employee)
- status (active, inactive, pending)
- created_at
```

### Table `students`
```sql
- id (UUID)
- user_id (FK)
- matricule (UNIQUE)
- first_name, last_name
- faculty_id, department_id
- promotion_id
```

### Table `teachers`
```sql
- id (UUID)
- user_id (FK)
- employee_id (UNIQUE)
- first_name, last_name
- academic_rank
- department_id
```

---

## 📞 CONTACTS

| Équipe | Responsable | Rôle |
|--------|-------------|------|
| NEXUS UNIKIN | M. Chris Ngozulu Kasongo et son équipe | Chef de projet |
| Backbone UNIKIN | M. Alphonse Tamina et son équipe | Administrateur BDD |

---

*Document préparé le 04/02/2026*  
*Projet NEXUS UNIKIN - Système de Gestion Académique Intégré*

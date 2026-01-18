# 🎓 NEXUS UNIKIN

<div align="center">

![NEXUS UNIKIN](https://img.shields.io/badge/NEXUS-UNIKIN-blue?style=for-the-badge&logo=graduation-cap)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**Système de Gestion Universitaire Moderne pour l'Université de Kinshasa**

</div>

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Comptes de test](#-comptes-de-test)
- [Structure du projet](#-structure-du-projet)
- [Technologies](#-technologies)
- [API Documentation](#-api-documentation)

---

## 🌟 Présentation

**NEXUS UNIKIN** est une plateforme complète de gestion universitaire conçue pour l'Université de Kinshasa (UNIKIN). Elle offre une interface moderne et intuitive pour gérer tous les aspects de la vie académique :

- ✅ Gestion des inscriptions et dossiers étudiants
- ✅ Encodage et suivi des notes
- ✅ Système de présence avec codes de validation
- ✅ Délibérations académiques automatisées
- ✅ Emplois du temps interactifs
- ✅ Gestion financière et suivi des paiements

---

## ✨ Fonctionnalités

### 👨‍💼 Espace Administrateur (Super Admin)
- Création et gestion des facultés, départements, promotions
- Gestion des comptes utilisateurs (étudiants, enseignants, employés)
- Configuration des années académiques et semestres
- Système de délibération avec verrouillage automatique
- Tableau de bord avec statistiques globales

### 👨‍🏫 Espace Enseignant
- Gestion des cours assignés
- Encodage des notes (CC, TP, Examens)
- Génération de codes de présence
- Visualisation de l'emploi du temps
- Suivi de l'avancement des cours

### 👨‍🎓 Espace Étudiant
- Consultation des notes et résultats
- Validation de présence avec code
- Consultation de l'emploi du temps
- Suivi de la situation financière
- Notifications et annonces

### 👨‍💻 Espace Employé
- Traitement des inscriptions
- Validation des paiements
- Génération de documents (attestations, relevés)
- Gestion des dossiers étudiants

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │   Admin     │   Teacher   │   Student   │   Employee  │     │
│  │  Dashboard  │  Dashboard  │  Dashboard  │  Dashboard  │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│                     API Routes (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                      Prisma ORM                                  │
├─────────────────────────────────────────────────────────────────┤
│                   PostgreSQL (Supabase)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou pnpm
- PostgreSQL (ou compte Supabase)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/unikin/nexus.git
cd nexus-unikin
```

2. **Installer les dépendances**
```bash
npm install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

6. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

---

## ⚙️ Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_unikin"
DIRECT_URL="postgresql://user:password@localhost:5432/nexus_unikin"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="NEXUS UNIKIN"
NEXTAUTH_SECRET="your-secret-key"

# Email (optionnel)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@unikin.ac.cd"
SMTP_PASSWORD="your-password"
```

---

## 👤 Comptes de test

Après avoir exécuté `prisma db seed`, les comptes suivants sont disponibles :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@unikin.ac.cd | Admin@2026 |
| Enseignant | prof.kabongo@unikin.ac.cd | Prof@2026 |
| Étudiant | etudiant.mbuyi@student.unikin.ac.cd | Etudiant@2026 |
| Étudiant (bloqué) | etudiant.kasongo@student.unikin.ac.cd | Etudiant@2026 |
| Employé | employe.mutombo@unikin.ac.cd | Employe@2026 |

---

## 📁 Structure du projet

```
nexus-unikin/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── academic/
│   │   ├── students/
│   │   └── deliberation/
│   ├── teacher/
│   │   ├── dashboard/
│   │   ├── grades/
│   │   └── timetable/
│   ├── student/
│   │   ├── dashboard/
│   │   └── timetable/
│   ├── employee/
│   │   └── dashboard/
│   └── api/
│       ├── auth/
│       ├── students/
│       ├── courses/
│       ├── grades/
│       ├── attendance/
│       └── deliberations/
├── components/
│   ├── layout/
│   ├── timetable/
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── supabase/
│   ├── types.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
└── styles/
```

---

## 🛠 Technologies

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | TailwindCSS, shadcn/ui, Radix UI |
| **State** | React Query (TanStack), Zustand |
| **Database** | PostgreSQL, Prisma ORM |
| **Backend** | Supabase (Auth, Storage, Realtime) |
| **Charts** | Recharts |
| **Forms** | React Hook Form, Zod |
| **PDF/Excel** | jspdf, xlsx |

---

## 📖 API Documentation

### Étudiants

```
GET    /api/students          - Liste des étudiants
POST   /api/students          - Créer un étudiant
GET    /api/students/:id      - Détails d'un étudiant
PATCH  /api/students/:id      - Modifier un étudiant
DELETE /api/students/:id      - Supprimer un étudiant
```

### Notes

```
GET    /api/grades            - Liste des notes
POST   /api/grades            - Enregistrer des notes (batch)
PATCH  /api/grades            - Valider/verrouiller une note
```

### Présences

```
GET    /api/attendance        - Sessions de présence
POST   /api/attendance        - Créer une session (génère le code)
PATCH  /api/attendance        - Valider une présence avec code
```

### Délibérations

```
GET    /api/deliberations     - Liste des délibérations
POST   /api/deliberations     - Créer une session
PATCH  /api/deliberations     - Exécuter/valider une délibération
```

---

## 🎨 Personnalisation

### Couleurs (tailwind.config.ts)

```typescript
colors: {
  unikin: {
    primary: '#1E40AF',    // Bleu principal
    secondary: '#0891B2',  // Cyan
    accent: '#7C3AED',     // Violet
    success: '#10B981',    // Vert
    warning: '#F59E0B',    // Orange
    danger: '#EF4444',     // Rouge
  }
}
```

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire notre [guide de contribution](CONTRIBUTING.md) avant de soumettre une pull request.

---

## 📞 Support

- 📧 Email: support@unikin.ac.cd
- 🌐 Site: https://nexus.unikin.ac.cd
- 📱 WhatsApp: +243 XXX XXX XXX

---

<div align="center">

**Développé avec ❤️ pour l'Université de Kinshasa**

© 2025 NEXUS UNIKIN - Tous droits réservés

</div>

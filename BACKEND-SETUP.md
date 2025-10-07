# Progress2Win - Configuration Multi-Backend

Ce projet supporte **deux backends différents** avec le même frontend React :

1. **Backend Tauri (Rust + SQLite)** - Application desktop native
2. **Backend Express (Node.js + PostgreSQL)** - API web classique

## 🎯 Architectures disponibles

### Architecture 1 : Tauri (Desktop Native)
```
Frontend (React + Vite)
    ↓
Backend Tauri (Rust)
    ↓
SQLite Database
```

### Architecture 2 : Express (Web API)
```
Frontend (React + Vite)
    ↓
Backend Express (Node.js)
    ↓
PostgreSQL Database
```

---

## 🚀 Démarrage rapide

### Option A : Mode Tauri (Application Desktop)

#### Prérequis
- Rust et Cargo installés
- Node.js 18+

#### Installation
```bash
# Installer les dépendances
npm install

# Lancer l'application
npm run tauri dev
```

✅ L'application desktop s'ouvre automatiquement avec SQLite.

---

### Option B : Mode Express (API Web)

#### Prérequis
- Node.js 18+
- PostgreSQL 14+

#### 1. Configuration de PostgreSQL

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE progress2win;
\q
```

#### 2. Configuration du backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env.example .env
# Éditer .env avec vos paramètres PostgreSQL

# Exécuter les migrations
npm run migrate

# Créer un utilisateur de test
npm run seed
```

#### 3. Configuration du frontend

```bash
# Dans le répertoire racine
cp env.local.example .env.local
```

Éditer `.env.local`:
```env
VITE_BACKEND_TYPE=express
VITE_API_URL=http://localhost:3000/api
```

#### 4. Démarrage

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

✅ Ouvrez `http://localhost:5173` dans votre navigateur.

---

## 🔄 Basculer entre les backends

### Passer en mode Tauri

Créez ou modifiez `.env.local`:
```env
VITE_BACKEND_TYPE=tauri
```

Puis lancez:
```bash
npm run tauri dev
```

### Passer en mode Express

Créez ou modifiez `.env.local`:
```env
VITE_BACKEND_TYPE=express
VITE_API_URL=http://localhost:3000/api
```

Puis lancez:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

---

## 📁 Structure du projet

```
progress2win/
├── src/                      # Frontend React
│   ├── components/           # Composants UI
│   ├── pages/                # Pages de l'application
│   ├── services/
│   │   └── api.ts            # Client API (supporte Tauri + Express)
│   ├── stores/               # État global (Zustand)
│   ├── types/                # Types TypeScript
│   └── config.ts             # Configuration du backend
├── src-tauri/                # Backend Tauri (Rust)
│   ├── src/
│   │   ├── main.rs           # Point d'entrée
│   │   ├── database.rs       # SQLite
│   │   ├── commands/         # Commandes Tauri
│   │   └── models.rs         # Modèles de données
│   └── tauri.conf.json
├── backend/                  # Backend Express (Node.js)
│   ├── src/
│   │   ├── index.ts          # Point d'entrée
│   │   ├── database/         # PostgreSQL + migrations
│   │   ├── routes/           # Routes API
│   │   ├── middleware/       # Auth, error handling
│   │   └── types/            # Types TypeScript
│   └── package.json
└── package.json              # Dépendances frontend
```

---

## 🔐 Authentification

Utilisateur de test (fonctionne sur les deux backends) :
- **Email** : `test@progress2win.com`
- **Mot de passe** : `password123`

---

## 🎨 Frontend

Le frontend est **identique** pour les deux backends grâce au système de configuration :

```typescript
// src/config.ts
export const config: AppConfig = {
  backendType: 'tauri' | 'express',
  expressApiUrl: 'http://localhost:3000/api'
};

// src/services/api.ts
export const authApi = {
  login: async (data) => {
    if (isTauriBackend()) {
      return await invoke('login_user', { data });
    } else {
      return await fetch('/api/auth/login', { ... });
    }
  }
};
```

---

## 📊 Fonctionnalités

Toutes les fonctionnalités sont disponibles sur les deux backends :

- ✅ Authentification (register, login, logout, reset password)
- ✅ Gestion du profil utilisateur
- ✅ Suivi de progression quotidienne
- ✅ Catégories et métriques personnalisées
- ✅ Comparaison avec des amis
- ✅ Leaderboard
- ✅ Notifications
- ✅ Système d'abonnement
- ✅ Paramètres

---

## 🛠️ Développement

### Backend Tauri (Rust)
```bash
# Compiler
cd src-tauri
cargo build

# Tests
cargo test
```

### Backend Express (Node.js)
```bash
cd backend

# Mode développement (hot reload)
npm run dev

# Compiler
npm run build

# Production
npm start
```

### Frontend (React)
```bash
# Mode développement
npm run dev

# Compiler
npm run build

# Vérifier les types
npx tsc --noEmit
```

---

## 🎯 Quand utiliser chaque backend ?

### Utilisez Tauri si :
- ✅ Vous voulez une application desktop native
- ✅ Vous avez besoin de performances maximales
- ✅ Vous voulez distribuer une app standalone
- ✅ Vous voulez éviter la configuration d'un serveur
- ✅ SQLite suffit pour votre use case

### Utilisez Express si :
- ✅ Vous voulez une application web accessible partout
- ✅ Vous avez besoin de plusieurs utilisateurs simultanés
- ✅ Vous voulez une base PostgreSQL avec features avancées
- ✅ Vous avez déjà une infrastructure Node.js
- ✅ Vous voulez faciliter le déploiement cloud

---

## 🚢 Déploiement

### Backend Tauri
```bash
npm run tauri build
# Les exécutables sont dans src-tauri/target/release/
```

### Backend Express
```bash
cd backend
npm run build
# Déployer sur Heroku, Railway, Render, etc.
```

---

## 📝 Notes

- Les deux backends utilisent **exactement les mêmes** types TypeScript
- Les deux backends ont **les mêmes routes** et **la même logique métier**
- Le frontend est **totalement agnostique** du backend utilisé
- Vous pouvez développer en Tauri et déployer en Express (ou vice versa)

---

## ❓ Troubleshooting

### Tauri ne compile pas
- Vérifiez que Rust est installé : `rustc --version`
- Vérifiez que Cargo est dans le PATH
- Redémarrez votre terminal après l'installation de Rust

### Express ne démarre pas
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans `.env`
- Exécutez les migrations : `npm run migrate`

### Le frontend ne se connecte pas
- Vérifiez `.env.local`
- Vérifiez que `VITE_BACKEND_TYPE` est correct
- Redémarrez le serveur de développement Vite


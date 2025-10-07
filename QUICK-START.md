# 🚀 Progress2Win - Démarrage Rapide

## 📦 Ce que vous avez

**Deux backends complètement fonctionnels** partageant le même frontend React :

### Backend 1 : **Tauri** (Desktop Native)
- ✅ Backend : Rust + SQLite
- ✅ Frontend : React + Vite
- ✅ Package : Application desktop native

### Backend 2 : **Express** (Web API)
- ✅ Backend : Node.js + PostgreSQL  
- ✅ Frontend : React + Vite (le même !)
- ✅ Package : API web + application web

---

## ⚡ Démarrage en 30 secondes

### Mode Tauri (Desktop) - RECOMMANDÉ POUR COMMENCER

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer l'application
npm run tauri dev
```

✅ **C'est tout !** L'application desktop s'ouvre avec SQLite intégré.

**Identifiants de test :**
- Email : `test@progress2win.com`
- Password : `password123`

---

## 🌐 Mode Express (Web) - Si vous voulez tester l'API

### Prérequis
- PostgreSQL installé et démarré

### Étapes

**1. Configurer PostgreSQL**
```bash
psql -U postgres
CREATE DATABASE progress2win;
\q
```

**2. Configurer le backend**
```bash
cd backend
npm install
cp env.example .env
# Éditez .env avec vos credentials PostgreSQL
npm run migrate
npm run seed
```

**3. Configurer le frontend**
```bash
# Dans le répertoire racine
cp env.local.example .env.local
```

Éditez `.env.local` :
```env
VITE_BACKEND_TYPE=express
VITE_API_URL=http://localhost:3000/api
```

**4. Démarrer les serveurs**

Terminal 1 :
```bash
cd backend
npm run dev
```

Terminal 2 :
```bash
npm run dev
```

Ouvrez http://localhost:5173

---

## 🎯 Quelle version utiliser ?

### Utilisez **Tauri** (Desktop) si :
- ✅ Vous voulez une démo rapide
- ✅ Vous développez une app desktop
- ✅ Vous n'avez pas PostgreSQL

### Utilisez **Express** (Web) si :
- ✅ Vous voulez une app web
- ✅ Vous avez besoin de multi-utilisateurs
- ✅ Vous avez PostgreSQL

---

## 📝 Fonctionnalités (identiques sur les deux backends)

- ✅ Authentification complète (register, login, logout, password reset)
- ✅ Profil utilisateur
- ✅ Suivi de progression quotidienne  
- ✅ Catégories et métriques personnalisables
- ✅ Comparaison avec amis
- ✅ Leaderboard
- ✅ Notifications
- ✅ Système d'abonnement
- ✅ Design néo-brutalisme moderne

---

## 🔄 Basculer entre les backends

C'est **aussi simple que de modifier un fichier** !

### Passer à Tauri
`.env.local` :
```env
VITE_BACKEND_TYPE=tauri
```
Puis : `npm run tauri dev`

### Passer à Express
`.env.local` :
```env
VITE_BACKEND_TYPE=express
VITE_API_URL=http://localhost:3000/api
```
Puis : `npm run dev` (+ backend Express en parallèle)

---

## 📚 Documentation complète

- `BACKEND-SETUP.md` - Guide détaillé sur les deux architectures
- `backend/README.md` - Documentation du backend Express
- `README-frontend.md` - Documentation du frontend React

---

## 🎨 Le projet en un coup d'œil

```
📦 progress2win/
├── 🖥️ src/                 # Frontend React (commun aux 2 backends)
├── 🦀 src-tauri/           # Backend Tauri (Rust + SQLite)
├── 🟢 backend/             # Backend Express (Node + PostgreSQL)
└── ⚙️ config files
```

**Le même frontend fonctionne avec les deux backends !**

---

## ❓ Problèmes ?

### Tauri ne compile pas
```bash
# Installer Rust
https://rustup.rs/
# Redémarrer le terminal puis :
npm run tauri dev
```

### PostgreSQL ne fonctionne pas
```bash
# Vérifier que PostgreSQL est démarré
pg_ctl status
# Ou utilisez Tauri à la place !
```

---

## 🎉 Prêt à coder !

**L'application fonctionne** - Vous pouvez maintenant :
- 🔧 Modifier le frontend (`src/`)
- 🦀 Modifier le backend Tauri (`src-tauri/src/`)
- 🟢 Modifier le backend Express (`backend/src/`)

**Les deux backends restent synchronisés avec les mêmes fonctionnalités !**


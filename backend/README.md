# Progress2Win - Backend Express/PostgreSQL

Backend Node.js/Express avec PostgreSQL pour Progress2Win.

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Créez un fichier `.env` basé sur `env.example`:
```bash
cp env.example .env
```

2. Modifiez les variables d'environnement dans `.env`:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/progress2win
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

## 🗄️ Base de données

### Créer la base de données PostgreSQL

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créez la base de données
CREATE DATABASE progress2win;
\q
```

### Exécuter les migrations

```bash
npm run migrate
```

### Créer un utilisateur de test

```bash
npm run seed
```

Identifiants de test:
- **Email**: test@progress2win.com
- **Mot de passe**: password123

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Créer un compte
- `POST /login` - Se connecter
- `POST /logout` - Se déconnecter
- `POST /refresh` - Rafraîchir le token
- `POST /forgot-password` - Demander un reset de mot de passe
- `POST /reset-password` - Réinitialiser le mot de passe
- `GET /me` - Obtenir l'utilisateur connecté

### Users (`/api/users`)
- `GET /:userId` - Obtenir un profil utilisateur
- `PUT /:userId` - Mettre à jour un profil
- `DELETE /:userId` - Supprimer un compte

### Progress (`/api/progress`)
- `POST /` - Ajouter une entrée de progression
- `GET /` - Obtenir toutes les progressions
- `GET /:progressId` - Obtenir une progression par ID
- `PUT /:progressId` - Mettre à jour une progression
- `DELETE /:progressId` - Supprimer une progression

### Compare (`/api/compare`)
- `GET /user/:friendId` - Comparer avec un ami
- `POST /invite` - Inviter un ami
- `GET /leaderboard` - Obtenir le classement

### Notifications (`/api/notifications`)
- `GET /` - Obtenir les notifications
- `POST /` - Créer une notification
- `PUT /:notificationId/read` - Marquer comme lu
- `DELETE /:notificationId` - Supprimer

### Subscriptions (`/api/subscriptions`)
- `POST /create-checkout` - Créer un abonnement
- `GET /` - Obtenir l'abonnement
- `POST /cancel` - Annuler l'abonnement
- `POST /webhook` - Webhook Stripe

### Settings (`/api/settings`)
- `GET /` - Obtenir les paramètres
- `PUT /:key` - Mettre à jour un paramètre
- `GET /metrics` - Obtenir les métriques

## 🔒 Authentification

Les routes protégées nécessitent un header `Authorization`:
```
Authorization: Bearer <access_token>
```

## 🌐 Utilisation avec le frontend

Pour utiliser ce backend avec le frontend React:

1. Créez un fichier `.env.local` dans le répertoire racine du frontend:
```env
VITE_BACKEND_TYPE=express
VITE_API_URL=http://localhost:3000/api
```

2. Redémarrez le frontend

Le frontend basculera automatiquement vers ce backend Express au lieu de Tauri.

## 🔄 Basculer entre Tauri et Express

### Mode Tauri (défaut)
```env
VITE_BACKEND_TYPE=tauri
```

### Mode Express
```env
VITE_BACKEND_TYPE=express
VITE_API_URL=http://localhost:3000/api
```


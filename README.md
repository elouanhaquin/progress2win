# Tracky (Progress2Win) 🎯

Application de suivi de progrès fitness avec comparaison entre amis, style neo-brutalism.

## 🚀 Démarrage rapide avec Docker

### Prérequis

- Docker Desktop installé ([Télécharger](https://www.docker.com/products/docker-desktop))

### Installation

```bash
# 1. Cloner/Télécharger le projet
cd Tracky

# 2. Démarrer avec Docker (Windows)
start.bat

# OU avec Docker Compose directement
docker-compose up -d
```

### Accès

- **Application** : http://localhost
- **API Backend** : http://localhost:3001/api

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Logs backend uniquement
docker-compose logs -f backend

# Logs frontend uniquement
docker-compose logs -f frontend

# Arrêter l'application
docker-compose down

# Redémarrer
docker-compose restart

# Rebuild après des changements
docker-compose up --build -d
```

## 📦 Architecture

```
Browser (localhost)
    ↓
Nginx (Port 80)
    ├── Frontend (React/Vite/TypeScript)
    └── /api → Backend (Express/Node.js:3001)
                  └── SQLite Database (Volume persisté)
```

## 🛠️ Développement local (sans Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

Le backend démarre sur http://localhost:3001

### Frontend

```bash
npm install
npm run dev
```

Le frontend démarre sur http://localhost:5173

## ✨ Fonctionnalités

- ✅ **Authentification** : Inscription, connexion, profil
- ✅ **Suivi de progrès** : Log tes entrées fitness (force, cardio, poids, etc.)
- ✅ **Goals** : Définis des objectifs avec deadline et suivi visuel
- ✅ **Groupes** : Rejoins/crée des groupes avec code de partage
- ✅ **Comparaison** : Compare tes stats avec tes amis
- ✅ **Leaderboard** : Classements par catégories et métriques
- ✅ **Célébrations** : Confettis et animations fun après chaque entry ! 🎉
- ✅ **Design Neo-Brutalism** : Bordures épaisses, couleurs vives, ombres dures

## 🎨 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router
- Zustand (state management)
- React Hook Form + Zod (validation)
- Recharts (graphiques)
- Tailwind CSS (styling neo-brutalism)
- Lucide React (icônes)

### Backend
- Express.js + TypeScript
- Better-SQLite3 (base de données)
- JWT (authentification)
- Bcrypt (hashing passwords)
- Helmet + CORS (sécurité)

### DevOps
- Docker + Docker Compose
- Nginx (reverse proxy + static files)
- Multi-stage builds optimisés

## 📊 Catégories de progrès

- **Strength** : bench_press, squat, deadlift, etc.
- **Cardio** : distance, time, speed, calories
- **Bodyweight** : pull_ups, push_ups, planks, etc.
- **Weight Loss** : weight, body_fat, waist, etc.
- **Nutrition** : calories, protein, carbs, fats, water
- **Other** : custom metrics

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Tokens JWT pour l'authentification
- CORS configuré
- Helmet pour headers de sécurité
- Rate limiting sur l'API
- Variables d'environnement pour les secrets

## 📝 Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# JWT Secrets (CHANGER EN PRODUCTION!)
JWT_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Port
PORT=3001
NODE_ENV=production
```

## 🗄️ Persistance des données

La base de données SQLite est stockée dans un volume Docker :
```
./backend/data/progress2win.db
```

### Backup

```bash
# Copier la DB depuis le container
docker cp tracky-backend:/app/data/progress2win.db ./backup.db
```

### Restore

```bash
# Copier une backup vers le container
docker cp ./backup.db tracky-backend:/app/data/progress2win.db
docker-compose restart backend
```

## 🐛 Troubleshooting

### Les containers ne démarrent pas

```bash
# Voir les logs d'erreur
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port 80 déjà utilisé

Modifier `docker-compose.yml` :

```yaml
frontend:
  ports:
    - "8080:80"  # Utiliser le port 8080 au lieu de 80
```

Puis accéder via http://localhost:8080

### Base de données corrompue

```bash
# Supprimer et recréer
docker-compose down -v
docker-compose up -d
```

## 👥 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT

## 🎯 Roadmap

- [ ] Notifications push
- [ ] Export des données (CSV, PDF)
- [ ] Statistiques avancées
- [ ] Mobile app (React Native)
- [ ] Intégrations (Strava, MyFitnessPal, etc.)
- [ ] Challenges entre groupes
- [ ] Badges et achievements

---

Made with 💪 and ☕

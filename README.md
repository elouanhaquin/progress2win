# Progress2Win - Backend Tauri

Backend développé avec Tauri et Rust pour l'application Progress2Win.

## Architecture

Le backend utilise :
- **Tauri** : Framework pour applications natives cross-platform
- **SQLite** : Base de données locale (plus adaptée que PostgreSQL pour Tauri)
- **SQLx** : ORM async pour Rust
- **JWT** : Authentification avec tokens
- **bcrypt** : Hachage des mots de passe

## Structure du projet

```
src/
├── main.rs              # Point d'entrée de l'application
├── database.rs          # Configuration et migrations de la base de données
├── models.rs            # Structures de données (User, Progress, etc.)
├── error.rs             # Gestion des erreurs personnalisées
└── commands/            # Commandes Tauri (équivalent des routes API)
    ├── mod.rs
    ├── auth.rs          # Authentification (register, login, logout, etc.)
    ├── users.rs         # Gestion des profils utilisateurs
    ├── progress.rs      # Suivi des progrès
    ├── compare.rs       # Comparaison et leaderboard
    └── other.rs         # Notifications, abonnements, paramètres
```

## Commandes Tauri disponibles

### Authentification
- `register_user` : Créer un compte utilisateur
- `login_user` : Connexion avec email/mot de passe
- `logout_user` : Déconnexion
- `refresh_token` : Renouvellement du token JWT
- `forgot_password` : Demande de réinitialisation du mot de passe
- `reset_password` : Réinitialisation avec token
- `get_current_user` : Récupérer les infos du user connecté

### Utilisateurs
- `get_user_profile` : Récupérer profil utilisateur public
- `update_user_profile` : Modifier profil (nom, avatar, objectifs)
- `delete_user_account` : Supprimer compte utilisateur

### Progression
- `add_progress` : Ajouter une nouvelle mesure
- `get_user_progress` : Récupérer toutes les mesures du user connecté
- `get_user_progress_by_id` : Récupérer mesures d'un autre utilisateur
- `update_progress` : Modifier une mesure existante
- `delete_progress` : Supprimer une mesure

### Comparaison
- `compare_progress` : Comparer le user connecté avec ses amis
- `invite_friend` : Inviter un ami à comparer
- `get_leaderboard` : Récupérer classement global ou groupe spécifique

### Notifications
- `get_notifications` : Liste notifications pour user connecté
- `create_notification` : Créer une notification
- `mark_notification_read` : Marquer comme lue
- `delete_notification` : Supprimer notification

### Abonnements
- `create_checkout_session` : Initier paiement Stripe
- `get_subscription` : Récupérer abonnement actif
- `cancel_subscription` : Annuler abonnement
- `handle_stripe_webhook` : Webhook Stripe

### Paramètres
- `get_settings` : Récupérer paramètres globaux
- `update_settings` : Modifier paramètres
- `get_metrics` : Statistiques générales

## Installation et développement

### Prérequis
- Rust (dernière version stable)
- Tauri CLI : `cargo install tauri-cli`

### Installation
```bash
# Cloner le projet
git clone <repository>
cd progress2win

# Installer les dépendances
cargo build

# Lancer en mode développement
cargo tauri dev
```

### Tests
```bash
# Lancer tous les tests
cargo test

# Lancer les tests avec couverture
cargo test -- --nocapture
```

## Base de données

La base de données SQLite est créée automatiquement au premier lancement avec les tables :
- `users` : Utilisateurs
- `refresh_tokens` : Tokens de rafraîchissement
- `password_reset_tokens` : Tokens de réinitialisation
- `progress` : Entrées de progression
- `notifications` : Notifications
- `subscriptions` : Abonnements
- `user_friends` : Relations d'amitié
- `settings` : Paramètres globaux

## Sécurité

- Mots de passe hachés avec bcrypt (12 rounds)
- Tokens JWT pour l'authentification
- Validation des données d'entrée
- Gestion des erreurs sécurisée
- Protection contre les injections SQL (SQLx)

## Déploiement

Pour créer une application native :

```bash
# Build de production
cargo tauri build
```

L'exécutable sera généré dans `src-tauri/target/release/bundle/`.

## Intégration Frontend

Le frontend React peut appeler les commandes Tauri via l'API Tauri :

```javascript
import { invoke } from '@tauri-apps/api/tauri';

// Exemple d'appel
const user = await invoke('register_user', {
  userData: {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  }
});
```

## Prochaines étapes

1. **Frontend React** : Développer l'interface utilisateur
2. **Tests E2E** : Tests d'intégration complets
3. **Stripe Integration** : Implémentation complète des paiements
4. **Email Service** : Service d'envoi d'emails pour les notifications
5. **Synchronisation** : Sync avec des applications tierces
6. **Analytics** : Tableaux de bord avancés
7. **Mobile** : Version mobile avec Tauri mobile

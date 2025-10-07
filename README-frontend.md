# Progress2Win - Frontend React

Frontend React avec design néo-brutalisme pour l'application Progress2Win.

## 🎨 Design Néo-Brutalisme

Le design suit les principes du néo-brutalisme :
- **Couleurs vives et contrastées** : Palette avec primary, secondary, accent, danger, success
- **Bordures épaisses** : Tous les éléments ont des bordures noires de 2-4px
- **Ombres prononcées** : Effet d'ombre "neo" avec décalage vers le bas-droit
- **Typographie bold** : Polices Inter avec poids élevés (600-900)
- **Formes géométriques** : Rectangles et carrés nets, pas de border-radius excessif
- **Interactions physiques** : Effet de "pression" au hover avec translation

## 🚀 Fonctionnalités

### Pages d'authentification
- ✅ **Login** : Connexion avec email/mot de passe
- ✅ **Register** : Inscription avec validation
- ✅ **Forgot Password** : Réinitialisation de mot de passe
- ✅ **Design cohérent** : Style néo-brutalisme sur toutes les pages

### Dashboard principal
- ✅ **Vue d'ensemble** : Statistiques et métriques clés
- ✅ **Progrès récents** : Affichage des dernières entrées
- ✅ **Actions rapides** : Boutons pour ajouter du progrès
- ✅ **Objectifs** : Affichage des objectifs utilisateur
- ✅ **Statistiques globales** : Métriques de l'application

### Pages fonctionnelles
- ✅ **Progress** : Gestion des entrées de progression
- ✅ **Compare** : Comparaison avec des amis
- ✅ **Leaderboard** : Classements et rankings
- ✅ **Notifications** : Centre de notifications
- ✅ **Settings** : Paramètres utilisateur et application

### Composants UI
- ✅ **Système de design complet** : Boutons, inputs, cards, badges, etc.
- ✅ **Layout responsive** : Sidebar et navigation adaptatifs
- ✅ **Thème cohérent** : Classes CSS personnalisées pour le néo-brutalisme
- ✅ **Animations** : Transitions et effets hover

## 🛠️ Technologies

- **React 18** : Framework frontend
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS avec configuration personnalisée
- **React Router** : Navigation
- **React Hook Form + Zod** : Gestion des formulaires et validation
- **Zustand** : Gestion d'état
- **Lucide React** : Icônes
- **Date-fns** : Manipulation des dates
- **Tauri API** : Communication avec le backend Rust

## 📁 Structure du projet

```
src/
├── components/
│   ├── Layout.tsx          # Layout principal avec sidebar et header
│   └── UI.tsx             # Composants UI réutilisables
├── pages/
│   ├── auth/              # Pages d'authentification
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── DashboardPage.tsx  # Dashboard principal
│   ├── ProgressPage.tsx   # Gestion des progrès
│   ├── ComparePage.tsx    # Comparaison
│   ├── LeaderboardPage.tsx # Classements
│   ├── NotificationsPage.tsx # Notifications
│   └── SettingsPage.tsx   # Paramètres
├── stores/
│   ├── authStore.ts       # Store d'authentification
│   └── appStore.ts        # Store de l'application
├── services/
│   └── api.ts            # Services API Tauri
├── types/
│   └── index.ts          # Types TypeScript
├── App.tsx               # Composant principal avec routes
├── main.tsx             # Point d'entrée
└── index.css            # Styles Tailwind personnalisés
```

## 🎨 Classes CSS personnalisées

### Boutons
- `.btn-neo` : Style de base néo-brutalisme
- `.btn-neo-primary` : Bouton principal (violet)
- `.btn-neo-secondary` : Bouton secondaire (bleu)
- `.btn-neo-accent` : Bouton accent (jaune)
- `.btn-neo-danger` : Bouton danger (rouge)
- `.btn-neo-success` : Bouton succès (vert)

### Inputs
- `.input-neo` : Style d'input néo-brutalisme
- Effet de focus avec translation et ombre

### Cards
- `.card-neo` : Card de base
- `.card-neo-primary` : Card avec thème primary
- Effet hover avec translation et ombre

### Ombres
- `.shadow-neo` : Ombre de base (4px)
- `.shadow-neo-sm` : Petite ombre (2px)
- `.shadow-neo-lg` : Grande ombre (8px)
- `.shadow-neo-xl` : Très grande ombre (12px)

## 🚀 Installation et développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Lancer avec Tauri
npm run tauri dev
```

## 🎯 Prochaines étapes

1. **Intégration Tauri** : Connecter les services API avec le backend Rust
2. **Graphiques** : Ajouter des graphiques avec Recharts
3. **Animations** : Améliorer les animations et transitions
4. **Tests** : Ajouter des tests unitaires et d'intégration
5. **PWA** : Transformer en Progressive Web App
6. **Mobile** : Adapter pour les écrans mobiles
7. **Thèmes** : Système de thèmes avancé
8. **Accessibilité** : Améliorer l'accessibilité

## 🎨 Palette de couleurs

```css
Primary:   #e54dff (Violet)
Secondary: #0ea5e9 (Bleu)
Accent:    #eab308 (Jaune)
Success:   #22c55e (Vert)
Danger:    #ef4444 (Rouge)
Neutral:   #737373 (Gris)
```

Le design néo-brutalisme donne une identité visuelle forte et moderne à Progress2Win, avec des interactions satisfaisantes et une esthétique distinctive !




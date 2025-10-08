# 🔄 Guide de Mise à Jour - Progress2Win

Ce guide explique comment mettre à jour Progress2Win une fois déjà déployé sur votre VPS.

> **Note :** Pour un premier déploiement, consultez `DEPLOY-INITIAL.md`

## 📋 Prérequis

- Application Progress2Win déjà déployée sur un VPS
- Accès SSH au VPS
- Code source mis à jour (nouvelles fonctionnalités, corrections)
- ⏱️ Temps estimé : 5-10 minutes

---

## 🎯 Méthode 1 : Mise à jour rapide (Git)

**Utilisez cette méthode si vous avez initialement déployé via Git.**

### Étape 1 : Connexion au VPS

```bash
ssh root@votre-ip-vps
# ou si vous avez changé le port SSH :
ssh -p 2222 root@votre-ip-vps
```

### Étape 2 : Backup de la base de données (IMPORTANT !)

```bash
# Se placer dans le dossier du projet
cd /opt/progress2win

# Créer un backup avant toute modification
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/backups
docker cp progress2win-backend:/app/data/progress2win.db /root/backups/progress2win_backup_$DATE.db

echo "✅ Backup créé : progress2win_backup_$DATE.db"
```

### Étape 3 : Récupérer les dernières modifications

```bash
# Sauvegarder le .env actuel (au cas où)
cp .env .env.backup

# Récupérer les derniers changements depuis Git
git pull origin main
# ou si vous êtes sur master :
# git pull origin master
```

### Étape 4 : Mettre à jour les variables d'environnement (si nécessaire)

```bash
# Vérifier si de nouvelles variables ont été ajoutées
cat .env.example

# Si de nouvelles variables sont nécessaires, les ajouter :
nano .env
# Ajouter les nouvelles variables (ex: MAILGUN_API_KEY)
```

### Étape 5 : Rebuild et redéployer

```bash
# Rebuild les images Docker avec les derniers changements
docker compose up -d --build

# Attendre quelques secondes que les containers démarrent
sleep 10

# Vérifier que tout fonctionne
docker compose ps
```

### Étape 6 : Vérifier les logs

```bash
# Voir les logs pour détecter d'éventuelles erreurs
docker compose logs -f

# Logs backend uniquement
docker compose logs -f backend

# Logs frontend uniquement
docker compose logs -f frontend

# Appuyer sur Ctrl+C pour quitter les logs
```

### Étape 7 : Tester l'application

```bash
# Tester l'API backend
curl http://localhost:3001/api/health

# Si ça fonctionne, visiter le site dans un navigateur
# https://progress2win.com
```

---

## 🎯 Méthode 2 : Mise à jour manuelle (SCP/SFTP)

**Utilisez cette méthode si vous n'utilisez pas Git.**

### Étape 1 : Sur votre PC local

#### Option A : Via SCP (PowerShell/Terminal)

```powershell
# Depuis Windows PowerShell
scp -r C:\Users\Tiaporo\Desktop\Tracky root@votre-ip-vps:/tmp/progress2win-update
```

#### Option B : Via FileZilla (SFTP)

1. Ouvrir FileZilla
2. Se connecter au VPS (SFTP)
3. Uploader le dossier du projet vers `/tmp/progress2win-update`

### Étape 2 : Sur le VPS

```bash
# Connexion SSH
ssh root@votre-ip-vps

# Backup de la base de données
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/backups
docker cp progress2win-backend:/app/data/progress2win.db /root/backups/progress2win_backup_$DATE.db

# Stopper les containers
cd /opt/progress2win
docker compose down

# Sauvegarder l'ancien .env et la DB
cp .env /root/backups/.env_$DATE
cp -r backend/data /root/backups/data_$DATE

# Remplacer les fichiers (SAUF .env et backend/data)
rsync -av --exclude='.env' --exclude='backend/data' --exclude='certbot' /tmp/progress2win-update/ /opt/progress2win/

# Vérifier/mettre à jour .env si besoin
nano .env

# Rebuild et redémarrer
docker compose up -d --build

# Vérifier
docker compose ps
docker compose logs -f
```

---

## 🎯 Méthode 3 : Mise à jour Zero-Downtime

**Pour éviter toute interruption de service.**

### Étape 1 : Préparation

```bash
ssh root@votre-ip-vps
cd /opt/progress2win

# Backup
DATE=$(date +%Y%m%d_%H%M%S)
docker cp progress2win-backend:/app/data/progress2win.db /root/backups/progress2win_backup_$DATE.db

# Récupérer les changements
git pull origin main
```

### Étape 2 : Build des nouvelles images en arrière-plan

```bash
# Build les nouvelles images sans arrêter les anciennes
docker compose build
```

### Étape 3 : Rolling update (un service à la fois)

```bash
# Mettre à jour le backend
docker compose up -d --no-deps --build backend

# Attendre 10 secondes
sleep 10

# Vérifier que le backend fonctionne
docker compose logs backend | tail -20

# Mettre à jour le frontend
docker compose up -d --no-deps --build frontend

# Vérifier
docker compose ps
```

---

## 🔍 Vérifications post-mise à jour

### 1. Vérifier les containers

```bash
docker compose ps
# Tous les containers doivent être "Up"
```

### 2. Vérifier les logs

```bash
docker compose logs --tail=50
# Pas d'erreurs critiques
```

### 3. Tester l'API

```bash
curl http://localhost:3001/api/health
# Devrait retourner un status 200
```

### 4. Tester le frontend

```bash
curl -I https://progress2win.com
# Devrait retourner 200 OK
```

### 5. Tester les fonctionnalités critiques

- Connexion utilisateur
- Enregistrement de progrès
- Affichage des graphiques
- Nouvelle fonctionnalité ajoutée

---

## 🚨 Rollback en cas de problème

**Si quelque chose ne fonctionne pas après la mise à jour :**

### Rollback rapide (Git)

```bash
cd /opt/progress2win

# Revenir à la version précédente
git log --oneline -5  # Voir les derniers commits
git reset --hard COMMIT_ID_PRECEDENT

# Rebuild avec l'ancienne version
docker compose down
docker compose up -d --build
```

### Restaurer depuis un backup

```bash
# Lister les backups disponibles
ls -lh /root/backups/

# Restaurer la base de données
docker cp /root/backups/progress2win_backup_YYYYMMDD_HHMMSS.db progress2win-backend:/app/data/progress2win.db

# Redémarrer le backend
docker compose restart backend
```

---

## 📊 Commandes utiles

### Voir l'utilisation des ressources

```bash
# CPU/RAM des containers
docker stats

# Espace disque
df -h
du -sh /opt/progress2win/*
```

### Nettoyer Docker (libérer de l'espace)

```bash
# Supprimer les images inutilisées
docker image prune -a

# Supprimer tout ce qui est inutilisé (ATTENTION!)
docker system prune -a --volumes
```

### Voir les versions déployées

```bash
# Version du code
cd /opt/progress2win
git log -1 --oneline

# Version des images Docker
docker compose images
```

---

## 🔄 Automatiser les mises à jour (Avancé)

### Créer un script de mise à jour automatique

```bash
cat > /root/update-progress2win.sh << 'EOF'
#!/bin/bash

echo "🔄 Début de la mise à jour Progress2Win..."

cd /opt/progress2win

# Backup
DATE=$(date +%Y%m%d_%H%M%S)
echo "📦 Backup de la base de données..."
docker cp progress2win-backend:/app/data/progress2win.db /root/backups/progress2win_backup_$DATE.db

# Récupérer les changements
echo "⬇️  Récupération des derniers changements..."
git pull origin main

# Vérifier si des changements ont été téléchargés
if [ $? -eq 0 ]; then
    echo "🔨 Rebuild des containers..."
    docker compose up -d --build

    echo "✅ Mise à jour terminée !"
    echo "📊 Status des containers :"
    docker compose ps
else
    echo "❌ Erreur lors du git pull"
    exit 1
fi

# Nettoyer les anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "🎉 Tout est à jour !"
EOF

chmod +x /root/update-progress2win.sh
```

### Utiliser le script

```bash
# Lancer une mise à jour
/root/update-progress2win.sh
```

### Automatiser avec un cron (optionnel)

```bash
# Mise à jour automatique tous les jours à 4h du matin
echo "0 4 * * * /root/update-progress2win.sh >> /var/log/progress2win-update.log 2>&1" | crontab -

# Voir les mises à jour planifiées
crontab -l
```

---

## ✅ Checklist de mise à jour

- [ ] Backup de la base de données créé
- [ ] Code source mis à jour (git pull ou upload)
- [ ] Variables d'environnement vérifiées/mises à jour
- [ ] Images Docker rebuild
- [ ] Containers redémarrés
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] API testée (curl)
- [ ] Frontend testé (navigateur)
- [ ] Fonctionnalités critiques testées
- [ ] Anciennes images Docker nettoyées

---

## 🆘 Besoin d'aide ?

### Erreurs communes

**"Error: Cannot find module..."**
```bash
# Rebuild complet
docker compose down
docker compose up -d --build --force-recreate
```

**"Port already in use"**
```bash
# Vérifier les processus
netstat -tulpn | grep -E '80|443|3001'
# Tuer le processus ou redémarrer le VPS
```

**"Database locked"**
```bash
# Redémarrer uniquement le backend
docker compose restart backend
```

---

🎉 **Mise à jour terminée !** Votre application est maintenant à jour avec les dernières fonctionnalités.

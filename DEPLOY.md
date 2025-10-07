# 🚀 Guide de déploiement sur VPS

Ce guide explique comment déployer Tracky sur un VPS (DigitalOcean, OVH, AWS, etc.)

## 📋 Prérequis

- Un VPS avec Ubuntu 22.04 ou 24.04
- Un nom de domaine (ex: tracky.com)
- Accès SSH au VPS
- 15 minutes ⏱️

## 🎯 Étape 1 : Configuration du VPS

### Connexion SSH

```bash
ssh root@votre-ip-vps
```

### Installation de Docker

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer les dépendances
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version
```

### Installer Git

```bash
apt install -y git
```

## 🎯 Étape 2 : Transférer le projet

### Option A : Via Git (recommandé)

```bash
# Si tu as un repo GitHub
cd /opt
git clone https://github.com/ton-username/Tracky.git
cd Tracky
```

### Option B : Via SCP (depuis ton PC)

```bash
# Sur ton PC Windows (depuis PowerShell)
scp -r C:\Users\Tiaporo\Desktop\Tracky root@votre-ip-vps:/opt/
```

### Option C : Via SFTP (FileZilla)

1. Télécharger [FileZilla](https://filezilla-project.org/)
2. Se connecter au VPS
3. Transférer le dossier Tracky vers `/opt/Tracky`

## 🎯 Étape 3 : Configuration pour la production

### Créer le fichier .env

```bash
cd /opt/Tracky

# Créer .env avec des secrets sécurisés
cat > .env << 'EOF'
# JWT Secrets - GÉNÉRER DES VALEURS ALÉATOIRES FORTES
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Backend
PORT=3001
NODE_ENV=production

# Frontend (si besoin)
VITE_API_URL=/api
VITE_BACKEND_TYPE=express
EOF

# Générer des secrets aléatoires sécurisés
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH=$(openssl rand -base64 32)

# Mettre à jour .env avec les vraies valeurs
echo "JWT_SECRET=$JWT_SECRET" > .env
echo "JWT_REFRESH_SECRET=$JWT_REFRESH" >> .env
echo "PORT=3001" >> .env
echo "NODE_ENV=production" >> .env
```

### Modifier docker-compose.yml pour la production

```bash
nano docker-compose.yml
```

Remplacer le contenu par :

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: tracky-backend
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    volumes:
      - ./backend/data:/app/data
    networks:
      - tracky-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: tracky-frontend
    restart: always
    depends_on:
      - backend
    networks:
      - tracky-network

  nginx:
    image: nginx:alpine
    container_name: tracky-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-prod.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - frontend
      - backend
    networks:
      - tracky-network

  certbot:
    image: certbot/certbot
    container_name: tracky-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  tracky-network:
    driver: bridge
```

## 🎯 Étape 4 : Configuration Nginx avec SSL

### Créer nginx-prod.conf

```bash
cat > nginx-prod.conf << 'EOF'
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name tracky.com www.tracky.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    server_name tracky.com www.tracky.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tracky.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tracky.com/privkey.pem;

    # Paramètres SSL recommandés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend - fichiers statiques du container frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/tracky_access.log;
    error_log /var/log/nginx/tracky_error.log;
}
EOF
```

### Obtenir un certificat SSL (Let's Encrypt)

```bash
# D'abord, pointer ton domaine vers l'IP du VPS (DNS A record)
# Attendre quelques minutes que le DNS se propage

# Lancer nginx temporairement sans SSL
docker run -d --name temp-nginx -p 80:80 -p 443:443 \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  nginx:alpine

# Obtenir le certificat
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d tracky.com \
  -d www.tracky.com \
  --email ton-email@example.com \
  --agree-tos \
  --no-eff-email

# Stopper nginx temporaire
docker stop temp-nginx && docker rm temp-nginx
```

## 🎯 Étape 5 : Déployer l'application

```bash
# Build et démarrer
docker compose up -d --build

# Vérifier que tout tourne
docker compose ps

# Voir les logs
docker compose logs -f
```

## 🎯 Étape 6 : Configuration du pare-feu

```bash
# Installer UFW (si pas déjà installé)
apt install -y ufw

# Autoriser SSH (IMPORTANT!)
ufw allow 22/tcp

# Autoriser HTTP et HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le pare-feu
ufw enable

# Vérifier
ufw status
```

## 🎯 Étape 7 : Configuration DNS

Chez ton registrar de domaine (ex: OVH, Namecheap, etc.) :

```
Type A  | Nom: @          | Valeur: IP-DU-VPS
Type A  | Nom: www        | Valeur: IP-DU-VPS
```

## 📊 Monitoring et maintenance

### Voir les logs en temps réel

```bash
docker compose logs -f

# Logs backend uniquement
docker compose logs -f backend

# Logs frontend uniquement
docker compose logs -f frontend
```

### Redémarrer l'application

```bash
docker compose restart
```

### Mettre à jour l'application

```bash
# Si tu utilises Git
git pull

# Rebuild et redéployer
docker compose up -d --build
```

### Backup de la base de données

```bash
# Créer un script de backup automatique
cat > /root/backup-tracky.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup de la DB
docker cp tracky-backend:/app/data/progress2win.db $BACKUP_DIR/tracky_$DATE.db

# Garder uniquement les 7 derniers backups
ls -t $BACKUP_DIR/tracky_*.db | tail -n +8 | xargs rm -f

echo "Backup completed: tracky_$DATE.db"
EOF

chmod +x /root/backup-tracky.sh

# Ajouter au cron (backup quotidien à 3h du matin)
echo "0 3 * * * /root/backup-tracky.sh" | crontab -
```

## 🔒 Sécurité supplémentaire

### Changer le port SSH

```bash
nano /etc/ssh/sshd_config
# Changer Port 22 en Port 2222
systemctl restart sshd

# Mettre à jour le pare-feu
ufw allow 2222/tcp
ufw delete allow 22/tcp
```

### Installer Fail2Ban (protection brute force)

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Auto-updates de sécurité

```bash
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

## 🚨 Troubleshooting

### L'application ne démarre pas

```bash
# Voir les logs détaillés
docker compose logs

# Vérifier les ports utilisés
netstat -tulpn | grep -E '80|443|3001'

# Redémarrer tout
docker compose down
docker compose up -d
```

### Certificat SSL non généré

```bash
# Vérifier que le DNS pointe bien vers le VPS
nslookup tracky.com

# Vérifier que le port 80 est ouvert
ufw status

# Réessayer la génération du certificat
docker compose down
# Relancer la commande certbot de l'étape 4
```

### Base de données perdue

```bash
# Restaurer depuis un backup
docker cp /root/backups/tracky_YYYYMMDD_HHMMSS.db tracky-backend:/app/data/progress2win.db
docker compose restart backend
```

## 💰 Coûts estimés

- **VPS** : 5-10€/mois (2GB RAM, 1 CPU)
- **Domaine** : 10-15€/an
- **SSL** : Gratuit (Let's Encrypt)

**Providers recommandés :**
- [DigitalOcean](https://www.digitalocean.com/) - 6$/mois
- [Hetzner](https://www.hetzner.com/) - 4€/mois
- [OVH](https://www.ovh.com/) - 5€/mois
- [Scaleway](https://www.scaleway.com/) - 5€/mois

## ✅ Checklist finale

- [ ] VPS configuré avec Ubuntu
- [ ] Docker et Docker Compose installés
- [ ] Projet transféré sur le VPS
- [ ] Fichier .env avec secrets sécurisés
- [ ] DNS configuré (domaine → IP VPS)
- [ ] Certificat SSL obtenu
- [ ] Application déployée et accessible
- [ ] Pare-feu configuré
- [ ] Backups automatiques configurés
- [ ] Monitoring en place

---

🎉 Ton application est maintenant en ligne et accessible depuis le monde entier !

**URL :** https://tracky.com

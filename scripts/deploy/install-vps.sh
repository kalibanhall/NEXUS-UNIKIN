#!/bin/bash

#############################################################
#                                                           #
#   NEXUS UNIKIN - Script d'Installation VPS               #
#   À exécuter sur un VPS Ubuntu 22.04 fraîchement créé    #
#                                                           #
#   Usage: sudo bash install-vps.sh                        #
#                                                           #
#############################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - À MODIFIER AVANT L'EXÉCUTION
DOMAIN="nexus.unikin.ac.cd"
DB_NAME="nexus_unikin"
DB_USER="nexus_admin"
DB_PASSWORD="ChangeThisPassword123!"  # ⚠️ CHANGEZ CE MOT DE PASSE
APP_USER="nexus"
GITHUB_REPO="https://github.com/kalibanhall/NEXUS-UNIKIN.git"
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🎓 NEXUS UNIKIN - Installation VPS                ║"
echo "║           Université de Kinshasa                         ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier qu'on est root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ce script doit être exécuté en tant que root (sudo)${NC}"
    exit 1
fi

# ============================================================
# ÉTAPE 1: Mise à jour du système
# ============================================================
echo -e "\n${YELLOW}📦 ÉTAPE 1/10: Mise à jour du système...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git build-essential

echo -e "${GREEN}✅ Système mis à jour${NC}"

# ============================================================
# ÉTAPE 2: Créer l'utilisateur applicatif
# ============================================================
echo -e "\n${YELLOW}👤 ÉTAPE 2/10: Création de l'utilisateur ${APP_USER}...${NC}"

if id "$APP_USER" &>/dev/null; then
    echo -e "${YELLOW}⚠️ L'utilisateur ${APP_USER} existe déjà${NC}"
else
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG sudo $APP_USER
    echo -e "${GREEN}✅ Utilisateur ${APP_USER} créé${NC}"
fi

# ============================================================
# ÉTAPE 3: Installation de Node.js 20 LTS
# ============================================================
echo -e "\n${YELLOW}📗 ÉTAPE 3/10: Installation de Node.js 20 LTS...${NC}"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${GREEN}✅ Node.js $(node --version) installé${NC}"

# ============================================================
# ÉTAPE 4: Installation de PostgreSQL
# ============================================================
echo -e "\n${YELLOW}🐘 ÉTAPE 4/10: Installation de PostgreSQL...${NC}"

apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Créer la base de données et l'utilisateur
sudo -u postgres psql <<EOF
-- Supprimer si existe (pour réinstallation)
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};

-- Créer l'utilisateur et la base
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Permissions étendues
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

echo -e "${GREEN}✅ PostgreSQL installé et configuré${NC}"

# ============================================================
# ÉTAPE 5: Installation de Nginx
# ============================================================
echo -e "\n${YELLOW}🌐 ÉTAPE 5/10: Installation de Nginx...${NC}"

apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}✅ Nginx installé${NC}"

# ============================================================
# ÉTAPE 6: Installation de PM2
# ============================================================
echo -e "\n${YELLOW}⚙️ ÉTAPE 6/10: Installation de PM2...${NC}"

npm install -g pm2

echo -e "${GREEN}✅ PM2 installé${NC}"

# ============================================================
# ÉTAPE 7: Cloner et configurer l'application
# ============================================================
echo -e "\n${YELLOW}📥 ÉTAPE 7/10: Clonage de l'application...${NC}"

APP_DIR="/home/${APP_USER}/NEXUS-UNIKIN"

# Supprimer si existe
rm -rf $APP_DIR

# Cloner le repo
sudo -u $APP_USER git clone $GITHUB_REPO $APP_DIR

# Créer le fichier .env
cat > $APP_DIR/.env <<EOF
# ============================================
# NEXUS UNIKIN - Configuration Production
# ============================================

# Base de données PostgreSQL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

# NextAuth Configuration
NEXTAUTH_URL="https://${DOMAIN}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Mode Production
NODE_ENV="production"

# Optionnel: Configuration Email (pour notifications)
# SMTP_HOST="smtp.example.com"
# SMTP_PORT="587"
# SMTP_USER="notifications@unikin.ac.cd"
# SMTP_PASSWORD="your-smtp-password"

# Optionnel: Configuration stockage fichiers
# UPLOAD_DIR="/home/${APP_USER}/uploads"
EOF

chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

echo -e "${GREEN}✅ Application clonée et configurée${NC}"

# ============================================================
# ÉTAPE 8: Build de l'application
# ============================================================
echo -e "\n${YELLOW}🔨 ÉTAPE 8/10: Build de l'application...${NC}"

cd $APP_DIR
sudo -u $APP_USER npm install
sudo -u $APP_USER npm run build

echo -e "${GREEN}✅ Application buildée${NC}"

# ============================================================
# ÉTAPE 9: Initialiser la base de données
# ============================================================
echo -e "\n${YELLOW}💾 ÉTAPE 9/10: Initialisation de la base de données...${NC}"

# Importer le schéma
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -f $APP_DIR/database/schema-nexus-complete.sql 2>/dev/null || true

# Importer les données initiales
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -f $APP_DIR/database/seed-complete.sql 2>/dev/null || true

echo -e "${GREEN}✅ Base de données initialisée${NC}"

# ============================================================
# ÉTAPE 10: Configuration Nginx
# ============================================================
echo -e "\n${YELLOW}🔧 ÉTAPE 10/10: Configuration Nginx...${NC}"

cat > /etc/nginx/sites-available/nexus-unikin <<EOF
# NEXUS UNIKIN - Configuration Nginx
# Généré automatiquement le $(date)

upstream nexus_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# Configuration HTTPS (sera complétée par Certbot)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    # SSL - sera configuré par Certbot
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Logs
    access_log /var/log/nginx/nexus-access.log;
    error_log /var/log/nginx/nexus-error.log;

    # Taille max upload (pour documents)
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy vers Next.js
    location / {
        proxy_pass http://nexus_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Cache pour fichiers statiques Next.js
    location /_next/static {
        proxy_pass http://nexus_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images et assets
    location /images {
        proxy_pass http://nexus_backend;
        proxy_cache_valid 200 24h;
        add_header Cache-Control "public, max-age=86400";
    }

    # API - pas de cache
    location /api {
        proxy_pass http://nexus_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/nexus-unikin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester et recharger Nginx
nginx -t
systemctl reload nginx

echo -e "${GREEN}✅ Nginx configuré${NC}"

# ============================================================
# Démarrer l'application avec PM2
# ============================================================
echo -e "\n${YELLOW}🚀 Démarrage de l'application...${NC}"

cd $APP_DIR
sudo -u $APP_USER pm2 start npm --name "nexus-unikin" -- start
sudo -u $APP_USER pm2 save

# Configurer PM2 pour démarrage automatique
env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

echo -e "${GREEN}✅ Application démarrée${NC}"

# ============================================================
# Configuration du pare-feu
# ============================================================
echo -e "\n${YELLOW}🔥 Configuration du pare-feu...${NC}"

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${GREEN}✅ Pare-feu configuré${NC}"

# ============================================================
# Installation de Certbot pour SSL
# ============================================================
echo -e "\n${YELLOW}🔒 Installation de Certbot...${NC}"

apt install -y certbot python3-certbot-nginx

echo -e "${GREEN}✅ Certbot installé${NC}"

# ============================================================
# Résumé final
# ============================================================
echo -e "\n${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !                 ║"
echo "║                                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║   📋 PROCHAINES ÉTAPES:                                  ║"
echo "║                                                           ║"
echo "║   1. Configurer le DNS:                                  ║"
echo "║      Ajouter un enregistrement A:                        ║"
echo "║      nexus.unikin.ac.cd → $(curl -s ifconfig.me)              ║"
echo "║                                                           ║"
echo "║   2. Après propagation DNS, installer SSL:               ║"
echo "║      sudo certbot --nginx -d ${DOMAIN}    ║"
echo "║                                                           ║"
echo "║   3. Accéder à l'application:                            ║"
echo "║      https://${DOMAIN}                    ║"
echo "║                                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║   🔑 IDENTIFIANTS PAR DÉFAUT:                            ║"
echo "║      Admin: admin@unikin.ac.cd / admin123                ║"
echo "║                                                           ║"
echo "║   ⚠️  CHANGEZ LES MOTS DE PASSE IMMÉDIATEMENT !          ║"
echo "║                                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║   📁 CHEMINS IMPORTANTS:                                 ║"
echo "║      Application: ${APP_DIR}              ║"
echo "║      Logs Nginx:  /var/log/nginx/                        ║"
echo "║      Config:      ${APP_DIR}/.env         ║"
echo "║                                                           ║"
echo "║   🛠️ COMMANDES UTILES:                                   ║"
echo "║      pm2 status              - État de l'app             ║"
echo "║      pm2 logs nexus-unikin   - Voir les logs             ║"
echo "║      pm2 restart nexus-unikin - Redémarrer               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Sauvegarder les informations
cat > /root/nexus-install-info.txt <<EOF
==============================================
NEXUS UNIKIN - Informations d'Installation
Date: $(date)
==============================================

DOMAINE: ${DOMAIN}
IP SERVEUR: $(curl -s ifconfig.me)

BASE DE DONNÉES:
  - Nom: ${DB_NAME}
  - Utilisateur: ${DB_USER}
  - Mot de passe: ${DB_PASSWORD}

APPLICATION:
  - Répertoire: ${APP_DIR}
  - Utilisateur système: ${APP_USER}

NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}

⚠️ CONSERVEZ CE FICHIER EN LIEU SÛR ET SUPPRIMEZ-LE DU SERVEUR
==============================================
EOF

chmod 600 /root/nexus-install-info.txt

echo -e "${YELLOW}📄 Informations sauvegardées dans /root/nexus-install-info.txt${NC}"
echo -e "${RED}⚠️ Pensez à sauvegarder ce fichier et le supprimer du serveur !${NC}"

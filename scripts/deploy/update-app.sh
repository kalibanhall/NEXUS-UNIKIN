#!/bin/bash

#############################################################
#                                                           #
#   NEXUS UNIKIN - Script de Mise à Jour                   #
#   À exécuter pour mettre à jour l'application            #
#                                                           #
#   Usage: sudo bash update-app.sh                         #
#                                                           #
#############################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_USER="nexus"
APP_DIR="/home/${APP_USER}/NEXUS-UNIKIN"
BACKUP_DIR="/home/${APP_USER}/backups"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        🔄 NEXUS UNIKIN - Mise à Jour                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier qu'on est root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ce script doit être exécuté en tant que root (sudo)${NC}"
    exit 1
fi

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# ============================================================
# ÉTAPE 1: Sauvegarde
# ============================================================
echo -e "\n${YELLOW}💾 ÉTAPE 1/5: Sauvegarde...${NC}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}"

# Backup de la base de données
source $APP_DIR/.env
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
pg_dump $DB_NAME > "${BACKUP_FILE}_db.sql" 2>/dev/null || echo "⚠️ Backup DB ignoré"

# Backup du fichier .env
cp $APP_DIR/.env "${BACKUP_FILE}_env"

echo -e "${GREEN}✅ Sauvegarde créée: ${BACKUP_FILE}${NC}"

# ============================================================
# ÉTAPE 2: Récupérer les mises à jour
# ============================================================
echo -e "\n${YELLOW}📥 ÉTAPE 2/5: Récupération des mises à jour...${NC}"

cd $APP_DIR

# Sauvegarder les modifications locales
sudo -u $APP_USER git stash 2>/dev/null || true

# Récupérer les dernières modifications
sudo -u $APP_USER git fetch origin
sudo -u $APP_USER git pull origin main

echo -e "${GREEN}✅ Code mis à jour${NC}"

# ============================================================
# ÉTAPE 3: Installer les dépendances
# ============================================================
echo -e "\n${YELLOW}📦 ÉTAPE 3/5: Installation des dépendances...${NC}"

sudo -u $APP_USER npm install

echo -e "${GREEN}✅ Dépendances installées${NC}"

# ============================================================
# ÉTAPE 4: Build de l'application
# ============================================================
echo -e "\n${YELLOW}🔨 ÉTAPE 4/5: Build de l'application...${NC}"

sudo -u $APP_USER npm run build

echo -e "${GREEN}✅ Application buildée${NC}"

# ============================================================
# ÉTAPE 5: Redémarrer l'application
# ============================================================
echo -e "\n${YELLOW}🚀 ÉTAPE 5/5: Redémarrage...${NC}"

sudo -u $APP_USER pm2 restart nexus-unikin

# Attendre que l'app démarre
sleep 5

# Vérifier l'état
sudo -u $APP_USER pm2 status

echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   ✅ MISE À JOUR TERMINÉE AVEC SUCCÈS !                  ║"
echo "║                                                           ║"
echo "║   L'application est maintenant à jour.                   ║"
echo "║   Backup disponible: ${BACKUP_FILE}                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

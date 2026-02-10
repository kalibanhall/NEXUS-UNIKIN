#!/bin/bash

#############################################################
#                                                           #
#   NEXUS UNIKIN - Script de Restauration Base de Données  #
#                                                           #
#   Usage: sudo bash restore-db.sh backup_file.sql.gz      #
#                                                           #
#############################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: sudo bash restore-db.sh <backup_file.sql.gz>${NC}"
    echo ""
    echo "Backups disponibles:"
    ls -la /home/nexus/backups/database/
    exit 1
fi

BACKUP_FILE=$1
APP_DIR="/home/nexus/NEXUS-UNIKIN"

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Fichier non trouvé: $BACKUP_FILE${NC}"
    exit 1
fi

# Charger les variables
source $APP_DIR/.env
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${YELLOW}⚠️ ATTENTION: Ceci va REMPLACER toutes les données actuelles !${NC}"
echo -e "Base de données: ${DB_NAME}"
echo -e "Fichier de restauration: ${BACKUP_FILE}"
echo ""
read -p "Êtes-vous sûr ? (oui/non): " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    echo "Restauration annulée."
    exit 0
fi

echo -e "\n${YELLOW}🔄 Restauration en cours...${NC}"

# Arrêter l'application
pm2 stop nexus-unikin

# Restaurer la base
gunzip -c $BACKUP_FILE | psql $DB_NAME

# Redémarrer l'application
pm2 start nexus-unikin

echo -e "${GREEN}✅ Base de données restaurée avec succès !${NC}"

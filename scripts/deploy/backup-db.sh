#!/bin/bash

#############################################################
#                                                           #
#   NEXUS UNIKIN - Script de Sauvegarde Base de Données    #
#   À exécuter quotidiennement via cron                    #
#                                                           #
#   Usage: bash backup-db.sh                               #
#   Cron:  0 2 * * * /home/nexus/NEXUS-UNIKIN/scripts/deploy/backup-db.sh
#                                                           #
#############################################################

# Configuration
APP_DIR="/home/nexus/NEXUS-UNIKIN"
BACKUP_DIR="/home/nexus/backups/database"
RETENTION_DAYS=30

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Charger les variables d'environnement
source $APP_DIR/.env

# Extraire les infos de connexion
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Nom du fichier de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/nexus_db_${TIMESTAMP}.sql.gz"

# Créer le backup compressé
pg_dump $DB_NAME | gzip > $BACKUP_FILE

# Supprimer les vieux backups (plus de 30 jours)
find $BACKUP_DIR -name "nexus_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup créé: $BACKUP_FILE"
echo "📊 Taille: $(du -h $BACKUP_FILE | cut -f1)"

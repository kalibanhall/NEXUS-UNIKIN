#!/bin/bash

#############################################################
#                                                           #
#   NEXUS UNIKIN - Script de Vérification Santé            #
#   Vérifie que tous les services fonctionnent             #
#                                                           #
#   Usage: bash health-check.sh                            #
#                                                           #
#############################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="nexus.unikin.ac.cd"
ERRORS=0

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        🏥 NEXUS UNIKIN - Vérification Santé              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier PostgreSQL
echo -n "🐘 PostgreSQL: "
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ Actif${NC}"
else
    echo -e "${RED}❌ Inactif${NC}"
    ERRORS=$((ERRORS+1))
fi

# Vérifier Nginx
echo -n "🌐 Nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Actif${NC}"
else
    echo -e "${RED}❌ Inactif${NC}"
    ERRORS=$((ERRORS+1))
fi

# Vérifier PM2 / Next.js
echo -n "⚙️ Application (PM2): "
if pm2 list 2>/dev/null | grep -q "nexus-unikin.*online"; then
    echo -e "${GREEN}✅ En ligne${NC}"
else
    echo -e "${RED}❌ Hors ligne${NC}"
    ERRORS=$((ERRORS+1))
fi

# Vérifier l'accès HTTP local
echo -n "🔌 Port 3000 (local): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
    echo -e "${GREEN}✅ Accessible${NC}"
else
    echo -e "${RED}❌ Non accessible${NC}"
    ERRORS=$((ERRORS+1))
fi

# Vérifier l'espace disque
echo -n "💾 Espace disque: "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${DISK_USAGE}% utilisé${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️ ${DISK_USAGE}% utilisé (attention)${NC}"
else
    echo -e "${RED}❌ ${DISK_USAGE}% utilisé (critique!)${NC}"
    ERRORS=$((ERRORS+1))
fi

# Vérifier la mémoire
echo -n "🧠 Mémoire RAM: "
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2*100}')
if [ "$MEM_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${MEM_USAGE}% utilisée${NC}"
elif [ "$MEM_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️ ${MEM_USAGE}% utilisée (attention)${NC}"
else
    echo -e "${RED}❌ ${MEM_USAGE}% utilisée (critique!)${NC}"
    ERRORS=$((ERRORS+1))
fi

# Vérifier le certificat SSL
echo -n "🔒 Certificat SSL: "
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/${DOMAIN}/fullchain.pem | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    
    if [ "$DAYS_LEFT" -gt 30 ]; then
        echo -e "${GREEN}✅ Valide (${DAYS_LEFT} jours restants)${NC}"
    elif [ "$DAYS_LEFT" -gt 7 ]; then
        echo -e "${YELLOW}⚠️ Expire bientôt (${DAYS_LEFT} jours)${NC}"
    else
        echo -e "${RED}❌ Expire dans ${DAYS_LEFT} jours !${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${YELLOW}⚠️ Non configuré${NC}"
fi

# Résumé
echo ""
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ Tous les systèmes sont opérationnels !              ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ ${ERRORS} problème(s) détecté(s) !                          ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
fi

exit $ERRORS

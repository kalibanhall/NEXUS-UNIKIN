# 🚀 Guide de Déploiement NEXUS UNIKIN

## 📋 Prérequis

- Un VPS avec Ubuntu 22.04 LTS (minimum 4GB RAM, 50GB SSD)
- Accès root au serveur
- Accès à la gestion DNS de unikin.ac.cd

## 🛠️ Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `install-vps.sh` | Installation complète | `sudo bash install-vps.sh` |
| `update-app.sh` | Mise à jour de l'application | `sudo bash update-app.sh` |
| `backup-db.sh` | Sauvegarde de la base | `bash backup-db.sh` |
| `restore-db.sh` | Restauration de la base | `sudo bash restore-db.sh <fichier>` |
| `health-check.sh` | Vérification de l'état | `bash health-check.sh` |

---

## 📦 Installation Initiale

### Étape 1: Préparer le VPS

1. Acheter un VPS chez Hostinger, Contabo, ou Hetzner
2. Choisir Ubuntu 22.04 LTS
3. Noter l'adresse IP du serveur

### Étape 2: Transférer le script

```bash
# Depuis votre PC local
scp scripts/deploy/install-vps.sh root@VOTRE_IP:/root/
```

### Étape 3: Configurer le script

Connectez-vous au serveur et éditez le script :

```bash
ssh root@VOTRE_IP
nano /root/install-vps.sh
```

**Modifiez ces variables :**
```bash
DOMAIN="nexus.unikin.ac.cd"      # Votre domaine
DB_PASSWORD="VotreMotDePasse!"   # Mot de passe DB sécurisé
```

### Étape 4: Exécuter l'installation

```bash
chmod +x /root/install-vps.sh
sudo bash /root/install-vps.sh
```

L'installation prend environ 5-10 minutes.

### Étape 5: Configurer le DNS

Contactez l'administrateur DNS de l'UNIKIN pour ajouter :

| Type | Nom | Valeur |
|------|-----|--------|
| A | nexus | IP_DU_VPS |

### Étape 6: Activer HTTPS

Après propagation DNS (quelques heures à 24h) :

```bash
sudo certbot --nginx -d nexus.unikin.ac.cd
```

---

## 🔄 Mises à Jour

### Mise à jour automatique

```bash
cd /home/nexus/NEXUS-UNIKIN/scripts/deploy
sudo bash update-app.sh
```

Le script :
1. ✅ Sauvegarde la base de données
2. ✅ Récupère le nouveau code depuis GitHub
3. ✅ Installe les nouvelles dépendances
4. ✅ Rebuild l'application
5. ✅ Redémarre le service

### Mise à jour manuelle

```bash
cd /home/nexus/NEXUS-UNIKIN
git pull origin main
npm install
npm run build
pm2 restart nexus-unikin
```

---

## 💾 Sauvegardes

### Sauvegarde manuelle

```bash
bash /home/nexus/NEXUS-UNIKIN/scripts/deploy/backup-db.sh
```

### Sauvegarde automatique (cron)

```bash
sudo crontab -e
```

Ajouter :
```
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /home/nexus/NEXUS-UNIKIN/scripts/deploy/backup-db.sh
```

### Restauration

```bash
# Lister les backups disponibles
ls -la /home/nexus/backups/database/

# Restaurer
sudo bash restore-db.sh /home/nexus/backups/database/nexus_db_XXXXX.sql.gz
```

---

## 🏥 Surveillance

### Vérification rapide

```bash
bash health-check.sh
```

### Commandes utiles

```bash
# État de l'application
pm2 status

# Logs en temps réel
pm2 logs nexus-unikin

# Logs Nginx
tail -f /var/log/nginx/nexus-error.log

# État des services
systemctl status postgresql
systemctl status nginx
```

---

## ⚠️ Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs nexus-unikin --lines 100

# Redémarrer
pm2 restart nexus-unikin
```

### Erreur de base de données

```bash
# Vérifier PostgreSQL
systemctl status postgresql

# Redémarrer si nécessaire
systemctl restart postgresql
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que l'app tourne
pm2 status

# Vérifier Nginx
nginx -t
systemctl restart nginx
```

### Renouvellement SSL échoué

```bash
# Renouveler manuellement
sudo certbot renew --force-renewal
```

---

## 📞 Support

En cas de problème :
1. Exécuter `bash health-check.sh`
2. Consulter les logs : `pm2 logs nexus-unikin`
3. Vérifier l'espace disque : `df -h`

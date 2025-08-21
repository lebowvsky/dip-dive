# 🐳 Documentation Docker - Dip Dive Backend

## 📋 Vue d'ensemble

Cette configuration Docker multi-stage optimise les performances, la sécurité et la taille des images pour votre API NestJS.

## 🏗️ Architecture Multi-Stage

### Stages disponibles :
- **`base`** : Configuration commune et utilisateur non-root
- **`dependencies`** : Installation optimisée des dépendances
- **`development`** : Environnement de développement avec hot-reload
- **`builder`** : Compilation TypeScript et nettoyage
- **`production`** : Image finale minimale et sécurisée
- **`testing`** : Exécution des tests unitaires

## 🚀 Commandes Docker Recommandées

### Développement

```bash
# Lancement de l'environnement complet de développement
docker-compose up -d

# Lancement avec rebuild forcé
docker-compose up --build -d

# Voir les logs en temps réel
docker-compose logs -f app

# Accès au shell du container
docker-compose exec app sh

# Arrêt des services
docker-compose down

# Arrêt avec suppression des volumes
docker-compose down -v
```

### Build Manuel

```bash
# Build de l'image de développement
docker build --target development -t dip-dive-backend:dev .

# Build de l'image de production
docker build --target production -t dip-dive-backend:prod .

# Build de l'image de test
docker build --target testing -t dip-dive-backend:test .

# Build avec cache désactivé
docker build --no-cache --target production -t dip-dive-backend:prod .
```

### Exécution des Containers

```bash
# Développement avec volume mount
docker run -d \
  --name dip-dive-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --env-file .env.development \
  dip-dive-backend:dev

# Production
docker run -d \
  --name dip-dive-prod \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  dip-dive-backend:prod

# Tests
docker run --rm \
  --name dip-dive-test \
  -v $(pwd)/coverage:/app/coverage \
  dip-dive-backend:test
```

### Production avec Docker Compose

```bash
# Déploiement production
docker-compose -f docker-compose.prod.yml up -d

# Mise à jour en production (zero-downtime)
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

## 🔧 Variables d'Environnement Essentielles

### Développement
```bash
NODE_ENV=development
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=nestjs
DB_PASSWORD=nestjs_password
DB_DATABASE=dip_dive_dev
JWT_SECRET=development_jwt_secret
```

### Production
```bash
NODE_ENV=production
PORT=3000
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
DB_DATABASE=dip_dive_prod
JWT_SECRET=your_super_secure_jwt_secret
CORS_ORIGIN=https://yourdomain.com
```

## 📊 Optimisations Implémentées

### Performance
- ✅ Build multi-stage pour réduire la taille finale
- ✅ Cache des layers Docker optimisé
- ✅ Copy des `package*.json` avant le code source
- ✅ Utilisation d'Alpine Linux (image légère)
- ✅ Suppression des caches npm après installation

### Sécurité
- ✅ Utilisateur non-root (`nestjs:nodejs`)
- ✅ Dumb-init pour la gestion des processus
- ✅ Healthcheck automatique
- ✅ Secrets Docker pour la production
- ✅ Variables d'environnement sécurisées

### Développement
- ✅ Hot-reload avec volumes montés
- ✅ MySQL et Redis préconfigurés
- ✅ Adminer pour l'administration DB
- ✅ Healthcheck personnalisé

## 🩺 Healthcheck et Monitoring

Le script `healthcheck.js` vérifie :
- Disponibilité de l'endpoint `/health`
- Temps de réponse sous 3 secondes
- Code de statut HTTP valide
- Parsing JSON optionnel

```bash
# Test manuel du healthcheck
docker exec dip-dive-backend node healthcheck.js

# Vérification du statut du container
docker inspect --format='{{.State.Health.Status}}' dip-dive-backend
```

## 📂 Structure des Fichiers

```
.
├── Dockerfile                 # Configuration multi-stage
├── .dockerignore             # Exclusions du contexte
├── docker-compose.yml        # Développement
├── docker-compose.prod.yml   # Production
├── healthcheck.js           # Script de santé
├── .env.example            # Template des variables
└── docker/
    └── README.md          # Cette documentation
```

## 🔍 Débogage

### Logs et Monitoring
```bash
# Logs de l'application
docker-compose logs -f app

# Logs de la base de données
docker-compose logs -f mysql

# Statut des healthchecks
docker-compose ps

# Inspection détaillée du container
docker inspect dip-dive-backend
```

### Performance
```bash
# Statistiques d'utilisation
docker stats dip-dive-backend

# Taille des images
docker images | grep dip-dive

# Analyse des layers
docker history dip-dive-backend:prod
```

## 🚨 Sécurité en Production

### Checklist avant déploiement :
- [ ] Variables d'environnement sécurisées
- [ ] Secrets Docker configurés
- [ ] Certificats SSL/TLS valides
- [ ] Firewall configuré
- [ ] Monitoring et logs centralisés
- [ ] Backup automatique de la DB
- [ ] Limite des ressources définies

### Commandes de sécurité :
```bash
# Scan de vulnérabilités
docker scan dip-dive-backend:prod

# Vérification des secrets
docker secret ls

# Inspection des autorisations
docker exec dip-dive-backend whoami
docker exec dip-dive-backend id
```

## 📈 Optimisations Futures

- Utilisation de distroless pour une sécurité renforcée
- Multi-architecture (ARM64/AMD64)
- Registry privé pour les images
- CI/CD avec GitHub Actions
- Kubernetes Deployment manifests
- Prometheus metrics
# =================================
# Multi-stage Dockerfile pour NestJS
# =================================

# =====================================
# Stage 1: Base - Configuration commune
# =====================================
FROM node:20-alpine AS base

# Métadonnées du projet
LABEL maintainer="dip-dive-team"
LABEL description="NestJS Backend API"
LABEL version="1.0.0"

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001 -G nodejs

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration des dépendances
COPY --chown=nestjs:nodejs package*.json ./

# ========================================
# Stage 2: Dependencies - Installation deps
# ========================================
FROM base AS dependencies

# Installation de toutes les dépendances (dev + prod)
RUN npm install --silent \
    && npm cache clean --force

# =====================================
# Stage 3: Development - Hot reload
# =====================================
FROM base AS development

# Copie des dépendances depuis le stage précédent
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copie du code source
COPY --chown=nestjs:nodejs . .

# Variables d'environnement pour le développement
ENV NODE_ENV=development
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true

# Exposition du port
EXPOSE 3000

# Basculement vers l'utilisateur non-root
USER nestjs

# Point d'entrée pour le développement avec hot-reload
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:dev"]

# =====================================
# Stage 4: Builder - Compilation TS
# =====================================
FROM base AS builder

# Copie des dépendances depuis le stage dependencies
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copie du code source
COPY --chown=nestjs:nodejs . .

# Variables d'environnement pour le build
ENV NODE_ENV=production

# Compilation TypeScript et nettoyage
RUN npm run build \
    && npm prune --production \
    && npm cache clean --force \
    && rm -rf src test *.md *.json tsconfig*.json .eslintrc.js .prettierrc

# =====================================
# Stage 5: Production - Image finale
# =====================================
FROM node:20-alpine AS production

# Métadonnées de production
LABEL stage="production"

# Installation de dumb-init uniquement
RUN apk add --no-cache dumb-init \
    && rm -rf /var/cache/apk/*

# Création de l'utilisateur non-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001 -G nodejs

# Définition du répertoire de travail
WORKDIR /app

# Copie des dépendances de production uniquement
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copie du code compilé
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copie du package.json pour les métadonnées
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Variables d'environnement de production
ENV NODE_ENV=production
ENV PORT=3000
ENV NPM_CONFIG_LOGLEVEL=warn

# Exposition du port
EXPOSE 3000

# Configuration du healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Basculement vers l'utilisateur non-root
USER nestjs

# Point d'entrée sécurisé avec dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]

# =====================================
# Stage 6: Testing - Tests unitaires
# =====================================
FROM dependencies AS testing

# Copie du code source pour les tests
COPY --chown=nestjs:nodejs . .

# Variables d'environnement pour les tests
ENV NODE_ENV=test

# Basculement vers l'utilisateur non-root
USER nestjs

# Commande pour exécuter les tests
CMD ["npm", "run", "test:cov"]
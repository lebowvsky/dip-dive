#!/bin/bash

# Script de nettoyage Docker pour DIP-DIVE
echo "🧹 Nettoyage des conteneurs DIP-DIVE..."

# Arrêter et supprimer tous les conteneurs dip-dive
docker stop $(docker ps -aq --filter name=dip-dive) 2>/dev/null || true
docker rm -f $(docker ps -aq --filter name=dip-dive) 2>/dev/null || true

# Supprimer les réseaux orphelins
docker network ls --filter name=dip-dive --format "{{.Name}}" | xargs -r docker network rm 2>/dev/null || true

# Optionnel : supprimer les volumes (décommentez si nécessaire)
# docker volume ls --filter name=dip-dive --format "{{.Name}}" | xargs -r docker volume rm 2>/dev/null || true

echo "✅ Nettoyage terminé ! Vous pouvez maintenant relancer docker compose."
#!/bin/bash

# Script pour reconstruire et redémarrer le stack Docker
# Utilisez ce script chaque fois que vous modifiez package.json

echo "🔄 Arrêt des conteneurs..."
docker compose down

echo "🧹 Nettoyage des conteneurs existants..."
docker rm -f $(docker ps -aq --filter name=dip-dive) 2>/dev/null || true

echo "🔨 Reconstruction du conteneur backend..."
docker compose build app --no-cache

echo "🚀 Démarrage de tous les conteneurs..."
docker compose up -d

echo "⏳ Attente du démarrage..."
sleep 10

echo "📊 Status des conteneurs:"
docker ps --filter name=dip-dive

echo "✅ Stack redémarrée avec succès!"
echo "Backend: http://localhost:3000"
echo "Adminer: http://localhost:8080"
/**
 * =============================================
 * Healthcheck Script pour Docker
 * =============================================
 * Script autonome pour vérifier la santé de l'application
 */

const http = require('http');
const process = require('process');

// Configuration du healthcheck
const config = {
  host: process.env.HEALTH_CHECK_HOST || 'localhost',
  port: process.env.PORT || 3000,
  path: process.env.HEALTH_CHECK_PATH || '/health',
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '3000'),
};

/**
 * Effectue une requête HTTP GET
 * @param {Object} options - Options de la requête
 * @returns {Promise<Object>} - Réponse HTTP
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(config.timeout);
    req.end();
  });
}

/**
 * Fonction principale du healthcheck
 */
async function healthcheck() {
  try {
    console.log(`[HEALTHCHECK] Vérification de l'état de santé sur ${config.host}:${config.port}${config.path}`);
    
    const options = {
      hostname: config.host,
      port: config.port,
      path: config.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Docker-Healthcheck/1.0',
        'Accept': 'application/json',
      },
    };

    const response = await makeRequest(options);
    
    // Vérification du code de statut
    if (response.statusCode >= 200 && response.statusCode < 300) {
      let healthData = {};
      
      try {
        healthData = JSON.parse(response.body);
      } catch (parseError) {
        console.log('[HEALTHCHECK] Réponse non-JSON reçue, mais statut OK');
      }
      
      console.log('[HEALTHCHECK] ✅ Application en bonne santé');
      console.log(`[HEALTHCHECK] Status: ${response.statusCode}`);
      
      if (healthData.status) {
        console.log(`[HEALTHCHECK] Statut rapporté: ${healthData.status}`);
      }
      
      if (healthData.uptime) {
        console.log(`[HEALTHCHECK] Uptime: ${healthData.uptime}s`);
      }
      
      process.exit(0);
    } else {
      console.error(`[HEALTHCHECK] ❌ Statut HTTP non valide: ${response.statusCode}`);
      console.error(`[HEALTHCHECK] Corps de la réponse: ${response.body}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('[HEALTHCHECK] ❌ Erreur lors du healthcheck:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('[HEALTHCHECK] Application non disponible (connexion refusée)');
    } else if (error.code === 'ENOTFOUND') {
      console.error('[HEALTHCHECK] Hôte non trouvé');
    } else if (error.message === 'Request timeout') {
      console.error('[HEALTHCHECK] Timeout de la requête');
    }
    
    process.exit(1);
  }
}

/**
 * Gestion des signaux pour un arrêt propre
 */
process.on('SIGTERM', () => {
  console.log('[HEALTHCHECK] Signal SIGTERM reçu, arrêt...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[HEALTHCHECK] Signal SIGINT reçu, arrêt...');
  process.exit(0);
});

// Démarrage du healthcheck
healthcheck();
# DIP-DIVE Stack

Complete Docker Compose setup for DIP-DIVE application with Vue.js frontend, NestJS backend, and MySQL database.

## 🏗️ Architecture

- **Frontend**: Vue 3 + TypeScript + Vite (Port 3000/5173)
- **Backend**: NestJS + TypeScript (Port 3001)
- **Database**: MySQL 8.0 (Port 3306/3307)
- **Additional Dev Tools**: phpMyAdmin, Mailhog, Redis (optional)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Start the Stack

#### Development Mode (Recommended)
```bash
# Using startup script (recommended)
./scripts/start.sh dev --build

# Or directly with Docker Compose
docker compose up --build
```

#### Production Mode
```bash
# Using startup script
./scripts/start.sh prod --build

# Or directly with Docker Compose
docker compose -f docker-compose.yml up --build
```

### 3. Access Services

#### Development URLs
- 🌐 **Frontend**: http://localhost:5173 (Vite dev server with hot reload)
- 🔧 **Backend API**: http://localhost:3001
- 🗄️ **Database**: localhost:3307
- 📊 **phpMyAdmin**: http://localhost:8080 (with dev-tools profile)
- 📧 **Mailhog**: http://localhost:8025 (with dev-tools profile)

#### Production URLs
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:3001
- 🗄️ **Database**: localhost:3306

## 📁 Project Structure

```
dip-dive/
├── dip-dive-front/          # Vue.js frontend
│   ├── Dockerfile           # Production build
│   └── Dockerfile.dev       # Development with hot reload
├── dip-dive-back/           # NestJS backend
│   └── Dockerfile           # Multi-stage build
├── scripts/                 # Utility scripts
│   ├── start.sh            # Start stack script
│   ├── stop.sh             # Stop stack script
│   └── mysql/              # MySQL initialization scripts
├── docker-compose.yml       # Production configuration
├── docker-compose.override.yml # Development overrides
├── .env.example            # Environment template
└── README.md               # This file
```

## 🛠️ Development

### Hot Reload & File Watching
In development mode, both frontend and backend support hot reload:
- **Frontend**: Vite dev server with HMR
- **Backend**: NestJS watch mode with Nodemon

### Database Management
```bash
# Access MySQL shell
docker compose exec mysql mysql -u root -p

# View database logs
docker compose logs mysql -f

# Access phpMyAdmin (dev mode)
docker compose --profile dev-tools up -d
```

### Debugging
```bash
# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# Access container shell
docker compose exec backend sh
docker compose exec frontend sh
```

## 📊 Environment Profiles

### Development Profile
- Hot reload enabled
- Source code mounted as volumes
- Debug ports exposed
- Development database with logging
- Additional dev tools (phpMyAdmin, Mailhog)

### Production Profile
- Optimized builds
- No source code mounting
- Health checks enabled
- Resource limits applied
- SSL/TLS ready

### Dev Tools Profile
```bash
# Start with development tools
docker compose --profile dev-tools up -d

# Services included:
# - phpMyAdmin (database management)
# - Mailhog (email testing)
# - Redis (caching)
```

## 🔧 Configuration

### Environment Variables
Key variables in `.env`:

```bash
# Ports
FRONTEND_PORT=3000
BACKEND_PORT=3001
MYSQL_PORT=3306

# Database
MYSQL_ROOT_PASSWORD=secure_password
MYSQL_DATABASE=dip_dive_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# Security
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key

# URLs
FRONTEND_URL=http://localhost:3000
VUE_APP_API_URL=http://localhost:3001
```

### Custom Networks
All services run on isolated `dip-dive-network` for security.

### Persistent Data
- MySQL data: `mysql_data` volume
- Development MySQL: `mysql_dev_data` volume

## 🔄 Common Commands

```bash
# Start development stack
./scripts/start.sh dev --build

# Start production stack
./scripts/start.sh prod

# Stop all services
./scripts/stop.sh

# Stop and remove everything (⚠️ deletes data)
./scripts/stop.sh --remove-volumes

# Rebuild specific service
docker compose build backend
docker compose up -d backend

# Scale services (production only)
docker compose up -d --scale backend=3

# View service status
docker compose ps

# Follow logs
docker compose logs -f

# Execute commands in container
docker compose exec backend npm run test
docker compose exec mysql mysql -u root -p
```

## 📦 Volumes & Data

### Persistent Volumes
- `mysql_data`: Production MySQL data
- `mysql_dev_data`: Development MySQL data
- `mysql_config`: MySQL configuration files

### Backup & Restore
```bash
# Backup database
docker compose exec mysql mysqldump -u root -p dip_dive_db > backup.sql

# Restore database
docker compose exec -T mysql mysql -u root -p dip_dive_db < backup.sql

# Backup with script
./scripts/backup.sh
```

## 🔒 Security

### Production Security Features
- Non-root users in containers
- Resource limits and health checks
- Isolated network communication
- Environment variable security
- SSL/TLS ready configuration

### Security Best Practices
- Never commit `.env` files
- Use strong passwords in production
- Enable SSL certificates for public deployment
- Regularly update base images
- Monitor logs for security events

## 🚀 Deployment

### Production Deployment
1. Set production environment variables
2. Configure SSL certificates (optional)
3. Set resource limits
4. Enable health checks
5. Use production Docker Compose file only

```bash
# Production deployment
docker compose -f docker-compose.yml up -d --build
```

### Cloud Deployment
The stack is ready for cloud deployment on:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Docker-compatible hosting

## 🧪 Testing

```bash
# Run backend tests
docker compose exec backend npm run test

# Run frontend tests
docker compose exec frontend npm run test

# Run e2e tests
docker compose exec backend npm run test:e2e
```

## 📈 Monitoring

### Health Checks
All services include health checks:
- **Frontend**: HTTP check on port 8080/5173
- **Backend**: API health endpoint
- **MySQL**: mysqladmin ping

### Logging
Centralized logging configuration with rotation:
- Log rotation: 10MB max, 3 files
- JSON format for structured logging

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Change port in .env file
   FRONTEND_PORT=3001
   ```

2. **Permission errors**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues**
   ```bash
   # Check database health
   docker compose exec mysql mysqladmin ping -h localhost -u root -p
   
   # Restart database
   docker compose restart mysql
   ```

4. **Build failures**
   ```bash
   # Clean build cache
   docker compose build --no-cache
   
   # Remove all and rebuild
   docker compose down
   docker compose up --build
   ```

### Reset Everything
```bash
# Nuclear option - removes everything
./scripts/stop.sh --remove-volumes --remove-images
docker system prune -a --volumes
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test with Docker Compose
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
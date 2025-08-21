#!/bin/bash

# =========================================
# DIP-DIVE Stack Startup Script
# =========================================
# Usage:
#   ./scripts/start.sh [dev|prod] [--build] [--logs]
# Examples:
#   ./scripts/start.sh dev --build
#   ./scripts/start.sh prod --logs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
BUILD_FLAG=""
LOGS_FLAG=""
DETACH_FLAG="-d"

# Functions
print_usage() {
    echo -e "${BLUE}Usage: $0 [dev|prod] [OPTIONS]${NC}"
    echo ""
    echo "Arguments:"
    echo "  dev|prod    Environment to start (default: dev)"
    echo ""
    echo "Options:"
    echo "  --build     Rebuild images before starting"
    echo "  --logs      Show logs after starting (implies --no-detach)"
    echo "  --no-detach Run in foreground"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev --build          # Start development with fresh build"
    echo "  $0 prod --logs          # Start production and show logs"
    echo "  $0 dev --no-detach      # Start development in foreground"
}

print_header() {
    echo -e "${BLUE}"
    echo "==========================================="
    echo "      DIP-DIVE Stack Startup"
    echo "==========================================="
    echo -e "${NC}"
}

check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not available${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Dependencies check passed${NC}"
}

check_env_file() {
    echo -e "${YELLOW}Checking environment configuration...${NC}"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
            cp .env.example .env
            echo -e "${YELLOW}⚠️  Please edit .env file with your configuration before starting${NC}"
            read -p "Press enter to continue or Ctrl+C to exit..."
        else
            echo -e "${RED}Error: No .env file found and no .env.example available${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✓ Environment configuration check passed${NC}"
}

cleanup() {
    echo -e "${YELLOW}Cleaning up previous containers...${NC}"
    docker compose down --remove-orphans
}

start_services() {
    local compose_files="-f docker-compose.yml"
    local compose_cmd="docker compose"
    
    # Add override file for development
    if [ "$ENVIRONMENT" = "dev" ]; then
        compose_files="$compose_files -f docker-compose.override.yml"
        echo -e "${BLUE}Starting in DEVELOPMENT mode...${NC}"
    else
        echo -e "${BLUE}Starting in PRODUCTION mode...${NC}"
    fi
    
    # Build command
    if [ ! -z "$BUILD_FLAG" ]; then
        echo -e "${YELLOW}Building images...${NC}"
        $compose_cmd $compose_files build --parallel
    fi
    
    # Start services
    echo -e "${YELLOW}Starting services...${NC}"
    $compose_cmd $compose_files up $DETACH_FLAG $BUILD_FLAG
    
    if [ "$DETACH_FLAG" = "-d" ]; then
        echo -e "${GREEN}✓ Services started successfully${NC}"
        
        # Show service status
        echo -e "${BLUE}Service Status:${NC}"
        $compose_cmd $compose_files ps
        
        # Show logs if requested
        if [ ! -z "$LOGS_FLAG" ]; then
            echo -e "${BLUE}Following logs...${NC}"
            $compose_cmd $compose_files logs -f
        fi
        
        # Show access URLs
        show_urls
    fi
}

show_urls() {
    echo -e "${GREEN}"
    echo "==========================================="
    echo "      Service Access URLs"
    echo "==========================================="
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo "🌐 Frontend:     http://localhost:5173"
        echo "🔧 Backend API:  http://localhost:3001"
        echo "🗄️  Database:    localhost:3307"
        echo "📊 phpMyAdmin:   http://localhost:8080 (with --profile dev-tools)"
        echo "📧 Mailhog:      http://localhost:8025 (with --profile dev-tools)"
    else
        echo "🌐 Frontend:     http://localhost:3000"
        echo "🔧 Backend API:  http://localhost:3001"
        echo "🗄️  Database:    localhost:3306"
    fi
    
    echo "==========================================="
    echo -e "${NC}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development)
            ENVIRONMENT="dev"
            shift
            ;;
        prod|production)
            ENVIRONMENT="prod"
            shift
            ;;
        --build)
            BUILD_FLAG="--build"
            shift
            ;;
        --logs)
            LOGS_FLAG="--logs"
            DETACH_FLAG=""
            shift
            ;;
        --no-detach)
            DETACH_FLAG=""
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
print_header
check_dependencies
check_env_file
cleanup
start_services

echo -e "${GREEN}🚀 DIP-DIVE stack started successfully!${NC}"

# Show useful commands
echo -e "${BLUE}Useful commands:${NC}"
echo "  Stop services:    docker compose down"
echo "  View logs:        docker compose logs -f"
echo "  Restart service:  docker compose restart [service]"
echo "  Shell access:     docker compose exec [service] sh"
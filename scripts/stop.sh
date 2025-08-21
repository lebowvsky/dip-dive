#!/bin/bash

# =========================================
# DIP-DIVE Stack Stop Script
# =========================================
# Usage:
#   ./scripts/stop.sh [--remove-volumes] [--remove-images]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
REMOVE_VOLUMES=false
REMOVE_IMAGES=false
REMOVE_ORPHANS=true

print_usage() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo "Options:"
    echo "  --remove-volumes    Remove all volumes (⚠️  DELETES ALL DATA)"
    echo "  --remove-images     Remove all built images"
    echo "  --keep-orphans      Keep orphaned containers"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                        # Stop services only"
    echo "  $0 --remove-images        # Stop and remove images"
    echo "  $0 --remove-volumes       # Stop and remove all data (⚠️  DANGEROUS)"
}

print_header() {
    echo -e "${BLUE}"
    echo "==========================================="
    echo "       DIP-DIVE Stack Stop"
    echo "==========================================="
    echo -e "${NC}"
}

confirm_action() {
    local message="$1"
    echo -e "${RED}⚠️  WARNING: $message${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Operation cancelled${NC}"
        exit 0
    fi
}

stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    
    local compose_files="-f docker-compose.yml -f docker-compose.override.yml"
    local down_options=""
    
    # Add remove orphans flag
    if [ "$REMOVE_ORPHANS" = true ]; then
        down_options="$down_options --remove-orphans"
    fi
    
    # Add remove volumes flag with confirmation
    if [ "$REMOVE_VOLUMES" = true ]; then
        confirm_action "This will DELETE ALL DATABASE DATA and cannot be undone!"
        down_options="$down_options --volumes"
    fi
    
    # Stop services
    docker compose $compose_files down $down_options
    
    echo -e "${GREEN}✓ Services stopped${NC}"
}

remove_images() {
    if [ "$REMOVE_IMAGES" = true ]; then
        echo -e "${YELLOW}Removing built images...${NC}"
        
        # Get image names for this project
        local images=$(docker images --filter "reference=dip-dive*" --format "{{.Repository}}:{{.Tag}}")
        
        if [ ! -z "$images" ]; then
            echo "Found images to remove:"
            echo "$images"
            echo
            confirm_action "This will remove all DIP-DIVE Docker images"
            
            echo "$images" | xargs docker rmi -f
            echo -e "${GREEN}✓ Images removed${NC}"
        else
            echo -e "${BLUE}No DIP-DIVE images found to remove${NC}"
        fi
    fi
}

cleanup_system() {
    echo -e "${YELLOW}Cleaning up Docker system...${NC}"
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused networks
    docker network prune -f
    
    echo -e "${GREEN}✓ System cleanup completed${NC}"
}

show_status() {
    echo -e "${BLUE}Current Docker status:${NC}"
    
    # Show running containers
    local running=$(docker ps --filter "name=dip-dive" --format "table {{.Names}}\t{{.Status}}")
    if [ ! -z "$running" ]; then
        echo "Still running:"
        echo "$running"
        echo
    fi
    
    # Show volumes
    local volumes=$(docker volume ls --filter "name=dip-dive" --format "table {{.Name}}\t{{.Driver}}")
    if [ ! -z "$volumes" ]; then
        echo "Remaining volumes:"
        echo "$volumes"
        echo
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --remove-volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        --remove-images)
            REMOVE_IMAGES=true
            shift
            ;;
        --keep-orphans)
            REMOVE_ORPHANS=false
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
stop_services
remove_images
cleanup_system
show_status

echo -e "${GREEN}🛑 DIP-DIVE stack stopped successfully!${NC}"

# Show useful commands
echo -e "${BLUE}Useful commands:${NC}"
echo "  Start again:      ./scripts/start.sh"
echo "  View volumes:     docker volume ls"
echo "  Remove volume:    docker volume rm <volume_name>"
echo "  System cleanup:   docker system prune -a"
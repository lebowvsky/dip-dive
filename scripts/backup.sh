#!/bin/bash

# =========================================
# DIP-DIVE MySQL Backup Script
# =========================================
# Automated backup script with retention policy
# Usage:
#   ./scripts/backup.sh [--compress] [--restore backup_file]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration from environment or defaults
BACKUP_DIR="${BACKUP_DIRECTORY:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
MYSQL_CONTAINER="dip-dive-mysql"
COMPRESS=false
RESTORE_FILE=""
DATE=$(date +%Y%m%d_%H%M%S)

# Database configuration
DB_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}"
DB_NAME="${MYSQL_DATABASE}"
DB_USER="${MYSQL_USER}"
DB_PASSWORD="${MYSQL_PASSWORD}"

print_usage() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo "Options:"
    echo "  --compress              Compress backup with gzip"
    echo "  --restore FILE          Restore from backup file"
    echo "  --list                  List available backups"
    echo "  --cleanup               Remove old backups (older than $RETENTION_DAYS days)"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Create backup"
    echo "  $0 --compress           # Create compressed backup"
    echo "  $0 --restore backup.sql # Restore from backup"
    echo "  $0 --list               # List backups"
    echo "  $0 --cleanup            # Clean old backups"
}

print_header() {
    echo -e "${BLUE}"
    echo "==========================================="
    echo "       DIP-DIVE MySQL Backup"
    echo "==========================================="
    echo -e "${NC}"
}

check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi
    
    # Check if MySQL container exists and is running
    if ! docker ps --format "{{.Names}}" | grep -q "^${MYSQL_CONTAINER}$"; then
        echo -e "${RED}Error: MySQL container '${MYSQL_CONTAINER}' is not running${NC}"
        echo "Start the stack first: ./scripts/start.sh"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Dependencies check passed${NC}"
}

create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}Creating backup directory: $BACKUP_DIR${NC}"
        mkdir -p "$BACKUP_DIR"
    fi
}

create_backup() {
    local backup_filename="dip-dive-backup-${DATE}.sql"
    local backup_path="$BACKUP_DIR/$backup_filename"
    
    echo -e "${YELLOW}Creating database backup...${NC}"
    echo "Database: $DB_NAME"
    echo "Backup file: $backup_path"
    
    # Create MySQL dump
    docker exec "$MYSQL_CONTAINER" mysqldump \
        --single-transaction \
        --routines \
        --triggers \
        --lock-tables=false \
        -u root \
        -p"$DB_ROOT_PASSWORD" \
        "$DB_NAME" > "$backup_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backup created successfully${NC}"
        
        # Compress if requested
        if [ "$COMPRESS" = true ]; then
            echo -e "${YELLOW}Compressing backup...${NC}"
            gzip "$backup_path"
            backup_path="${backup_path}.gz"
            backup_filename="${backup_filename}.gz"
            echo -e "${GREEN}✓ Backup compressed${NC}"
        fi
        
        # Show backup info
        local file_size=$(ls -lh "$backup_path" | awk '{print $5}')
        echo -e "${BLUE}Backup Information:${NC}"
        echo "  File: $backup_filename"
        echo "  Size: $file_size"
        echo "  Path: $backup_path"
        
        return 0
    else
        echo -e "${RED}✗ Backup failed${NC}"
        return 1
    fi
}

restore_backup() {
    local restore_file="$1"
    
    if [ ! -f "$restore_file" ]; then
        echo -e "${RED}Error: Backup file '$restore_file' not found${NC}"
        exit 1
    fi
    
    echo -e "${RED}⚠️  WARNING: This will overwrite the current database!${NC}"
    echo "Database: $DB_NAME"
    echo "Backup file: $restore_file"
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Restore cancelled${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}Restoring database from backup...${NC}"
    
    # Check if file is compressed
    if [[ "$restore_file" == *.gz ]]; then
        echo -e "${BLUE}Decompressing and restoring...${NC}"
        gunzip -c "$restore_file" | docker exec -i "$MYSQL_CONTAINER" mysql \
            -u root \
            -p"$DB_ROOT_PASSWORD" \
            "$DB_NAME"
    else
        echo -e "${BLUE}Restoring from SQL file...${NC}"
        docker exec -i "$MYSQL_CONTAINER" mysql \
            -u root \
            -p"$DB_ROOT_PASSWORD" \
            "$DB_NAME" < "$restore_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Restore failed${NC}"
        exit 1
    fi
}

list_backups() {
    echo -e "${BLUE}Available backups in $BACKUP_DIR:${NC}"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}No backups found${NC}"
        return
    fi
    
    echo
    echo -e "$(printf "%-30s %-10s %-20s" "Filename" "Size" "Date")"
    echo "--------------------------------------------------------"
    
    for backup in "$BACKUP_DIR"/dip-dive-backup-*.sql*; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local size=$(ls -lh "$backup" | awk '{print $5}')
            local date=$(ls -l "$backup" | awk '{print $6, $7, $8}')
            printf "%-30s %-10s %-20s\n" "$filename" "$size" "$date"
        fi
    done
    echo
}

cleanup_old_backups() {
    echo -e "${YELLOW}Cleaning up backups older than $RETENTION_DAYS days...${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${BLUE}No backup directory found${NC}"
        return
    fi
    
    local deleted_count=0
    
    # Find and remove old backups
    find "$BACKUP_DIR" -name "dip-dive-backup-*.sql*" -mtime +$RETENTION_DAYS -type f | while read -r file; do
        echo "Removing: $(basename "$file")"
        rm -f "$file"
        ((deleted_count++))
    done
    
    if [ $deleted_count -gt 0 ]; then
        echo -e "${GREEN}✓ Removed $deleted_count old backup(s)${NC}"
    else
        echo -e "${BLUE}No old backups to remove${NC}"
    fi
}

verify_backup() {
    local backup_file="$1"
    
    echo -e "${YELLOW}Verifying backup integrity...${NC}"
    
    # Basic file checks
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}✗ Backup file not found${NC}"
        return 1
    fi
    
    if [ ! -s "$backup_file" ]; then
        echo -e "${RED}✗ Backup file is empty${NC}"
        return 1
    fi
    
    # Check if it's a valid SQL file (basic check)
    if [[ "$backup_file" == *.gz ]]; then
        if gunzip -t "$backup_file" 2>/dev/null; then
            echo -e "${GREEN}✓ Compressed file is valid${NC}"
        else
            echo -e "${RED}✗ Compressed file is corrupted${NC}"
            return 1
        fi
    else
        if head -n 1 "$backup_file" | grep -q "-- MySQL dump"; then
            echo -e "${GREEN}✓ Backup file appears to be valid${NC}"
        else
            echo -e "${RED}✗ Backup file doesn't appear to be a MySQL dump${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --compress)
            COMPRESS=true
            shift
            ;;
        --restore)
            RESTORE_FILE="$2"
            shift 2
            ;;
        --list)
            print_header
            list_backups
            exit 0
            ;;
        --cleanup)
            print_header
            create_backup_dir
            cleanup_old_backups
            exit 0
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

# Load environment from .env if it exists
if [ -f .env ]; then
    echo -e "${BLUE}Loading environment variables from .env${NC}"
    source .env
fi

check_dependencies
create_backup_dir

if [ ! -z "$RESTORE_FILE" ]; then
    # Restore mode
    restore_backup "$RESTORE_FILE"
else
    # Backup mode
    create_backup
    
    # Verify the backup
    if [ "$COMPRESS" = true ]; then
        verify_backup "$BACKUP_DIR/dip-dive-backup-${DATE}.sql.gz"
    else
        verify_backup "$BACKUP_DIR/dip-dive-backup-${DATE}.sql"
    fi
    
    # Cleanup old backups
    cleanup_old_backups
fi

echo -e "${GREEN}🎉 Operation completed successfully!${NC}"

# Show useful commands
echo -e "${BLUE}Useful commands:${NC}"
echo "  List backups:     $0 --list"
echo "  Restore backup:   $0 --restore <backup_file>"
echo "  Clean old files:  $0 --cleanup"
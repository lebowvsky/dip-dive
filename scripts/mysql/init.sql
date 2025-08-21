-- =========================================
-- DIP-DIVE Database Initialization Script
-- =========================================
-- This script runs automatically when MySQL container starts for the first time
-- Place additional initialization SQL here

-- Create database if it doesn't exist (redundant with MYSQL_DATABASE env var but safe)
CREATE DATABASE IF NOT EXISTS dip_dive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Switch to the database
USE dip_dive_db;

-- =========================================
-- Example Tables (Replace with your schema)
-- =========================================

-- Users table example
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table example (if using session-based auth)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT,
    data TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- Initial Data
-- =========================================

-- Insert default application settings
INSERT IGNORE INTO app_settings (setting_key, setting_value, description) VALUES
('app_name', 'DIP-DIVE', 'Application name'),
('app_version', '1.0.0', 'Current application version'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('registration_enabled', 'true', 'Allow new user registrations');

-- =========================================
-- Development Data (only for development)
-- =========================================

-- Create development admin user (password: admin123)
-- NOTE: Remove this in production!
INSERT IGNORE INTO users (email, password, first_name, last_name, is_active) VALUES
('admin@dipdive.dev', '$2b$10$rZ6.QZ6QZ6QZ6QZ6QZ6QZ6', 'Admin', 'User', TRUE);

-- =========================================
-- Indexes and Performance Optimizations
-- =========================================

-- Additional indexes for better performance
-- Add more indexes based on your application's query patterns

-- =========================================
-- Views (if needed)
-- =========================================

-- Example view for active users
CREATE OR REPLACE VIEW active_users AS
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) as full_name,
    created_at
FROM users 
WHERE is_active = TRUE;

-- =========================================
-- Stored Procedures (if needed)
-- =========================================

DELIMITER //

-- Example stored procedure for user cleanup
CREATE PROCEDURE CleanupInactiveUsers(IN days_inactive INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_count INT DEFAULT 0;
    
    -- Count users to be deleted
    SELECT COUNT(*) INTO user_count
    FROM users 
    WHERE is_active = FALSE 
    AND updated_at < DATE_SUB(NOW(), INTERVAL days_inactive DAY);
    
    -- Delete inactive users
    DELETE FROM users 
    WHERE is_active = FALSE 
    AND updated_at < DATE_SUB(NOW(), INTERVAL days_inactive DAY);
    
    -- Return count of deleted users
    SELECT user_count as deleted_users;
END //

DELIMITER ;

-- =========================================
-- Triggers (if needed)
-- =========================================

-- Example trigger to update updated_at automatically
DELIMITER //

CREATE TRIGGER update_users_timestamp 
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- =========================================
-- Grant Permissions
-- =========================================

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON dip_dive_db.* TO 'dip_dive_user'@'%';
GRANT EXECUTE ON dip_dive_db.* TO 'dip_dive_user'@'%';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- =========================================
-- Final Message
-- =========================================

SELECT 'DIP-DIVE database initialization completed successfully!' as message;
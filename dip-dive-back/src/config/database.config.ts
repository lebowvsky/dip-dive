import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * TypeORM configuration factory
 * Supports multiple environments with proper naming strategy
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const isDevelopment = configService.get('NODE_ENV') === 'development';

  return {
    type: 'mysql',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 3306),
    username: configService.get<string>('DATABASE_USER', 'root'),
    password: configService.get<string>('DATABASE_PASSWORD', ''),
    database: configService.get<string>('DATABASE_NAME', 'dip_dive_db'),
    
    // Entity configuration - will be loaded automatically by NestJS
    autoLoadEntities: true,
    
    // Naming strategy for snake_case database columns
    namingStrategy: new SnakeNamingStrategy(),
    
    // Migration and synchronization
    synchronize: !isProduction, // Never sync in production
    migrationsRun: isProduction, // Auto-run migrations in production
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations_history',
    
    // Connection pool settings
    extra: {
      connectionLimit: isProduction ? 20 : 5,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    
    // Logging configuration
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    logger: isDevelopment ? 'advanced-console' : 'file',
    
    // Connection options
    charset: 'utf8mb4',
    timezone: 'Z', // UTC timezone
    
    // Enable foreign key constraints (handled by MySQL configuration)
    
    // Cache configuration
    cache: {
      type: 'database',
      duration: 30000, // 30 seconds
      tableName: 'query_result_cache',
    },
    
    // Development features
    dropSchema: false, // Never drop schema automatically
    
    // SSL configuration for production
    ssl: isProduction ? {
      rejectUnauthorized: false,
    } : false,

    // Entity schema validation (handled by TypeORM automatically)
  };
};

/**
 * Test database configuration
 * Used for unit tests and integration tests
 */
export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: ':memory:',
  autoLoadEntities: true,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
  logging: false,
  dropSchema: true,
});

/**
 * Migration configuration for TypeORM CLI
 */
export const migrationConfig = {
  type: 'mysql' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'dip_dive_db',
  entities: [
    'src/users/entities/*.entity.ts',
    'src/roles/entities/*.entity.ts', 
    'src/permissions/entities/*.entity.ts',
    'src/user-roles/entities/*.entity.ts',
    'src/role-permissions/entities/*.entity.ts',
  ],
  migrations: ['src/migrations/**/*.ts'],
  migrationsTableName: 'migrations_history',
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: false,
};
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UsersSeeder } from './users.seed';

/**
 * Script to run user seeds only
 * Usage: npm run seed:users
 */
async function runUserSeeds() {
  console.log('👥 Starting user seeding process...');

  // Create data source with environment variables
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'dip_dive_dev',
    entities: [
      'src/users/entities/*.entity.ts',
      'src/roles/entities/*.entity.ts', 
      'src/permissions/entities/*.entity.ts',
      'src/user-roles/entities/*.entity.ts',
      'src/role-permissions/entities/*.entity.ts',
    ],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false, // Don't auto-sync for user seeds
    logging: false,
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Run user seeds
    const seeder = new UsersSeeder(dataSource);
    await seeder.run();

    console.log('🎉 User seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during user seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  runUserSeeds();
}
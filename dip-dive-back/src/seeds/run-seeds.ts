import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { InitialDataSeeder } from './initial-data.seed';

/**
 * Script to run database seeds
 * Usage: npm run seed
 */
async function runSeeds() {
  console.log('🌱 Starting database seeding process...');

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
    synchronize: true, // Auto-create tables in development
    logging: false,
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Run seeds
    const seeder = new InitialDataSeeder(dataSource);
    await seeder.run();

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('📧 Email: admin@dipdive.local');
    console.log('🔐 Password: Admin123!');
    console.log('');
    console.log('⚠️  Remember to change the default password in production!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  runSeeds();
}
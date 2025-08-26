import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CustomUserSeeder, CreateUserData } from './custom-user.seed';

/**
 * Script to create custom users
 * Modify the usersToCreate array below to add your custom users
 * Usage: npm run seed:custom-user
 */
async function runCustomUserSeeds() {
  console.log('👤 Starting custom user creation...');

  // 🔧 MODIFY THIS ARRAY TO ADD YOUR CUSTOM USERS
  const usersToCreate: CreateUserData[] = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      password: 'CustomPassword123!',
      divingLicenseNumber: 'US-ALI001',
      roleName: 'instructor',
      isActive: true,
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com', 
      password: 'BobPassword456!',
      divingLicenseNumber: 'US-BOB002',
      roleName: 'diver',
      isActive: true,
    },
    // Add more users here as needed
  ];

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
    synchronize: false,
    logging: false,
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Create custom users
    const seeder = new CustomUserSeeder(dataSource);
    const createdUsers = await seeder.createMultiple(usersToCreate);

    console.log(`🎉 Custom user creation completed! Created ${createdUsers.length} users.`);
    
    if (createdUsers.length > 0) {
      console.log('\n📋 Summary of created users:');
      createdUsers.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during custom user creation:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  runCustomUserSeeds();
}
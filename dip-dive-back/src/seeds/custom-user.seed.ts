import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

/**
 * Custom user seeder for creating specific users
 * Usage example: npm run seed:custom-user
 */
export class CustomUserSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(userData: CreateUserData): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(`👤 Creating user: ${userData.firstName} ${userData.lastName}...`);

      const userRepository = queryRunner.manager.getRepository(User);
      const roleRepository = queryRunner.manager.getRepository(Role);
      const userRoleRepository = queryRunner.manager.getRepository(UserRole);

      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists!`);
        return existingUser;
      }

      // Get admin user for assignment tracking
      const adminUser = await userRepository.findOne({ 
        where: { email: 'admin@dipdive.local' }
      });

      if (!adminUser) {
        throw new Error('Admin user not found. Please run initial seeds first.');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = userRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
        divingLicenseNumber: userData.divingLicenseNumber || undefined,
        isActive: userData.isActive !== false, // Default to true
      });

      const savedUser = await userRepository.save(user);
      console.log(`✅ User created: ${savedUser.email}`);

      // Assign role if specified
      if (userData.roleName) {
        const role = await roleRepository.findOne({
          where: { name: userData.roleName }
        });

        if (!role) {
          console.log(`⚠️  Role ${userData.roleName} not found, user created without role`);
        } else {
          const userRole = userRoleRepository.create({
            userId: savedUser.id,
            roleId: role.id,
            assignedByUserId: adminUser.id,
            isActive: true,
          });

          await userRoleRepository.save(userRole);
          console.log(`🔗 Assigned role ${userData.roleName} to ${savedUser.email}`);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Custom user creation completed!');
      
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error creating custom user:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Helper method to create multiple users
  async createMultiple(usersData: CreateUserData[]): Promise<User[]> {
    const createdUsers: User[] = [];
    
    for (const userData of usersData) {
      try {
        const user = await this.run(userData);
        createdUsers.push(user);
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    }
    
    return createdUsers;
  }
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  divingLicenseNumber?: string;
  roleName?: string; // 'super_admin' | 'admin' | 'instructor' | 'dive_master' | 'diving_supervisor' | 'diver'
  isActive?: boolean;
}
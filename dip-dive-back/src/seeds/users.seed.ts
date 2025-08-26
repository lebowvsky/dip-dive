import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

/**
 * User seeder for creating test users with different roles
 */
export class UsersSeeder {
  private static readonly ROLE_NAMES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    DIVING_SUPERVISOR: 'diving_supervisor',
    DIVER: 'diver',
    DIVE_MASTER: 'dive_master',
    INSTRUCTOR: 'instructor',
  };

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('👥 Starting user seeding...');

      const userRepository = queryRunner.manager.getRepository(User);
      const roleRepository = queryRunner.manager.getRepository(Role);
      const userRoleRepository = queryRunner.manager.getRepository(UserRole);

      // Get existing roles
      const roles = await this.getRoles(roleRepository);

      // Get admin user for assignment tracking
      const adminUser = await userRepository.findOne({ 
        where: { email: 'admin@dipdive.local' }
      });

      if (!adminUser) {
        throw new Error('Admin user not found. Please run initial seeds first.');
      }

      // Create test users
      const users = await this.createUsers(userRepository);

      // Assign roles to users
      await this.assignRolesToUsers(userRoleRepository, users, roles, adminUser);

      await queryRunner.commitTransaction();
      console.log('✅ User seeding completed successfully!');
      console.log('\n📋 Created users:');
      this.displayCreatedUsers(users);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error seeding users:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async getRoles(roleRepository: any): Promise<Record<string, Role>> {
    const allRoles = await roleRepository.find();
    const roles: Record<string, Role> = {};
    
    allRoles.forEach((role: Role) => {
      roles[role.name] = role;
    });

    return roles;
  }

  private async createUsers(userRepository: any): Promise<User[]> {
    const usersData = [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@dipdive.local',
        password: 'Diver123!',
        divingLicenseNumber: 'FR-001234',
        role: UsersSeeder.ROLE_NAMES.DIVER,
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@dipdive.local',
        password: 'Instructor123!',
        divingLicenseNumber: 'FR-INS567',
        role: UsersSeeder.ROLE_NAMES.INSTRUCTOR,
      },
      {
        firstName: 'Pierre',
        lastName: 'Bernard',
        email: 'pierre.bernard@dipdive.local',
        password: 'DiveMaster123!',
        divingLicenseNumber: 'FR-DM890',
        role: UsersSeeder.ROLE_NAMES.DIVE_MASTER,
      },
      {
        firstName: 'Sophie',
        lastName: 'Leroy',
        email: 'sophie.leroy@dipdive.local',
        password: 'Supervisor123!',
        divingLicenseNumber: 'FR-SUP123',
        role: UsersSeeder.ROLE_NAMES.DIVING_SUPERVISOR,
      },
      {
        firstName: 'Lucas',
        lastName: 'Moreau',
        email: 'lucas.moreau@dipdive.local',
        password: 'Admin123!',
        role: UsersSeeder.ROLE_NAMES.ADMIN,
      },
      {
        firstName: 'Emma',
        lastName: 'Petit',
        email: 'emma.petit@dipdive.local',
        password: 'Diver456!',
        divingLicenseNumber: 'FR-002468',
        role: UsersSeeder.ROLE_NAMES.DIVER,
      },
      {
        firstName: 'Thomas',
        lastName: 'Roux',
        email: 'thomas.roux@dipdive.local',
        password: 'Instructor456!',
        divingLicenseNumber: 'FR-INS789',
        role: UsersSeeder.ROLE_NAMES.INSTRUCTOR,
      },
      {
        firstName: 'Camille',
        lastName: 'Garnier',
        email: 'camille.garnier@dipdive.local',
        password: 'Diver789!',
        divingLicenseNumber: 'FR-003691',
        role: UsersSeeder.ROLE_NAMES.DIVER,
      },
    ];

    const createdUsers: User[] = [];

    for (const userData of usersData) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        createdUsers.push(existingUser);
        continue;
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
        isActive: true,
      });

      const savedUser = await userRepository.save(user);
      savedUser.role = userData.role; // Store role for later assignment
      createdUsers.push(savedUser);

      console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    return createdUsers;
  }

  private async assignRolesToUsers(
    userRoleRepository: any,
    users: User[],
    roles: Record<string, Role>,
    adminUser: User
  ): Promise<void> {
    for (const user of users) {
      const roleName = (user as any).role;
      const role = roles[roleName];

      if (!role) {
        console.log(`⚠️  Role ${roleName} not found for user ${user.email}`);
        continue;
      }

      // Check if user already has this role
      const existingUserRole = await userRoleRepository.findOne({
        where: {
          userId: user.id,
          roleId: role.id,
        }
      });

      if (existingUserRole) {
        console.log(`⚠️  User ${user.email} already has role ${roleName}`);
        continue;
      }

      // Create user role assignment
      const userRole = userRoleRepository.create({
        userId: user.id,
        roleId: role.id,
        assignedByUserId: adminUser.id,
        isActive: true,
      });

      await userRoleRepository.save(userRole);
      console.log(`🔗 Assigned role ${roleName} to ${user.email}`);
    }
  }

  private displayCreatedUsers(users: User[]): void {
    users.forEach((user) => {
      const roleName = (user as any).role;
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Role: ${roleName}`);
      if (user.divingLicenseNumber) {
        console.log(`   🤿 License: ${user.divingLicenseNumber}`);
      }
      console.log(`   🔐 Password: [Check source code for test passwords]`);
      console.log('');
    });

    console.log('⚠️  Test passwords (change in production):');
    console.log('   - Divers: Diver123!, Diver456!, Diver789!');
    console.log('   - Instructors: Instructor123!, Instructor456!');
    console.log('   - Dive Master: DiveMaster123!');
    console.log('   - Supervisor: Supervisor123!');
    console.log('   - Admin: Admin123!');
  }
}
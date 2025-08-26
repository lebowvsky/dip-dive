import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { RolePermission } from '../role-permissions/entities/role-permission.entity';
import { CategoryEnum, PermissionActionEnum } from '../common/enums';
import * as bcrypt from 'bcrypt';

/**
 * Initial data seeder for diving management application
 * Creates default roles, permissions, and admin user
 */
export class InitialDataSeeder {
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
      console.log('🌱 Starting initial data seeding...');

      // Create repositories
      const userRepository = queryRunner.manager.getRepository(User);
      const roleRepository = queryRunner.manager.getRepository(Role);
      const permissionRepository = queryRunner.manager.getRepository(Permission);
      const userRoleRepository = queryRunner.manager.getRepository(UserRole);
      const rolePermissionRepository = queryRunner.manager.getRepository(RolePermission);

      // 1. Create Permissions
      console.log('📝 Creating permissions...');
      const permissions = await this.createPermissions(permissionRepository);

      // 2. Create Roles
      console.log('👥 Creating roles...');
      const roles = await this.createRoles(roleRepository);

      // 3. Assign Permissions to Roles
      console.log('🔗 Assigning permissions to roles...');
      await this.assignPermissionsToRoles(rolePermissionRepository, roles, permissions);

      // 4. Create Default Admin User
      console.log('👨‍💼 Creating default admin user...');
      const adminUser = await this.createAdminUser(userRepository);

      // 5. Assign Admin Role to Admin User
      console.log('🔑 Assigning admin role to admin user...');
      await this.assignAdminRole(userRoleRepository, adminUser, roles);

      await queryRunner.commitTransaction();
      console.log('✅ Initial data seeding completed successfully!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error seeding initial data:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createPermissions(permissionRepository: any): Promise<Record<string, Permission>> {
    const permissionsData = [
      // Admin permissions
      { name: 'users:create', displayName: 'Create Users', resource: 'users', action: PermissionActionEnum.CREATE, category: CategoryEnum.ADMIN, description: 'Create new users' },
      { name: 'users:read', displayName: 'View Users', resource: 'users', action: PermissionActionEnum.READ, category: CategoryEnum.ADMIN, description: 'View users' },
      { name: 'users:update', displayName: 'Update Users', resource: 'users', action: PermissionActionEnum.UPDATE, category: CategoryEnum.ADMIN, description: 'Update user information' },
      { name: 'users:delete', displayName: 'Delete Users', resource: 'users', action: PermissionActionEnum.DELETE, category: CategoryEnum.ADMIN, description: 'Delete users' },
      
      { name: 'roles:create', displayName: 'Create Roles', resource: 'roles', action: PermissionActionEnum.CREATE, category: CategoryEnum.ADMIN, description: 'Create new roles' },
      { name: 'roles:read', displayName: 'View Roles', resource: 'roles', action: PermissionActionEnum.READ, category: CategoryEnum.ADMIN, description: 'View roles' },
      { name: 'roles:update', displayName: 'Update Roles', resource: 'roles', action: PermissionActionEnum.UPDATE, category: CategoryEnum.ADMIN, description: 'Update roles' },
      { name: 'roles:delete', displayName: 'Delete Roles', resource: 'roles', action: PermissionActionEnum.DELETE, category: CategoryEnum.ADMIN, description: 'Delete roles' },
      
      { name: 'permissions:create', displayName: 'Create Permissions', resource: 'permissions', action: PermissionActionEnum.CREATE, category: CategoryEnum.ADMIN, description: 'Create new permissions' },
      { name: 'permissions:read', displayName: 'View Permissions', resource: 'permissions', action: PermissionActionEnum.READ, category: CategoryEnum.ADMIN, description: 'View permissions' },
      { name: 'permissions:update', displayName: 'Update Permissions', resource: 'permissions', action: PermissionActionEnum.UPDATE, category: CategoryEnum.ADMIN, description: 'Update permissions' },
      { name: 'permissions:delete', displayName: 'Delete Permissions', resource: 'permissions', action: PermissionActionEnum.DELETE, category: CategoryEnum.ADMIN, description: 'Delete permissions' },

      { name: 'settings:read', displayName: 'View Settings', resource: 'settings', action: PermissionActionEnum.READ, category: CategoryEnum.ADMIN, description: 'View system settings' },
      { name: 'settings:update', displayName: 'Update Settings', resource: 'settings', action: PermissionActionEnum.UPDATE, category: CategoryEnum.ADMIN, description: 'Update system settings' },

      // Diving permissions
      { name: 'dives:create', displayName: 'Create Dives', resource: 'dives', action: PermissionActionEnum.CREATE, category: CategoryEnum.DIVING, description: 'Create new dives' },
      { name: 'dives:read', displayName: 'View Dives', resource: 'dives', action: PermissionActionEnum.READ, category: CategoryEnum.DIVING, description: 'View dives' },
      { name: 'dives:update', displayName: 'Update Dives', resource: 'dives', action: PermissionActionEnum.UPDATE, category: CategoryEnum.DIVING, description: 'Update dive information' },
      { name: 'dives:delete', displayName: 'Delete Dives', resource: 'dives', action: PermissionActionEnum.DELETE, category: CategoryEnum.DIVING, description: 'Delete dives' },

      { name: 'divers:read', displayName: 'View Divers', resource: 'divers', action: PermissionActionEnum.READ, category: CategoryEnum.DIVING, description: 'View divers' },
      { name: 'divers:update', displayName: 'Update Divers', resource: 'divers', action: PermissionActionEnum.UPDATE, category: CategoryEnum.DIVING, description: 'Update diver information' },

      { name: 'diving_sites:create', displayName: 'Create Diving Sites', resource: 'diving_sites', action: PermissionActionEnum.CREATE, category: CategoryEnum.DIVING, description: 'Create diving sites' },
      { name: 'diving_sites:read', displayName: 'View Diving Sites', resource: 'diving_sites', action: PermissionActionEnum.READ, category: CategoryEnum.DIVING, description: 'View diving sites' },
      { name: 'diving_sites:update', displayName: 'Update Diving Sites', resource: 'diving_sites', action: PermissionActionEnum.UPDATE, category: CategoryEnum.DIVING, description: 'Update diving sites' },

      { name: 'reports:read', displayName: 'View Reports', resource: 'reports', action: PermissionActionEnum.READ, category: CategoryEnum.DIVING, description: 'View diving reports' },
      { name: 'reports:create', displayName: 'Create Reports', resource: 'reports', action: PermissionActionEnum.CREATE, category: CategoryEnum.DIVING, description: 'Create diving reports' },
    ];

    const permissions: Record<string, Permission> = {};

    for (const permData of permissionsData) {
      const permission = permissionRepository.create(permData);
      const saved = await permissionRepository.save(permission);
      permissions[permData.name] = saved;
    }

    return permissions;
  }

  private async createRoles(roleRepository: any): Promise<Record<string, Role>> {
    const rolesData = [
      {
        name: InitialDataSeeder.ROLE_NAMES.SUPER_ADMIN,
        displayName: 'Super Administrator',
        description: 'Super Administrator with full system access',
        category: CategoryEnum.ADMIN,
      },
      {
        name: InitialDataSeeder.ROLE_NAMES.ADMIN,
        displayName: 'Administrator',
        description: 'System Administrator with technical management access',
        category: CategoryEnum.ADMIN,
      },
      {
        name: InitialDataSeeder.ROLE_NAMES.DIVING_SUPERVISOR,
        displayName: 'Diving Supervisor',
        description: 'Diving Supervisor responsible for dive operations',
        category: CategoryEnum.DIVING,
      },
      {
        name: InitialDataSeeder.ROLE_NAMES.DIVER,
        displayName: 'Diver',
        description: 'Certified diver with basic diving permissions',
        category: CategoryEnum.DIVING,
      },
      {
        name: InitialDataSeeder.ROLE_NAMES.DIVE_MASTER,
        displayName: 'Dive Master',
        description: 'Dive Master with advanced diving supervision rights',
        category: CategoryEnum.DIVING,
      },
      {
        name: InitialDataSeeder.ROLE_NAMES.INSTRUCTOR,
        displayName: 'Instructor',
        description: 'Diving Instructor with teaching and certification rights',
        category: CategoryEnum.DIVING,
      },
    ];

    const roles: Record<string, Role> = {};

    for (const roleData of rolesData) {
      const role = roleRepository.create(roleData);
      const saved = await roleRepository.save(role);
      roles[roleData.name] = saved;
    }

    return roles;
  }

  private async assignPermissionsToRoles(
    rolePermissionRepository: any,
    roles: Record<string, Role>,
    permissions: Record<string, Permission>,
  ): Promise<void> {
    const assignments = [
      // Super Admin - ALL permissions
      { role: InitialDataSeeder.ROLE_NAMES.SUPER_ADMIN, permissions: Object.keys(permissions) },

      // Admin - All admin permissions + read diving data
      {
        role: InitialDataSeeder.ROLE_NAMES.ADMIN,
        permissions: [
          'create_users', 'read_users', 'update_users', 'delete_users',
          'create_roles', 'read_roles', 'update_roles', 'delete_roles',
          'create_permissions', 'read_permissions', 'update_permissions', 'delete_permissions',
          'read_settings', 'update_settings',
          'read_dives', 'read_divers', 'read_diving_sites', 'read_reports',
        ],
      },

      // Instructor - Advanced diving permissions
      {
        role: InitialDataSeeder.ROLE_NAMES.INSTRUCTOR,
        permissions: [
          'create_dives', 'read_dives', 'update_dives', 'delete_dives',
          'read_divers', 'update_divers',
          'create_diving_sites', 'read_diving_sites', 'update_diving_sites',
          'create_reports', 'read_reports',
        ],
      },

      // Dive Master - Diving supervision permissions
      {
        role: InitialDataSeeder.ROLE_NAMES.DIVE_MASTER,
        permissions: [
          'create_dives', 'read_dives', 'update_dives',
          'read_divers', 'update_divers',
          'read_diving_sites', 'update_diving_sites',
          'create_reports', 'read_reports',
        ],
      },

      // Diving Supervisor - Basic supervision permissions
      {
        role: InitialDataSeeder.ROLE_NAMES.DIVING_SUPERVISOR,
        permissions: [
          'read_dives', 'update_dives',
          'read_divers',
          'read_diving_sites',
          'create_reports', 'read_reports',
        ],
      },

      // Diver - Basic permissions
      {
        role: InitialDataSeeder.ROLE_NAMES.DIVER,
        permissions: [
          'read_dives',
          'read_diving_sites',
          'read_reports',
        ],
      },
    ];

    for (const assignment of assignments) {
      const role = roles[assignment.role];
      for (const permissionName of assignment.permissions) {
        const permission = permissions[permissionName];
        if (role && permission) {
          const rolePermission = rolePermissionRepository.create({
            roleId: role.id,
            permissionId: permission.id,
          });
          await rolePermissionRepository.save(rolePermission);
        }
      }
    }
  }

  private async createAdminUser(userRepository: any): Promise<User> {
    const passwordHash = await bcrypt.hash('Admin123!', 12);

    const adminUser = userRepository.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@dipdive.local',
      passwordHash,
      isActive: true,
    });

    return await userRepository.save(adminUser);
  }

  private async assignAdminRole(
    userRoleRepository: any,
    adminUser: User,
    roles: Record<string, Role>,
  ): Promise<void> {
    const superAdminRole = roles[InitialDataSeeder.ROLE_NAMES.SUPER_ADMIN];
    
    const userRole = userRoleRepository.create({
      userId: adminUser.id,
      roleId: superAdminRole.id,
      assignedByUserId: adminUser.id, // Self-assigned during setup
    });

    await userRoleRepository.save(userRole);
  }
}
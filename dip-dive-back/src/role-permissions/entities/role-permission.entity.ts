import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

@Entity('role_permissions')
@Index(['roleId', 'permissionId'], { unique: true })
@Index(['roleId'])
@Index(['permissionId'])
@Index(['assignedByUserId'])
@Index(['isActive'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  roleId: string;

  @Column({ name: 'permission_id', type: 'uuid' })
  @IsUUID(4, { message: 'Permission ID must be a valid UUID' })
  permissionId: string;

  @Column({ name: 'assigned_by_user_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'Assigned by user ID must be a valid UUID' })
  assignedByUserId?: string;

  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToOne('Role', 'rolePermissions', {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Promise<any>;

  @ManyToOne('Permission', 'rolePermissions', {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Promise<any>;

  @ManyToOne('User', {
    lazy: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedByUser?: Promise<any>;

  async getRoleName(): Promise<string> {
    const role = await this.role;
    return role?.name || 'Unknown Role';
  }

  async getRoleDisplayName(): Promise<string> {
    const role = await this.role;
    return role?.displayName || 'Unknown Role';
  }

  async getPermissionName(): Promise<string> {
    const permission = await this.permission;
    return permission?.name || 'Unknown Permission';
  }

  async getPermissionDisplayName(): Promise<string> {
    const permission = await this.permission;
    return permission?.displayName || 'Unknown Permission';
  }

  async getAssignedByUserName(): Promise<string | null> {
    if (!this.assignedByUserId || !this.assignedByUser) return null;
    const assignedByUser = await this.assignedByUser;
    return assignedByUser?.fullName || 'Unknown User';
  }

  async isRoleActive(): Promise<boolean> {
    const role = await this.role;
    return role?.isActive === true;
  }

  async isPermissionActive(): Promise<boolean> {
    const permission = await this.permission;
    return permission?.isActive === true;
  }

  async isFullyActive(): Promise<boolean> {
    return this.isActive && (await this.isRoleActive()) && (await this.isPermissionActive());
  }

  deactivate(): void {
    this.isActive = false;
  }

  reactivate(): void {
    this.isActive = true;
    this.deletedAt = undefined;
  }
}

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

@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true })
@Index(['userId'])
@Index(['roleId'])
@Index(['assignedByUserId'])
@Index(['isActive'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @Column({ name: 'role_id', type: 'uuid' })
  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  roleId: string;

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

  @ManyToOne('User', 'userRoles', {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Promise<any>;

  @ManyToOne('Role', 'userRoles', {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Promise<any>;

  @ManyToOne('User', 'assignedUserRoles', {
    lazy: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedByUser?: Promise<any>;

  async getUserFullName(): Promise<string> {
    const user = await this.user;
    return user?.fullName || 'Unknown User';
  }

  async getRoleName(): Promise<string> {
    const role = await this.role;
    return role?.name || 'Unknown Role';
  }

  async getRoleDisplayName(): Promise<string> {
    const role = await this.role;
    return role?.displayName || 'Unknown Role';
  }

  async getAssignedByUserName(): Promise<string | null> {
    if (!this.assignedByUserId || !this.assignedByUser) return null;
    const assignedByUser = await this.assignedByUser;
    return assignedByUser?.fullName || 'Unknown User';
  }

  async isUserActive(): Promise<boolean> {
    const user = await this.user;
    return user?.isActive === true;
  }

  async isRoleActive(): Promise<boolean> {
    const role = await this.role;
    return role?.isActive === true;
  }

  async isFullyActive(): Promise<boolean> {
    return this.isActive && (await this.isUserActive()) && (await this.isRoleActive());
  }

  deactivate(): void {
    this.isActive = false;
  }

  reactivate(): void {
    this.isActive = true;
    this.deletedAt = undefined;
  }
}

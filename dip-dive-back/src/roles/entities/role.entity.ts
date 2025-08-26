import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoryEnum } from '../../common/enums';

@Entity('roles')
@Index(['category'])
@Index(['isActive'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @IsString()
  @MinLength(3, { message: 'Role name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Role name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Role name can only contain letters, numbers, underscores and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  name: string;

  @Column({ name: 'display_name', length: 100 })
  @IsString()
  @MinLength(3, { message: 'Display name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Display name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  displayName: string;

  @Column({ length: 500, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @Column({ type: 'enum', enum: CategoryEnum })
  @IsEnum(CategoryEnum, { message: 'Category must be either admin or diving' })
  category: CategoryEnum;

  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany('UserRole', 'role', {
    lazy: true,
    cascade: ['remove'],
  })
  userRoles: Promise<any[]>;

  @OneToMany('RolePermission', 'role', {
    lazy: true,
    cascade: ['remove'],
  })
  rolePermissions: Promise<any[]>;

  get isAdminRole(): boolean {
    return this.category === CategoryEnum.ADMIN;
  }

  get isDivingRole(): boolean {
    return this.category === CategoryEnum.DIVING;
  }

  async getActiveUserCount(): Promise<number> {
    const userRoles = await this.userRoles;
    return userRoles.filter(ur => ur.isActive && ur.user?.isActive).length;
  }

  async getPermissions(): Promise<string[]> {
    const rolePermissions = await this.rolePermissions;
    return rolePermissions
      .filter(rp => rp.isActive && rp.permission?.isActive)
      .map(rp => rp.permission?.name);
  }

  async hasPermission(permissionName: string): Promise<boolean> {
    const permissions = await this.getPermissions();
    return permissions.includes(permissionName);
  }

  deactivate(): void {
    this.isActive = false;
  }

  reactivate(): void {
    this.isActive = true;
    this.deletedAt = undefined;
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateData(): void {
    if (this.name) {
      this.name = this.name.toLowerCase().trim();
    }
    if (this.displayName) {
      this.displayName = this.displayName.trim();
    }
    if (this.description) {
      this.description = this.description.trim();
    }
  }
}

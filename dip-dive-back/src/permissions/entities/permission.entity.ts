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
import { CategoryEnum, PermissionActionEnum } from '../../common/enums';

@Entity('permissions')
@Index(['resource'])
@Index(['action'])
@Index(['category'])
@Index(['isActive'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @IsString()
  @MinLength(3, { message: 'Permission name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Permission name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_:-]+$/, {
    message: 'Permission name can only contain letters, numbers, underscores, hyphens and colons',
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

  @Column({ length: 50 })
  @IsString()
  @MinLength(2, { message: 'Resource must be at least 2 characters long' })
  @MaxLength(50, { message: 'Resource cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Resource can only contain letters, numbers, underscores and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  resource: string;

  @Column({ type: 'enum', enum: PermissionActionEnum })
  @IsEnum(PermissionActionEnum, { message: 'Action must be create, read, update, or delete' })
  action: PermissionActionEnum;

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

  @OneToMany('RolePermission', 'permission', {
    lazy: true,
    cascade: ['remove'],
  })
  rolePermissions: Promise<any[]>;

  get isAdminPermission(): boolean {
    return this.category === CategoryEnum.ADMIN;
  }

  get isDivingPermission(): boolean {
    return this.category === CategoryEnum.DIVING;
  }

  get isCreateAction(): boolean {
    return this.action === PermissionActionEnum.CREATE;
  }

  get isReadAction(): boolean {
    return this.action === PermissionActionEnum.READ;
  }

  get isUpdateAction(): boolean {
    return this.action === PermissionActionEnum.UPDATE;
  }

  get isDeleteAction(): boolean {
    return this.action === PermissionActionEnum.DELETE;
  }

  async getActiveRoleCount(): Promise<number> {
    const rolePermissions = await this.rolePermissions;
    return rolePermissions.filter(rp => rp.isActive && rp.role?.isActive).length;
  }

  async getRoles(): Promise<string[]> {
    const rolePermissions = await this.rolePermissions;
    return rolePermissions
      .filter(rp => rp.isActive && rp.role?.isActive)
      .map(rp => rp.role?.name);
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
    if (this.resource) {
      this.resource = this.resource.toLowerCase().trim();
    }
    
    if (this.name && this.resource && this.action) {
      this.name = `${this.resource}:${this.action}`;
    }
  }
}

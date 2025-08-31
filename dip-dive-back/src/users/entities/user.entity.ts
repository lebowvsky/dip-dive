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
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Exclude, Transform } from 'class-transformer';

/**
 * User entity for diving management application
 * Handles user authentication, profile information, and diving credentials
 */
@Entity('users')
@Index(['isActive'])
@Index(['divingLicenseNumber'])
@Index(['lastName', 'firstName'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 50 })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'First name can only contain letters, spaces, hyphens and apostrophes',
  })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @Column({ name: 'last_name', length: 50 })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Last name can only contain letters, spaces, hyphens and apostrophes',
  })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @Column({ unique: true, length: 255 })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  @IsString()
  @MinLength(60, { message: 'Password hash is invalid' }) // bcrypt hash length
  @MaxLength(255, { message: 'Password hash is invalid' })
  // @Exclude({ toPlainOnly: true }) // Never expose password hash in API responses
  @Exclude()
  passwordHash: string;

  @Column({ name: 'diving_license_number', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Diving license number cannot exceed 20 characters' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Diving license number can only contain uppercase letters, numbers and hyphens',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  divingLicenseNumber?: string;

  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relations (lazy loaded to avoid circular dependencies)
  @OneToMany('UserRole', 'user', {
    lazy: true,
    cascade: ['remove'],
  })
  userRoles: Promise<any[]>;

  @OneToMany('UserRole', 'assignedByUser', {
    lazy: true,
  })
  assignedUserRoles: Promise<any[]>;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get displayName(): string {
    return this.fullName;
  }

  get isDiver(): boolean {
    return !!this.divingLicenseNumber;
  }

  // Helper methods
  /**
   * Check if user has a specific role by name
   */
  async hasRole(roleName: string): Promise<boolean> {
    const userRoles = await this.userRoles;
    return userRoles.some((userRole) => userRole.role?.name === roleName && userRole.isActive);
  }

  /**
   * Check if user has any role in a specific category
   */
  async hasRoleInCategory(category: string): Promise<boolean> {
    const userRoles = await this.userRoles;
    return userRoles.some((userRole) => userRole.role?.category === category && userRole.isActive);
  }

  /**
   * Get all active roles for the user
   */
  async getActiveRoles(): Promise<string[]> {
    const userRoles = await this.userRoles;
    return userRoles
      .filter((userRole) => userRole.isActive && userRole.role?.isActive)
      .map((userRole) => userRole.role?.name);
  }

  /**
   * Deactivate user (soft delete alternative)
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Reactivate user
   */
  reactivate(): void {
    this.isActive = true;
    this.deletedAt = undefined;
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateData(): void {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    if (this.firstName) {
      this.firstName = this.firstName.trim();
    }
    if (this.lastName) {
      this.lastName = this.lastName.trim();
    }
    if (this.divingLicenseNumber) {
      this.divingLicenseNumber = this.divingLicenseNumber.toUpperCase().trim();
    }
  }
}

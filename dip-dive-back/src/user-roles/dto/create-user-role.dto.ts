import { IsUUID, IsOptional } from 'class-validator';

export class CreateUserRoleDto {
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  roleId: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assigned by user ID must be a valid UUID' })
  assignedByUserId?: string;
}

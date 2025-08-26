import { IsUUID, IsOptional } from 'class-validator';

export class CreateRolePermissionDto {
  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  roleId: string;

  @IsUUID(4, { message: 'Permission ID must be a valid UUID' })
  permissionId: string;

  @IsOptional()
  @IsUUID(4, { message: 'Assigned by user ID must be a valid UUID' })
  assignedByUserId?: string;
}

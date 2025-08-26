import { PartialType } from '@nestjs/mapped-types';
import { CreateRolePermissionDto } from './create-role-permission.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRolePermissionDto extends PartialType(CreateRolePermissionDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

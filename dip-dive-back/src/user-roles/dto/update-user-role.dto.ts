import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRoleDto } from './create-user-role.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

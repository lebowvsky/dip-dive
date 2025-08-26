import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoryEnum } from '../../common/enums';

export class CreateRoleDto {
  @IsString()
  @MinLength(3, { message: 'Role name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Role name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Role name can only contain letters, numbers, underscores and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  name: string;

  @IsString()
  @MinLength(3, { message: 'Display name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Display name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsEnum(CategoryEnum, { message: 'Category must be either admin or diving' })
  category: CategoryEnum;
}

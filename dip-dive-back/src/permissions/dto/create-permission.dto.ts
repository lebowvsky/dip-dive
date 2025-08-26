import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoryEnum, PermissionActionEnum } from '../../common/enums';

export class CreatePermissionDto {
  @IsString()
  @MinLength(3, { message: 'Permission name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Permission name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_:-]+$/, {
    message: 'Permission name can only contain letters, numbers, underscores, hyphens and colons',
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

  @IsString()
  @MinLength(2, { message: 'Resource must be at least 2 characters long' })
  @MaxLength(50, { message: 'Resource cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Resource can only contain letters, numbers, underscores and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  resource: string;

  @IsEnum(PermissionActionEnum, { message: 'Action must be create, read, update, or delete' })
  action: PermissionActionEnum;

  @IsEnum(CategoryEnum, { message: 'Category must be either admin or diving' })
  category: CategoryEnum;
}

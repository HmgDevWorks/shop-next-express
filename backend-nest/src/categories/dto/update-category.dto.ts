import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  @IsUrl()
  icon?: string;
}

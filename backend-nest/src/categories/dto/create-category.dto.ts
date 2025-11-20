import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(3, 20, { message: 'Name must be between 3 and 20 characters' })
  name: string;
  @IsOptional()
  @IsString()
  @Length(10, 500, {
    message: 'Description must be between 10 and 100 characters',
  })
  description?: string;
  @IsOptional()
  @IsString()
  @IsUrl()
  @Length(10, 500, {
    message: 'Icon must be a URL',
  })
  icon?: string;
}

import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class MessageResponseDto {
  @Expose()
  @IsString()
  message: string;
}

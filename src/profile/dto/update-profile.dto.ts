import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  profilePicture: string | null = null;
}

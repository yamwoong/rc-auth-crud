import { IsOptional, IsEmail, MinLength } from "class-validator";

/**
 * DTO for updating user information.
 * All fields are optional; at least one must be provided.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  name?: string;
}

import { IsEmail, IsString, MinLength } from "class-validator";

/**
 * DTO for user login request.
 * - Validates email and password fields.
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

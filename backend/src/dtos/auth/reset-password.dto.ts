import { IsString, MinLength } from "class-validator";

/**
 * DTO for resetting password.
 * - Used for /auth/reset-password endpoint
 */
export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

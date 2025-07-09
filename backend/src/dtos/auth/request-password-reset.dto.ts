import { IsEmail } from "class-validator";

/**
 * DTO for requesting password reset.
 * - Used for /auth/forgot-password endpoint
 */
export class RequestPasswordResetDto {
  @IsEmail()
  email!: string;
}

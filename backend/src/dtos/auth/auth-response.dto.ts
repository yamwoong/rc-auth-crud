/**
 * DTO for authentication response after login.
 * - Contains access token and token expiry info.
 */
export class AuthResponseDto {
  accessToken!: string;

  refreshToken?: string;

  expiresIn!: number;
}

import { Service } from "typedi";
import { LoginDto } from "@/dtos/auth/login.dto";
import { AuthResponseDto } from "@/dtos/auth/auth-response.dto";
import { UserRepository } from "@/repositories/user.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { ERROR } from "@/constants/errors";
import { assertExists, assertHasGoogleProfileInfo } from "@/utils/assert.utils";
import { verifyPassword } from "@/utils/password.utils";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt.utils";
import { plainToInstance } from "class-transformer";

/**
 * @class AuthService
 * Service layer for authentication business logic.
 */
@Service()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository
  ) {}

  /**
   * Authenticates a user by verifying email and password.
   * Issues access and refresh tokens if successful.
   * Saves the refresh token in DB for session management.
   * Throws 401 error if credentials are invalid.
   * @param loginDto - Login request data (email, password)
   * @returns AuthResponseDto (accessToken, refreshToken, expiresIn)
   * @throws AppError(401) if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    assertExists(user, ERROR.INVALID_LOGIN.message, ERROR.INVALID_LOGIN.code);

    const isPasswordValid =
      user?.password &&
      (await verifyPassword(loginDto.password, user.password));
    assertExists(
      isPasswordValid,
      ERROR.INVALID_LOGIN.message,
      ERROR.INVALID_LOGIN.code
    );

    const payload = { id: user!._id, email: user!.email, role: user!.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.authRepository.saveRefreshToken(
      user!._id.toString(),
      refreshToken
    );

    return plainToInstance(AuthResponseDto, {
      accessToken,
      refreshToken,
      expiresIn: 60 * 15, // 15 minutes (access token expiration)
    });
  }

  /**
   * Logs out a user by removing their refresh token from DB.
   * Used for session invalidation and secure logout.
   * @param userId - User's unique ID
   * @returns void
   */
  async logout(userId: string): Promise<void> {
    await this.authRepository.removeRefreshToken(userId);
  }

  /**
   * Re-issues a new access token using a valid refresh token.
   * Verifies refresh token signature and existence in DB.
   * Throws 401 error if refresh token is invalid or not found.
   * @param refreshToken - Refresh token string
   * @returns AuthResponseDto (new accessToken, expiresIn)
   * @throws AppError(401) if refresh token is invalid
   */
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const payload = verifyRefreshToken(refreshToken);
    assertExists(
      payload && typeof payload === "object" && payload.id,
      ERROR.INVALID_REFRESH_TOKEN.message,
      ERROR.INVALID_REFRESH_TOKEN.code
    );

    const user = await this.authRepository.findByRefreshToken(refreshToken);
    assertExists(
      user,
      ERROR.INVALID_REFRESH_TOKEN.message,
      ERROR.INVALID_REFRESH_TOKEN.code
    );

    const accessToken = generateAccessToken({
      id: user!._id,
      email: user!.email,
      role: user!.role,
    });

    return plainToInstance(AuthResponseDto, {
      accessToken,
      expiresIn: 60 * 15, // 15 minutes
    });
  }

  /**
   * Authenticates or registers a user using Google OAuth profile.
   * Throws if required profile fields are missing.
   * @param profile - Google OAuth profile object
   * @returns AuthResponseDto (accessToken, refreshToken, expiresIn)
   */
  async loginWithGoogle(profile: {
    id: string;
    email?: string;
    name?: string;
  }): Promise<AuthResponseDto> {
    assertHasGoogleProfileInfo(profile);

    let user = await this.userRepository.findByGoogleId(profile.id);

    if (!user) {
      user = await this.userRepository.createGoogleUser({
        email: profile.email,
        name: profile.name,
        provider: "google",
        googleId: profile.id,
      });
    }

    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    return plainToInstance(AuthResponseDto, {
      accessToken,
      refreshToken,
      expiresIn: 60 * 15,
    });
  }
}

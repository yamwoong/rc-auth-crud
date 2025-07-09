import {
  JsonController,
  Get,
  Post,
  Req,
  Res,
  Body,
  HttpCode,
  UseBefore,
} from "routing-controllers";
import { Service } from "typedi";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { AuthService } from "@/services/auth.service";
import { LoginDto } from "@/dtos/auth/login.dto";
import { AuthResponseDto } from "@/dtos/auth/auth-response.dto";
import { Request, Response } from "express";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "@/utils/cookies.utils";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { ERROR } from "@/constants/errors";
import passport from "passport";
import { RequestPasswordResetDto } from "@/dtos/auth/request-password-reset.dto";
import { ResetPasswordDto } from "@/dtos/auth/reset-password.dto";

/**
 * Handles authentication endpoints (login, refresh, logout)
 * All endpoints prefixed with /auth.
 */
@Service()
@JsonController("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login (email + password)
   * @route POST /auth/login
   * @returns { accessToken, expiresIn } (refreshToken → httpOnly cookie)
   */
  @Post("/login")
  @HttpCode(200)
  @OpenAPI({
    summary: "User login",
    description:
      "Authenticate with email and password. Sets refresh token as httpOnly cookie.",
  })
  @ResponseSchema(AuthResponseDto)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);
    setRefreshTokenCookie(res, result.refreshToken!);
    return res.json({
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      message: "Login success",
      code: 200,
    });
  }

  /**
   * Refresh access token by refresh token (from cookie)
   * @route POST /auth/refresh
   * @returns { accessToken, expiresIn }
   */
  @Post("/refresh")
  @HttpCode(200)
  @OpenAPI({
    summary: "Refresh access token",
    description:
      "Re-issues a new access token using a valid refresh token (from cookie).",
  })
  @ResponseSchema(AuthResponseDto)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        data: null,
        message: ERROR.INVALID_REFRESH_TOKEN.message,
        code: ERROR.INVALID_REFRESH_TOKEN.code,
      });
    }
    const result = await this.authService.refresh(refreshToken);
    return res.json({
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      message: "Token refreshed",
      code: 200,
    });
  }

  /**
   * Logout (delete refresh token from DB and cookie)
   * @route POST /auth/logout
   * @returns message
   */
  @Post("/logout")
  @UseBefore(authMiddleware)
  @HttpCode(200)
  @OpenAPI({
    summary: "Logout",
    description:
      "Logs out user, removes refresh token from DB and clears cookie.",
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        data: null,
        message: "Not authenticated",
        code: 401,
      });
    }
    await this.authService.logout(userId);
    clearRefreshTokenCookie(res);
    return res.json({
      data: null,
      message: "Logged out successfully",
      code: 200,
    });
  }

  /**
   * Google OAuth login entrypoint
   * @route GET /auth/google
   */
  @Get("/google")
  @UseBefore(
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })
  )
  async googleLogin() {
    // No implementation needed, passport handles redirect
  }

  /**
   * Google OAuth callback
   * @route GET /auth/google/callback
   */
  @Get("/google/callback")
  @UseBefore(
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/login",
    })
  )
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as {
      id: string;
      email?: string;
      name?: string;
    };

    const result = await this.authService.loginWithGoogle(profile);
    setRefreshTokenCookie(res, result.refreshToken!);

    return res.json({
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      message: "Google login success",
      code: 200,
    });
  }

  /**
   * Request password reset email
   * @route POST /auth/forgot-password
   * @returns message
   */
  @Post("/forgot-password")
  @HttpCode(200)
  @OpenAPI({
    summary: "Request password reset email",
    description: "Sends a password reset link to user's email.",
  })
  async forgotPassword(
    @Body() body: RequestPasswordResetDto,
    @Res() res: Response
  ) {
    await this.authService.requestPasswordReset(body.email);
    return res.json({
      data: null,
      message: "If this email exists, a reset link has been sent.",
      code: 200,
    });
  }

  /**
   * Reset password using token from email
   * @route POST /auth/reset-password
   * @returns message
   */
  @Post("/reset-password")
  @HttpCode(200)
  @OpenAPI({
    summary: "Reset password",
    description: "Resets user's password using reset token.",
  })
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response) {
    await this.authService.resetPassword(body.token, body.newPassword);
    return res.json({
      data: null,
      message: "Password has been reset successfully.",
      code: 200,
    });
  }
}

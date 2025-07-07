import {
  JsonController,
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
}

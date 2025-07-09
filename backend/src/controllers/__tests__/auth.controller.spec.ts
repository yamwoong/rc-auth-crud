import { AuthController } from "@/controllers/auth.controller";
import { AuthService } from "@/services/auth.service";
import { LoginDto } from "@/dtos/auth/login.dto";
import { RequestPasswordResetDto } from "@/dtos/auth/request-password-reset.dto";
import { ResetPasswordDto } from "@/dtos/auth/reset-password.dto";
import { mock } from "jest-mock-extended";
import { Request, Response } from "express";
import { AppError } from "@/errors/app.error";

// Mock Express response
function createMockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("AuthController", () => {
  let controller: AuthController;
  let service: ReturnType<typeof mock<AuthService>>;
  let res: Response;

  beforeEach(() => {
    service = mock<AuthService>();
    controller = new AuthController(service as any);
    res = createMockRes();
    jest.clearAllMocks();
  });

  // ========== LOGIN ==========
  describe("login", () => {
    it("should return tokens and set cookie on success", async () => {
      service.login.mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
        expiresIn: 900,
      });

      const loginDto: LoginDto = { email: "user@test.com", password: "pw" };
      await controller.login(loginDto, res);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            accessToken: "access",
            expiresIn: 900,
          }),
          message: expect.any(String),
        })
      );
    });

    it("should handle login failure", async () => {
      service.login.mockRejectedValue(new AppError("fail", 401));
      const loginDto: LoginDto = { email: "fail@test.com", password: "pw" };
      await expect(controller.login(loginDto, res)).rejects.toThrow(AppError);
    });
  });

  // ========== REFRESH ==========
  describe("refresh", () => {
    it("should refresh access token on valid refresh token", async () => {
      // @ts-ignore
      const req: Request = { cookies: { refreshToken: "refresh" } };
      service.refresh.mockResolvedValue({
        accessToken: "new-access",
        expiresIn: 900,
      });
      await controller.refresh(req, res);

      expect(service.refresh).toHaveBeenCalledWith("refresh");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            accessToken: "new-access",
          }),
        })
      );
    });

    it("should return 401 if no refresh token in cookie", async () => {
      // @ts-ignore
      const req: Request = { cookies: {} };
      await controller.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          code: expect.any(Number),
        })
      );
    });
  });

  // ========== LOGOUT ==========
  describe("logout", () => {
    it("should logout if user authenticated", async () => {
      // @ts-ignore
      const req: Request = { user: { id: "user1" } };
      service.logout.mockResolvedValue(undefined);
      await controller.logout(req, res);

      expect(service.logout).toHaveBeenCalledWith("user1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    it("should return 401 if user not authenticated", async () => {
      // @ts-ignore
      const req: Request = { user: undefined };
      await controller.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Not authenticated" })
      );
    });
  });

  // ========== GOOGLE CALLBACK ==========
  describe("googleCallback", () => {
    it("should login or register with Google profile", async () => {
      // @ts-ignore
      const req: Request = {
        user: { id: "gid", email: "g@test.com", name: "g" },
      } as unknown as Request;
      service.loginWithGoogle.mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
        expiresIn: 900,
      });
      await controller.googleCallback(req, res);

      expect(service.loginWithGoogle).toHaveBeenCalledWith({
        id: "gid",
        email: "g@test.com",
        name: "g",
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ accessToken: "access" }),
        })
      );
    });
  });

  // ========== FORGOT PASSWORD ==========
  describe("forgotPassword", () => {
    it("should call service and return message", async () => {
      service.requestPasswordReset.mockResolvedValue(undefined);
      const dto: RequestPasswordResetDto = { email: "user@test.com" };

      await controller.forgotPassword(dto, res);

      expect(service.requestPasswordReset).toHaveBeenCalledWith(
        "user@test.com"
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });
  });

  // ========== RESET PASSWORD ==========
  describe("resetPassword", () => {
    it("should reset password and return message", async () => {
      service.resetPassword.mockResolvedValue(undefined);
      const dto: ResetPasswordDto = { token: "tok", newPassword: "pw12345678" };

      await controller.resetPassword(dto, res);

      expect(service.resetPassword).toHaveBeenCalledWith("tok", "pw12345678");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });
  });
});

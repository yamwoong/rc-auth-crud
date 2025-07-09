import { AuthService } from "../auth.service";
import { UserRepository } from "@/repositories/user.repository";
import { AuthRepository } from "@/repositories/auth.repository";
import { AppError } from "@/errors/app.error";
import { mock } from "jest-mock-extended";
import * as jwtUtils from "@/utils/jwt.utils";
import * as passwordUtils from "@/utils/password.utils";
import * as emailUtils from "@/utils/email.utils";
import { IUser } from "@/models/user.model";

// 외부 유틸 mock
jest.mock("@/utils/jwt.utils");
jest.mock("@/utils/password.utils");
jest.mock("@/utils/email.utils");

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: ReturnType<typeof mock<UserRepository>>;
  let authRepository: ReturnType<typeof mock<AuthRepository>>;

  beforeEach(() => {
    userRepository = mock<UserRepository>();
    authRepository = mock<AuthRepository>();
    authService = new AuthService(userRepository, authRepository);
    jest.clearAllMocks();
  });

  // ========== LOGIN ==========
  describe("login", () => {
    it("should throw if user not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "notfound@test.com", password: "pw" })
      ).rejects.toThrow(AppError);
    });

    it("should throw if password invalid", async () => {
      userRepository.findByEmail.mockResolvedValue({
        _id: "1",
        email: "user@test.com",
        password: "hashed",
        role: "user",
        name: "Test User",
        provider: "local",
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as IUser);
      (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: "user@test.com", password: "wrongpw" })
      ).rejects.toThrow(AppError);
    });

    it("should return tokens on valid login", async () => {
      userRepository.findByEmail.mockResolvedValue({
        _id: "1",
        email: "user@test.com",
        password: "hashed",
        role: "user",
        name: "Test User",
        provider: "local",
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as IUser);
      (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue(
        "access-token"
      );
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue(
        "refresh-token"
      );
      authRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login({
        email: "user@test.com",
        password: "pw",
      });

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.expiresIn).toBeDefined();
      expect(authRepository.saveRefreshToken).toHaveBeenCalledWith(
        "1",
        "refresh-token"
      );
    });
  });

  // ========== REFRESH ==========
  describe("refresh", () => {
    it("should throw if refresh token is invalid", async () => {
      (jwtUtils.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new AppError("Invalid", 401);
      });

      await expect(authService.refresh("badtoken")).rejects.toThrow(AppError);
    });

    it("should throw if user by refresh token not found", async () => {
      (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        id: "1",
        email: "test@test.com",
        role: "user",
      });
      authRepository.findByRefreshToken.mockResolvedValue(null);

      await expect(authService.refresh("token")).rejects.toThrow(AppError);
    });

    it("should return new access token if refresh token is valid", async () => {
      (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        id: "1",
        email: "test@test.com",
        role: "user",
      });
      authRepository.findByRefreshToken.mockResolvedValue({
        _id: "1",
        email: "test@test.com",
        password: "hashed",
        role: "user",
        name: "Test User",
        provider: "local",
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as IUser);
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue(
        "new-access-token"
      );

      const result = await authService.refresh("goodtoken");
      expect(result.accessToken).toBe("new-access-token");
      expect(result.expiresIn).toBeDefined();
    });
  });

  // ========== LOGOUT ==========
  describe("logout", () => {
    it("should call removeRefreshToken on logout", async () => {
      authRepository.removeRefreshToken.mockResolvedValue(undefined);

      await authService.logout("1");
      expect(authRepository.removeRefreshToken).toHaveBeenCalledWith("1");
    });
  });

  // ========== GOOGLE LOGIN ==========
  describe("loginWithGoogle", () => {
    it("should create and return token for new Google user", async () => {
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.createGoogleUser.mockResolvedValue({
        _id: "1",
        email: "googleuser@test.com",
        name: "Google User",
        role: "user",
        provider: "google",
        googleId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        save: jest.fn().mockResolvedValue(undefined),
      } as unknown as IUser);

      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue(
        "access-token"
      );
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue(
        "refresh-token"
      );

      const result = await authService.loginWithGoogle({
        id: "google-123",
        email: "googleuser@test.com",
        name: "Google User",
      });

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    it("should return token for existing Google user", async () => {
      userRepository.findByGoogleId.mockResolvedValue({
        _id: "1",
        email: "googleuser@test.com",
        name: "Google User",
        role: "user",
        provider: "google",
        googleId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        save: jest.fn().mockResolvedValue(undefined),
      } as unknown as IUser);

      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue(
        "access-token"
      );
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue(
        "refresh-token"
      );

      const result = await authService.loginWithGoogle({
        id: "google-123",
        email: "googleuser@test.com",
        name: "Google User",
      });

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });
  });

  // ========== PASSWORD RESET (FIND/RESET) ==========
  describe("requestPasswordReset", () => {
    it("should throw if user not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(
        authService.requestPasswordReset("nouser@test.com")
      ).rejects.toThrow(AppError);
    });

    it("should set token and send email for found user", async () => {
      userRepository.findByEmail.mockResolvedValue({
        _id: "1",
        email: "test@test.com",
        name: "Test User",
        role: "user",
        provider: "local",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IUser);
      userRepository.setPasswordResetToken.mockResolvedValue(null);
      (emailUtils.sendMail as jest.Mock).mockResolvedValue(undefined);

      await authService.requestPasswordReset("test@test.com");

      expect(userRepository.setPasswordResetToken).toHaveBeenCalled();
      expect(emailUtils.sendMail).toHaveBeenCalledWith(
        "test@test.com",
        expect.any(String),
        expect.stringContaining("reset-password")
      );
    });
  });

  describe("resetPassword", () => {
    it("should throw if token is invalid", async () => {
      userRepository.findByPasswordResetToken.mockResolvedValue(null);
      await expect(
        authService.resetPassword("badtoken", "newpass")
      ).rejects.toThrow(AppError);
    });

    it("should update password, clear reset fields for valid token", async () => {
      const user = {
        _id: "1",
        email: "test@test.com",
        password: "old",
        name: "Test User",
        role: "user",
        provider: "local",
        createdAt: new Date(),
        updatedAt: new Date(),
        resetPasswordToken: "token",
        resetPasswordTokenExpires: new Date(Date.now() + 1000 * 60 * 60),
        save: jest.fn().mockResolvedValue(undefined),
      } as unknown as IUser;

      userRepository.findByPasswordResetToken.mockResolvedValue(user);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue("newhash");
      userRepository.clearPasswordResetToken.mockResolvedValue(null);

      await authService.resetPassword("token", "newpassword");

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("newpassword");
      expect(user.password).toBe("newhash");
      expect(user.save).toHaveBeenCalled();
    });
  });
});

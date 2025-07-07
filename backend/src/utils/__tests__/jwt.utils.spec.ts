import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../jwt.utils";
import { AuthTokenPayload } from "@/types/auth.type";

describe("jwt.utils", () => {
  const payload: AuthTokenPayload = {
    id: "user123",
    email: "test@example.com",
    role: "user",
  };

  it("should generate and verify access token", () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("should generate and verify refresh token", () => {
    const token = generateRefreshToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("should throw AppError for invalid access token", () => {
    expect(() => verifyAccessToken("invalid.token.here")).toThrow();
  });

  it("should throw AppError for invalid refresh token", () => {
    expect(() => verifyRefreshToken("invalid.token.here")).toThrow();
  });
});

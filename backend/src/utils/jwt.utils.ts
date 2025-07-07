import jwt, { Secret } from "jsonwebtoken";
import { AppError } from "@/errors/app.error";
import { ERROR } from "@/constants/errors";
import { AuthTokenPayload } from "@/types/auth.type";

const ACCESS_SECRET: Secret =
  process.env.JWT_ACCESS_SECRET || "access_secret_key";
const ACCESS_EXPIRES_IN = "15m";

const REFRESH_SECRET: Secret =
  process.env.JWT_REFRESH_SECRET || "refresh_secret_key";
const REFRESH_EXPIRES_IN = "7d";

// ===============================
// JWT Generate Functions
// ===============================

/**
 * Generates a JWT access token.
 * @param payload - User data to include in the token (e.g., { id, email, role })
 * @returns Signed JWT access token string
 */
export function generateAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

/**
 * Generates a JWT refresh token.
 * @param payload - User data to include in the token (e.g., { id, email, role })
 * @returns Signed JWT refresh token string
 */
export function generateRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// ===============================
// JWT Verify Functions
// ===============================

/**
 * Verifies a JWT access token and returns its payload.
 * Throws AppError(401) if token is invalid or expired.
 * @param token - JWT token string
 * @returns Decoded payload if valid
 * @throws AppError(401) if token is invalid or expired
 */
export function verifyAccessToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AuthTokenPayload;
  } catch (err) {
    throw new AppError(ERROR.INVALID_TOKEN.message, ERROR.INVALID_TOKEN.code);
  }
}

/**
 * Verifies a JWT refresh token and returns its payload.
 * Throws AppError(401) if token is invalid or expired.
 * @param token - JWT token string
 * @returns Decoded payload if valid
 * @throws AppError(401) if token is invalid or expired
 */
export function verifyRefreshToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as AuthTokenPayload;
  } catch (err) {
    throw new AppError(ERROR.INVALID_TOKEN.message, ERROR.INVALID_TOKEN.code);
  }
}

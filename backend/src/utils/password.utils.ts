import argon2 from "argon2";
import { AppError } from "@/errors/app.error";
import { ERROR } from "@/constants/errors";

/**
 * Hashes a plain password using argon2.
 * Throws AppError(500) if hashing fails.
 * @param password - Plain password string
 * @returns Promise<string> - Hashed password
 * @throws AppError(500) if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (err) {
    throw new AppError(
      ERROR.INTERNAL_SERVER_ERROR.message,
      ERROR.INTERNAL_SERVER_ERROR.code
    );
  }
}

/**
 * Verifies a plain password against a hashed password.
 * Throws AppError(500) if verification fails.
 * @param password - Plain password string
 * @param hash - Hashed password string
 * @returns Promise<boolean> - True if matched, else false
 * @throws AppError(500) if verification fails
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    throw new AppError(
      ERROR.INTERNAL_SERVER_ERROR.message,
      ERROR.INTERNAL_SERVER_ERROR.code
    );
  }
}

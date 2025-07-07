import { AppError } from "@/errors/app.error";

/**
 * Throws AppError if entity does NOT exist (for 404 Not Found).
 * @param entity - entity value (object, null, undefined, false, 0, '', etc)
 * @param message - error message
 * @param code - HTTP status code (default: 404)
 */
export function assertExists<T>(
  entity: T | null | undefined,
  message: string,
  code = 404
): asserts entity is NonNullable<T> {
  if (!entity) {
    throw new AppError(message, code);
  }
}

/**
 * Throws AppError if entity DOES exist (for 409 Conflict).
 * @param entity - entity value (object, null, undefined, false, 0, '', etc)
 * @param message - error message
 * @param code - HTTP status code (default: 409)
 */
export function assertNotExists<T>(
  entity: T | null | undefined,
  message: string,
  code = 409
): void {
  if (entity) {
    throw new AppError(message, code);
  }
}

/**
 * Throws AppError if Google profile is missing required fields.
 * Used for validating social login profile fields.
 * @param profile - Google OAuth profile object
 * @throws AppError(400) if email or name is missing
 */
export function assertHasGoogleProfileInfo(profile: {
  email?: string;
  name?: string;
}): asserts profile is { email: string; name: string } {
  if (!profile.email || !profile.name) {
    throw new AppError("Google profile is missing email or name", 400);
  }
}

import { AppError } from "@/errors/app.error";

/**
 * Throws AppError if entity does NOT exist (for 404 Not Found).
 * @param entity - entity value (object, null, undefined, etc)
 * @param message - error message
 * @param code - HTTP status code (default: 404)
 */

export function assertExists<T>(
  entity: T | null | undefined,
  message: string,
  code = 404
): asserts entity is NonNullable<T> {
  if (entity === null || entity === undefined) {
    throw new AppError(message, code);
  }
}

/**
 * Throws AppError if entity DOES exist (for 409 Conflict).
 * @param entity - entity value (object, null, undefined, etc)
 * @param message - error message
 * @param code - HTTP status code (default: 409)
 */

export function assertNotExists<T>(
  entity: T | null | undefined,
  message: string,
  code = 409
): void {
  if (entity !== null && entity !== undefined) {
    throw new AppError(message, code);
  }
}

/**
 * @class AppError
 * Custom error class for application-level errors.
 * - Extends the built-in Error class.
 * - Used for consistent error handling across the app.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Create an AppError instance.
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param isOperational - Flag for operational errors (default: true)
   */
  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Better stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

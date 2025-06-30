import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "@/errors/app.error";
import { ERROR } from "@/constants/errors";

/**
 * Global error handling middleware.
 * - Catches all errors thrown in the app.
 * - Sends standardized JSON error responses.
 * - Handles both AppError and unknown errors.
 */
export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.statusCode,
    });
    return;
  }

  console.error("UNHANDLED ERROR:", err);

  res.status(ERROR.INTERNAL_SERVER_ERROR.code).json({
    message: ERROR.INTERNAL_SERVER_ERROR.message,
    code: ERROR.INTERNAL_SERVER_ERROR.code,
  });
  return;
};

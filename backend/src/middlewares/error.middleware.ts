import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from "routing-controllers";
import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/errors/app.error";
import { ERROR } from "@/constants/errors";

/**
 * Global error handler middleware for API exceptions.
 * Always responds with a consistent format: { data: null, message, code }
 */
@Middleware({ type: "after" })
@Service()
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    if (error instanceof AppError) {
      console.warn("[AppError]", error.message);

      res.status(error.statusCode).json({
        data: null,
        message: error.message,
        code: error.statusCode,
      });
      return;
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      console.warn("[JWT Error]", error.message);

      res.status(401).json({
        data: null,
        message: "Authentication required.",
        code: 401,
      });
      return;
    }

    if (error instanceof Error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Unhandled Error]", error);
      } else {
        console.error("[Unhandled Error]", error.message);
      }
    }

    res.status(ERROR.INTERNAL_SERVER_ERROR.code).json({
      message: ERROR.INTERNAL_SERVER_ERROR.message,
      code: ERROR.INTERNAL_SERVER_ERROR.code,
    });
  }
}

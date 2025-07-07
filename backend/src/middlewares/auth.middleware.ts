import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { ERROR } from "@/constants/errors";

/**
 * JWT authentication middleware.
 * - Verifies the access token from the Authorization header.
 * - If valid, attaches user payload to req.user.
 * - If invalid/missing, returns 401 Unauthorized.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      data: null,
      message: ERROR.UNAUTHORIZED.message,
      code: ERROR.UNAUTHORIZED.code,
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      data: null,
      message: ERROR.UNAUTHORIZED.message,
      code: ERROR.UNAUTHORIZED.code,
    });
  }
}

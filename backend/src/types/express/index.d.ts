/**
 * Extends Express Request type to support req.user (JWT payload).
 * - Needed for TypeScript to recognize req.user in controllers/middlewares.
 */
import "express";
import { AuthTokenPayload } from "@/types/auth.type";

declare module "express" {
  export interface Request {
    user?: AuthTokenPayload;
  }
}

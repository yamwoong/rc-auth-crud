import { Response } from "express";

/**
 * Sets the refresh token as an HTTP-only cookie on the response.
 * @param res - Express response object
 * @param refreshToken - JWT refresh token string
 */
export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

/**
 * Clears the refresh token cookie from the response (for logout).
 * @param res - Express response object
 */
export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

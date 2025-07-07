import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { UserModel } from "@/models/user.model";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwt.utils";
import { Request } from "express";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback";

/**
 * Configure Google OAuth strategy for passport.
 * Handles user lookup, registration, and JWT issuance.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        // 1. Find existing user by Google ID
        let user = await UserModel.findOne({
          provider: "google",
          googleId: profile.id,
        });

        // 2. Register user if not found
        if (!user) {
          user = await UserModel.create({
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            provider: "google",
            googleId: profile.id,
          });
        }

        // 3. Generate JWT tokens
        const payload = { id: user._id, email: user.email, role: user.role };
        const accessTokenJWT = generateAccessToken(payload);
        const refreshTokenJWT = generateRefreshToken(payload);

        // 4. Save refresh token to database
        user.refreshToken = refreshTokenJWT;
        await user.save();

        // 5. Pass tokens and user to next middleware/controller
        done(null, {
          accessToken: accessTokenJWT,
          refreshToken: refreshTokenJWT,
          user,
        });
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

export default passport;

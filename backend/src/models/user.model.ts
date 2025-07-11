import { Document, model } from "mongoose";
import { UserSchema } from "@/schemas/user.schema";

/**
 * @interface IUser
 * Mongoose User document interface.
 * - Used for TypeScript compile-time type checking.
 */

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string | null;
  name: string;
  provider: "local" | "google";
  googleId?: string | null;
  refreshToken?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpires?: Date | null;
}

/**
 * @constant UserModel
 * Mongoose Model for the User collection.
 * - Provides runtime DB access with TypeScript type safety.
 */
export const UserModel = model<IUser>("User", UserSchema);

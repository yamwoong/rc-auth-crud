import { Schema } from "mongoose";

/**
 * @constant UserSchema
 * MongoDB schema for User collection.
 * - Supports both Local and Google login users.
 * - Password required only for local users.
 * - Password is excluded from query results by default (select: false).
 */

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: function (this: { provider?: string }) {
        return this.provider == "local";
      },
      default: null,
      select: false,
    },
    name: { type: String, required: true },
    provider: {
      type: String,
      enum: ["local", "google"],
      reqwuired: true,
      default: "local",
    },
    googoleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

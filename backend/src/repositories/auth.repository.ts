import { Service } from "typedi";
import { UserModel } from "@/models/user.model";
import { IUser } from "@/models/user.model";

/**
 * Repository for authentication-related DB operations.
 * Handles refresh token storage and retrieval for users.
 */
@Service()
export class AuthRepository {
  /**
   * Saves or updates the refresh token for a user.
   * @param userId - The user's unique ID.
   * @param refreshToken - The refresh token string.
   */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken });
  }

  /**
   * Finds a user by refresh token.
   * @param refreshToken - The refresh token string.
   * @returns The user document or null if not found.
   */
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return UserModel.findOne({ refreshToken }).exec();
  }

  /**
   * Removes the refresh token from a user (logout).
   * @param userId - The user's unique ID.
   */
  async removeRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
  }
}

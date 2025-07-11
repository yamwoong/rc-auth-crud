import { Service } from "typedi";
import { UserModel, IUser } from "@/models/user.model";

/**
 * @class UserRepository
 * Repository layer for User data access.
 * - Handles all database operations related to the User collection.
 * - Uses Mongoose UserModel.
 * - Injectable via TypeDI for dependency injection.
 */

@Service()
export class UserRepository {
  /**
   * Find all users who are not soft-deleted.
   * @returns Array of IUser documents
   */
  async findAll(): Promise<IUser[]> {
    return UserModel.find({ deletedAt: null }).exec();
  }

  /**
   * Find a user by their unique MongoDB ID.
   * @param id - MongoDB document ID
   * @returns User document or null
   */
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  /**
   * Find a user by their email address.
   * @param email - User's email
   * @returns User document or null
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  /**
   * Create and save a new user in the database.
   * @param userData - Partial user data (e.g., email, password, name, etc.)
   * @returns The created User document
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  /**
   * Update an existing user by their ID.
   * @param id - MongoDB document ID
   * @param updateData - Fields to update
   * @returns Updated User document or null if not found
   */
  async updateById(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  /**
   * Soft delete a user by setting the deletedAt timestamp.
   * @param id - MongoDB document ID
   * @returns Updated User document with deletedAt set, or null if not found
   */
  async softDeleteById(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    ).exec();
  }

  /**
   * Find a user by Google ID (for Google OAuth login).
   * @param googleId - User's Google account ID
   * @returns User document or null
   */
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return UserModel.findOne({ provider: "google", googleId }).exec();
  }

  /**
   * Create a new user with Google provider.
   * @param userData - Partial user data from Google profile
   * @returns The created User document
   */
  async createGoogleUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  /**
   * Sets/reset password reset token & expiration for user.
   * @param userId - User's MongoDB ID
   * @param token - Reset token string
   * @param expires - Expiration date (Date)
   * @returns Updated user document or null
   */
  async setPasswordResetToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        resetPasswordToken: token,
        resetPasswordTokenExpires: expires,
      },
      { new: true }
    ).exec();
  }

  /**
   * Finds a user by password reset token and checks expiration.
   * @param token - Password reset token string
   * @returns User document or null
   */
  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    const now = new Date();
    return UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: now },
    }).exec();
  }

  /**
   * Clears the password reset token for a user.
   * @param userId - User's MongoDB ID
   * @returns Updated user document or null
   */
  async clearPasswordResetToken(userId: string): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $unset: { resetPasswordToken: 1, resetPasswordTokenExpires: 1 },
      },
      { new: true }
    ).exec();
  }
}

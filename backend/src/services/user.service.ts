import { getOrThrowById } from "@/utils/db.utils";
import { assertExists, assertNotExists } from "@/utils/assert.utils";
import { Service } from "typedi";
import { UserRepository } from "@/repositories/user.repository";
import { IUser } from "@/models/user.model";
import { ERROR } from "@/constants/errors";
import { hashPassword } from "@/utils/password.utils";
/**
 * @class UserService
 * Service layer for business logic related to Users.
 */
@Service()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get all users who are not soft-deleted.
   * @returns Array of IUser documents
   */
  async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  /**
   * Create a new user.
   * Throws 409 error if the email already exists.
   * @param userData - Partial user data (e.g., email, password, name)
   * @returns The created IUser document
   * @throws AppError(409) if email already exists
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email!);
    assertNotExists(
      existingUser,
      ERROR.EMAIL_ALREADY_EXISTS.message,
      ERROR.EMAIL_ALREADY_EXISTS.code
    );

    const passwordHash = userData.password
      ? await hashPassword(userData.password)
      : undefined;

    return this.userRepository.create(userData);
  }

  /**
   * Update an existing user's information by ID.
   * Throws 404 error if user does not exist.
   * @param id - User document ID
   * @param updateData - Fields to update
   * @returns Updated IUser document
   * @throws AppError(404) if user not found
   */
  async updateUserById(id: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await this.userRepository.updateById(id, updateData);
    assertExists(user, ERROR.USER_NOT_FOUND.message, ERROR.USER_NOT_FOUND.code);
    return user!;
  }

  /**
   * Soft delete a user by setting the deletedAt timestamp.
   * Throws 404 error if user does not exist.
   * @param id - User document ID
   * @returns Updated IUser document with deletedAt set
   * @throws AppError(404) if user not found
   */
  async softDeleteUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.softDeleteById(id);
    assertExists(user, ERROR.USER_NOT_FOUND.message, ERROR.USER_NOT_FOUND.code);
    return user!;
  }

  /**
   * Get user by ID or throw 404 if not found.
   * @param id - User document ID
   * @returns IUser document
   * @throws AppError(404) if not found
   */
  async getUserById(id: string): Promise<IUser> {
    return getOrThrowById(
      this.userRepository,
      id,
      ERROR.USER_NOT_FOUND.message,
      ERROR.USER_NOT_FOUND.code
    );
  }

  /**
   * Get user by email or throw 404 if not found.
   * @param email - User's email
   * @returns IUser document
   * @throws AppError(404) if not found
   */
  async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userRepository.findByEmail(email);
    assertExists(user, ERROR.USER_NOT_FOUND.message, ERROR.USER_NOT_FOUND.code);
    return user!;
  }
}

import { getOrThrowById } from "@/utils/db.utils";
import { assertExists, assertNotExists } from "@/utils/assert.utils";
import { Service } from "typedi";
import { UserRepository } from "@/repositories/user.repository";
import { IUser } from "@/models/user.model";
import { ERROR } from "@/constants/errors";
import { hashPassword } from "@/utils/password.utils";
import { mapMongoUserToUser } from "@/mappers/user.mapper";
import { User } from "@/types/user.type";

/**
 * @class UserService
 * Service layer for business logic related to Users.
 */
@Service()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get all users who are not soft-deleted.
   * @returns Array of User objects
   */
  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return users.map(mapMongoUserToUser);
  }

  /**
   * Create a new user.
   * Throws 409 error if the email already exists.
   * @param userData - Partial user data (e.g., email, password, name)
   * @returns The created User object
   * @throws AppError(409) if email already exists
   */
  async createUser(userData: Partial<IUser>): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email!);
    assertNotExists(
      existingUser,
      ERROR.EMAIL_ALREADY_EXISTS.message,
      ERROR.EMAIL_ALREADY_EXISTS.code
    );

    const passwordHash = userData.password
      ? await hashPassword(userData.password)
      : undefined;

    const user = await this.userRepository.create({
      ...userData,
      password: passwordHash,
    });
    return mapMongoUserToUser(user);
  }

  /**
   * Update an existing user's information by ID.
   * Throws 404 error if user does not exist.
   * @param id - User document ID
   * @param updateData - Fields to update
   * @returns Updated User object
   * @throws AppError(404) if user not found
   */
  async updateUserById(id: string, updateData: Partial<IUser>): Promise<User> {
    const user = await this.userRepository.updateById(id, updateData);
    assertExists(user, ERROR.USER_NOT_FOUND.message, ERROR.USER_NOT_FOUND.code);
    return mapMongoUserToUser(user!);
  }

  /**
   * Soft delete a user by setting the deletedAt timestamp.
   * Throws 404 error if user does not exist.
   * @param id - User document ID
   * @returns Updated User object with deletedAt set
   * @throws AppError(404) if user not found
   */
  async softDeleteUserById(id: string): Promise<User> {
    const user = await this.userRepository.softDeleteById(id);
    assertExists(user, ERROR.USER_NOT_FOUND.message, ERROR.USER_NOT_FOUND.code);
    return mapMongoUserToUser(user!);
  }

  /**
   * Get user by ID or throw 404 if not found.
   * @param id - User document ID
   * @returns User object
   * @throws AppError(404) if not found
   */
  async getUserById(id: string): Promise<User> {
    const user = await getOrThrowById(
      this.userRepository,
      id,
      ERROR.USER_NOT_FOUND.message,
      ERROR.USER_NOT_FOUND.code
    );
    return mapMongoUserToUser(user);
  }

  /**
   * Get user by email or throw 404 if not found.
   * @param email - User's email
   * @returns User object
   * @throws AppError(404) if not found
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    assertExists(user, ERROR.USER_NOT_FOUND.message, ERROR.USER_NOT_FOUND.code);
    return mapMongoUserToUser(user!);
  }
}

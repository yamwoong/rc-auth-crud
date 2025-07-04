// src/services/__tests__/user.service.spec.ts

import { UserService } from "@/services/user.service";
import { UserRepository } from "@/repositories/user.repository";
import { AppError } from "@/errors/app.error";
import { ERROR } from "@/constants/errors";

/**
 * Unit tests for UserService.
 * Covers all public methods and their success/failure cases.
 * Uses a fully mocked UserRepository to isolate service logic.
 */
const mockUserRepository = {
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  softDeleteById: jest.fn(),
  findById: jest.fn(), // add for getOrThrowById (if needed)
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(
      mockUserRepository as unknown as UserRepository
    );
    jest.clearAllMocks();
  });

  // getAllUsers
  it("should return all users", async () => {
    mockUserRepository.findAll.mockResolvedValue([
      { _id: "1", email: "a@test.com" },
      { _id: "2", email: "b@test.com" },
    ]);
    const users = await userService.getAllUsers();
    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty("email", "a@test.com");
  });

  // createUser - success
  it("should create a new user if email does not exist", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue({
      _id: "3",
      email: "new@example.com",
      name: "Tester",
      role: "user",
      createdAt: new Date(),
    });

    const userData = {
      email: "new@example.com",
      password: "password123",
      name: "Tester",
    };
    const user = await userService.createUser(userData);

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@example.com",
      })
    );
    expect(user).toHaveProperty("email", "new@example.com");
  });

  // createUser - duplicate email
  it("should throw AppError if email already exists", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      _id: "4",
      email: "dupe@example.com",
    });

    await expect(
      userService.createUser({
        email: "dupe@example.com",
        password: "pw",
        name: "D",
      })
    ).rejects.toThrow(AppError);
  });

  // getUserById - success
  it("should return user by id", async () => {
    mockUserRepository.findById.mockResolvedValue({
      _id: "1",
      email: "a@test.com",
      name: "A",
      role: "user",
      createdAt: new Date(),
    });

    // If your service uses getOrThrowById, ensure it calls findById internally.
    // You may need to mock getOrThrowById separately depending on your util implementation.
    // Here, we assume findById is used.
    const user = await userService.getUserById("1");
    expect(user).toHaveProperty("email", "a@test.com");
  });

  // getUserById - not found
  it("should throw AppError if user not found by id", async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(userService.getUserById("404")).rejects.toThrow(AppError);
  });

  // updateUserById - success
  it("should update user by id", async () => {
    mockUserRepository.updateById.mockResolvedValue({
      _id: "1",
      email: "updated@test.com",
      name: "Updated",
      role: "user",
      createdAt: new Date(),
    });
    const updated = await userService.updateUserById("1", {
      email: "updated@test.com",
    });
    expect(updated).toHaveProperty("email", "updated@test.com");
  });

  // updateUserById - not found
  it("should throw AppError if user not found on update", async () => {
    mockUserRepository.updateById.mockResolvedValue(null);
    await expect(
      userService.updateUserById("404", { email: "none@test.com" })
    ).rejects.toThrow(AppError);
  });

  // softDeleteUserById - success
  it("should soft delete user by id", async () => {
    mockUserRepository.softDeleteById.mockResolvedValue({
      _id: "1",
      email: "deleted@test.com",
      deletedAt: new Date(),
      name: "Deleted",
      role: "user",
      createdAt: new Date(),
    });
    const deleted = await userService.softDeleteUserById("1");
    expect(deleted).toMatchObject({
      id: "1",
      email: "deleted@test.com",
      name: "Deleted",
      role: "user",
    });
  });

  // softDeleteUserById - not found
  it("should throw AppError if user not found on soft delete", async () => {
    mockUserRepository.softDeleteById.mockResolvedValue(null);
    await expect(userService.softDeleteUserById("404")).rejects.toThrow(
      AppError
    );
  });

  // getUserByEmail - success
  it("should return user by email", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      _id: "1",
      email: "found@test.com",
      name: "Found",
      role: "user",
      createdAt: new Date(),
    });
    const user = await userService.getUserByEmail("found@test.com");
    expect(user).toHaveProperty("email", "found@test.com");
  });

  // getUserByEmail - not found
  it("should throw AppError if user not found by email", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    await expect(
      userService.getUserByEmail("notfound@test.com")
    ).rejects.toThrow(AppError);
  });
});

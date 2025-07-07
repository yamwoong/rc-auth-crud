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
  findById: jest.fn(),
};

const validId1 = "507f1f77bcf86cd799439011";
const validId2 = "507f1f77bcf86cd799439012";
const validId3 = "507f1f77bcf86cd799439013";
const notFoundId = "507f1f77bcf86cd799439099";

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
      { _id: validId1, email: "a@test.com" },
      { _id: validId2, email: "b@test.com" },
    ]);
    const users = await userService.getAllUsers();
    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty("email", "a@test.com");
  });

  // createUser - success
  it("should create a new user if email does not exist", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue({
      _id: validId3,
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
      _id: validId2,
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
      _id: validId1,
      email: "a@test.com",
      name: "A",
      role: "user",
      createdAt: new Date(),
    });

    const user = await userService.getUserById(validId1);
    expect(user).toHaveProperty("email", "a@test.com");
  });

  // getUserById - not found
  it("should throw AppError if user not found by id", async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await expect(userService.getUserById(notFoundId)).rejects.toThrow(AppError);
  });

  // updateUserById - success
  it("should update user by id", async () => {
    mockUserRepository.updateById.mockResolvedValue({
      _id: validId1,
      email: "updated@test.com",
      name: "Updated",
      role: "user",
      createdAt: new Date(),
    });
    const updated = await userService.updateUserById(validId1, {
      email: "updated@test.com",
    });
    expect(updated).toHaveProperty("email", "updated@test.com");
  });

  // updateUserById - not found
  it("should throw AppError if user not found on update", async () => {
    mockUserRepository.updateById.mockResolvedValue(null);
    await expect(
      userService.updateUserById(notFoundId, { email: "none@test.com" })
    ).rejects.toThrow(AppError);
  });

  // softDeleteUserById - success
  it("should soft delete user by id", async () => {
    mockUserRepository.softDeleteById.mockResolvedValue({
      _id: validId1,
      email: "deleted@test.com",
      deletedAt: new Date(),
      name: "Deleted",
      role: "user",
      createdAt: new Date(),
    });
    const deleted = await userService.softDeleteUserById(validId1);
    expect(deleted).toMatchObject({
      id: validId1,
      email: "deleted@test.com",
      name: "Deleted",
      role: "user",
    });
  });

  // softDeleteUserById - not found
  it("should throw AppError if user not found on soft delete", async () => {
    mockUserRepository.softDeleteById.mockResolvedValue(null);
    await expect(userService.softDeleteUserById(notFoundId)).rejects.toThrow(
      AppError
    );
  });

  // getUserByEmail - success
  it("should return user by email", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      _id: validId1,
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

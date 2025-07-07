import { mapMongoUserToUser, toUserResponseDto } from "@/mappers/user.mapper";
import { IUser } from "@/models/user.model";
/*
 * Unit tests for the UserResponseDto mapper function.
 * Uses Partial<IUser> for mock data and type-casts to IUser for safety.
 */
describe("User Mapper", () => {
  it("should map IUser to UserResponseDto and remove sensitive fields", () => {
    const user: Partial<IUser> = {
      _id: "TestId123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      password: "hashed-password",
      provider: "local",
      googleId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mappedUser = mapMongoUserToUser(user as IUser);

    const dto = toUserResponseDto(mappedUser);

    expect(dto).toMatchObject({
      id: "TestId123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    });

    expect(dto).not.toHaveProperty("password");
  });
});

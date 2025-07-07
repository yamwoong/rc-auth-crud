import { IUser } from "@/models/user.model";
import { User } from "@/types/user.type";
import { UserResponseDto } from "@/dtos/user/user-response.dto";
import { plainToInstance } from "class-transformer";
/**
 * Maps a User model instance to UserResponseDto.
 * Excludes sensitive fields and converts _id to id.
 * @param user User model object (from MongoDB)
 * @returns UserResponseDto instance
 */
export function mapMongoUserToUser(user: IUser): User {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    provider: user.provider,
    googleId: user.googleId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

export function toUserResponseDto(user: User): UserResponseDto {
  return plainToInstance(UserResponseDto, user);
}

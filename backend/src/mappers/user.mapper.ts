import { plainToInstance } from "class-transformer";
import { IUser } from "@/models/user.model";
import { UserResponseDto } from "@/dtos/user/user-response.dto";

/**
 * Maps a User model instance to UserResponseDto.
 * Excludes sensitive fields and converts _id to id.
 * @param user User model object (from MongoDB)
 * @returns UserResponseDto instance
 */
export function toUserResponseDto(user: IUser): UserResponseDto {
  return plainToInstance(UserResponseDto, {
    id: user._id?.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  });
}

import { Expose } from "class-transformer";

/**
 * DTO for user API responses.
 * Only exposes safe, necessary fields to the client.
 */
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: string;

  @Expose()
  createdAt!: Date;
}

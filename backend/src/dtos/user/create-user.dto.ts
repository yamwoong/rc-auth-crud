import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

/**
 * DTO for creating a new user.
 * Used in user registration API.
 */
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  name!: string;
}

import {
  JsonController,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  OnUndefined,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { UserService } from "@/services/user.service";
import { CreateUserDto } from "@/dtos/user/create-user.dto";
import { UpdateUserDto } from "@/dtos/user/update-user.dto";
import { UserResponseDto } from "@/dtos/user/user-response.dto";

/**
 * Handles all user-related API endpoints (CRUD).
 * All endpoints are prefixed with /users.
 */
@Service()
@JsonController("/users")
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Returns all users who are not soft-deleted.
   * GET /users
   */
  @Get("/")
  @OpenAPI({
    summary: "Get all users",
    description: "Returns all active (not soft-deleted) users.",
  })
  @ResponseSchema(UserResponseDto, { isArray: true })
  async getAll() {
    return this.userService.getAllUsers();
  }

  /**
   * Creates a new user with validated data.
   * POST /users
   * @param createUserDto Request body for user creation
   */
  @Post("/")
  @OpenAPI({
    summary: "Create user",
    description: "Creates a new user with the given info.",
  })
  @ResponseSchema(UserResponseDto)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Returns user details by ID.
   * GET /users/:id
   * @param id User document ID
   */
  @Get("/:id")
  @OpenAPI({
    summary: "Get user by ID",
    description: "Returns the user with the specified ID.",
  })
  @ResponseSchema(UserResponseDto)
  async getById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }

  /**
   * Updates existing user info.
   * PATCH /users/:id
   * @param id User document ID
   * @param updateUserDto Request body for updating user
   */
  @Patch("/:id")
  @OpenAPI({
    summary: "Update user",
    description: "Updates the specified user's information.",
  })
  @ResponseSchema(UserResponseDto)
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  /**
   * Soft deletes a user (marks as deleted, does not remove from DB).
   * DELETE /users/:id
   * @param id User document ID
   * Returns 204 No Content if successful.
   */
  @Delete("/:id")
  @OnUndefined(204)
  @OpenAPI({
    summary: "Soft delete user",
    description:
      "Soft deletes a user (marks as deleted, does not remove from DB).",
  })
  async softDelete(@Param("id") id: string) {
    await this.userService.softDeleteUserById(id);
  }
}

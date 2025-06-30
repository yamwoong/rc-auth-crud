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
import { Service } from "typedi";
import { UserService } from "@/services/user.service";
import { CreateUserDto } from "@/dtos/user/create-user.dto";
import { UpdateUserDto } from "@/dtos/user/update-user.dto";

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
  async getAll() {
    return this.userService.getAllUsers();
  }

  /**
   * Creates a new user with validated data.
   * POST /users
   * @param createUserDto Request body for user creation
   */
  @Post("/")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Returns user details by ID.
   * GET /users/:id
   * @param id User document ID
   */
}

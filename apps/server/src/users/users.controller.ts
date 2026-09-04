import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SafeUser } from "./entities/user.entity";
import { UserDto } from "../auth/dto/auth-response.dto";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("search")
  @ApiOperation({
    summary: "Search registered users",
    description: "Searches for registered users by email or name to invite as board collaborators.",
  })
  @ApiQuery({
    name: "q",
    required: true,
    description: "Search keyword (email or name)",
    example: "alex",
  })
  @ApiOkResponse({
    description: "List of matching users (excluding passwords and current user).",
    type: [UserDto],
  })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid JWT token.",
  })
  async search(
    @Query("q") query: string,
    @CurrentUser() currentUser: SafeUser,
  ): Promise<SafeUser[]> {
    return this.usersService.searchUsers(query, currentUser.id);
  }
}

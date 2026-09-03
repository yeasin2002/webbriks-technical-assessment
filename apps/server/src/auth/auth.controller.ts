import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthService, type AuthResponse } from "./auth.service";
import { RegisterDto, RegisterSchema } from "./dto/register.dto";
import { LoginDto, LoginSchema } from "./dto/login.dto";
import { AuthResponseDto, MeResponseDto } from "./dto/auth-response.dto";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { SafeUser } from "../users/entities/user.entity";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  @ApiOperation({
    summary: "Register a new user",
    description: "Creates a new user account with hashed password and returns the user object with a JWT access token.",
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: "User successfully registered.",
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: "Email is already in use.",
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  @ApiOperation({
    summary: "Authenticate user",
    description: "Authenticates user credentials and returns user details along with a JWT access token.",
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: "User successfully authenticated.",
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid email or password.",
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieves the authenticated user's profile based on the supplied JWT Bearer token.",
  })
  @ApiOkResponse({
    description: "Current user profile.",
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Missing, invalid, or expired authentication token.",
  })
  @ApiNotFoundResponse({
    description: "User record no longer exists.",
  })
  async getProfile(@CurrentUser() user: SafeUser): Promise<{ user: SafeUser }> {
    return { user };
  }
}

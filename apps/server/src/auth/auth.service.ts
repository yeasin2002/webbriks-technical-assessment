import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import type { SafeUser } from "../users/entities/user.entity";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    const token = await this.generateToken(user.id, user.email);
    return {
      user: this.usersService.toSafeUser(user),
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = await this.generateToken(user.id, user.email);
    return {
      user: this.usersService.toSafeUser(user),
      token,
    };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.usersService.toSafeUser(user);
  }

  private async generateToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      email,
    });
  }
}

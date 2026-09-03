import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { env } from "@webbriks-technical-assessment/env/server";
import type { Request } from "express";
import { UsersService } from "../../users/users.service";
import type { SafeUser } from "../../users/entities/user.entity";

export interface AuthenticatedRequest extends Request {
  user: SafeUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Authentication token not provided");
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(
        token,
        { secret: env.JWT_SECRET },
      );

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("User not found or no longer active");
      }

      request.user = this.usersService.toSafeUser(user);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired authentication token");
    }
  }
}

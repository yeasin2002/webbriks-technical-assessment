import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { SafeUser } from "../../users/entities/user.entity";
import type { AuthenticatedRequest } from "../guards/jwt-auth.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SafeUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);

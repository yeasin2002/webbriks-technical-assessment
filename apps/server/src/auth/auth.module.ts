import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { env } from "@webbriks-technical-assessment/env/server";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: "7d",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

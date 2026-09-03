import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
    description: "Registered user email",
  })
  email!: string;

  @ApiProperty({
    example: "SecurePassword123!",
    description: "User password",
  })
  password!: string;
}

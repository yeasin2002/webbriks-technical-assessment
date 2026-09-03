import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1).max(100).optional(),
});

export class RegisterDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  email!: string;

  @ApiProperty({
    example: "SecurePassword123!",
    description: "User password (minimum 6 characters)",
    minLength: 6,
  })
  password!: string;

  @ApiPropertyOptional({
    example: "Alex Johnson",
    description: "User full name",
  })
  name?: string;
}

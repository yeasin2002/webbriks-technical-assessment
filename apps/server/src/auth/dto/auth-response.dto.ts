import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty({
    example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    description: "User unique identifier (UUID)",
  })
  id!: string;

  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  email!: string;

  @ApiPropertyOptional({
    example: "Alex Johnson",
    description: "User full name",
    nullable: true,
  })
  name!: string | null;

  @ApiProperty({
    example: "2026-09-03T12:00:00.000Z",
    description: "Account creation timestamp",
  })
  createdAt!: Date;

  @ApiProperty({
    example: "2026-09-03T12:00:00.000Z",
    description: "Account last updated timestamp",
  })
  updatedAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    type: () => UserDto,
    description: "Authenticated user details (excluding password)",
  })
  user!: UserDto;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT Bearer access token",
  })
  token!: string;
}

export class MeResponseDto {
  @ApiProperty({
    type: () => UserDto,
    description: "Current user profile information",
  })
  user!: UserDto;
}

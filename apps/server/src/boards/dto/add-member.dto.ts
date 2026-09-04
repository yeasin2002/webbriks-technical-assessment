import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const AddMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export class AddMemberDto {
  @ApiProperty({
    example: "collaborator@example.com",
    description: "Email of the registered user to invite as a collaborator",
  })
  email!: string;
}

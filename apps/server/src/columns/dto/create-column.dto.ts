import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateColumnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(50, "Column name cannot exceed 50 characters"),
});

export class CreateColumnDto {
  @ApiProperty({
    example: "QA Testing",
    description: "Name of the workflow column",
  })
  name!: string;
}

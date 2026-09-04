import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const CreateBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

export class CreateBoardDto {
  @ApiProperty({
    example: "Sprint Launch Board",
    description: "Title of the board",
  })
  title!: string;

  @ApiPropertyOptional({
    example: "Roadmap and task tracking for Q3 launch",
    description: "Optional description of the board",
  })
  description?: string;
}

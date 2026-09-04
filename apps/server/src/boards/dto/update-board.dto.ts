import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateBoardSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export class UpdateBoardDto {
  @ApiPropertyOptional({
    example: "Updated Sprint Board",
    description: "New title for the board",
  })
  title?: string;

  @ApiPropertyOptional({
    example: "Updated board description",
    description: "New description for the board",
  })
  description?: string;
}

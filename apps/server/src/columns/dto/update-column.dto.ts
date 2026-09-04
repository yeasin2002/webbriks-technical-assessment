import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateColumnSchema = z.object({
  name: z.string().min(1, "Column name cannot be empty").max(50).optional(),
  order: z.number().optional(),
});

export class UpdateColumnDto {
  @ApiPropertyOptional({
    example: "In Review",
    description: "New name for the column",
  })
  name?: string;

  @ApiPropertyOptional({
    example: 2500,
    description: "New ordering sequence for the column",
  })
  order?: number;
}

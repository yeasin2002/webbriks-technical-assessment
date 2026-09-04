import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
});

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: "Updated Task Title",
    description: "New title for the task",
  })
  title?: string;

  @ApiPropertyOptional({
    example: "Updated details for the task",
    description: "New description for the task",
  })
  description?: string;
}

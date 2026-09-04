import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Task title cannot exceed 200 characters"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional(),
});

export class CreateTaskDto {
  @ApiProperty({
    example: "Implement Task Movement API",
    description: "Title of the task card",
  })
  title!: string;

  @ApiPropertyOptional({
    example: "Atomic transactional reordering within and across columns",
    description: "Optional description or details for the task",
  })
  description?: string;
}

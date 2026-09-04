import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const MoveTaskSchema = z.object({
  targetColumnId: z.string().uuid("targetColumnId must be a valid UUID"),
  newPosition: z.number().int("newPosition must be an integer").min(0, "newPosition must be >= 0"),
});

export class MoveTaskDto {
  @ApiProperty({
    example: "col-uuid",
    description: "Target column UUID to place the task into",
  })
  targetColumnId!: string;

  @ApiProperty({
    example: 0,
    description: "0-indexed position within the target column (0 = top, 1 = second, etc.)",
  })
  newPosition!: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const ReorderColumnsSchema = z.object({
  columnIds: z.array(z.string().uuid("Each columnId must be a valid UUID")).min(1, "columnIds cannot be empty"),
});

export class ReorderColumnsDto {
  @ApiProperty({
    example: ["col-uuid-1", "col-uuid-2", "col-uuid-3"],
    description: "Ordered array of column UUIDs representing the new column sequence",
  })
  columnIds!: string[];
}

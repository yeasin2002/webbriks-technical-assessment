import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import type { ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema,
    private targetType: "body" | "query" | "param" = "body",
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Only validate the targeted argument type (defaults to 'body')
    // Skips custom decorators (e.g. @CurrentUser()) and route params (e.g. @Param())
    if (metadata.type !== this.targetType) {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw new BadRequestException({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    return result.data;
  }
}

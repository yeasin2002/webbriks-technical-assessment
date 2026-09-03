import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("Health & System")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Health check",
    description: "Returns API server health message.",
  })
  @ApiOkResponse({
    description: "Server is healthy.",
    schema: {
      type: "string",
      example: "Hello World!",
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}

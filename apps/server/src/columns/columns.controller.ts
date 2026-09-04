import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ColumnsService } from "./columns.service";
import { CreateColumnDto, CreateColumnSchema } from "./dto/create-column.dto";
import { UpdateColumnDto, UpdateColumnSchema } from "./dto/update-column.dto";
import {
  ReorderColumnsDto,
  ReorderColumnsSchema,
} from "./dto/reorder-columns.dto";
import { ColumnDetailDto } from "../boards/dto/board-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SafeUser } from "../users/entities/user.entity";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@ApiTags("Columns")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post("boards/:boardId/columns")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateColumnSchema))
  @ApiOperation({
    summary: "Create a column in a board",
    description: "Adds a new workflow column to the board with an auto-calculated position index.",
  })
  @ApiParam({ name: "boardId", description: "Target Board UUID" })
  @ApiBody({ type: CreateColumnDto })
  @ApiCreatedResponse({
    description: "Column successfully created.",
    type: ColumnDetailDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication token." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async create(
    @Param("boardId") boardId: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(boardId, user.id, dto);
  }

  @Patch("columns/:id")
  @UsePipes(new ZodValidationPipe(UpdateColumnSchema))
  @ApiOperation({
    summary: "Update column name or order",
    description: "Updates an existing column. Validates that the user has access to the parent board.",
  })
  @ApiParam({ name: "id", description: "Column UUID" })
  @ApiBody({ type: UpdateColumnDto })
  @ApiOkResponse({
    description: "Column successfully updated.",
    type: ColumnDetailDto,
  })
  @ApiNotFoundResponse({ description: "Column not found." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, user.id, dto);
  }

  @Delete("columns/:id")
  @ApiOperation({
    summary: "Delete column",
    description: "Deletes a column and cascades deletion to all tasks within it.",
  })
  @ApiParam({ name: "id", description: "Column UUID" })
  @ApiOkResponse({ description: "Column deleted successfully." })
  @ApiNotFoundResponse({ description: "Column not found." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.columnsService.remove(id, user.id);
  }

  @Patch("boards/:boardId/columns/reorder")
  @UsePipes(new ZodValidationPipe(ReorderColumnsSchema))
  @ApiOperation({
    summary: "Reorder columns in board",
    description: "Accepts an ordered array of column IDs and updates their sequence indices in an atomic database transaction.",
  })
  @ApiParam({ name: "boardId", description: "Target Board UUID" })
  @ApiBody({ type: ReorderColumnsDto })
  @ApiOkResponse({
    description: "List of columns in new order.",
    type: [ColumnDetailDto],
  })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async reorder(
    @Param("boardId") boardId: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: ReorderColumnsDto,
  ) {
    return this.columnsService.reorder(boardId, user.id, dto);
  }
}

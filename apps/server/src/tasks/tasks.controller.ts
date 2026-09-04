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
  ApiBadRequestResponse,
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
import { TasksService } from "./tasks.service";
import { CreateTaskDto, CreateTaskSchema } from "./dto/create-task.dto";
import { UpdateTaskDto, UpdateTaskSchema } from "./dto/update-task.dto";
import { MoveTaskDto, MoveTaskSchema } from "./dto/move-task.dto";
import { TaskSummaryDto } from "../boards/dto/board-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SafeUser } from "../users/entities/user.entity";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@ApiTags("Tasks")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post("columns/:columnId/tasks")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateTaskSchema))
  @ApiOperation({
    summary: "Create a task in a column",
    description: "Creates a new task card placed at the end of the specified column. Validates board access.",
  })
  @ApiParam({ name: "columnId", description: "Target Column UUID" })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({
    description: "Task successfully created.",
    type: TaskSummaryDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication token." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async create(
    @Param("columnId") columnId: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(columnId, user.id, dto);
  }

  @Patch("tasks/:id")
  @UsePipes(new ZodValidationPipe(UpdateTaskSchema))
  @ApiOperation({
    summary: "Update task title or description",
    description: "Updates an existing task card. Validates that the user has access to the board.",
  })
  @ApiParam({ name: "id", description: "Task UUID" })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({
    description: "Task successfully updated.",
    type: TaskSummaryDto,
  })
  @ApiNotFoundResponse({ description: "Task not found." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.id, dto);
  }

  @Delete("tasks/:id")
  @ApiOperation({
    summary: "Delete task",
    description: "Removes a task card permanently.",
  })
  @ApiParam({ name: "id", description: "Task UUID" })
  @ApiOkResponse({ description: "Task deleted successfully." })
  @ApiNotFoundResponse({ description: "Task not found." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.remove(id, user.id);
  }

  @Patch("tasks/:id/move")
  @UsePipes(new ZodValidationPipe(MoveTaskSchema))
  @ApiOperation({
    summary: "Move/Reorder task within or across columns (Core Task Movement API)",
    description: "Moves a task to targetColumnId at position newPosition (0-indexed). Re-indexes sibling tasks inside an atomic database transaction to ensure stable, conflict-free ordering.",
  })
  @ApiParam({ name: "id", description: "Task UUID to move" })
  @ApiBody({ type: MoveTaskDto })
  @ApiOkResponse({
    description: "Task moved successfully with updated target column tasks.",
  })
  @ApiBadRequestResponse({ description: "Cross-board task movement or invalid position payload." })
  @ApiNotFoundResponse({ description: "Task or Target Column not found." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async move(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(id, user.id, dto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { BoardsService } from "./boards.service";
import { CreateBoardDto, CreateBoardSchema } from "./dto/create-board.dto";
import { UpdateBoardDto, UpdateBoardSchema } from "./dto/update-board.dto";
import { AddMemberDto, AddMemberSchema } from "./dto/add-member.dto";
import {
  BoardDetailDto,
  BoardListItemDto,
  BoardMemberDto,
} from "./dto/board-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SafeUser } from "../users/entities/user.entity";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@ApiTags("Boards")
@Controller("boards")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateBoardSchema))
  @ApiOperation({
    summary: "Create a new Kanban board",
    description: "Creates a board assigned to the authenticated user and automatically seeds default workflow columns ('To Do', 'In Progress', 'Done').",
  })
  @ApiBody({ type: CreateBoardDto })
  @ApiCreatedResponse({
    description: "Board successfully created with default columns.",
    type: BoardDetailDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication token." })
  async create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: "List all boards accessible by current user",
    description: "Returns all boards owned by the authenticated user or shared with them as a collaborator.",
  })
  @ApiOkResponse({
    description: "List of boards with member and column counts.",
    type: [BoardListItemDto],
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication token." })
  async findAll(@CurrentUser() user: SafeUser) {
    return this.boardsService.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get single board details",
    description: "Fetches full board details with nested columns, ordered tasks, and collaborator list. Accessible by owner and invited members.",
  })
  @ApiParam({ name: "id", description: "Board UUID", example: "board-uuid" })
  @ApiOkResponse({
    description: "Full board object with nested columns and tasks.",
    type: BoardDetailDto,
  })
  @ApiNotFoundResponse({ description: "Board not found." })
  @ApiForbiddenResponse({ description: "User does not have access to this board." })
  async findById(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.boardsService.findById(id, user.id);
  }

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(UpdateBoardSchema))
  @ApiOperation({
    summary: "Update board title or description",
    description: "Updates board metadata. Restricted to the board owner.",
  })
  @ApiParam({ name: "id", description: "Board UUID" })
  @ApiBody({ type: UpdateBoardDto })
  @ApiOkResponse({ description: "Board successfully updated." })
  @ApiForbiddenResponse({ description: "Only the board owner can update the board." })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, user.id, dto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete board",
    description: "Deletes board and cascades deletion to all columns, tasks, and member records. Restricted to the board owner.",
  })
  @ApiParam({ name: "id", description: "Board UUID" })
  @ApiOkResponse({ description: "Board deleted successfully." })
  @ApiForbiddenResponse({ description: "Only the board owner can delete the board." })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.boardsService.remove(id, user.id);
  }

  @Get(":id/members")
  @ApiOperation({
    summary: "Get board collaborators",
    description: "Lists all users with member access to the board.",
  })
  @ApiParam({ name: "id", description: "Board UUID" })
  @ApiOkResponse({
    description: "List of board members with user profiles.",
    type: [BoardMemberDto],
  })
  async getMembers(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.boardsService.getMembers(id, user.id);
  }

  @Post(":id/members")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(AddMemberSchema))
  @ApiOperation({
    summary: "Invite/Share board with collaborator",
    description: "Shares board access with another registered user by their email address. Restricted to the board owner.",
  })
  @ApiParam({ name: "id", description: "Board UUID" })
  @ApiBody({ type: AddMemberDto })
  @ApiCreatedResponse({
    description: "Collaborator successfully added to board.",
    type: BoardMemberDto,
  })
  @ApiConflictResponse({ description: "User is already a collaborator on this board." })
  @ApiNotFoundResponse({ description: "User with given email not found." })
  @ApiForbiddenResponse({ description: "Only the board owner can add members." })
  async addMember(
    @Param("id") id: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: AddMemberDto,
  ) {
    return this.boardsService.addMember(id, user.id, dto);
  }

  @Delete(":id/members/:userId")
  @ApiOperation({
    summary: "Revoke collaborator access",
    description: "Removes a collaborator from the board. Restricted to the board owner.",
  })
  @ApiParam({ name: "id", description: "Board UUID" })
  @ApiParam({ name: "userId", description: "Target User UUID to remove" })
  @ApiOkResponse({ description: "Collaborator access revoked." })
  @ApiForbiddenResponse({ description: "Only the board owner can remove members." })
  async removeMember(
    @Param("id") id: string,
    @Param("userId") memberUserId: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.boardsService.removeMember(id, user.id, memberUserId);
  }
}

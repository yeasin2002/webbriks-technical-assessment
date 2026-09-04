import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserDto } from "../../auth/dto/auth-response.dto";

export class BoardMemberDto {
  @ApiProperty({ example: "member-uuid", description: "Membership ID" })
  id!: string;

  @ApiProperty({ example: "board-uuid", description: "Board ID" })
  boardId!: string;

  @ApiProperty({ example: "user-uuid", description: "User ID" })
  userId!: string;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Date invited/joined" })
  createdAt!: Date;

  @ApiProperty({ type: () => UserDto, description: "Member user details" })
  user!: UserDto;
}

export class TaskSummaryDto {
  @ApiProperty({ example: "task-uuid", description: "Task ID" })
  id!: string;

  @ApiProperty({ example: "Implement Authentication", description: "Task title" })
  title!: string;

  @ApiPropertyOptional({ example: "Use JWT tokens", description: "Task description", nullable: true })
  description!: string | null;

  @ApiProperty({ example: 1000, description: "Positional order index" })
  order!: number;

  @ApiProperty({ example: "col-uuid", description: "Parent column ID" })
  columnId!: string;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Task creation date" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Task last updated date" })
  updatedAt!: Date;
}

export class ColumnDetailDto {
  @ApiProperty({ example: "col-uuid", description: "Column ID" })
  id!: string;

  @ApiProperty({ example: "In Progress", description: "Column name" })
  name!: string;

  @ApiProperty({ example: 1, description: "Column sequence order" })
  order!: number;

  @ApiProperty({ example: "board-uuid", description: "Parent board ID" })
  boardId!: string;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Column creation date" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Column last updated date" })
  updatedAt!: Date;

  @ApiProperty({ type: [TaskSummaryDto], description: "List of tasks in this column ordered by position" })
  tasks!: TaskSummaryDto[];
}

export class BoardListItemDto {
  @ApiProperty({ example: "board-uuid", description: "Board ID" })
  id!: string;

  @ApiProperty({ example: "Sprint Launch Board", description: "Board title" })
  title!: string;

  @ApiPropertyOptional({ example: "Q3 Project roadmap", description: "Board description", nullable: true })
  description!: string | null;

  @ApiProperty({ example: "owner-user-uuid", description: "ID of the board owner" })
  ownerId!: string;

  @ApiProperty({ example: true, description: "True if authenticated user owns the board, false if collaborator" })
  isOwner!: boolean;

  @ApiProperty({ type: () => UserDto, description: "Board owner information" })
  owner!: UserDto;

  @ApiProperty({ example: 3, description: "Total columns in the board" })
  columnCount!: number;

  @ApiProperty({ example: 2, description: "Total invited members" })
  memberCount!: number;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Board creation date" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Board last updated date" })
  updatedAt!: Date;
}

export class BoardDetailDto {
  @ApiProperty({ example: "board-uuid", description: "Board ID" })
  id!: string;

  @ApiProperty({ example: "Sprint Launch Board", description: "Board title" })
  title!: string;

  @ApiPropertyOptional({ example: "Q3 Project roadmap", description: "Board description", nullable: true })
  description!: string | null;

  @ApiProperty({ example: "owner-user-uuid", description: "ID of the board owner" })
  ownerId!: string;

  @ApiProperty({ example: true, description: "True if authenticated user owns the board" })
  isOwner!: boolean;

  @ApiProperty({ type: () => UserDto, description: "Board owner information" })
  owner!: UserDto;

  @ApiProperty({ type: [BoardMemberDto], description: "List of invited collaborators" })
  members!: BoardMemberDto[];

  @ApiProperty({ type: [ColumnDetailDto], description: "Columns with nested ordered tasks" })
  columns!: ColumnDetailDto[];

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Board creation date" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T12:00:00.000Z", description: "Board last updated date" })
  updatedAt!: Date;
}

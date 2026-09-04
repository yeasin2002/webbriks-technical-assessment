import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@webbriks-technical-assessment/db";
import { BoardsService } from "../boards/boards.service";
import type { CreateColumnDto } from "./dto/create-column.dto";
import type { UpdateColumnDto } from "./dto/update-column.dto";
import type { ReorderColumnsDto } from "./dto/reorder-columns.dto";

@Injectable()
export class ColumnsService {
  constructor(private readonly boardsService: BoardsService) {}

  async create(boardId: string, userId: string, dto: CreateColumnDto) {
    await this.boardsService.validateBoardAccess(boardId, userId);

    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastColumn ? lastColumn.order + 1000 : 1000;

    const column = await prisma.column.create({
      data: {
        name: dto.name.trim(),
        order: nextOrder,
        boardId,
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return column;
  }

  async update(columnId: string, userId: string, dto: UpdateColumnDto) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException("Column not found");
    }

    await this.boardsService.validateBoardAccess(column.boardId, userId);

    const updated = await prisma.column.update({
      where: { id: columnId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return updated;
  }

  async remove(columnId: string, userId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException("Column not found");
    }

    await this.boardsService.validateBoardAccess(column.boardId, userId);

    await prisma.column.delete({
      where: { id: columnId },
    });

    return { success: true, message: "Column deleted successfully" };
  }

  async reorder(boardId: string, userId: string, dto: ReorderColumnsDto) {
    await this.boardsService.validateBoardAccess(boardId, userId);

    const existingColumns = await prisma.column.findMany({
      where: { boardId },
      select: { id: true },
    });

    const existingIds = new Set(existingColumns.map((c) => c.id));
    for (const id of dto.columnIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestException(`Column ID "${id}" does not belong to this board`);
      }
    }

    await prisma.$transaction(
      dto.columnIds.map((columnId, index) =>
        prisma.column.update({
          where: { id: columnId },
          data: { order: (index + 1) * 1000 },
        }),
      ),
    );

    return prisma.column.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });
  }
}

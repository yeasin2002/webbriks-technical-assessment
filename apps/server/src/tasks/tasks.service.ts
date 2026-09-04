import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@webbriks-technical-assessment/db";
import { BoardsService } from "../boards/boards.service";
import type { CreateTaskDto } from "./dto/create-task.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";
import type { MoveTaskDto } from "./dto/move-task.dto";

@Injectable()
export class TasksService {
  constructor(private readonly boardsService: BoardsService) {}

  async create(columnId: string, userId: string, dto: CreateTaskDto) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException("Column not found");
    }

    await this.boardsService.validateBoardAccess(column.boardId, userId);

    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastTask ? lastTask.order + 1000 : 1000;

    const task = await prisma.task.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        order: nextOrder,
        columnId,
      },
    });

    return task;
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.boardsService.validateBoardAccess(task.column.boardId, userId);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description ? dto.description.trim() : null,
        }),
      },
    });

    return updated;
  }

  async remove(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.boardsService.validateBoardAccess(task.column.boardId, userId);

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true, message: "Task deleted successfully" };
  }

  async move(taskId: string, userId: string, dto: MoveTaskDto) {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
      },
    });

    if (!currentTask) {
      throw new NotFoundException("Task not found");
    }

    // Validate access to source column's board
    await this.boardsService.validateBoardAccess(currentTask.column.boardId, userId);

    const targetColumn = await prisma.column.findUnique({
      where: { id: dto.targetColumnId },
    });

    if (!targetColumn) {
      throw new NotFoundException("Target column not found");
    }

    // Target column must belong to the same board
    if (targetColumn.boardId !== currentTask.column.boardId) {
      throw new BadRequestException("Cross-board task movements are not permitted");
    }

    return prisma.$transaction(async (tx) => {
      // Fetch current tasks in the target column
      const targetTasks = await tx.task.findMany({
        where: { columnId: dto.targetColumnId },
        orderBy: { order: "asc" },
      });

      // Filter out moving task if moving within same column
      const siblings = targetTasks.filter((t) => t.id !== taskId);

      // Clamp target position index
      const insertIndex = Math.min(Math.max(dto.newPosition, 0), siblings.length);

      const { column: _, ...plainTask } = currentTask;

      // Insert moving task into target slot
      siblings.splice(insertIndex, 0, {
        ...plainTask,
        columnId: dto.targetColumnId,
      });

      // Update positions for all items in destination column
      let movedTaskResult = plainTask;
      for (let i = 0; i < siblings.length; i++) {
        const item = siblings[i];
        if (!item) continue;
        const newOrder = (i + 1) * 1000;

        if (item.id === taskId) {
          movedTaskResult = await tx.task.update({
            where: { id: taskId },
            data: {
              columnId: dto.targetColumnId,
              order: newOrder,
            },
          });
        } else if (item.order !== newOrder) {
          await tx.task.update({
            where: { id: item.id },
            data: { order: newOrder },
          });
        }
      }

      // If moving across columns, optionally reindex source column
      if (currentTask.columnId !== dto.targetColumnId) {
        const sourceSiblings = await tx.task.findMany({
          where: { columnId: currentTask.columnId },
          orderBy: { order: "asc" },
        });

        for (let i = 0; i < sourceSiblings.length; i++) {
          const s = sourceSiblings[i];
          if (!s) continue;
          const sOrder = (i + 1) * 1000;
          if (s.order !== sOrder) {
            await tx.task.update({
              where: { id: s.id },
              data: { order: sOrder },
            });
          }
        }
      }

      // Fetch all tasks in the target column in final sorted order
      const updatedTargetColumnTasks = await tx.task.findMany({
        where: { columnId: dto.targetColumnId },
        orderBy: { order: "asc" },
      });

      return {
        task: movedTaskResult,
        targetColumnTasks: updatedTargetColumnTasks,
      };
    });
  }
}

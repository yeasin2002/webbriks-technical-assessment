import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "@webbriks-technical-assessment/db";
import { UsersService } from "../users/users.service";
import type { CreateBoardDto } from "./dto/create-board.dto";
import type { UpdateBoardDto } from "./dto/update-board.dto";
import type { AddMemberDto } from "./dto/add-member.dto";

@Injectable()
export class BoardsService {
  constructor(private readonly usersService: UsersService) {}

  async validateBoardAccess(boardId: string, userId: string, requireOwner = false) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
      },
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((m) => m.userId === userId);

    if (requireOwner && !isOwner) {
      throw new ForbiddenException("Only the board owner can perform this action");
    }

    if (!isOwner && !isMember) {
      throw new ForbiddenException("You do not have access to this board");
    }

    return { board, isOwner };
  }

  async create(userId: string, dto: CreateBoardDto) {
    return prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          ownerId: userId,
          columns: {
            create: [
              { name: "To Do", order: 1000 },
              { name: "In Progress", order: 2000 },
              { name: "Done", order: 3000 },
            ],
          },
        },
        include: {
          owner: true,
          columns: {
            orderBy: { order: "asc" },
            include: { tasks: { orderBy: { order: "asc" } } },
          },
          members: {
            include: { user: true },
          },
        },
      });

      return {
        ...board,
        isOwner: true,
        owner: this.usersService.toSafeUser(board.owner),
        members: board.members.map((m) => ({
          ...m,
          user: this.usersService.toSafeUser(m.user),
        })),
      };
    });
  }

  async findAll(userId: string) {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: true,
        _count: {
          select: {
            columns: true,
            members: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return boards.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      ownerId: b.ownerId,
      isOwner: b.ownerId === userId,
      owner: this.usersService.toSafeUser(b.owner),
      columnCount: b._count.columns,
      memberCount: b._count.members,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  }

  async findById(boardId: string, userId: string) {
    await this.validateBoardAccess(boardId, userId);

    const board = await prisma.board.findUniqueOrThrow({
      where: { id: boardId },
      include: {
        owner: true,
        members: {
          include: { user: true },
        },
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return {
      id: board.id,
      title: board.title,
      description: board.description,
      ownerId: board.ownerId,
      isOwner: board.ownerId === userId,
      owner: this.usersService.toSafeUser(board.owner),
      members: board.members.map((m) => ({
        id: m.id,
        boardId: m.boardId,
        userId: m.userId,
        createdAt: m.createdAt,
        user: this.usersService.toSafeUser(m.user),
      })),
      columns: board.columns,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    await this.validateBoardAccess(boardId, userId, true);

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description ? dto.description.trim() : null,
        }),
      },
      include: {
        owner: true,
      },
    });

    return {
      ...updated,
      isOwner: true,
      owner: this.usersService.toSafeUser(updated.owner),
    };
  }

  async remove(boardId: string, userId: string) {
    await this.validateBoardAccess(boardId, userId, true);

    await prisma.board.delete({
      where: { id: boardId },
    });

    return { success: true, message: "Board deleted successfully" };
  }

  async addMember(boardId: string, ownerId: string, dto: AddMemberDto) {
    await this.validateBoardAccess(boardId, ownerId, true);

    const targetUser = await this.usersService.findByEmail(dto.email);
    if (!targetUser) {
      throw new NotFoundException(`User with email "${dto.email}" not found`);
    }

    if (targetUser.id === ownerId) {
      throw new BadRequestException("You are already the owner of this board");
    }

    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException("User is already a collaborator on this board");
    }

    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId: targetUser.id,
      },
      include: {
        user: true,
      },
    });

    await prisma.board.update({
      where: { id: boardId },
      data: { updatedAt: new Date() },
    });

    return {
      id: member.id,
      boardId: member.boardId,
      userId: member.userId,
      createdAt: member.createdAt,
      user: this.usersService.toSafeUser(member.user),
    };
  }

  async getMembers(boardId: string, userId: string) {
    await this.validateBoardAccess(boardId, userId);

    const members = await prisma.boardMember.findMany({
      where: { boardId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return members.map((m) => ({
      id: m.id,
      boardId: m.boardId,
      userId: m.userId,
      createdAt: m.createdAt,
      user: this.usersService.toSafeUser(m.user),
    }));
  }

  async removeMember(boardId: string, ownerId: string, memberUserId: string) {
    await this.validateBoardAccess(boardId, ownerId, true);

    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException("Member not found on this board");
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    return { success: true, message: "Member removed from board" };
  }
}

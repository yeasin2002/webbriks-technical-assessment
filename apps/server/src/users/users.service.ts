import { Injectable } from "@nestjs/common";
import { prisma } from "@webbriks-technical-assessment/db";
import type { User } from "@webbriks-technical-assessment/db";
import type { SafeUser } from "./entities/user.entity";

@Injectable()
export class UsersService {
  toSafeUser(user: User): SafeUser {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; password: string; name?: string }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        name: data.name?.trim() || null,
      },
    });
  }

  async searchUsers(query: string, excludeUserId: string): Promise<SafeUser[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    const cleanQuery = query.trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: {
        id: { not: excludeUserId },
        OR: [
          { email: { contains: cleanQuery, mode: "insensitive" } },
          { name: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { email: "asc" },
    });

    return users.map((u) => this.toSafeUser(u));
  }
}

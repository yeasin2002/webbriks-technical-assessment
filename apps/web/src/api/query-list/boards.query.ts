import { api } from "@/lib/ky";
import type { User } from "./auth.query";

export interface BoardTask {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  columnId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  boardId: string;
  createdAt?: string;
  updatedAt?: string;
  tasks: BoardTask[];
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  createdAt?: string;
  user: User;
}

export interface BoardListItem {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  isOwner: boolean;
  owner: User;
  columnCount: number;
  memberCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardDetail {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  isOwner: boolean;
  owner: User;
  members: BoardMember[];
  columns: BoardColumn[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBoardData {
  title: string;
  description?: string;
}

export interface UpdateBoardData {
  title?: string;
  description?: string;
}

export interface AddMemberData {
  email: string;
}

export const boardsApi = {
  getAll: () =>
    api.get("boards").json<BoardListItem[]>(),

  getById: (id: string) =>
    api.get(`boards/${id}`).json<BoardDetail>(),

  create: (data: CreateBoardData) =>
    api.post("boards", { json: data }).json<BoardDetail>(),

  update: (id: string, data: UpdateBoardData) =>
    api.patch(`boards/${id}`, { json: data }).json<BoardDetail>(),

  remove: (id: string) =>
    api.delete(`boards/${id}`).json<void>(),

  getMembers: (id: string) =>
    api.get(`boards/${id}/members`).json<BoardMember[]>(),

  addMember: (id: string, data: AddMemberData) =>
    api.post(`boards/${id}/members`, { json: data }).json<BoardMember>(),

  removeMember: (id: string, userId: string) =>
    api.delete(`boards/${id}/members/${userId}`).json<void>(),
};

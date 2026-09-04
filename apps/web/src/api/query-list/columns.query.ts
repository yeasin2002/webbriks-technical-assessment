import { api } from "@/lib/ky";
import type { BoardColumn } from "./boards.query";

export interface CreateColumnData {
  name: string;
}

export interface UpdateColumnData {
  name?: string;
  order?: number;
}

export interface ReorderColumnsData {
  columnIds: string[];
}

export const columnsApi = {
  create: (boardId: string, data: CreateColumnData) =>
    api.post(`boards/${boardId}/columns`, { json: data }).json<BoardColumn>(),

  update: (id: string, data: UpdateColumnData) =>
    api.patch(`columns/${id}`, { json: data }).json<BoardColumn>(),

  remove: (id: string) =>
    api.delete(`columns/${id}`).json<void>(),

  reorder: (boardId: string, data: ReorderColumnsData) =>
    api.patch(`boards/${boardId}/columns/reorder`, { json: data }).json<BoardColumn[]>(),
};

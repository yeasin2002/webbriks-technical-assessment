import { api } from "@/lib/ky";
import type { BoardTask } from "./boards.query";

export interface CreateTaskData {
  title: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
}

export interface MoveTaskData {
  targetColumnId: string;
  newPosition: number;
}

export interface MoveTaskResponse {
  task: BoardTask;
  targetColumnTasks: BoardTask[];
}

export const tasksApi = {
  create: (columnId: string, data: CreateTaskData) =>
    api.post(`columns/${columnId}/tasks`, { json: data }).json<BoardTask>(),

  update: (id: string, data: UpdateTaskData) =>
    api.patch(`tasks/${id}`, { json: data }).json<BoardTask>(),

  remove: (id: string) =>
    api.delete(`tasks/${id}`).json<void>(),

  move: (id: string, data: MoveTaskData) =>
    api.patch(`tasks/${id}/move`, { json: data }).json<MoveTaskResponse>(),
};

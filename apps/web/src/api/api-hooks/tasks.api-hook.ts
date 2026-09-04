import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/ky";
import {
  tasksApi,
  type CreateTaskData,
  type MoveTaskData,
  type UpdateTaskData,
} from "../query-list/tasks.query";
import type { BoardDetail, BoardTask } from "../query-list/boards.query";
import { BOARD_KEYS } from "./boards.api-hook";

export const TASK_KEYS = {
  all: () => ["tasks"] as const,
  byColumn: (columnId: string) => ["tasks", "column", columnId] as const,
};

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: CreateTaskData }) =>
      tasksApi.create(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      toast.success("Task created");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to create task");
      toast.error(msg);
    },
  });
};

export const useUpdateTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      toast.success("Task updated");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to update task");
      toast.error(msg);
    },
  });
};

export const useDeleteTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      toast.info("Task deleted");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to delete task");
      toast.error(msg);
    },
  });
};

// Optimistic Task Movement Hook with automatic rollback
export const useMoveTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveTaskData }) =>
      tasksApi.move(id, data),

    onMutate: async ({ id, data }) => {
      // 1. Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.detail(boardId) });

      // 2. Snapshot the previous value
      const previousBoard = queryClient.getQueryData<BoardDetail>(BOARD_KEYS.detail(boardId));

      if (previousBoard) {
        // Find task across all columns
        let movedTask: BoardTask | undefined;
        for (const col of previousBoard.columns) {
          const found = col.tasks.find((t) => t.id === id);
          if (found) {
            movedTask = { ...found, columnId: data.targetColumnId };
            break;
          }
        }

        if (movedTask) {
          // Construct updated columns optimistically
          const updatedColumns = previousBoard.columns.map((col) => {
            // Remove from existing column
            const filteredTasks = col.tasks.filter((t) => t.id !== id);

            if (col.id === data.targetColumnId) {
              // Insert into target column at newPosition
              const safeIndex = Math.max(0, Math.min(data.newPosition, filteredTasks.length));
              filteredTasks.splice(safeIndex, 0, movedTask!);
              return {
                ...col,
                tasks: filteredTasks.map((t, idx) => ({ ...t, order: (idx + 1) * 1000 })),
              };
            }

            return {
              ...col,
              tasks: filteredTasks,
            };
          });

          // Optimistically update the cache
          queryClient.setQueryData<BoardDetail>(BOARD_KEYS.detail(boardId), {
            ...previousBoard,
            columns: updatedColumns,
          });
        }
      }

      return { previousBoard };
    },

    onError: async (error, _variables, context) => {
      // Rollback on error
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_KEYS.detail(boardId), context.previousBoard);
      }
      const msg = await getApiErrorMessage(error, "Failed to move task");
      toast.error(msg);
    },

    onSettled: () => {
      // Re-sync with database authoritative state
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/ky";
import {
  columnsApi,
  type CreateColumnData,
  type ReorderColumnsData,
  type UpdateColumnData,
} from "../query-list/columns.query";
import { BOARD_KEYS } from "./boards.api-hook";

export const COLUMN_KEYS = {
  all: () => ["columns"] as const,
  byBoard: (boardId: string) => ["columns", "board", boardId] as const,
};

export const useCreateColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumnData) => columnsApi.create(boardId, data),
    onSuccess: (newColumn) => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      toast.success(`Column "${newColumn.name}" added`);
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to add column");
      toast.error(msg);
    },
  });
};

export const useUpdateColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateColumnData }) =>
      columnsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      toast.success("Column updated");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to update column");
      toast.error(msg);
    },
  });
};

export const useDeleteColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => columnsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      toast.info("Column deleted");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to delete column");
      toast.error(msg);
    },
  });
};

export const useReorderColumns = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderColumnsData) => columnsApi.reorder(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to reorder columns");
      toast.error(msg);
    },
  });
};

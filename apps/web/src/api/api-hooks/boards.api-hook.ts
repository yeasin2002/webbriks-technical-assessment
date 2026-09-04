import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/ky";
import {
  boardsApi,
  type AddMemberData,
  type BoardDetail,
  type CreateBoardData,
  type UpdateBoardData,
} from "../query-list/boards.query";

export const BOARD_KEYS = {
  all: () => ["boards"] as const,
  lists: () => ["boards", "list"] as const,
  detail: (id: string) => ["boards", "detail", id] as const,
  members: (id: string) => ["boards", "members", id] as const,
};

// List all boards for the authenticated user + SHORT POLLING (every 3 seconds)
export const useBoards = () => {
  return useQuery({
    queryKey: BOARD_KEYS.lists(),
    queryFn: () => boardsApi.getAll(),
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });
};

// Fetch single board with nested columns & tasks + SHORT POLLING (every 3 seconds)
export const useBoard = (id?: string) => {
  return useQuery({
    queryKey: BOARD_KEYS.detail(id ?? "unknown"),
    queryFn: () => boardsApi.getById(id!),
    enabled: !!id,
    refetchInterval: 3000, // Continuous polling for real-time collaboration
    refetchIntervalInBackground: true,
  });
};

// List board members
export const useBoardMembers = (boardId?: string) => {
  return useQuery({
    queryKey: BOARD_KEYS.members(boardId ?? "unknown"),
    queryFn: () => boardsApi.getMembers(boardId!),
    enabled: !!boardId,
  });
};

// Create a new board
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardData) => boardsApi.create(data),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all() });
      toast.success(`Board "${newBoard.title}" created`);
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to create board");
      toast.error(msg);
    },
  });
};

// Update board metadata (e.g. title)
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardData }) =>
      boardsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(updated.id) });
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.lists() });
      toast.success("Board updated");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to update board");
      toast.error(msg);
    },
  });
};

// Delete board
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => boardsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all() });
      toast.info("Board deleted");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to delete board");
      toast.error(msg);
    },
  });
};

// Add board collaborator
export const useAddBoardMember = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberData) => boardsApi.addMember(boardId, data),
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.members(boardId) });
      toast.success(`Access granted to ${newMember.user.email}`);
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to invite member");
      toast.error(msg);
    },
  });
};

// Revoke collaborator access
export const useRemoveBoardMember = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => boardsApi.removeMember(boardId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.members(boardId) });
      toast.info("Collaborator access revoked");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to remove member");
      toast.error(msg);
    },
  });
};

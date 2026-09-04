import { create } from "zustand";
import { apiFetch, ApiError } from "@/lib/api";
import type { BoardDetail, BoardListItem, BoardMember, Column, Task } from "@/components/board/types";
import { toast } from "sonner";

interface BoardState {
  // Board List & Active Board
  boards: BoardListItem[];
  activeBoard: BoardDetail | null;
  boardTitle: string;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;

  // Normalized Board Data
  columns: Column[];
  tasks: Task[];
  members: BoardMember[];

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // UI Modal State
  isShareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  addingToColumnId: string | null;
  setAddingToColumnId: (columnId: string | null) => void;
  dragOverColumnId: string | null;
  setDragOverColumnId: (columnId: string | null) => void;

  // Board Actions
  fetchBoards: () => Promise<void>;
  selectBoard: (boardId: string) => Promise<void>;
  createBoard: (title: string, description?: string) => Promise<void>;
  updateBoardTitle: (title: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;

  // Task Actions
  addTask: (columnId: string, title: string, description?: string) => Promise<void>;
  updateTask: (task: { id: string; title: string; description?: string | null; columnId?: string }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, targetColumnId: string, newPosition: number) => Promise<void>;

  // Column Actions
  addColumn: (name: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;

  // Member / Sharing Actions
  addMember: (email: string) => Promise<boolean>;
  removeMember: (userId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  activeBoard: null,
  boardTitle: "Mini Kanban Board",
  isOwner: true,
  isLoading: false,
  error: null,

  columns: [],
  tasks: [],
  members: [],

  // Filter
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // UI Modals
  isShareModalOpen: false,
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  addingToColumnId: null,
  setAddingToColumnId: (columnId) => set({ addingToColumnId: columnId }),
  dragOverColumnId: null,
  setDragOverColumnId: (columnId) => set({ dragOverColumnId: columnId }),

  // Fetch all accessible boards
  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const boards = await apiFetch<BoardListItem[]>("/boards");
      set({ boards });

      if (boards.length === 0) {
        // Automatically create initial default board for new users
        await get().createBoard("My Kanban Board");
      } else {
        // Load the first board or keep current active board if it exists in the list
        const currentActive = get().activeBoard;
        const targetId = currentActive && boards.some((b) => b.id === currentActive.id)
          ? currentActive.id
          : boards[0]!.id;
        await get().selectBoard(targetId);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load boards";
      set({ error: msg, isLoading: false });
    }
  },

  // Select and fetch full details for a single board
  selectBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await apiFetch<BoardDetail>(`/boards/${boardId}`);
      
      const columns: Column[] = board.columns.map((c) => ({
        id: c.id,
        name: c.name,
        order: c.order,
        boardId: c.boardId,
      }));

      // Sort tasks by order within each column
      const tasks: Task[] = board.columns.flatMap((c) =>
        (c.tasks || []).sort((a, b) => a.order - b.order)
      );

      set({
        activeBoard: board,
        boardTitle: board.title,
        isOwner: board.isOwner,
        columns,
        tasks,
        members: board.members || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load board details";
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  // Create a new board
  createBoard: async (title: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const payload: { title: string; description?: string } = { title };
      if (description?.trim()) payload.description = description.trim();

      const created = await apiFetch<BoardDetail>("/boards", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const columns: Column[] = (created.columns || []).map((c) => ({
        id: c.id,
        name: c.name,
        order: c.order,
        boardId: c.boardId,
      }));

      const tasks: Task[] = (created.columns || []).flatMap((c) => c.tasks || []);

      set((state) => ({
        activeBoard: created,
        boardTitle: created.title,
        isOwner: true,
        columns,
        tasks,
        members: created.members || [],
        isLoading: false,
        boards: [
          {
            id: created.id,
            title: created.title,
            description: created.description,
            ownerId: created.ownerId,
            isOwner: true,
            owner: created.owner,
            columnCount: columns.length,
            memberCount: 0,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
          ...state.boards,
        ],
      }));
      toast.success(`Board "${title}" created`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create board";
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  // Update current board title
  updateBoardTitle: async (title: string) => {
    const activeBoard = get().activeBoard;
    if (!activeBoard) return;

    try {
      await apiFetch(`/boards/${activeBoard.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      set((state) => ({
        boardTitle: title,
        activeBoard: state.activeBoard ? { ...state.activeBoard, title } : null,
        boards: state.boards.map((b) => (b.id === activeBoard.id ? { ...b, title } : b)),
      }));
      toast.success("Board renamed");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update board";
      toast.error(msg);
    }
  },

  // Delete a board
  deleteBoard: async (boardId: string) => {
    try {
      await apiFetch(`/boards/${boardId}`, {
        method: "DELETE",
      });

      toast.info("Board deleted");
      const remaining = get().boards.filter((b) => b.id !== boardId);
      set({ boards: remaining });

      if (remaining.length > 0) {
        await get().selectBoard(remaining[0]!.id);
      } else {
        await get().createBoard("My Kanban Board");
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete board";
      toast.error(msg);
    }
  },

  // Task Mutations
  addTask: async (columnId: string, title: string, description?: string) => {
    try {
      const payload: { title: string; description?: string } = { title };
      if (description?.trim()) payload.description = description.trim();

      const newTask = await apiFetch<Task>(`/columns/${columnId}/tasks`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      set((state) => ({
        tasks: [...state.tasks, newTask],
      }));
      toast.success("Task created");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create task";
      toast.error(msg);
    }
  },

  updateTask: async (updated) => {
    try {
      const payload: { title?: string; description?: string | null } = {
        title: updated.title,
        description: updated.description ?? null,
      };

      const res = await apiFetch<Task>(`/tasks/${updated.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === updated.id ? { ...t, ...res } : t)),
        selectedTask: state.selectedTask?.id === updated.id ? { ...state.selectedTask, ...res } : state.selectedTask,
      }));
      toast.success("Task updated");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update task";
      toast.error(msg);
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: "DELETE",
      });

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
      }));
      toast.info("Task deleted");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete task";
      toast.error(msg);
    }
  },

  // Core Task Movement API with Optimistic UI & Atomic Reindexing
  moveTask: async (taskId: string, targetColumnId: string, newPosition: number) => {
    const previousTasks = [...get().tasks];
    const taskToMove = previousTasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    // 1. Optimistic Update: calculate memory state
    const targetColumnTasks = previousTasks
      .filter((t) => t.columnId === targetColumnId && t.id !== taskId)
      .sort((a, b) => a.order - b.order);

    const safeIndex = Math.max(0, Math.min(newPosition, targetColumnTasks.length));
    targetColumnTasks.splice(safeIndex, 0, { ...taskToMove, columnId: targetColumnId });

    // Assign temporary simulated sequence orders for immediate UI rendering
    const updatedTargetTasks = targetColumnTasks.map((t, idx) => ({
      ...t,
      columnId: targetColumnId,
      order: (idx + 1) * 1000,
    }));

    const otherTasks = previousTasks.filter(
      (t) => t.columnId !== targetColumnId && t.id !== taskId
    );

    set({ tasks: [...otherTasks, ...updatedTargetTasks] });

    // 2. Call backend transactional movement API
    try {
      const response = await apiFetch<{
        task: Task;
        targetColumnTasks: Task[];
      }>(`/tasks/${taskId}/move`, {
        method: "PATCH",
        body: JSON.stringify({
          targetColumnId,
          newPosition: safeIndex,
        }),
      });

      // Synchronize with database-authoritative orders
      if (response && response.targetColumnTasks) {
        set((state) => {
          const unaffected = state.tasks.filter((t) => t.columnId !== targetColumnId);
          return {
            tasks: [...unaffected, ...response.targetColumnTasks],
          };
        });
      }
    } catch (err) {
      // Roll back to previous snapshot on error
      set({ tasks: previousTasks });
      const msg = err instanceof ApiError ? err.message : "Failed to move task";
      toast.error(msg);
    }
  },

  // Column Mutations
  addColumn: async (name: string) => {
    const activeBoard = get().activeBoard;
    if (!activeBoard) return;

    try {
      const newCol = await apiFetch<Column>(`/boards/${activeBoard.id}/columns`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      set((state) => ({
        columns: [...state.columns, { id: newCol.id, name: newCol.name, order: newCol.order, boardId: newCol.boardId }],
      }));
      toast.success(`Column "${name}" added`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create column";
      toast.error(msg);
    }
  },

  deleteColumn: async (columnId: string) => {
    try {
      await apiFetch(`/columns/${columnId}`, {
        method: "DELETE",
      });

      set((state) => ({
        columns: state.columns.filter((c) => c.id !== columnId),
        tasks: state.tasks.filter((t) => t.columnId !== columnId),
      }));
      toast.info("Column deleted");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete column";
      toast.error(msg);
    }
  },

  // Member / Sharing Actions
  addMember: async (email: string) => {
    const activeBoard = get().activeBoard;
    if (!activeBoard) return false;

    const lowerEmail = email.trim().toLowerCase();
    try {
      const newMember = await apiFetch<BoardMember>(`/boards/${activeBoard.id}/members`, {
        method: "POST",
        body: JSON.stringify({ email: lowerEmail }),
      });

      set((state) => ({
        members: [...state.members, newMember],
      }));
      toast.success(`Access granted to ${lowerEmail}`);
      return true;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to invite user";
      toast.error(msg);
      return false;
    }
  },

  removeMember: async (userId: string) => {
    const activeBoard = get().activeBoard;
    if (!activeBoard) return;

    try {
      await apiFetch(`/boards/${activeBoard.id}/members/${userId}`, {
        method: "DELETE",
      });

      set((state) => ({
        members: state.members.filter((m) => m.userId !== userId),
      }));
      toast.info("Collaborator access revoked");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to revoke collaborator";
      toast.error(msg);
    }
  },
}));

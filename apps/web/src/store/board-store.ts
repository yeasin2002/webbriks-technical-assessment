import { create } from "zustand";
import type { BoardMember, Column, Task } from "@/components/board/types";

interface BoardState {
  // Board Data
  boardTitle: string;
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

  // Task Actions
  addTask: (columnId: string, title: string, description?: string) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetColumnId: string, newOrder?: number) => void;

  // Column Actions
  addColumn: (name: string) => void;
  deleteColumn: (columnId: string) => void;

  // Member / Sharing Actions
  addMember: (email: string) => boolean;
  removeMember: (memberId: string) => void;
}

const INITIAL_COLUMNS: Column[] = [
  { id: "col-todo", name: "To Do", order: 1 },
  { id: "col-in-progress", name: "In Progress", order: 2 },
  { id: "col-done", name: "Done", order: 3 },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Design PostgreSQL Schema",
    description: "Model Board, BoardMember, Column, and Task tables with cascade deletions and access constraints.",
    columnId: "col-done",
    order: 1,
  },
  {
    id: "task-2",
    title: "Implement Token-Based Authentication",
    description: "User registration and login endpoints returning secure JWT access tokens.",
    columnId: "col-done",
    order: 2,
  },
  {
    id: "task-3",
    title: "Task Movement & Reordering API",
    description: "Transactional endpoint supporting task movement within the same column or across columns to specific position indices.",
    columnId: "col-in-progress",
    order: 1,
  },
  {
    id: "task-4",
    title: "Board Sharing & Authorization Rules",
    description: "Enforce multi-tenant access control so users can only view or mutate boards they own or have been granted access to.",
    columnId: "col-in-progress",
    order: 2,
  },
  {
    id: "task-5",
    title: "Interactive Drag-and-Drop Board View",
    description: "Responsive Kanban board supporting drag-and-drop movement for columns and tasks.",
    columnId: "col-todo",
    order: 1,
  },
  {
    id: "task-6",
    title: "Docker Compose Local Orchestration",
    description: "Multi-service compose configuration for PostgreSQL, API server, and Next.js frontend.",
    columnId: "col-todo",
    order: 2,
  },
];

const INITIAL_MEMBERS: BoardMember[] = [
  {
    id: "user-1",
    name: "Yeasin (You)",
    email: "yeasin@webbriks.com",
    role: "OWNER",
  },
  {
    id: "user-2",
    name: "Alex Rivera",
    email: "alex.rivera@team.com",
    role: "COLLABORATOR",
  },
  {
    id: "user-3",
    name: "John Doe",
    email: "john.doe@partner.com",
    role: "COLLABORATOR",
  },
];

export const useBoardStore = create<BoardState>((set, get) => ({
  boardTitle: "Mini Kanban Board",
  columns: INITIAL_COLUMNS,
  tasks: INITIAL_TASKS,
  members: INITIAL_MEMBERS,

  // Filters
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

  // Task Mutations
  addTask: (columnId, title, description) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: description || undefined,
      columnId,
      order: Date.now(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (updatedTask) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      selectedTask: state.selectedTask?.id === updatedTask.id ? updatedTask : state.selectedTask,
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    }));
  },

  moveTask: (taskId, targetColumnId, newOrder) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              columnId: targetColumnId,
              order: newOrder ?? Date.now(),
            }
          : t
      ),
    }));
  },

  // Column Mutations
  addColumn: (name) => {
    const newCol: Column = {
      id: `col-${Date.now()}`,
      name,
      order: get().columns.length + 1,
    };
    set((state) => ({ columns: [...state.columns, newCol] }));
  },

  deleteColumn: (columnId) => {
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== columnId),
      tasks: state.tasks.filter((t) => t.columnId !== columnId),
    }));
  },

  // Member Mutations
  addMember: (email) => {
    const lowerEmail = email.trim().toLowerCase();
    const existing = get().members.some((m) => m.email.toLowerCase() === lowerEmail);
    if (existing) return false;

    const newMember: BoardMember = {
      id: `user-${Date.now()}`,
      name: lowerEmail.split("@")[0] ?? "Collaborator",
      email: lowerEmail,
      role: "COLLABORATOR",
    };

    set((state) => ({ members: [...state.members, newMember] }));
    return true;
  },

  removeMember: (memberId) => {
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    }));
  },
}));

"use client";

import {
  useBoard,
  useBoards,
  useCreateBoard,
  useCreateColumn,
  useCreateTask,
  useDeleteBoard,
  useDeleteColumn,
  useDeleteTask,
  useMoveTask,
  type BoardTask,
} from "@/api";
import { useAuthStore } from "@/store";
import {
  IconChevronDown,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShare,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShareModal } from "./share-modal";
import { TaskCard } from "./task-card";
import { TaskDetailModal } from "./task-detail-modal";

export function KanbanBoard() {
  const user = useAuthStore((state) => state.user);

  // TanStack Query: Fetch all boards for current user
  const {
    data: boards = [],
    isLoading: isLoadingBoards,
    refetch: refetchBoards,
    isRefetching: isRefetchingBoards,
  } = useBoards();

  // Active board state synced with URL query param ?board=<id>
  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get("board");
      if (paramId) return paramId;
    }
    return "";
  });

  // Track known boards to detect and notify when a collaborator shares a board with current user
  const previousBoardIdsRef = React.useRef<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlBoardId = params.get("board");

      // Check if a new board was shared with current user in real-time
      if (boards.length > 0 && previousBoardIdsRef.current.length > 0) {
        const newlyShared = boards.find(
          (b) => !previousBoardIdsRef.current.includes(b.id) && !b.isOwner
        );
        if (newlyShared && newlyShared.id !== activeBoardId) {
          toast.info(`"${newlyShared.title}" was shared with you!`, {
            description: `Invited by ${newlyShared.owner?.name || newlyShared.owner?.email}`,
            action: {
              label: "Open Board",
              onClick: () => handleSelectBoard(newlyShared.id),
            },
            duration: 8000,
          });
        }
      }
      previousBoardIdsRef.current = boards.map((b) => b.id);

      // If URL already specifies a board, ensure activeBoardId matches it
      if (urlBoardId) {
        if (activeBoardId !== urlBoardId) {
          setActiveBoardId(urlBoardId);
        }
        return;
      }
    }

    // If no board in URL, pick the first board if activeBoardId is not set
    if (boards.length > 0 && !activeBoardId) {
      const firstId = boards[0]!.id;
      setActiveBoardId(firstId);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("board", firstId);
        window.history.replaceState(null, "", url.toString());
      }
    }
  }, [boards, activeBoardId]);

  // Mutations
  const createBoardMutation = useCreateBoard();
  const deleteBoardMutation = useDeleteBoard();

  // Auto-seed initial board only for brand-new users who have NO boards and NO board in URL
  useEffect(() => {
    const hasUrlBoard = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("board");
    if (!isLoadingBoards && boards.length === 0 && !hasUrlBoard && !createBoardMutation.isPending) {
      createBoardMutation.mutate({ title: "My Kanban Board" });
    }
  }, [isLoadingBoards, boards.length, createBoardMutation]);

  // TanStack Query: Fetch single active board with short polling (every 3 seconds)
  const {
    data: activeBoard,
    isLoading: isLoadingBoard,
    refetch: refetchBoard,
    isRefetching: isRefetchingBoard,
  } = useBoard(activeBoardId);

  const isRefreshing = isRefetchingBoards || isRefetchingBoard;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchBoard(), refetchBoards()]);
      toast.success("Board refreshed");
    } catch {
      toast.error("Failed to refresh board");
    }
  };

  // Board-specific mutations
  const createColumnMutation = useCreateColumn(activeBoardId);
  const deleteColumnMutation = useDeleteColumn(activeBoardId);
  const createTaskMutation = useCreateTask(activeBoardId);
  const deleteTaskMutation = useDeleteTask(activeBoardId);
  const moveTaskMutation = useMoveTask(activeBoardId);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<BoardTask | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);

  // Switch active board
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setIsBoardDropdownOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("board", boardId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: BoardTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetColumnId: string,
    targetIndex?: number
  ) => {
    e.preventDefault();
    setDragOverColumnId(null);

    if (!draggedTask || !activeBoard) return;

    const targetColumn = activeBoard.columns.find((c) => c.id === targetColumnId);
    const columnTasks = (targetColumn?.tasks || []).slice().sort((a, b) => a.order - b.order);

    const newPosition =
      typeof targetIndex === "number" ? targetIndex : columnTasks.length;

    // If dropped in same column at same position, skip
    if (draggedTask.columnId === targetColumnId) {
      const currentIndex = columnTasks.findIndex((t) => t.id === draggedTask.id);
      if (currentIndex === newPosition) {
        setDraggedTask(null);
        return;
      }
    }

    const movingTaskId = draggedTask.id;
    setDraggedTask(null);

    // Trigger optimistic movement mutation
    moveTaskMutation.mutate({
      id: movingTaskId,
      data: {
        targetColumnId,
        newPosition,
      },
    });
  };

  // Task Creation
  const handleCreateTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    createTaskMutation.mutate(
      {
        columnId,
        data: {
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          setNewTaskDescription("");
          setAddingToColumnId(null);
        },
      }
    );
  };

  // Column Creation
  const handleCreateColumn = () => {
    if (!newColumnName.trim()) return;
    createColumnMutation.mutate(
      { name: newColumnName.trim() },
      {
        onSuccess: () => {
          setNewColumnName("");
          setIsAddingColumn(false);
        },
      }
    );
  };

  // Board Creation
  const handleCreateNewBoard = () => {
    if (!newBoardTitle.trim()) return;
    createBoardMutation.mutate(
      { title: newBoardTitle.trim() },
      {
        onSuccess: (newBoard) => {
          setNewBoardTitle("");
          setIsCreatingBoard(false);
          setIsBoardDropdownOpen(false);
          handleSelectBoard(newBoard.id);
        },
      }
    );
  };

  const columns = activeBoard?.columns || [];
  const isOwner = activeBoard?.isOwner ?? false;

  // Flatten and filter tasks
  const allTasks = columns.flatMap((c) => c.tasks || []);
  const filteredTasks = allTasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description?.toLowerCase().includes(q) ?? false)
    );
  });

  // Loading state
  if ((isLoadingBoards || isLoadingBoard) && !activeBoard) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-[#0f0f11]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Loading Kanban Board...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0f0f11]">
      {/* Board Utility Sub-Header */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Board Title & Switcher */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                  isOwner
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                }`}
              >
                {isOwner ? "OWNER" : "COLLABORATOR"}
              </span>
              <span className="text-xs font-semibold text-neutral-400">
                {isOwner
                  ? user?.email
                  : `Shared by ${activeBoard?.owner?.name || activeBoard?.owner?.email}`}
              </span>
            </div>

            {/* Board Selector Trigger */}
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
                className="group flex items-center gap-2 text-left"
              >
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                  {activeBoard?.title || "Mini Kanban Board"}
                </h1>
                <IconChevronDown className="size-5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-transform duration-200" />
              </button>

              {isOwner && boards.length > 1 && (
                <button
                  onClick={() => {
                    if (activeBoard) {
                      deleteBoardMutation.mutate(activeBoard.id, {
                        onSuccess: () => {
                          const remaining = boards.filter((b) => b.id !== activeBoard.id);
                          if (remaining.length > 0) {
                            handleSelectBoard(remaining[0]!.id);
                          }
                        },
                      });
                    }
                  }}
                  disabled={deleteBoardMutation.isPending}
                  title="Delete this board"
                  className="rounded-full p-1 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  <IconTrash className="size-4" />
                </button>
              )}
            </div>

            {/* Board Dropdown Menu */}
            {isBoardDropdownOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {/* Owned Boards */}
                  {boards.filter((b) => b.isOwner).length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        My Boards ({boards.filter((b) => b.isOwner).length})
                      </div>
                      <div className="space-y-0.5">
                        {boards
                          .filter((b) => b.isOwner)
                          .map((b) => (
                            <button
                              key={b.id}
                              onClick={() => handleSelectBoard(b.id)}
                              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                                b.id === activeBoardId
                                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
                              }`}
                            >
                              <span className="truncate">{b.title}</span>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 shrink-0">
                                Owner
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Shared Boards */}
                  {boards.filter((b) => !b.isOwner).length > 0 && (
                    <div className={boards.filter((b) => b.isOwner).length > 0 ? "border-t border-neutral-100 dark:border-neutral-800 pt-2" : ""}>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Shared With Me ({boards.filter((b) => !b.isOwner).length})
                      </div>
                      <div className="space-y-0.5">
                        {boards
                          .filter((b) => !b.isOwner)
                          .map((b) => (
                            <button
                              key={b.id}
                              onClick={() => handleSelectBoard(b.id)}
                              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                                b.id === activeBoardId
                                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
                              }`}
                            >
                              <div className="truncate">
                                <p className="truncate font-semibold">{b.title}</p>
                                <p className="text-[10px] font-normal text-neutral-400">
                                  By {b.owner?.name || b.owner?.email}
                                </p>
                              </div>
                              <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 shrink-0 uppercase">
                                Shared
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                  {isCreatingBoard ? (
                    <div className="p-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Board name..."
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateNewBoard();
                          if (e.key === "Escape") setIsCreatingBoard(false);
                        }}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-2.5 py-1.5 text-xs font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                      />
                      <div className="mt-2 flex justify-end gap-1">
                        <button
                          onClick={() => setIsCreatingBoard(false)}
                          className="rounded-full px-2 py-1 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateNewBoard}
                          disabled={createBoardMutation.isPending}
                          className="rounded-full bg-neutral-900 dark:bg-white px-2.5 py-1 text-[10px] font-bold text-white dark:text-neutral-900 disabled:opacity-50"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreatingBoard(true)}
                      className="flex w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <IconPlus className="size-3.5" />
                      <span>Create New Board</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions: Share & Add Task */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 transition-all"
            >
              <IconShare className="size-3.5" />
              <span>Share Board</span>
            </button>

            <button
              onClick={() => {
                const firstCol = columns[0];
                if (firstCol) {
                  setAddingToColumnId(firstCol.id);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-neutral-900 px-4 py-2 text-xs font-bold shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95"
            >
              <IconPlus className="size-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-10 pr-4 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-neutral-300 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400">
              {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
            </span>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh board data"
              className="group flex items-center gap-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs disabled:opacity-50"
            >
              <IconRefresh
                className={`size-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors ${
                  isRefreshing ? "animate-spin text-neutral-700 dark:text-neutral-200" : ""
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Kanban Columns Canvas */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex h-full min-w-max gap-5 items-start">
          {columns.map((column) => {
            const columnTasks = filteredTasks
              .filter((t) => t.columnId === column.id)
              .sort((a, b) => a.order - b.order);
            const isDragOver = dragOverColumnId === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex w-80 shrink-0 flex-col rounded-2xl border bg-[#f5f5f5] dark:bg-neutral-950/70 p-3.5 transition-all duration-200 ${
                  isDragOver
                    ? "border-neutral-900 dark:border-white ring-2 ring-neutral-900/10 dark:ring-white/10 shadow-lg scale-[1.01]"
                    : "border-neutral-200/80 dark:border-neutral-800"
                }`}
                style={{ maxHeight: "calc(100vh - 180px)" }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                      {column.name}
                    </h2>
                    <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAddingToColumnId(column.id)}
                      title="Add task"
                      className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <IconPlus className="size-4" />
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => deleteColumnMutation.mutate(column.id)}
                        disabled={deleteColumnMutation.isPending}
                        title="Delete column"
                        className="rounded-full p-1 text-neutral-400 hover:text-red-600 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        <IconTrash className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Add Task Form */}
                {addingToColumnId === column.id && (
                  <div className="mb-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                    <input
                      type="text"
                      placeholder="Task title..."
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleCreateTask(column.id);
                        }
                        if (e.key === "Escape") setAddingToColumnId(null);
                      }}
                      className="w-full text-xs font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 bg-transparent focus:outline-none"
                    />
                    <textarea
                      placeholder="Optional description..."
                      rows={2}
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="mt-2 w-full text-xs text-neutral-600 dark:text-neutral-300 placeholder:text-neutral-400 bg-transparent focus:outline-none resize-none"
                    />
                    <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                      <button
                        onClick={() => setAddingToColumnId(null)}
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCreateTask(column.id)}
                        disabled={createTaskMutation.isPending}
                        className="rounded-full bg-[#111111] dark:bg-white px-3 py-1 text-[11px] font-bold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {columnTasks.map((task, idx) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={idx}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDropOnTask={(e, targetColId, targetIdx) =>
                        handleDrop(e, targetColId, targetIdx)
                      }
                      onClick={(t) => setSelectedTask(t)}
                      onDelete={(id) => deleteTaskMutation.mutate(id)}
                    />
                  ))}

                  {columnTasks.length === 0 && addingToColumnId !== column.id && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 text-center text-neutral-400">
                      <span className="text-xs font-semibold">No tasks</span>
                      <button
                        onClick={() => setAddingToColumnId(column.id)}
                        className="mt-2 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 underline hover:no-underline"
                      >
                        + Add task
                      </button>
                    </div>
                  )}
                </div>

                {/* Column Footer */}
                {addingToColumnId !== column.id && (
                  <button
                    onClick={() => setAddingToColumnId(column.id)}
                    className="mt-2.5 flex items-center justify-center gap-1 rounded-xl border border-transparent py-2 text-xs font-bold text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all"
                  >
                    <IconPlus className="size-3.5" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Add New Column Box */}
          {isOwner && (
            <div className="w-80 shrink-0">
              {isAddingColumn ? (
                <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3.5 shadow-sm">
                  <input
                    type="text"
                    placeholder="Column name (e.g. In Review)..."
                    autoFocus
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateColumn();
                      if (e.key === "Escape") setIsAddingColumn(false);
                    }}
                    className="w-full text-xs font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 bg-transparent focus:outline-none"
                  />
                  <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateColumn}
                      disabled={createColumnMutation.isPending}
                      className="rounded-full bg-[#111111] dark:bg-white px-3.5 py-1 text-[11px] font-bold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      Add Column
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 py-4 text-xs font-bold text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all"
                >
                  <IconPlus className="size-4" />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Board Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        board={activeBoard ?? null}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        columns={columns}
        boardId={activeBoardId}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

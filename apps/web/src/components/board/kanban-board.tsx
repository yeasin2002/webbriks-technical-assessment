"use client";

import React, { useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconShare,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useBoardStore } from "@/store";
import { TaskCard } from "./task-card";
import { ShareModal } from "./share-modal";
import { TaskDetailModal } from "./task-detail-modal";
import type { Task } from "./types";

export function KanbanBoard() {
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const searchQuery = useBoardStore((state) => state.searchQuery);
  const setSearchQuery = useBoardStore((state) => state.setSearchQuery);
  const addingToColumnId = useBoardStore((state) => state.addingToColumnId);
  const setAddingToColumnId = useBoardStore((state) => state.setAddingToColumnId);
  const dragOverColumnId = useBoardStore((state) => state.dragOverColumnId);
  const setDragOverColumnId = useBoardStore((state) => state.setDragOverColumnId);
  const setShareModalOpen = useBoardStore((state) => state.setShareModalOpen);
  const setSelectedTask = useBoardStore((state) => state.setSelectedTask);

  const addTask = useBoardStore((state) => state.addTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const moveTask = useBoardStore((state) => state.moveTask);
  const addColumn = useBoardStore((state) => state.addColumn);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);

  // Local drag state & inline inputs
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);

    if (!draggedTask) return;
    if (draggedTask.columnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const targetColumn = columns.find((c) => c.id === targetColumnId);
    moveTask(draggedTask.id, targetColumnId);

    toast.success(`Moved to ${targetColumn?.name ?? targetColumnId}`);
    setDraggedTask(null);
  };

  // Task Creation Handler
  const handleCreateTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    addTask(columnId, newTaskTitle.trim(), newTaskDescription.trim());
    setNewTaskTitle("");
    setNewTaskDescription("");
    setAddingToColumnId(null);
    toast.success("Task created");
  };

  // Column Creation Handler
  const handleCreateColumn = () => {
    if (!newColumnName.trim()) return;
    addColumn(newColumnName.trim());
    toast.success(`Column "${newColumnName.trim()}" added`);
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
    toast.info("Column deleted");
  };

  // Filter Tasks by Search Query
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0f0f11]">
      {/* Board Utility Sub-Header */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Board Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                BOARD
              </span>
              <span className="text-xs font-semibold text-neutral-400">
                Webbriks Assessment
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              Mini Kanban Board
            </h1>
          </div>

          {/* Actions: Share & Add Task */}
          <div className="flex items-center gap-3">
            {/* Share Board Button */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 transition-all"
            >
              <IconShare className="size-3.5" />
              <span>Share Board</span>
            </button>

            {/* New Task Pill Button */}
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

          <span className="text-xs font-semibold text-neutral-400">
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>

      {/* Main Kanban Columns Canvas */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex h-full min-w-max gap-5 items-start">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.columnId === column.id);
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
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      title="Delete column"
                      className="rounded-full p-1 text-neutral-400 hover:text-red-600 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <IconTrash className="size-3.5" />
                    </button>
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
                        className="rounded-full bg-[#111111] dark:bg-white px-3 py-1 text-[11px] font-bold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={(t) => setSelectedTask(t)}
                      onDelete={(id) => {
                        deleteTask(id);
                        toast.info("Task deleted");
                      }}
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
                    className="rounded-full bg-[#111111] dark:bg-white px-3.5 py-1 text-[11px] font-bold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
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
        </div>
      </div>

      {/* Share Board Modal */}
      <ShareModal />

      {/* Task Detail Modal */}
      <TaskDetailModal />
    </div>
  );
}

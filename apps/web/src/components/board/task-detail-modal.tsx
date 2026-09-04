"use client";

import React, { useState, useEffect } from "react";
import { IconTrash, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useBoardStore } from "@/store";

export function TaskDetailModal() {
  const task = useBoardStore((state) => state.selectedTask);
  const columns = useBoardStore((state) => state.columns);
  const onClose = () => useBoardStore.getState().setSelectedTask(null);
  const updateTask = useBoardStore((state) => state.updateTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const moveTask = useBoardStore((state) => state.moveTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setColumnId(task.columnId);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      // If column changed, move to the end of the new column
      if (columnId !== task.columnId) {
        await moveTask(task.id, columnId, 9999);
      }

      await updateTask({
        id: task.id,
        title: title.trim(),
        description: description.trim() || null,
        columnId,
      });

      onClose();
    } catch {
      // handled in store
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Task Details
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              title="Delete task"
              className="rounded-full p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <IconTrash className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
        </div>

        {/* Description Input */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add task description or details..."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs leading-relaxed text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
        </div>

        {/* Column Placement */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Column
          </label>
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-[#111111] dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

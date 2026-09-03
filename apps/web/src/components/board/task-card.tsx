"use client";

import React from "react";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import type { Task } from "./types";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onDragStart, onDragEnd, onClick, onDelete }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="group relative cursor-grab active:cursor-grabbing select-none rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-md"
    >
      {/* Top row: Title and Actions */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white transition-colors">
          {task.title}
        </h3>

        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              title="Delete task"
              className="rounded-full p-1 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <IconTrash className="size-3.5" />
            </button>
          )}
          <div className="text-neutral-400 p-0.5">
            <IconGripVertical className="size-3.5" />
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {task.description}
        </p>
      )}
    </div>
  );
}

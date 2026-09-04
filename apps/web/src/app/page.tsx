"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { KanbanBoard } from "@/components/board/kanban-board";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isInitialized && !user) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      router.replace((search ? `/login${search}` : "/login") as any);
    }
  }, [isInitialized, user, router]);

  // Loading state while checking authentication
  if (!isInitialized || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white dark:bg-[#0f0f11]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Checking session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="h-full w-full overflow-hidden">
      <KanbanBoard />
    </main>
  );
}

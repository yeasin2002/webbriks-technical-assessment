"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconLayoutKanban, IconLogout, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully");
    router.push("/login");
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name?.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Brand & Editorial Lockup */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-8 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm group-hover:scale-105 transition-transform">
              <IconLayoutKanban className="size-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black tracking-tight uppercase text-neutral-900 dark:text-white">
                WEBBRIKS
              </span>
              <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.2 text-[10px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                KANBAN
              </span>
            </div>
          </Link>
        </div>

        {/* Right Utility: Mode Toggle & Auth Controls */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          <div className="flex items-center gap-2.5 border-l border-neutral-200 dark:border-neutral-800 pl-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    title={user.email}
                    className="flex size-7 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold ring-2 ring-neutral-200 dark:ring-neutral-800"
                  >
                    {getInitials(user.name, user.email)}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <span className="block text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">
                      {user.name || user.email.split("@")[0]}
                    </span>
                    <span className="block text-[10px] font-semibold text-neutral-400 truncate max-w-[120px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="rounded-full p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <IconLogout className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3.5 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#111111] dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

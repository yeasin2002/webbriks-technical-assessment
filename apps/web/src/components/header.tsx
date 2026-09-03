"use client";

import React from "react";
import Link from "next/link";
import { IconLayoutKanban, IconShieldCheck } from "@tabler/icons-react";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
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

          <span className="text-neutral-300 dark:text-neutral-700 font-light">/</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>Sprint 14 — Core Platform</span>
          </div>
        </div>

        {/* Right Utility: Mode Toggle & Current User Avatar */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          <div className="flex items-center gap-2.5 border-l border-neutral-200 dark:border-neutral-800 pl-3">
            <div
              title="Yeasin (Owner)"
              className="flex size-7 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold ring-2 ring-neutral-200 dark:ring-neutral-800"
            >
              MY
            </div>
            <div className="hidden md:block text-left leading-tight">
              <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                Yeasin
              </span>
              <span className="block text-[10px] font-semibold text-neutral-400">
                Board Owner
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

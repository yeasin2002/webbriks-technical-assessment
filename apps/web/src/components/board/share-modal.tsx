"use client";

import React, { useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconMail,
  IconShieldCheck,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useBoardStore } from "@/store";

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return (name.slice(0, 2) ?? "U").toUpperCase();
  }
  if (email) {
    return (email.slice(0, 2) ?? "U").toUpperCase();
  }
  return "U";
}

export function ShareModal() {
  const isOpen = useBoardStore((state) => state.isShareModalOpen);
  const onClose = () => useBoardStore.getState().setShareModalOpen(false);
  const boardTitle = useBoardStore((state) => state.boardTitle);
  const members = useBoardStore((state) => state.members);
  const addMember = useBoardStore((state) => state.addMember);
  const removeMember = useBoardStore((state) => state.removeMember);

  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const email = inviteEmail.trim().toLowerCase();
    const success = addMember(email);

    if (!success) {
      toast.error("User is already a member of this board");
      return;
    }

    setInviteEmail("");
    toast.success(`Access granted to ${email}`, {
      description: "User can now view and mutate tasks on this board.",
    });
  };

  const handleRemoveCollaborator = (id: string, name?: string) => {
    removeMember(id);
    toast.info(`Removed ${name ?? "collaborator"} from board`);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Board invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
              <IconUsers className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Share Board
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {boardTitle} • Multi-tenant access control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <IconX className="size-5" />
          </button>
        </div>

        {/* Invite Input Bar */}
        <form onSubmit={handleAddCollaborator} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="email"
              placeholder="Enter registered user's email..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-10 pr-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black px-4 py-2 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm shrink-0"
          >
            <IconUserPlus className="size-3.5" />
            <span>Invite</span>
          </button>
        </form>

        {/* Member List Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            <span>Members with Access ({members.length})</span>
            <span>Role</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 max-h-56 overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
                    {getInitials(member.name, member.email)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      {member.name || member.email}
                      {member.role === "OWNER" && (
                        <span title="Board Owner">
                          <IconShieldCheck className="size-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider ${
                      member.role === "OWNER"
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {member.role}
                  </span>

                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveCollaborator(member.id, member.name)}
                      title="Revoke access"
                      className="rounded-full p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <IconTrash className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer: Copy Link & Done */}
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {copied ? <IconCheck className="size-3.5 text-emerald-600" /> : <IconCopy className="size-3.5" />}
            <span>{copied ? "Link Copied!" : "Copy Board Link"}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

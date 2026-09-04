"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconLayoutKanban, IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";

export default function RegisterPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/");
    }
  }, [isInitialized, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password) {
      toast.error("Please fill in both email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await register(email.trim(), password, name);
      toast.success("Account created successfully!", {
        description: "Welcome to Webbriks Kanban.",
      });
      router.replace("/");
    } catch (err: any) {
      toast.error("Registration failed", {
        description: err.message || "An error occurred during registration",
      });
    }
  };

  if (isInitialized && user) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6 bg-white dark:bg-[#0f0f11]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Redirecting to your Kanban board...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6 bg-white dark:bg-[#0f0f11]">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md mb-3">
            <IconLayoutKanban className="size-6" />
          </div>
          <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-0.5 text-[10.5px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
            JOIN WEBBRIKS
          </span>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Sign up to create and share interactive Kanban boards
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 pl-1">
              Full Name (Optional)
            </label>
            <div className="relative">
              <IconUser className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-11 pr-4 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 pl-1">
              Email Address
            </label>
            <div className="relative">
              <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-11 pr-4 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 pl-1">
              Password (Min. 6 Characters)
            </label>
            <div className="relative">
              <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-11 pr-4 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] dark:bg-white py-3 text-xs font-bold text-white dark:text-neutral-900 shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <IconArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-neutral-900 dark:text-white underline underline-offset-4 hover:no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

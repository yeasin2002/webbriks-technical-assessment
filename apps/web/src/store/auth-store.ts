import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch, ApiError } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", data.token);
          }

          set({ user: data.user, token: data.token, isLoading: false, error: null });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Failed to log in";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const payload: { email: string; password: string; name?: string } = { email, password };
          if (name?.trim()) {
            payload.name = name.trim();
          }

          const data = await apiFetch<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", data.token);
          }

          set({ user: data.user, token: data.token, isLoading: false, error: null });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Failed to register";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
        set({ user: null, token: null, error: null });
      },

      checkAuth: async () => {
        const token = get().token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
        if (!token) {
          set({ user: null, token: null });
          return;
        }

        try {
          const data = await apiFetch<{ user: User }>("/auth/me");
          set({ user: data.user, token });
        } catch {
          // Token expired or invalid
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "webbriks-auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

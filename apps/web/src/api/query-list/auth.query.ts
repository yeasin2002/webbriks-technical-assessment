import { api } from "@/lib/ky";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export const authApi = {
  login: (data: LoginData) =>
    api.post("auth/login", { json: data }).json<AuthResponse>(),

  register: (data: RegisterData) =>
    api.post("auth/register", { json: data }).json<AuthResponse>(),

  getMe: () =>
    api.get("auth/me").json<{ user: User }>(),
};

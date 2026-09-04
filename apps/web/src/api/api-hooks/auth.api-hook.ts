import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/ky";
import {
  authApi,
  type LoginData,
  type RegisterData,
  type User,
} from "../query-list/auth.query";

export const AUTH_KEYS = {
  all: () => ["auth"] as const,
  me: () => ["auth", "me"] as const,
};

export const useCurrentUser = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return useQuery({
    queryKey: AUTH_KEYS.me(),
    queryFn: () => authApi.getMe(),
    enabled: !!token,
    select: (res) => res.user,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }
      queryClient.setQueryData(AUTH_KEYS.me(), { user: data.user });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all() });
      toast.success("Signed in successfully");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to sign in");
      toast.error(msg);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }
      queryClient.setQueryData(AUTH_KEYS.me(), { user: data.user });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all() });
      toast.success("Account created successfully");
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, "Failed to register");
      toast.error(msg);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    queryClient.removeQueries();
    toast.info("Signed out");
  };
};

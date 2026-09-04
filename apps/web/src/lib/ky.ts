import ky, { HTTPError } from "ky";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const api = ky.create({
  prefix: SERVER_URL,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token");
          if (token && !request.headers.has("Authorization")) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        }
      },
    ],
  },
});

export async function getApiErrorMessage(error: unknown, fallback = "An unexpected error occurred"): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const data = await error.response.json() as { message?: string | string[]; error?: string };
      if (Array.isArray(data.message)) {
        return data.message.join(", ");
      }
      if (typeof data.message === "string") {
        return data.message;
      }
    } catch {
      return error.message || fallback;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

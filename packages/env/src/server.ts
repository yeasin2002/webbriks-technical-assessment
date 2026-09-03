import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.string().default("http://localhost:3001"),
    JWT_SECRET: z.string().min(1).default("webbriks-kanban-secret-key-development-2026"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

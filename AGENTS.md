# AGENTS.md

This document serves as the primary steering guide and architectural blueprint for AI assistants and engineers working on the **Webbriks Technical Assessment** repository.

---

## 1. Product

### Overview
This project is a **Mini Kanban Board** application built as a full-stack engineering challenge for Webbriks. The application enables users to organize projects and workflows interactively through customizable boards, workflow columns, and tasks with smooth drag-and-drop capabilities and real-time feel.

### Core Problem & Concept
Kanban systems require clear boundaries between collaboration, access control, and state synchronization. Rather than micro-specifying every UI detail, the system focuses on delivering a reliable, secure, and intuitive collaborative workflow:
- **Authentication & Secure Collaboration**: Users register, authenticate, create boards, and invite or share access with other registered collaborators.
- **Access Control & Authorization**: Strict multi-tenant security ensuring users can only read, update, or delete boards, columns, and tasks they own or have been explicitly granted permission to access.
- **Dynamic Workflow & Positional Ordering**: Visual Kanban boards where tasks can be created, updated, reordered within a column, and moved across columns with absolute ordering stability and conflict-free consistency.
- **Evaluation Scope**: Built to demonstrate production-grade system architecture, clean database modeling, API design, robust drag-and-drop interactions, and developer-friendly local orchestration.

---

## 2. Tech

### Monorepo & Core Stack
- **Package Manager & Runtime**: [Bun](https://bun.sh/) (v1.3+) workspace runner with Node.js runtime.
- **Monorepo Engine**: [Turborepo](https://turbo.build/) (v2) managing task pipelines and caching.
- **Language**: TypeScript (strict mode across all packages and apps).

### Applications & Packages
- **Frontend (`apps/web`)**:
  - **Framework**: Next.js 16 (App Router) + React 19.
  - **Styling**: Tailwind CSS v4 + Radix UI / Base UI / shadcn-ui design primitives.
  - **State & Forms**: TanStack Form + Zod for client validation.
  - **UI / Icons**: Tabler Icons (`@tabler/icons-react`), Sonner (toasts), `next-themes` (theme switching).
  - **Interactions**: Modern drag-and-drop task movement and board management.
- **Backend (`apps/server`)**:
  - **Framework**: NestJS 11 running on Express 5 platform.
  - **Compiler / Tooling**: SWC builder for fast builds and hot-reloading with Bun.
  - **Architecture**: Modular structure (Controllers, Services, Modules, Guards, DTOs).
- **Database & Data Layer (`packages/db`)**:
  - **Database Engine**: PostgreSQL 16.
  - **ORM**: Prisma 7 with `@prisma/adapter-pg` driver.
- **Shared Packages**:
  - `packages/env`: Type-safe environment validation using `@t3-oss/env-core` and Zod for both client and server boundaries.
  - `packages/config`: Shared TypeScript configurations (`tsconfig.base.json`).
- **DevOps & Infrastructure**:
  - **Docker**: `docker-compose.yml` orchestrating PostgreSQL, NestJS API, and Next.js frontend with automated healthchecks.
  - **Git Hooks**: Lefthook for pre-commit linting and type checks.

### Current Working State
- Monorepo workspace orchestration configured with Turborepo and Bun.
- Type-safe environment variables configured in `packages/env` for both server and web.
- PostgreSQL database service defined in Docker Compose and connected to `packages/db` via Prisma.
- NestJS backend scaffolded in `apps/server` with initial health controller, CORS configuration, and SWC build pipeline.
- Next.js frontend scaffolded in `apps/web` with Tailwind CSS v4, theme providers, and UI component foundations.

---

## 3. Structure & Best Practices

### Monorepo Tree
```
webbriks-technical-assessment/
├── apps/
│   ├── server/               # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/         # Authentication & JWT guards
│   │   │   ├── boards/       # Boards module & access control
│   │   │   ├── columns/      # Columns management module
│   │   │   ├── tasks/        # Tasks module & reordering logic
│   │   │   ├── users/        # User management module
│   │   │   ├── app.module.ts # Root application module
│   │   │   └── index.ts      # NestJS entry point & bootstrap
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                  # Next.js Frontend Application
│       ├── src/
│       │   ├── app/          # Next.js App Router (pages & layouts)
│       │   ├── components/   # UI & Kanban board components
│       │   │   ├── board/    # Board, column, and task card components
│       │   │   └── ui/       # shadcn / reusable primitives
│       │   └── lib/          # API clients, utils, and hooks
│       ├── Dockerfile.next
│       └── package.json
├── packages/
│   ├── config/               # Shared tsconfig definitions
│   ├── db/                   # Database layer
│   │   ├── prisma/
│   │   │   └── schema/       # Prisma schema definitions
│   │   └── src/index.ts      # Prisma client singleton export
│   └── env/                  # Zod environment validation schemas
├── docker-compose.yml        # Multi-service local orchestration
├── turbo.json                # Turborepo task pipeline configuration
└── package.json              # Monorepo root scripts & dependencies
```

### Good Practices (Do's)
- **Domain-Driven Backend Modules**: Keep NestJS features modular (`AuthModule`, `BoardsModule`, `ColumnsModule`, `TasksModule`). Each module owns its controllers, services, repositories, and DTOs.
- **Strict Authorization at Every Endpoint**: Always authenticate requests and verify the current user has explicit read/write permission for the target board before querying or mutating columns and tasks. Prevent cross-board information disclosure.
- **Robust Positional Ordering System**:
  - Implement a stable ordering strategy for task movements (e.g., fractional indexing / LexoRank or atomic transactional reordering) to handle reordering within a column and cross-column transfers without race conditions.
  - Wrap multi-record movement operations inside atomic database transactions (`prisma.$transaction`).
- **Type-Safe Boundary Validation**: Validate all incoming API payloads using NestJS validation pipes / Zod schemas and validate forms on the frontend with TanStack Form / Zod.
- **Single DB Client Authority**: Consume the database exclusively through the `@webbriks-technical-assessment/db` package singleton.
- **Optimistic UI with Graceful Fallbacks**: Apply optimistic updates on drag-and-drop events in the frontend to ensure a responsive feel, reverting changes if the backend returns an error.
- **Predictable Error Responses**: Use standard HTTP status codes and structured error payloads (e.g., `{ statusCode, message, error }`).

### Bad Practices (Don'ts)
- **No Insecure Direct Object References (IDOR)**: Never assume a user has access to a column or task just because they supplied the ID; always validate ownership or board-level membership.
- **No Direct Frontend-to-DB Access**: Frontend components must communicate strictly through the NestJS REST API endpoints.
- **No Fragile Dense Integer Re-indexing**: Avoid naive loops updating every task's index one by one without concurrency safeguards, which leads to race conditions and ordering corruption.
- **No Hardcoded Config or Secrets**: Never commit `.env` files or hardcode URLs/secrets in source code. Use `packages/env` and `.env.example` templates.
- **No Giant Monolithic Components**: Avoid bloated Next.js page files; decompose Kanban boards into dedicated Column, TaskCard, TaskModal, and DndContext components.
- **No Circular Workspace Dependencies**: Keep workspace package dependency flow unidirectional (`apps` -> `packages/db` & `packages/env` -> `packages/config`).

---

## 4. Development Workflow & Commands

### Common Commands
- `bun install`: Install all workspace dependencies.
- `bun dev`: Start all apps concurrently in development mode via Turborepo.
- `bun dev:server`: Start only the NestJS backend in watch mode.
- `bun dev:web`: Start only the Next.js frontend on port 3001.
- `bun check-types`: Run type checks across all workspaces.
- `bun build`: Build all applications for production.

### Database Operations
- `bun db:generate`: Generate the Prisma client.
- `bun db:push`: Push Prisma schema changes directly to the PostgreSQL database.
- `bun db:migrate`: Run database migrations.
- `bun db:studio`: Open Prisma Studio UI for database inspection.

### Docker Environment
- `docker compose up -d db`: Start only the PostgreSQL database.
- `docker compose up --build`: Build and run the entire full-stack application (web, server, db).

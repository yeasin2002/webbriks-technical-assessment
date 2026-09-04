# Technical Assessment Progress & Task Checklist

This checklist tracks the implementation status for the **Webbriks Mini Kanban Board Technical Assessment**, strictly mapped to [Webbriks_Technical_Assessment.md](file:///d:/programming/assignment/webbriks-technical-assessment/Webbriks_Technical_Assessment.md).

---

## 🎯 Assessment Core Requirements Mapping

| Core Requirement | Spec Details | Current Status |
|---|---|---|
| **1. Authentication & Collaboration** | Token-based auth, user registration & login | ✅ **Completed** (`/auth/register`, `/auth/login`, `/auth/me`, JWT Guard) |
| **1. Authentication & Collaboration** | Board sharing with registered collaborators & access control rules | ✅ **Completed** (`/boards/:id/members`, multi-tenant access guards, User Search) |
| **2. Workflow Management** | Full CRUD for Boards, Columns, and Tasks | ✅ **Completed** (`BoardsModule`, `ColumnsModule`, `TasksModule`) |
| **2. Task Movement API** | Reorder within column & move across columns to position index | ✅ **Completed** (`PATCH /tasks/:id/move` with atomic reindexing) |
| **2. Order Consistency** | Conflict-free atomic transactional positioning | ✅ **Completed** (`prisma.$transaction` ordering engine) |
| **3. Frontend** | Interactive board view with Drag-and-Drop task movement | ✅ **Completed** (Full live REST API integration, optimistic drag-and-drop, sharing & multi-tenant access) |
| **4. Submission & Deliverables** | Single repo, setup instructions, Docker/Podman compose | ✅ **Completed** (Turborepo, Bun/pnpm, Docker Compose, Swagger UI, README.md) |

---

## PART 1: Backend (`apps/server` & `packages/db`)

### 1. Database & Schema Modeling (`packages/db`)

#### Completed Tasks:
- [x] **PostgreSQL & Prisma Setup**: Configured Prisma 7 client with PostgreSQL 16 adapter.
- [x] **User Entity**: `User` model defined with `id`, `email`, `password`, `name`, timestamps.
- [x] **Board Model (`schema.prisma`)**: `id`, `title`, `description`, `ownerId` (relation to `User`), timestamps, relations to `BoardMember` and `Column`.
- [x] **BoardMember / Sharing Model (`schema.prisma`)**: `id`, `boardId`, `userId`, `@@unique([boardId, userId])` to prevent duplicate membership.
- [x] **Column Model (`schema.prisma`)**: `id`, `name`, `order` (float for flexible ordering), `boardId`, relation to `Task` list.
- [x] **Task Model (`schema.prisma`)**: `id`, `title`, `description`, `order` (position index), `columnId` (relation to `Column`).
- [x] **Database Migration/Push Tooling**: Executed `bun db:push` to sync PostgreSQL and generated client via `bun db:generate`.

---

### 2. Authentication & Authorization (`apps/server`)

#### Completed Tasks:
- [x] **User Registration (`POST /auth/register`)**: Password hashing with `bcryptjs`, email uniqueness validation, JWT issuance.
- [x] **User Login (`POST /auth/login`)**: Credential verification, JWT access token generation.
- [x] **Current User Profile (`GET /auth/me`)**: Protected endpoint with `JwtAuthGuard` and `@CurrentUser()` decorator.
- [x] **JWT Strategy & Module**: `JwtModule` configured with environment secrets and payload verification.
- [x] **Swagger OpenAPI Specification**: Interactive API documentation configured with Bearer Auth at `http://localhost:3000/api`.
- [x] **Board Access Guard / Verification Helper**: Reusable `validateBoardAccess` enforcing Owner vs Collaborator permissions and rejecting unauthorized cross-board access (`403 Forbidden` / `404 Not Found`).
- [x] **Collaborator Search Endpoint (`GET /users/search?q=...`)**: User search by email and name for board invitation flows.

---

### 3. Board Management & Sharing API (`apps/server`)

#### Completed Tasks:
- [x] **`BoardsModule` Scaffold**: Controller, Service, DTOs with Zod validation.
- [x] **`POST /boards`**: Create a new board (assigns authenticated user as `ownerId` and seeds default columns "To Do", "In Progress", "Done").
- [x] **`GET /boards`**: List all boards accessible by current user (both owned boards and shared collaborator boards).
- [x] **`GET /boards/:id`**: Get a single board with its columns and ordered tasks (restricted to owner and shared members).
- [x] **`PATCH /boards/:id`**: Update board title / description (owner only).
- [x] **`DELETE /boards/:id`**: Delete board and its associated columns/tasks (owner only, cascade delete).
- [x] **`POST /boards/:id/members`**: Share board with another registered user by email address (owner only).
- [x] **`GET /boards/:id/members`**: List all members who have access to the board.
- [x] **`DELETE /boards/:id/members/:userId`**: Revoke access from a member (owner only).

---

### 4. Workflow Columns API (`apps/server`)

#### Completed Tasks:
- [x] **`ColumnsModule` Scaffold**: Controller, Service, DTOs.
- [x] **`POST /boards/:boardId/columns`**: Create a new column in a board with calculated order index.
- [x] **`PATCH /columns/:id`**: Rename or update a column.
- [x] **`DELETE /columns/:id`**: Delete a column and its tasks.
- [x] **`PATCH /boards/:boardId/columns/reorder`**: Transactionally reorder columns within a board.

---

### 5. Tasks Management & Movement API (`apps/server`)

#### Completed Tasks:
- [x] **`TasksModule` Scaffold**: Controller, Service, DTOs.
- [x] **`POST /columns/:columnId/tasks`**: Create a task inside a column with automatic end placement.
- [x] **`PATCH /tasks/:id`**: Update task details (title, description).
- [x] **`DELETE /tasks/:id`**: Remove a task.
- [x] **`PATCH /tasks/:id/move` (Task Movement API - Core Requirement)**:
  - Payload: `{ targetColumnId: string, newPosition: number }`.
  - **Case 1 (Reorder within same column)**: Adjust ordering of sibling tasks transactionally without collision.
  - **Case 2 (Move across columns)**: Update `columnId` and reindex positions in destination column.
  - **Order Consistency**: Atomic database transaction (`prisma.$transaction`) ensuring stable, conflict-free indices.

---

## PART 2: Frontend (`apps/web`)

### 1. API Client & Authentication State (`apps/web`)

#### Completed Tasks:
- [x] **Design Primitive Setup**: Tailwind CSS v4, Tabler Icons, Radix/shadcn UI components (`button`, `card`, `input`, `dropdown-menu`, etc.).
- [x] **Theme Switcher**: Dark/Light mode provider setup.
- [x] **API Client / Fetch Wrapper (`lib/api.ts`)**:
  - Lightweight `apiFetch` wrapper with automatic JWT Bearer headers and error handling.
- [x] **Auth State Management (`store/auth-store.ts`)**:
  - Zustand auth store with localStorage persistence for `user` and `token`.
  - Login, register, logout functions with session restoration.

---

### 2. Authentication Views (`apps/web`)

#### Completed Tasks:
- [x] **Register Page (`/register`)**:
  - Form validation: Name (optional), Email, Password (min 6 chars).
  - Calls `POST /auth/register`, sets token/user state, and redirects to board view.
- [x] **Login Page (`/login`)**:
  - Form validation: Email, Password.
  - Calls `POST /auth/login`, sets token/user state, and redirects to board view.
- [x] **Navigation Header Integration (`components/header.tsx`)**:
  - Displays authenticated user initials and email when logged in with a "Sign Out" button.
  - Displays "Sign In" and "Register" links when unauthenticated.

---

### 3. Kanban Board View & Drag-and-Drop (`apps/web`)

#### Completed Tasks:
- [x] **Interactive Kanban Board View (`components/board/kanban-board.tsx`)**:
  - Columns layout, board header with sprint indicator, search input, and priority filter chips.
- [x] **Task Card Component (`components/board/task-card.tsx`)**:
  - Clean card with title, description, drag handle, and delete.
- [x] **Board Sharing Modal (`components/board/share-modal.tsx`)**:
  - Member access list, role indicators (Owner vs Collaborator), email invitation bar, and copy link action.
- [x] **Task Details Inspection Modal (`components/board/task-detail-modal.tsx`)**:
  - Task title, description editor, column selector, and delete.
- [x] **Client-Side Drag-and-Drop Reordering**:
  - Native drag-and-drop between columns and reordering with instant optimistic state updates and feedback toasts.
- [x] **Header Component (`components/header.tsx`)**:
  - High-contrast editorial brand lockup with pill geometry, user avatar, and dark/light mode toggle.
- [x] **Live Backend API Integration (`store/board-store.ts`)**:
  - Connected board view to `GET /boards` and `GET /boards/:id` live API.
  - Connected drag-and-drop drop event to `PATCH /tasks/:id/move` backend endpoint.
  - Connected board sharing to `POST /boards/:id/members` and `DELETE /boards/:id/members/:userId` backend endpoints.
  - Connected column and task creations/updates/deletions to live backend endpoints.

---

## PART 3: DevOps & Local Tooling

#### Completed Tasks:
- [x] **Multi-Service Docker Compose** ([docker-compose.yml](file:///d:/programming/assignment/webbriks-technical-assessment/docker-compose.yml)): PostgreSQL, NestJS API, and Next.js frontend with health checks.
- [x] **Server Docker Compose** ([apps/server/docker-compose.yml](file:///d:/programming/assignment/webbriks-technical-assessment/apps/server/docker-compose.yml)): Standalone PostgreSQL database service for local development.
- [x] **Podman CLI Integration**: Custom scripts in `package.json` for starting, stopping, checking status, viewing logs, and dropping the container.
- [x] **Prisma Studio**: `bun db:studio` for visual browser inspection of database tables and records.
- [x] **Type-Safe Environment**: `@webbriks-technical-assessment/env` validating configuration across client and server.

---

## Progress Summary Table

| Area | Feature | Status |
|---|---|---|
| **Database** | Prisma Models (`User`, `Board`, `BoardMember`, `Column`, `Task`) | ✅ **Completed** |
| **Backend** | Auth (`/auth/register`, `/auth/login`, `/auth/me`, JWT Guard) | ✅ **Completed** |
| **Backend** | User Search (`GET /users/search?q=...`) | ✅ **Completed** |
| **Backend** | Boards CRUD & Multi-Tenant Access Control | ✅ **Completed** |
| **Backend** | Board Sharing & Collaborator Members API | ✅ **Completed** |
| **Backend** | Columns CRUD & Column Reordering | ✅ **Completed** |
| **Backend** | Tasks CRUD | ✅ **Completed** |
| **Backend** | Task Movement & Positional Reordering Engine (`prisma.$transaction`) | ✅ **Completed** |
| **Backend** | Swagger OpenAPI Docs (`/api`) | ✅ **Completed** |
| **Frontend** | Base UI primitives & Tailwind v4 | ✅ **Completed** |
| **Frontend** | API Client & Zustand Auth Store | ✅ **Completed** |
| **Frontend** | Login (`/login`) & Register (`/register`) Views | ✅ **Completed** |
| **Frontend** | Interactive Kanban Board View | ✅ **Completed** |
| **Frontend** | Drag-and-Drop Task Movement & Reordering | ✅ **Completed** |
| **Frontend** | Board Sharing Modal | ✅ **Completed** |
| **Frontend** | Live Backend API Integration | ✅ **Completed** |
| **DevOps** | Docker / Podman Orchestration & Prisma Studio | ✅ **Completed** |

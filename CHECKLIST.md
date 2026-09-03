# Technical Assessment Progress & Task Checklist

This checklist tracks the implementation status for the **Webbriks Mini Kanban Board Technical Assessment**, strictly mapped to [Webbriks_Technical_Assessment.md](file:///d:/programming/assignment/webbriks-technical-assessment/Webbriks_Technical_Assessment.md).

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
- [x] **Database Migration/Push Tooling**: Executed `pnpm db:push` to sync PostgreSQL and generated client via `pnpm db:generate`.

#### Remaining Tasks:
- *(All tasks completed)*

---

### 2. Authentication & Authorization (`apps/server`)

#### Completed Tasks:
- [x] **User Registration (`POST /auth/register`)**: Password hashing with `bcryptjs`, email uniqueness validation, JWT issuance.
- [x] **User Login (`POST /auth/login`)**: Credential verification, JWT access token generation.
- [x] **Current User Profile (`GET /auth/me`)**: Protected endpoint with `JwtAuthGuard` and `@CurrentUser()` decorator.
- [x] **JWT Strategy & Module**: `JwtModule` configured with environment secrets and payload verification.

#### Remaining Tasks:
- [ ] **Board Access Guard / Verification Helper**:
  - Reusable guard or service method ensuring the requesting user is either the **Owner** or an **Invited Member** of the board before permitting read/write operations.
  - Reject unauthorized access with `403 Forbidden` or `404 Not Found` to prevent cross-board IDOR disclosures.
- [ ] **Collaborator Search Endpoint (`GET /users/search?email=...`)**:
  - Simple user lookup by email so board owners can find registered users to share boards with.

---

### 3. Board Management & Sharing API (`apps/server`)

#### Completed Tasks:
- *(None yet — Module scaffold pending)*

#### Remaining Tasks:
- [ ] **`BoardsModule` Scaffold**: Controller, Service, DTOs.
- [ ] **`POST /boards`**: Create a new board (assigns authenticated user as `ownerId`).
- [ ] **`GET /boards`**: List all boards accessible by current user (both owned boards and shared boards).
- [ ] **`GET /boards/:id`**: Get a single board with its columns and ordered tasks (restricted to owner and shared members).
- [ ] **`PUT` / `PATCH /boards/:id`**: Update board title / description (owner only).
- [ ] **`DELETE /boards/:id`**: Delete board and its associated columns/tasks (owner only).
- [ ] **`POST /boards/:id/members`**: Share board with another registered user by email / userId.
- [ ] **`GET /boards/:id/members`**: List all members who have access to the board.
- [ ] **`DELETE /boards/:id/members/:userId`**: Revoke access from a member (owner only).

---

### 4. Workflow Columns API (`apps/server`)

#### Completed Tasks:
- *(None yet — Module scaffold pending)*

#### Remaining Tasks:
- [ ] **`ColumnsModule` Scaffold**: Controller, Service, DTOs.
- [ ] **`POST /boards/:boardId/columns`**: Create a new column in a board (e.g., "To Do", "In Progress", "Done") with calculated order index.
- [ ] **`PATCH /columns/:id`**: Rename or update a column.
- [ ] **`DELETE /columns/:id`**: Delete a column and its tasks.
- [ ] **`PATCH /columns/:id/reorder`**: Reorder columns within a board (optional/standard for Kanban).

---

### 5. Tasks Management & Movement API (`apps/server`)

#### Completed Tasks:
- *(None yet — Module scaffold pending)*

#### Remaining Tasks:
- [ ] **`TasksModule` Scaffold**: Controller, Service, DTOs.
- [ ] **`POST /columns/:columnId/tasks`**: Create a task inside a column with automatic ordering placement at the end.
- [ ] **`PATCH /tasks/:id`**: Update task details (title, description).
- [ ] **`DELETE /tasks/:id`**: Remove a task.
- [ ] **`PATCH /tasks/:id/move` (Task Movement API - Core Requirement)**:
  - Payload: `{ targetColumnId: string, newPosition: number }`.
  - **Case 1 (Reorder within same column)**: Adjust ordering of sibling tasks transactionally without collision.
  - **Case 2 (Move across columns)**: Update `columnId` and reindex positions in destination column.
  - **Order Consistency**: Atomic database transaction (`prisma.$transaction`) to ensure stable, conflict-free indices.

---

## PART 2: Frontend (`apps/web`)

### 1. API Client & Authentication State (`apps/web`)

#### Completed Tasks:
- [x] **Design Primitive Setup**: Tailwind CSS v4, Lucide/Tabler Icons, shadcn UI components (`button`, `card`, `input`, `dropdown-menu`, etc.).
- [x] **Theme Switcher**: Dark/Light mode provider setup.

#### Remaining Tasks:
- [ ] **API Client / Fetch Wrapper (`lib/api.ts`)**:
  - Base HTTP fetch utility attaching Bearer JWT token from storage/cookie.
  - Centralized error and response handling.
- [ ] **Auth Context / State Management (`lib/auth-context.tsx`)**:
  - Login, register, logout functions.
  - Persisting auth token and user state (`localStorage` / cookies).
  - Protected route redirection (redirect to `/login` if unauthenticated).

---

### 2. Authentication Views (`apps/web`)

#### Completed Tasks:
- *(None yet — UI pages pending)*

#### Remaining Tasks:
- [ ] **Register Page (`/register`)**:
  - Simple form: Name, Email, Password.
  - Calls `POST /auth/register`, sets auth state, and redirects to boards dashboard.
- [ ] **Login Page (`/login`)**:
  - Simple form: Email, Password.
  - Calls `POST /auth/login`, sets auth state, and redirects to boards dashboard.
- [ ] **Navigation Header Integration**:
  - Display current user name/email, logout button, or login/register links.

---

### 3. Board Management & Dashboard (`apps/web`)

#### Completed Tasks:
- *(None yet — UI pages pending)*

#### Remaining Tasks:
- [ ] **Boards Dashboard (`/boards` or `/`)**:
  - Grid/list of boards owned by user and shared with user.
  - "Create New Board" button and simple modal/form.
  - Quick action to delete or open each board.
- [ ] **Board Sharing Modal (`components/board/share-modal.tsx`)**:
  - List current board members.
  - Input field to invite/share board with a user via email.
  - Revoke member access button (visible to owner).

---

### 4. Kanban Board View & Drag-and-Drop (`apps/web`)

#### Completed Tasks:
- *(None yet — UI components pending)*

#### Completed Tasks:
- [x] **Interactive Kanban Board View (`components/board/kanban-board.tsx`)**:
  - Columns layout, board header with sprint indicator, search input, and priority filter chips.
- [x] **Task Card Component (`components/board/task-card.tsx`)**:
  - Pill badges, priority signaling (CRITICAL/HIGH/MEDIUM/LOW), subtasks progress, comments count, and assignee pill.
- [x] **Board Sharing Modal (`components/board/share-modal.tsx`)**:
  - Member access list, role indicators (Owner vs Collaborator), email invitation bar, and copy link action.
- [x] **Task Details Inspection Modal (`components/board/task-detail-modal.tsx`)**:
  - Full task description, priority editor, column mover, and checklist progress.
- [x] **Client-Side Drag-and-Drop Reordering**:
  - Native drag-and-drop between columns and reordering with instant optimistic state updates and feedback toasts.
- [x] **Header Component (`components/header.tsx`)**:
  - High-contrast editorial brand lockup with pill geometry, sprint label, and dark/light mode toggle.

#### Remaining Tasks (for full backend integration):
- [ ] Connect board view to `GET /boards/:id` live API.
- [ ] Connect drag-and-drop drop event to `PATCH /tasks/:id/move` backend endpoint.
- [ ] Connect board sharing to `POST /boards/:id/members` backend endpoint.

---

## Progress Summary Table

| Area | Feature | Status |
|---|---|---|
| **Backend** | Auth (Register, Login, Me) | **Completed** |
| **Backend** | Prisma Models (Board, Member, Column, Task) | **Completed** |
| **Backend** | Boards CRUD & Access Control | **Pending** |
| **Backend** | Board Sharing & Members API | **Pending** |
| **Backend** | Columns CRUD | **Pending** |
| **Backend** | Tasks CRUD | **Pending** |
| **Backend** | Task Movement & Reordering API | **Pending** |
| **Frontend** | Base UI primitives & Tailwind v4 | **Completed** |
| **Frontend** | Interactive Kanban Board View | **Completed (Static)** |
| **Frontend** | Drag-and-Drop Task Movement & Reordering | **Completed (Client-side)** |
| **Frontend** | Board Sharing Dialog | **Completed (Static)** |
| **Frontend** | API Client & Auth Provider | **Pending** |
| **Frontend** | Login & Register Pages | **Pending** |
| **Frontend** | Boards Dashboard & Create Board | **Pending** |

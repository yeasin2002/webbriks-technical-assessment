# Mini Kanban Board

A full-stack collaborative Kanban board application built for the **Webbriks Technical Assessment**.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/Radix UI
- **Backend**: NestJS 11 (Express 5, TypeScript)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Monorepo & DevOps**: Turborepo, Bun, Docker Compose

---

## Project Structure

```text
webbriks-technical-assessment/
├── apps/
│   ├── web/        # Next.js frontend (Port 3001)
│   └── server/     # NestJS backend API (Port 3000)
├── packages/
│   ├── db/         # Prisma schema and database client
│   ├── env/        # Type-safe environment schemas
│   └── config/     # Shared TypeScript configurations
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.3+)
- [Docker](https://www.docker.com/) (for PostgreSQL / containerized workflow)

### 1. Installation
```sh
bun install
```

### 2. Environment Configuration

**Backend (`apps/server/.env`)**:
```env
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webbriks-technical-assessment
```

**Frontend (`apps/web/.env`)**:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Database Setup
Start the local PostgreSQL container and push the schema:
```sh
docker compose up -d db
bun db:push
```

### 4. Run Development Servers
```sh
bun dev
```
- **Web App**: [http://localhost:3001](http://localhost:3001)
- **API Server**: [http://localhost:3000](http://localhost:3000)

---

## Docker Setup (All-in-One)

To run the full stack (database, backend, and frontend) in Docker containers:
```sh
docker compose up --build
```

---

## Useful Commands

| Command | Description |
|---|---|
| `bun dev` | Run all applications concurrently |
| `bun dev:web` | Run only the Next.js frontend |
| `bun dev:server` | Run only the NestJS backend |
| `bun check-types` | Run type checking across workspaces |
| `bun build` | Build all apps for production |
| `bun db:push` | Push schema changes to database |
| `bun db:studio` | Open Prisma Studio UI |

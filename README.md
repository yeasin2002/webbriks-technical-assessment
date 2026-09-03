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
- [Podman](https://podman.io/) or [Docker](https://www.docker.com/) (for containerized PostgreSQL)

### 1. Installation
```sh
bun install
```

### 2. Environment Configuration

**Backend (`apps/server/.env`)**:
```env
CORS_ORIGIN=http://localhost:3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/webbriks-technical-assessment
```

**Frontend (`apps/web/.env`)**:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Database Setup (Podman / Docker)
Start the local PostgreSQL container and push the schema:
```sh
bun db:start
bun db:push
```

### 4. Run Development Servers
```sh
bun dev
```
- **Web App**: [http://localhost:3001](http://localhost:3001)
- **API Server & Swagger**: [http://localhost:3000](http://localhost:3000) (Swagger UI: [http://localhost:3000/api](http://localhost:3000/api))

---

## Database Management & Inspection

To visually inspect and manage users and database records in your browser:
```sh
bun db:studio
```

---

## Useful Commands

| Command | Description |
|---|---|
| `bun dev` | Run all applications concurrently |
| `bun dev:web` | Run only the Next.js frontend |
| `bun dev:server` | Run only the NestJS backend |
| `bun db:start` | Start local PostgreSQL container (Podman/Docker) |
| `bun db:stop` | Stop PostgreSQL container |
| `bun db:status` | Check PostgreSQL container status |
| `bun db:logs` | View PostgreSQL container logs |
| `bun db:studio` | Open Prisma Studio UI to inspect users & records |
| `bun db:push` | Push schema changes directly to PostgreSQL |
| `bun db:generate` | Generate Prisma client types |
| `bun check-types` | Run type checking across all workspaces |
| `bun build` | Build all apps for production |

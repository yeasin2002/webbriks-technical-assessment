# Mini Kanban Board

A full-stack collaborative Kanban board application built for the **Webbriks Technical Assessment**.


## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/Radix UI, @tanstack/react-query
- **Backend**: NestJS 11 (Express 5, TypeScript)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Monorepo & DevOps**: Turborepo, pnpm, Docker Compose

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
- [pnpm](https://pnpm.io/) (v11+) and [Node.js](https://nodejs.org/) (v20+)
- [Podman](https://podman.io/) or [Docker](https://www.docker.com/) (for containerized PostgreSQL)

### 1. Installation
```sh
pnpm install
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
pnpm db:start
pnpm db:push
```

### 4. Run Development Servers
```sh
pnpm dev
```
- **Web App**: [http://localhost:3001](http://localhost:3001)
- **API Server & Swagger**: [http://localhost:3000](http://localhost:3000) (Swagger UI: [http://localhost:3000/api](http://localhost:3000/api))

---

## Database Management & Inspection

To visually inspect and manage users and database records in your browser:
```sh
pnpm db:studio
```

---

## Useful Commands

| Command | Description |
|---|---|
| `pnpm dev` | Run all applications concurrently |
| `pnpm dev:web` | Run only the Next.js frontend |
| `pnpm dev:server` | Run only the NestJS backend |
| `pnpm db:start` | Start local PostgreSQL container (Podman/Docker) |
| `pnpm db:stop` | Stop PostgreSQL container |
| `pnpm db:status` | Check PostgreSQL container status |
| `pnpm db:logs` | View PostgreSQL container logs |
| `pnpm db:studio` | Open Prisma Studio UI to inspect users & records |
| `pnpm db:push` | Push schema changes directly to PostgreSQL |
| `pnpm db:generate` | Generate Prisma client types |
| `pnpm check-types` | Run type checking across all workspaces |
| `pnpm build` | Build all apps for production |

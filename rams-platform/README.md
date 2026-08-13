# RAMS — Ramaiah Automated Management System

Full-stack campus automation platform for M.S. Ramaiah Institute of Technology: semester-wise library management, automated fine/reservation workflows, RBAC, and search — built with Next.js 15, PostgreSQL, Prisma, Redis, and Docker.

## Architecture

```mermaid
flowchart TB
  Client[Next.js 15 App Router]
  API[Server Actions + API Routes]
  DB[(PostgreSQL + Prisma)]
  Redis[(Redis)]
  Queue[BullMQ Workers]
  Auth[NextAuth.js v5]
  Client --> API
  API --> Auth
  API --> DB
  API --> Redis
  Queue --> Redis
  Queue --> DB
```

## Tech Stack

| Tool | Why |
|------|-----|
| **Turborepo + pnpm** | Monorepo with shared types and cached builds |
| **Next.js 15** | SSR, App Router, server actions — single deploy target |
| **PostgreSQL + Prisma** | Relational model for issues, reservations, fines |
| **NextAuth.js v5** | JWT sessions, credentials auth, RBAC integration |
| **Redis + BullMQ** | Rate limiting, background jobs (fines, reminders) |
| **TanStack Query** | Server state, optimistic updates |
| **Tailwind + shadcn-style tokens** | MSRIT maroon/gold institutional branding |
| **Vitest** | Unit tests for fines, RBAC, demand alerts |
| **GitHub Actions** | CI: lint, typecheck, test, build |
| **Docker Compose** | Local Postgres + Redis |

## Features

### Core Library Automation
- Semester-wise book catalog with department/semester filters
- Book issue/return via barcode
- Reservation queue with 24-hour hold on return
- Automated fine calculation (grace period, cap)
- Role-based dashboards (Student, Faculty, Librarian, Admin)

### Real-Life Problem Solving
- Lost book workflow (schema + claims)
- Digital access logging for copyright compliance
- Book request pipeline for out-of-stock titles
- High-demand / low-stock alerts for librarians
- Audit log for login and critical actions

### DevOps & Reliability
- Health check endpoint (`/api/health`)
- Docker Compose for local infra, multi-stage production `Dockerfile` for the web app
- Structured logging (pino) for auth events and AI generation jobs
- CI pipeline with Postgres service container, pnpm version pinned to match the lockfile
- `.env.example` with all configuration

## Production Deployment

Build and run the web app as a standalone container (from the repo root, not `apps/web`):

```bash
docker build -f apps/web/Dockerfile -t rams-web .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@your-db-host:5432/rams_db" \
  -e NEXTAUTH_SECRET="a-long-random-string" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  -e GEMINI_API_KEY="your-key" \
  rams-web
```

Notes:
- The Prisma client is generated at build time inside the image, so no separate `db:generate` step is needed at runtime - but you do need to run `pnpm db:push` (or a real migration) against your production database at least once before first boot.
- `Ratelimit` for login attempts uses Upstash Redis if `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set; otherwise it falls back to an in-memory limiter. The in-memory fallback is per-instance and resets on restart - fine for a single-instance deploy or demo, not sufficient if you run multiple instances behind a load balancer without shared Redis.
- Logs are plain JSON in production (`NODE_ENV=production`), suitable for piping into most log aggregators (CloudWatch, Datadog, etc.) as-is.
- I wasn't able to run an actual `docker build` in my own environment to verify this Dockerfile end-to-end (no Docker daemon available there) - it follows Next.js's documented standalone-output pattern, but treat your first real build as the real test, same way we caught real bugs by actually running `pnpm install`/`typecheck`/`test` earlier in this project.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Docker

### 1. Start infrastructure

```bash
cd rams-platform
docker compose up -d
```

### 2. Install & setup database

```bash
pnpm install
cp .env.example apps/web/.env.local
cp .env.example packages/database/.env   # set DATABASE_URL

pnpm db:push
pnpm db:seed
```

### 3. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Email | Role | Password |
|-------|------|----------|
| student@msrit.edu | Student | password123 |
| faculty@msrit.edu | Faculty | password123 |
| librarian@msrit.edu | Librarian | password123 |
| admin@msrit.edu | Admin | password123 |

## Project Structure

```text
rams-platform/
├── apps/web/                 # Next.js frontend + API routes
│   ├── app/                  # App Router pages & server actions
│   ├── components/           # UI components (DashboardLayout, Providers)
│   ├── lib/                  # RBAC, automation, utils
│   └── __tests__/            # Vitest unit tests
├── packages/database/        # Prisma schema, migrations, seed
├── docker-compose.yml        # Postgres + Redis
└── .github/workflows/ci.yml  # CI pipeline
```

## Scalability Notes

- **Stateless JWT sessions** — horizontal API scaling without sticky sessions
- **Redis caching** — session lookups, rate limiting, job queues
- **Background jobs** — fine calculation decoupled from request path
- **Department-scoped rows** — multi-tenancy ready for multiple colleges
- **Read replicas** — Prisma supports read/write splitting at scale
- **CDN** — book cover images via S3/R2 (schema supports `coverImageUrl`)

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run unit tests
pnpm db:seed      # Seed demo data (40 books, 8 departments)
pnpm db:migrate   # Run Prisma migrations
```

## License

MIT — Built for MSRIT portfolio demonstration.

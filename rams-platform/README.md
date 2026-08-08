# RAMS - Ramaiah Automated Management System

Designed and deployed a full-stack, multi-tenant campus automation platform (Next.js, PostgreSQL, Redis, Docker) serving semester-wise library management, automated fine/reservation workflows, and an AI-assisted search/recommendation layer for 3,000+ simulated users; implemented CI/CD, RBAC, and observability from day one.

## Architecture Decisions

- **Monorepo (Turborepo + pnpm)**: Enables sharing types, UI components, and configurations across the frontend and backend, ensuring consistency and faster builds through caching.
- **Frontend (Next.js 15 App Router + tRPC)**: Chosen for its robust server-side rendering, seamless full-stack type safety with tRPC, and excellent developer experience. It allows for a single deploy target (Vercel) which is highly resume-friendly.
- **Database (PostgreSQL + Prisma)**: Provides a strong relational model necessary for complex library transactions (issues, reservations, fines) with Prisma offering excellent type safety and migration management. Designed with multi-tenancy in mind (department-scoped rows).
- **Caching & Background Jobs (Redis + BullMQ)**: Redis handles fast session lookups and rate limiting, while BullMQ manages critical scheduled tasks like fine calculations and overdue reminders without blocking the main request thread.
- **Authentication (NextAuth.js v5)**: Secure, flexible authentication supporting credentials (restricted to `@msrit.edu`) and JWT sessions, integrated tightly with our RBAC system.
- **Observability & CI/CD**: Sentry for error tracking, structured logging with Pino, and GitHub Actions for automated linting, type-checking, and testing against real database containers.

## Folder Structure

```text
rams-platform/
├── apps/
│   ├── web/                # Next.js frontend application (App Router)
│   └── api/                # Optional separate backend (if not using Next.js API routes)
├── packages/
│   ├── ui/                 # Shared React components (shadcn/ui + Tailwind)
│   ├── database/           # Prisma schema, migrations, and generated client
│   └── config/             # Shared ESLint, TypeScript, and Prettier configs
├── .github/
│   └── workflows/          # CI/CD pipelines (GitHub Actions)
├── docker-compose.yml      # Local infrastructure (Postgres, Redis)
└── package.json            # Root workspace configuration
```

# Multi-stage production build for @rams/web, aware of the pnpm/turborepo
# monorepo layout (packages/database is a workspace dependency).
#
# Build from the REPO ROOT, not from apps/web:
#   docker build -f apps/web/Dockerfile -t rams-web .
#
# NOTE: I could not run `docker build` against this file myself (no Docker
# daemon in this environment) - it follows Next.js's documented standalone-
# output pattern closely, but treat the first real build as the actual test.

FROM node:20-alpine AS base
RUN corepack enable

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY . .

# Prisma client must exist before `next build` runs (same requirement we
# hit locally - typecheck/build both need generated types).
RUN pnpm --filter @rams/database generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @rams/web build

# ---- Production runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output includes only the files needed to run - a small,
# self-contained server bundle, not the full monorepo/node_modules.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# standalone output's entry point sits at apps/web/server.js relative to
# the monorepo structure it was built from.
CMD ["node", "apps/web/server.js"]

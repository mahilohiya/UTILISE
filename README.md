# UTILISE

This repository is organized by product stage.

## Active product

The live application is in [rams-platform](rams-platform/).

It contains the full campus automation platform built with:
- Next.js 15
- Prisma + PostgreSQL
- NextAuth
- Redis / BullMQ
- Docker Compose
- RBAC + library workflows

See [rams-platform/README.md](rams-platform/README.md) for the full project overview and setup instructions.

## Archived legacy app

The older Java Swing project has been moved into [archive/legacy-java-app](archive/legacy-java-app/).

This includes the earlier desktop library app and related assets, and is kept for reference only.

## Repository structure

```text
UTILISE/
├── rams-platform/                 # Active app (production-focused project)
├── archive/
│   └── legacy-java-app/          # Older desktop Java project kept for history
├── README.md                     # This overview file
└── .gitignore                    # Ignore rules for generated files
```

## Recommended workflow

- Use [rams-platform](rams-platform/) for active development
- Keep archived materials under [archive/legacy-java-app](archive/legacy-java-app/)
- Keep the main branch as the clean production-ready branch

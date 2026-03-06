# Pulse — Emmabyte Observability Platform

## Project Overview

Pulse is a standalone observability service that aggregates logs and events from MailerSend, Vercel, PlanetScale, and the Emmabyte SvelteKit application. It provides a centralized admin dashboard for querying, filtering, and alerting on events across the stack.

## Tech Stack

- **Framework**: SvelteKit (Svelte 5) with adapter-node
- **Database**: PostgreSQL (Docker container)
- **ORM**: Prisma
- **Auth**: better-auth (email/password)
- **UI**: shadcn-svelte + Tailwind CSS
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deployment**: Docker + docker-compose on VM, Cloudflare Tunnel for public API
- **CI/CD**: GitHub Actions
- **Package manager**: pnpm (mandatory — do not use npm or yarn)

## Commands

```bash
pnpm dev              # Start dev server (port 5173)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm check            # Type checking
pnpm test             # Run unit tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run Playwright e2e tests
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database (dev)
pnpm db:migrate       # Create and run migrations (dev)
pnpm db:migrate:deploy # Run migrations (production)
pnpm db:studio        # Open Prisma Studio
```

## Project Structure

```
src/
├── app.html, app.css, app.d.ts   # App shell and global styles
├── hooks.server.ts                # Auth session middleware
├── lib/
│   ├── auth-client.ts             # Client-side auth
│   ├── utils.ts                   # Utility functions (cn, formatDate, severityColor)
│   ├── server/
│   │   ├── auth.ts                # better-auth server config
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── events.ts              # Event ingestion functions (ingestEvent, ingestBatch)
│   │   └── webhooks/
│   │       ├── mailersend.ts      # MailerSend webhook processing
│   │       └── vercel.ts          # Vercel log drain processing
│   └── components/ui/             # shadcn-svelte components (added via CLI)
├── routes/
│   ├── api/
│   │   ├── auth/[...all]/         # better-auth catch-all handler
│   │   ├── health/                # Health check endpoint
│   │   ├── ingest/                # Public event ingestion API
│   │   └── webhooks/
│   │       ├── mailersend/        # MailerSend webhook endpoint
│   │       └── vercel/            # Vercel log drain endpoint
│   ├── login/                     # Login page
│   └── admin/
│       ├── +page                  # Dashboard (stats + latest events)
│       ├── events/                # Event browser with search/filter
│       ├── alerts/                # Alert rule management (CRUD)
│       └── settings/              # Webhook endpoint reference
```

## Conventions

- **Never commit to main** — all work on feature branches
- **Commit style**: Conventional Commits
- **Env vars**: Never use fallback defaults in production — all must be explicitly set
- **Prisma**: Always run `pnpm db:generate` after schema changes
- **Docker**: Use `docker compose up -d` for local development with PostgreSQL

## Key API Endpoints

| Endpoint                    | Method | Auth     | Purpose                          |
| --------------------------- | ------ | -------- | -------------------------------- |
| `/api/health`               | GET    | None     | Health check                     |
| `/api/ingest`               | POST   | API Key  | External event ingestion         |
| `/api/webhooks/mailersend`  | POST   | Webhook  | MailerSend webhook receiver      |
| `/api/webhooks/vercel`      | GET/POST | Webhook | Vercel log drain receiver       |
| `/api/auth/*`               | ALL    | None     | better-auth endpoints            |

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth signing secret
- `MAILERSEND_WEBHOOK_SECRET` — Webhook signature verification
- `VERCEL_WEBHOOK_SECRET` — Log drain verification

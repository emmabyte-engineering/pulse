# Pulse — Emmabyte Observability Platform

Pulse is a standalone observability service that aggregates logs and events from MailerSend, Vercel, PlanetScale, and the Emmabyte SvelteKit application.

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm
- Docker & Docker Compose

### Local Development

```bash
# Start PostgreSQL
docker compose up db -d

# Install dependencies
pnpm install

# Generate Prisma client and push schema
pnpm db:generate
pnpm db:push

# Copy env file
cp .env.example .env

# Start dev server
pnpm dev
```

The app runs at `http://localhost:5173`.

### Production Deployment

```bash
# Build and start all services
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
```

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  MailerSend  │     │    Vercel    │     │ emmabyte.io  │
│  (webhooks)  │     │ (log drain)  │     │  (API calls) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                     Pulse (SvelteKit)                   │
│                                                         │
│  /api/webhooks/mailersend  ← MailerSend events          │
│  /api/webhooks/vercel      ← Vercel log drain           │
│  /api/ingest               ← Generic event ingestion    │
│  /api/health               ← Health check               │
│                                                         │
│  /admin                    ← Dashboard                  │
│  /admin/events             ← Event browser              │
│  /admin/alerts             ← Alert management           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  PostgreSQL   │
              │  (Docker)     │
              └───────────────┘
```

## Networking

In production, the app runs on port 3000 inside Docker. A Cloudflare Tunnel exposes the API endpoints publicly so external services (MailerSend, Vercel) can deliver webhooks.

See [deployment.md](./deployment.md) for full setup instructions.

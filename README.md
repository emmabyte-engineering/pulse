# Pulse

[![CI](https://github.com/emmabyte-engineering/pulse/actions/workflows/ci.yml/badge.svg)](https://github.com/emmabyte-engineering/pulse/actions/workflows/ci.yml)

Open source observability platform for aggregating logs, events, and metrics from your entire stack.

Pulse collects events from MailerSend, Vercel, PlanetScale, and your application code into a single dashboard with search, filtering, and alerting.

## Quick Start

### Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/emmabyte/pulse.git
cd pulse

# Configure environment
cp .env.example .env
# Edit .env — at minimum set BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)

# Start Pulse
docker compose up -d
```

Pulse will be available at `http://localhost:3000`.

### From source

```bash
# Prerequisites: Node.js 22+, pnpm, PostgreSQL

pnpm install
docker compose -f docker-compose.dev.yml up -d  # PostgreSQL
cp .env.example .env                              # Configure env vars
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev
```

Dev server runs at `http://localhost:5173`.

## Features

- **Multi-source ingestion** — Webhooks for MailerSend and Vercel, REST API for everything else
- **Org-scoped API keys** — Structured `pk_<keyId>.<secret>` format with granular permissions
- **Event browser** — Search, filter by source/severity/time, full-text search
- **Alert rules** — Threshold, rate, and occurrence-based alerts with email and Slack notifications
- **Multi-tenant** — Organizations with role-based membership
- **Self-hostable** — Single Docker image, PostgreSQL, no external dependencies

## Architecture

| Component     | Technology                        |
| ------------- | --------------------------------- |
| Framework     | SvelteKit (Svelte 5)              |
| Database      | PostgreSQL                        |
| ORM           | Prisma                            |
| Auth          | better-auth (email/password, OAuth) |
| UI            | shadcn-svelte + Tailwind CSS      |
| Runtime       | Node.js via adapter-node          |

## Docker Images

Images are published on every push to `main`:

```bash
# GitHub Container Registry (recommended)
docker pull ghcr.io/emmabyte/pulse:latest

# Docker Hub
docker pull emmabyteeng/pulse:latest
```

## API

Send events to the org-scoped ingest endpoint:

```bash
curl -X POST https://your-pulse-instance/api/v1/{org-slug}/ingest \
  -H "Authorization: Bearer pk_XXXX.XXXX..." \
  -H "Content-Type: application/json" \
  -d '{"source": "APP", "eventType": "user.signup", "severity": "INFO"}'
```

Full API documentation is available at `/docs` on your Pulse instance.

## Configuration

See [`.env.example`](./.env.example) for all configuration options. Key variables:

| Variable             | Required | Description                     |
| -------------------- | -------- | ------------------------------- |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string    |
| `BETTER_AUTH_SECRET` | Yes      | Auth signing secret             |
| `BETTER_AUTH_URL`    | Yes      | Public URL of your instance     |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

[AGPL-3.0](./LICENSE)

---

Built by [Emmabyte](https://emmabyte.io)

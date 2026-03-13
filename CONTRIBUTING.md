# Contributing to Pulse

Thanks for your interest in contributing to Pulse! This guide covers how to get set up and submit changes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) (mandatory — do not use npm or yarn)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/emmabyte/pulse.git
cd pulse

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# Copy env file and fill in values
cp .env.example .env

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate:deploy

# Start the dev server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Running with Docker

```bash
# Build and run the full stack
docker compose up -d
```

## Development Workflow

1. **Create a branch** — all work happens on feature branches, never commit directly to `main`.
2. **Make your changes** — follow the conventions below.
3. **Run checks** — `pnpm check` for types, `pnpm test` for unit tests, `pnpm test:e2e` for end-to-end tests.
4. **Open a PR** — describe what changed and why.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm check            # Type checking
pnpm test             # Unit tests (Vitest)
pnpm test:e2e         # E2E tests (Playwright)
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Create migration (dev)
pnpm db:migrate:deploy # Run migrations (production)
pnpm db:studio        # Open Prisma Studio
```

## Conventions

- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.)
- **Package manager**: pnpm only
- **Env vars**: Never use fallback defaults in production code — all must be explicitly set
- **Prisma**: Run `pnpm db:generate` after any schema changes

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for a full overview of the tech stack, project structure, and key API endpoints.

## Reporting Issues

Open an issue on GitHub with:
- A clear title and description
- Steps to reproduce (if it's a bug)
- Expected vs actual behavior
- Your environment (OS, Node version, Docker version)

## License

By contributing, you agree that your contributions will be licensed under the [AGPL-3.0](./LICENSE) license.

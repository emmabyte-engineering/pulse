# Build stage
FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .

# Prisma 7 config requires DATABASE_URL; better-auth requires its secret at build time
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG BETTER_AUTH_SECRET=build-time-placeholder
ARG BETTER_AUTH_URL=http://localhost:3000
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL

RUN npx svelte-kit sync
RUN pnpm db:generate
RUN pnpm build

# Production dependencies only — then prune packages not needed at runtime
RUN pnpm install --frozen-lockfile --prod \
    && rm -rf node_modules/.pnpm/@prisma+dev@* \
    && rm -rf node_modules/.pnpm/hono@* \
    && rm -rf node_modules/.pnpm/@hono+node-server@* \
    && rm -rf node_modules/.pnpm/glob@10.* \
    && rm -rf node_modules/.pnpm/minimatch@9.*

# Production stage
FROM node:22-slim AS production

RUN apt-get update && apt-get install -y openssl wget netcat-openbsd && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

RUN groupadd --gid 1001 pulse && useradd --uid 1001 --gid pulse --shell /bin/sh --create-home pulse

WORKDIR /app

COPY --from=builder --chown=pulse:pulse /app/node_modules ./node_modules
COPY --from=builder --chown=pulse:pulse /app/build ./build
COPY --from=builder --chown=pulse:pulse /app/prisma ./prisma
COPY --from=builder --chown=pulse:pulse /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=pulse:pulse /app/package.json ./package.json
COPY --from=builder --chown=pulse:pulse /app/src/lib/generated ./src/lib/generated

COPY --chown=pulse:pulse docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

RUN mkdir -p /app/data && chown pulse:pulse /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/pulse.db
ENV DB_HOST=db
ENV DB_PORT=5432

VOLUME /app/data

EXPOSE 3000

USER pulse

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]

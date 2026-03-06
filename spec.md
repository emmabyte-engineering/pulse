# Emmabyte Observability Platform — Project Spec

## Problem

We have near-zero visibility into email deliverability, application errors, database performance, and cross-system events. Our MailerSend dashboard shows an 89% bounce rate over the past week (38 emails sent), and we had no logging on our side to debug which emails bounced, why, or what code paths triggered them. Our domain reputation is currently "Healthy" but at serious risk.

We need a centralized observability and audit database that ingests event streams from all of our infrastructure providers, giving us a single place to query, alert on, and investigate issues across the stack.

## Goal

Build a standalone observability service that aggregates logs and events from:

1. **MailerSend** — email sends, deliveries, bounces, complaints, opens, clicks
2. **Vercel** — application logs (function invocations, errors, cold starts)
3. **PlanetScale** — query insights, slow queries, branch operations
4. **Our SvelteKit application** — email audit events, auth events, API errors

## Current Infrastructure

| Component             | Service        | Details                                                      |
| --------------------- | -------------- | ------------------------------------------------------------ |
| Application           | SvelteKit      | Deployed on Vercel (adapter-vercel)                          |
| Database              | PlanetScale    | MySQL via Prisma ORM, org: `emmabyte-engineering`, db: `emmabyte-io` |
| Email (transactional) | MailerSend     | Starter plan, domain: `emmabyte.io`, sender: `noreply@emmabyte.io` |
| Auth                  | better-auth    | Email/password, OAuth (Google, GitHub), magic links          |
| Package manager       | pnpm           | Required — do not use npm/yarn                               |
| CI/CD                 | GitHub Actions | Test on PR, deploy on merge to main                          |

### Current Audit Logging (app-level only)

We have an existing `AuditLog` table in PlanetScale used for compliance (SOC 2, GDPR). Schema:

- `id`, `userId`, `actorName`, `actorEmail`, `action` (enum), `resourceType`, `resourceId`
- `timestamp`, `ipAddress`, `userAgent`, `success`, `errorMessage`
- `organizationId`, `metadata` (JSON), `complianceFlags`, `retainUntil`
- 7-year default retention

This table has **no email-related actions** currently. The `AuditAction` enum includes auth, data access, admin, CMS, and pipeline events but nothing for email sends/bounces/blocks.

### Current Email Architecture

- `src/lib/server/email.ts` — all transactional email functions, uses MailerSend SDK
- `src/lib/server/auth.ts` — auth-related emails (verification, password reset, magic links), has its own duplicate `sendTemplateEmail`
- `verifyEmailDeliverability()` — pre-send check using MailerSend's verification API
- No logging of send attempts, successes, failures, or bounces
- No webhook ingestion from MailerSend

### Cron Jobs (already on Vercel)

- `/api/cron/sync-mercury-invoices` — Mercury banking sync
- `/api/cron/lead-follow-ups` — Sales pipeline follow-ups
- `/api/cron/cleanup-images` — Cloudflare Images cleanup
- `/api/cron/publish-scheduled-posts` — Scheduled blog posts

## Data Sources & Integration Points

### 1. MailerSend Webhooks

MailerSend can send webhook events for:

- `activity.sent` — email accepted by recipient's mail server
- `activity.delivered` — confirmed delivery
- `activity.soft_bounced` — temporary delivery failure
- `activity.hard_bounced` — permanent delivery failure (critical for reputation)
- `activity.spam_complaint` — recipient marked as spam (critical)
- `activity.opened`, `activity.clicked` — engagement tracking
- `activity.unsubscribed`

**Integration**: Create a webhook endpoint in our app (e.g., `/api/webhooks/mailersend`) that receives these events and writes them to the observability store. MailerSend webhooks include a signing secret for verification.

**Priority events for alerting**: `hard_bounced`, `spam_complaint`

### 2. Vercel Log Drains

Vercel supports log drains that forward all runtime logs to an external endpoint. Supported formats:

- JSON (recommended)
- NDJSON
- Syslog

Log drain types:

- **Runtime logs** — `console.log`/`console.error` from serverless functions
- **Build logs** — build output
- **Edge logs** — edge function execution
- **Static logs** — static file access
- **External logs** — third-party integrations

**Integration**: Configure a Vercel log drain pointing to our observability service. Vercel sends batched log events via HTTP POST with a verification header (`x-vercel-verify`).

### 3. PlanetScale Query Insights

PlanetScale provides:

- Query insights dashboard (slow queries, most frequent queries)
- Branch operation logs
- Audit log (available on certain plans)

**Integration**: PlanetScale doesn't have native webhook support. Options:

- Poll the PlanetScale API periodically (via cron)
- Use PlanetScale's Boost/Insights API if available on our plan
- For now, manual review may be sufficient — focus automation on MailerSend and Vercel first

### 4. Application-Level Email Audit Events

Add structured logging from our email functions. Every call to `sendTemplateEmail` and `sendEmail` should emit an event with:

- `recipient`, `subject`, `templateId`
- `status`: `sent`, `blocked`, `skipped_test_mode`, `error`
- `blockReason` (if deliverability check failed)
- `triggerFunction` (which email function initiated the send)
- `userId` / `organizationId` (if available in context)
- `timestamp`

## Architecture Options

### Option A: Dedicated Database + Ingestion Endpoints (Recommended)

Create a separate PlanetScale database (or a separate schema) specifically for observability data. This keeps the high-volume event data isolated from the production application database.

- **Ingestion endpoints**: SvelteKit API routes that receive webhooks and log drains
- **Storage**: Dedicated PlanetScale database with time-series-optimized tables
- **Retention**: Configurable per source (e.g., 90 days for Vercel logs, 1 year for email events, 7 years for compliance audit events)
- **Querying**: Admin dashboard page(s) for searching and filtering events

### Option B: External Observability Platform

Use a purpose-built platform like Tinybird, Axiom, or Datadog that's designed for log ingestion and querying at scale. We'd still need webhook endpoints in our app to forward events.

- Pro: Purpose-built for this, better query performance at scale, built-in alerting
- Con: Additional vendor dependency and cost, data lives outside our control

### Option C: Hybrid

Store critical audit events (email bounces, compliance logs) in our own database for retention/compliance, but forward all logs to an external platform for real-time querying and alerting.

## Suggested Schema (Option A)

```sql
-- Core event table (partitioned by source)
CREATE TABLE observability_event (
  id VARCHAR(36) PRIMARY KEY,
  source ENUM('MAILERSEND', 'VERCEL', 'PLANETSCALE', 'APP') NOT NULL,
  event_type VARCHAR(100) NOT NULL,  -- e.g., 'email.hard_bounced', 'function.error', 'email.sent'
  severity ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL') DEFAULT 'INFO',
  timestamp DATETIME(3) NOT NULL,

  -- Context
  user_id VARCHAR(36),
  organization_id VARCHAR(36),
  email_address VARCHAR(255),        -- For email events

  -- Payload
  summary VARCHAR(500),              -- Human-readable summary
  metadata JSON,                     -- Full event payload from the source

  -- Source-specific IDs for deduplication
  external_id VARCHAR(255),          -- MailerSend message ID, Vercel request ID, etc.

  -- Retention
  retain_until DATETIME,

  INDEX idx_source_type (source, event_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_email (email_address),
  INDEX idx_severity (severity),
  INDEX idx_user (user_id),
  INDEX idx_external (external_id)
);

-- Aggregated metrics (populated by cron or on-write)
CREATE TABLE observability_metric (
  id VARCHAR(36) PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,  -- e.g., 'email.bounce_rate', 'email.send_count'
  source ENUM('MAILERSEND', 'VERCEL', 'PLANETSCALE', 'APP') NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  metadata JSON,

  INDEX idx_metric_period (metric_name, period_start),
  INDEX idx_source_period (source, period_start)
);

-- Alert rules and history
CREATE TABLE observability_alert (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source ENUM('MAILERSEND', 'VERCEL', 'PLANETSCALE', 'APP') NOT NULL,
  event_type VARCHAR(100),
  condition_type ENUM('THRESHOLD', 'RATE', 'OCCURRENCE') NOT NULL,
  condition_value DECIMAL(10,4) NOT NULL,   -- e.g., bounce rate > 0.05
  window_minutes INT DEFAULT 60,
  enabled BOOLEAN DEFAULT TRUE,
  notify_email VARCHAR(255),
  notify_slack_webhook VARCHAR(500),
  last_triggered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Alerting Rules (Day 1)

| Alert                | Condition                                               | Action                   |
| -------------------- | ------------------------------------------------------- | ------------------------ |
| Hard bounce detected | Any `email.hard_bounced` event                          | Notify admin immediately |
| Spam complaint       | Any `email.spam_complaint` event                        | Notify admin immediately |
| Bounce rate spike    | Bounce rate > 5% in rolling 1-hour window               | Notify admin             |
| Function error spike | > 10 function errors in 5 minutes                       | Notify admin             |
| Email blocked        | Any `email.blocked` event (deliverability check failed) | Log for review           |

## Implementation Priority

1. **MailerSend webhook ingestion** — highest priority, directly addresses the bounce rate visibility gap
2. **Application email audit logging** — emit structured events from `sendTemplateEmail` and `sendEmail`
3. **Admin dashboard** — query and filter events, view metrics, see bounce rates over time
4. **Vercel log drain** — capture function errors and performance data
5. **Alerting** — notify on critical events (bounces, complaints, error spikes)
6. **PlanetScale insights** — lower priority, manual review is acceptable for now

## Key Files in the Codebase

| File                               | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `src/lib/server/email.ts`          | All transactional email functions, `sendTemplateEmail`, `verifyEmailDeliverability` |
| `src/lib/server/auth.ts`           | Auth email functions (has duplicate `sendTemplateEmail`)     |
| `src/lib/server/audit-log.ts`      | Existing audit logging utility                               |
| `prisma/schema.prisma`             | Database schema (lines 148-236 for `AuditAction` enum, lines 960-994 for `AuditLog` model) |
| `src/routes/api/cron/`             | Existing cron job patterns                                   |
| `src/routes/api/health/+server.ts` | Health check endpoint pattern                                |
| `.github/workflows/deploy.yml`     | Deployment workflow (env vars, Vercel deploy)                |
| `CLAUDE.md`                        | Full project conventions and instructions                    |

## Environment & Conventions

- **Package manager**: pnpm (mandatory)
- **Never commit to main** — all work on feature branches
- **Database branching**: PlanetScale branches mirror git branches (see CLAUDE.md for workflow)
- **Env vars**: No fallback defaults in deploy scripts — all must be explicitly set
- **Testing**: `TEST_MODE=true` skips real email sends, use test reCAPTCHA keys
- **Commit style**: Conventional Commits with SemVer version bumps

## Open Questions

- **Storage choice**: Separate PlanetScale database vs. external platform (Axiom, Tinybird)? A separate PlanetScale DB keeps everything in-house but may hit scale limits with high-volume Vercel log drains.
- **Notification channel**: Email alerts (ironic given the problem), Slack webhook, or both?
- **Dashboard scope**: New admin page in the existing app, or standalone dashboard?
- **MailerSend plan limits**: Verify webhook support is available on the Starter plan.
- **Vercel plan limits**: Verify log drain support is available on our current Vercel plan.
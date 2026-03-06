# Pulse API Reference

Base URL: `https://<your-pulse-domain>` (via Cloudflare Tunnel)

## Health Check

```
GET /api/health
```

Response:
```json
{ "status": "ok", "database": "connected" }
```

## Event Ingestion

Use this endpoint to push events from external services (e.g., emmabyte.io).

```
POST /api/ingest
Content-Type: application/json
```

### Single Event

```json
{
  "source": "APP",
  "eventType": "email.sent",
  "severity": "INFO",
  "summary": "Verification email sent to user@example.com",
  "emailAddress": "user@example.com",
  "userId": "user_abc123",
  "organizationId": "org_xyz",
  "metadata": {
    "templateId": "verification",
    "triggeredBy": "signUp"
  }
}
```

Response:
```json
{ "ok": true, "id": "clxyz..." }
```

### Batch Events

```json
{
  "events": [
    {
      "source": "APP",
      "eventType": "email.sent",
      "severity": "INFO",
      "summary": "...",
      "metadata": { ... }
    },
    {
      "source": "APP",
      "eventType": "email.blocked",
      "severity": "WARN",
      "summary": "...",
      "metadata": { ... }
    }
  ]
}
```

Response:
```json
{ "ok": true, "count": 2 }
```

### Event Fields

| Field            | Type     | Required | Description                                    |
| ---------------- | -------- | -------- | ---------------------------------------------- |
| `source`         | string   | Yes      | `APP`, `MAILERSEND`, `VERCEL`, `PLANETSCALE`   |
| `eventType`      | string   | Yes      | Dot-notation event type (e.g., `email.sent`)   |
| `severity`       | string   | No       | `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`   |
| `summary`        | string   | No       | Human-readable description                     |
| `emailAddress`   | string   | No       | Related email address                          |
| `userId`         | string   | No       | Related user ID                                |
| `organizationId` | string   | No       | Related organization ID                        |
| `metadata`       | object   | No       | Arbitrary JSON payload                         |
| `externalId`     | string   | No       | External ID for deduplication                  |
| `retainUntil`    | ISO date | No       | Retention deadline                             |

### Event Type Conventions

Use dot-notation to namespace event types:

| Pattern                   | Source     | Description              |
| ------------------------- | ---------- | ------------------------ |
| `email.sent`              | APP        | Email send attempted     |
| `email.delivered`         | MAILERSEND | Confirmed delivery       |
| `email.hard_bounced`      | MAILERSEND | Permanent bounce         |
| `email.soft_bounced`      | MAILERSEND | Temporary bounce         |
| `email.spam_complaint`    | MAILERSEND | Spam report              |
| `email.opened`            | MAILERSEND | Email opened             |
| `email.clicked`           | MAILERSEND | Link clicked             |
| `email.blocked`           | APP        | Deliverability check failed |
| `auth.login`              | APP        | User logged in           |
| `auth.signup`             | APP        | User registered          |
| `vercel.lambda`           | VERCEL     | Function invocation log  |
| `vercel.edge`             | VERCEL     | Edge function log        |

## Integration Example (emmabyte.io)

```typescript
// In your SvelteKit app's email.ts
const PULSE_URL = process.env.PULSE_URL; // e.g., https://pulse.emmabyte.io

async function logToPulse(event: {
  source: string;
  eventType: string;
  severity?: string;
  summary?: string;
  emailAddress?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await fetch(`${PULSE_URL}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch (err) {
    // Don't let observability failures break the app
    console.error('Failed to log to Pulse:', err);
  }
}

// Usage in sendTemplateEmail
export async function sendTemplateEmail(params: EmailParams) {
  await logToPulse({
    source: 'APP',
    eventType: 'email.sent',
    severity: 'INFO',
    summary: `Email sent to ${params.recipient}`,
    emailAddress: params.recipient,
    userId: params.userId,
    metadata: {
      templateId: params.templateId,
      subject: params.subject
    }
  });
}
```

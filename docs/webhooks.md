# Webhook Configuration

## MailerSend

1. Go to MailerSend Dashboard > Settings > Webhooks
2. Create a new webhook with URL: `https://<your-pulse-domain>/api/webhooks/mailersend`
3. Select events: `activity.sent`, `activity.delivered`, `activity.soft_bounced`, `activity.hard_bounced`, `activity.spam_complaint`, `activity.opened`, `activity.clicked`, `activity.unsubscribed`
4. Copy the signing secret and set it as `MAILERSEND_WEBHOOK_SECRET` in your `.env`

### MailerSend Event Types Mapped

| MailerSend Event         | Pulse Event Type      | Severity |
| ------------------------ | --------------------- | -------- |
| `activity.sent`          | `email.sent`          | INFO     |
| `activity.delivered`     | `email.delivered`     | INFO     |
| `activity.soft_bounced`  | `email.soft_bounced`  | WARN     |
| `activity.hard_bounced`  | `email.hard_bounced`  | ERROR    |
| `activity.spam_complaint`| `email.spam_complaint`| CRITICAL |
| `activity.opened`        | `email.opened`        | DEBUG    |
| `activity.clicked`       | `email.clicked`       | DEBUG    |
| `activity.unsubscribed`  | `email.unsubscribed`  | WARN     |

## Vercel Log Drain

1. Go to Vercel Dashboard > Project Settings > Log Drains (or use Vercel CLI)
2. Add a log drain:
   - URL: `https://<your-pulse-domain>/api/webhooks/vercel`
   - Format: JSON
   - Sources: Runtime, Build, Edge
3. Vercel will send a verification GET request with a `challenge` query param — Pulse handles this automatically
4. Set the verification secret as `VERCEL_WEBHOOK_SECRET` in your `.env`

### Using Vercel CLI

```bash
vercel log-drains create \
  --url https://<your-pulse-domain>/api/webhooks/vercel \
  --type json \
  --sources runtime,build,edge
```

## Testing Webhooks Locally

During development, use a tunnel to expose your local instance:

```bash
# Using Cloudflare Tunnel (cloudflared)
cloudflared tunnel --url http://localhost:5173

# Or using ngrok
ngrok http 5173
```

Then use the generated public URL to configure webhooks in MailerSend/Vercel for testing.

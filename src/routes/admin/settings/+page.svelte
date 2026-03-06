<script lang="ts">
	import type { PageData } from './$types';
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold tracking-tight">Settings</h1>

	<div class="space-y-4">
		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="text-lg font-semibold">Webhook Endpoints</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Configure these URLs in your external services to start receiving events.
			</p>
			<dl class="mt-4 space-y-3">
				<div>
					<dt class="text-sm font-medium">MailerSend Webhook</dt>
					<dd class="mt-1 rounded bg-muted px-3 py-2 font-mono text-xs">
						POST /api/webhooks/mailersend
					</dd>
				</div>
				<div>
					<dt class="text-sm font-medium">Vercel Log Drain</dt>
					<dd class="mt-1 rounded bg-muted px-3 py-2 font-mono text-xs">
						POST /api/webhooks/vercel
					</dd>
				</div>
				<div>
					<dt class="text-sm font-medium">Event Ingestion API</dt>
					<dd class="mt-1 rounded bg-muted px-3 py-2 font-mono text-xs">
						POST /api/ingest
					</dd>
				</div>
			</dl>
		</div>

		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="text-lg font-semibold">Health Check</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Use this endpoint to verify the service is running.
			</p>
			<dd class="mt-3 rounded bg-muted px-3 py-2 font-mono text-xs">
				GET /api/health
			</dd>
		</div>
	</div>
</div>

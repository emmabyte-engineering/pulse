<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { formatDate } from '$lib/utils';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showCreateKey = $state(false);
	let copiedKey = $state(false);

	function copyKey(key: string) {
		navigator.clipboard.writeText(key);
		copiedKey = true;
		setTimeout(() => (copiedKey = false), 2000);
	}
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold tracking-tight">Settings</h1>

	<!-- API Keys -->
	<div class="rounded-lg border border-border bg-card p-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-semibold">API Keys</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Manage API keys for the event ingestion endpoint.
				</p>
			</div>
			<button
				onclick={() => (showCreateKey = !showCreateKey)}
				class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				{showCreateKey ? 'Cancel' : 'New API Key'}
			</button>
		</div>

		{#if showCreateKey}
			<form
				method="POST"
				action="?/createKey"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showCreateKey = false;
					};
				}}
				class="mt-4 flex gap-3"
			>
				<input
					name="name"
					required
					class="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
					placeholder="Key name (e.g., emmabyte-prod)"
				/>
				<button
					type="submit"
					class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Create
				</button>
			</form>
		{/if}

		{#if form?.newKey}
			<div class="mt-4 rounded-md border border-[#FFBA71]/50 bg-[#FFBA71]/10 p-4">
				<p class="text-sm font-medium text-[#FFBA71]">
					API key created: {form.keyName}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Copy this key now — it won't be shown again.
				</p>
				<div class="mt-2 flex items-center gap-2">
					<code class="flex-1 rounded bg-muted px-3 py-2 font-mono text-xs break-all">
						{form.newKey}
					</code>
					<button
						onclick={() => copyKey(form?.newKey ?? '')}
						class="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs hover:bg-accent"
					>
						{copiedKey ? 'Copied!' : 'Copy'}
					</button>
				</div>
			</div>
		{/if}

		<div class="mt-4 divide-y divide-border rounded-md border border-border">
			{#each data.apiKeys as apiKey}
				<div class="flex items-center gap-4 px-4 py-3">
					<div class="flex-1">
						<p class="text-sm font-medium">{apiKey.name}</p>
						<p class="text-xs text-muted-foreground">
							<span class="font-mono">{apiKey.prefix}</span>
							&middot; Created {formatDate(apiKey.createdAt)}
							{#if apiKey.lastUsedAt}
								&middot; Last used {formatDate(apiKey.lastUsedAt)}
							{:else}
								&middot; Never used
							{/if}
							{#if apiKey.expiresAt}
								&middot; Expires {formatDate(apiKey.expiresAt)}
							{/if}
						</p>
					</div>
					<form method="POST" action="?/deleteKey" use:enhance>
						<input type="hidden" name="id" value={apiKey.id} />
						<button type="submit" class="text-xs text-red-400 hover:text-red-300">
							Revoke
						</button>
					</form>
				</div>
			{:else}
				<div class="px-4 py-6 text-center text-sm text-muted-foreground">
					No API keys yet.
				</div>
			{/each}
		</div>
	</div>

	<!-- Webhook Endpoints -->
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
					POST /api/ingest (requires API key)
				</dd>
			</div>
		</dl>
	</div>

	<!-- Health Check -->
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

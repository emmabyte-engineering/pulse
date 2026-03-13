<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Triangle, Mail, Database, Globe, Copy, Check, ArrowLeft, Key, ExternalLink, BookOpen } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let copied = $state(false);

	const icons: Record<string, typeof Triangle> = {
		triangle: Triangle,
		mail: Mail,
		database: Database,
		globe: Globe
	};

	const Icon = $derived(icons[data.integration.icon] ?? Globe);

	const endpointUrl = $derived(() => {
		return `${page.url.origin}${data.integration.webhookEndpoint}`;
	});

	function copyEndpoint() {
		navigator.clipboard.writeText(endpointUrl());
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="mx-auto max-w-2xl space-y-8">
	<!-- Back link -->
	<a
		href="/admin/integrations/add"
		class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		Back to integrations
	</a>

	<!-- Header -->
	<div class="flex items-center gap-4">
		<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
			<Icon class="h-6 w-6 text-muted-foreground" />
		</div>
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Connect {data.integration.name}</h1>
			<p class="text-sm text-muted-foreground">{data.integration.description}</p>
		</div>
	</div>

	<!-- Setup steps -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Setup Steps</h2>
		<ol class="mt-4 space-y-3">
			{#each data.integration.setupSteps as step, i}
				<li class="flex gap-3 text-sm">
					<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
						{i + 1}
					</span>
					<span class="pt-0.5">{step}</span>
				</li>
			{/each}
		</ol>
	</div>

	<!-- API Key callout (for ingest-based integrations) -->
	{#if data.integration.requiresApiKey}
		<div class="rounded-2xl border border-[#FFBA71]/30 bg-[#FFBA71]/5 p-6">
			<div class="flex items-start gap-3">
				<Key class="mt-0.5 h-5 w-5 shrink-0 text-[#FFBA71]" />
				<div>
					<h2 class="text-sm font-semibold">API key required</h2>
					<p class="mt-1 text-sm text-muted-foreground">
						This integration sends events via the ingest API, which requires an API key for authentication. Create one before you start sending events.
					</p>
					<a
						href="/admin/api-keys"
						class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FFBA71] to-[#FF6798] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
					>
						<Key class="h-3.5 w-3.5" />
						Go to API Keys
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- Documentation link -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-start gap-3">
			<BookOpen class="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
			<div>
				<h2 class="text-sm font-semibold">Documentation</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Learn how to configure {data.integration.name}, define custom event types, and get the most out of this integration.
				</p>
				<a
					href={data.integration.docsUrl}
					class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#b93a54] transition-colors hover:text-[#e85d75]"
				>
					Read the {data.integration.name} integration guide
					<ExternalLink class="h-3.5 w-3.5" />
				</a>
			</div>
		</div>
	</div>

	<!-- Endpoint URL -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Endpoint URL</h2>
		<p class="mt-2 text-xs text-muted-foreground">Configure this URL in your external service</p>
		<div class="mt-3 flex items-center gap-2">
			<code class="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs">
				{endpointUrl()}
			</code>
			<button
				onclick={copyEndpoint}
				class="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-3 text-xs hover:bg-accent"
			>
				{#if copied}
					<Check class="h-3 w-3" /> Copied
				{:else}
					<Copy class="h-3 w-3" /> Copy
				{/if}
			</button>
		</div>
	</div>

	<!-- Config form -->
	{#if form?.error}
		<div class="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{form.error}</div>
	{/if}

	<form method="POST" action="?/connect" use:enhance class="rounded-2xl border border-border bg-card p-6">
		{#if data.integration.fields.length > 0}
			<h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configuration</h2>
			<div class="mt-4 space-y-4">
				{#each data.integration.fields as field}
					<div>
						<label for={field.key} class="text-sm font-medium">
							{field.label}
							{#if field.required}<span class="text-red-500">*</span>{/if}
						</label>
						{#if field.description}
							<p class="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
						{/if}
						<input
							id={field.key}
							name={field.key}
							type={field.type}
							placeholder={field.placeholder ?? ''}
							required={field.required}
							class="mt-1.5 flex h-9 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm"
						/>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">
				No additional configuration needed. Click connect to start receiving events.
			</p>
		{/if}

		<button
			type="submit"
			class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FFBA71] to-[#FF6798] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
		>
			Connect {data.integration.name}
		</button>
	</form>
</div>

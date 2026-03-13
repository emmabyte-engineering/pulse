<script lang="ts">
	import type { PageData } from './$types';
	import { timeAgo } from '$lib/utils';
	import StatCard from '$components/StatCard.svelte';
	import LineChart from '$components/LineChart.svelte';
	import SeverityBadge from '$components/SeverityBadge.svelte';
	import TimeRangeSelect from '$components/TimeRangeSelect.svelte';
	import { Activity, CheckCircle, Key, Wifi, Plus, ArrowRight, BookOpen, ExternalLink } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	const stats = $derived(data.stats);

	const sourceLabels: Record<string, string> = {
		VERCEL: 'Vercel',
		MAILERSEND: 'MailerSend',
		PLANETSCALE: 'PlanetScale',
		APP: 'Website'
	};

	const sourceSlugs: Record<string, string> = {
		VERCEL: 'vercel',
		MAILERSEND: 'mailersend',
		PLANETSCALE: 'planetscale',
		APP: 'website'
	};
</script>

{#if !data.hasIntegrations}
	<!-- Getting Started -->
	<div class="space-y-8">
		<div class="text-center">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFBA71]/20 to-[#FF6798]/20">
				<Activity class="h-8 w-8 text-[#FF6798]" />
			</div>
			<h2 class="mt-6 text-2xl font-semibold">Welcome to Pulse</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Get set up in a few minutes. Follow the steps below to start monitoring your stack.
			</p>
		</div>

		<div class="mx-auto max-w-2xl space-y-4">
			<!-- Step 1: Add Integration -->
			<div class="rounded-2xl border border-border bg-card p-6">
				<div class="flex items-start gap-4">
					<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FFBA71] to-[#FF6798] text-sm font-semibold text-white">
						1
					</span>
					<div class="flex-1">
						<h3 class="text-sm font-semibold">Connect an integration</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							Choose a service to start receiving events from — like MailerSend for email tracking,
							Vercel for deployment logs, or your own application via the ingest API.
						</p>
						<a
							href="/admin/integrations/add"
							class="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFBA71] to-[#FF6798] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
						>
							<Plus class="h-4 w-4" />
							Add Your First Integration
						</a>
					</div>
				</div>
			</div>

			<!-- Step 2: Create API Key -->
			<div class="rounded-2xl border border-border bg-card p-6">
				<div class="flex items-start gap-4">
					<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-muted-foreground">
						2
					</span>
					<div class="flex-1">
						<h3 class="text-sm font-semibold">Create an API key</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							If you're using the Website or PlanetScale integration, you'll need an API key
							to authenticate requests to the ingest endpoint. Keys are shown once on creation, so copy it right away.
						</p>
						<a
							href="/admin/api-keys"
							class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#b93a54] transition-colors hover:text-[#e85d75]"
						>
							<Key class="h-3.5 w-3.5" />
							Go to API Keys
							<ArrowRight class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			</div>

			<!-- Step 3: Send Events -->
			<div class="rounded-2xl border border-border bg-card p-6">
				<div class="flex items-start gap-4">
					<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-muted-foreground">
						3
					</span>
					<div class="flex-1">
						<h3 class="text-sm font-semibold">Start sending events</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							Configure your webhook URL or instrument your app to send events. Define your own
							event types using dot-notation (e.g., <code class="rounded bg-muted px-1 text-xs">email.sent</code>,
							<code class="rounded bg-muted px-1 text-xs">auth.login</code>,
							<code class="rounded bg-muted px-1 text-xs">order.created</code>) and
							attach metadata to make events searchable.
						</p>
					</div>
				</div>
			</div>

			<!-- Step 4: Set Up Alerts -->
			<div class="rounded-2xl border border-border bg-card p-6">
				<div class="flex items-start gap-4">
					<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-muted-foreground">
						4
					</span>
					<div class="flex-1">
						<h3 class="text-sm font-semibold">Configure alerts</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							Set up alert rules to get notified when error rates spike, events stop flowing,
							or specific conditions are met. Add notification channels in Settings to route
							alerts to Slack, email, or other services.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Docs callout -->
		<div class="mx-auto max-w-2xl rounded-2xl border border-border bg-muted/50 p-6 text-center">
			<BookOpen class="mx-auto h-6 w-6 text-muted-foreground" />
			<h3 class="mt-3 text-sm font-semibold">Need more details?</h3>
			<p class="mt-1 text-sm text-muted-foreground">
				Our docs cover the full event schema, integration guides, naming conventions, and API reference.
			</p>
			<a
				href="/docs/v1"
				class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#b93a54] transition-colors hover:text-[#e85d75]"
			>
				Read the Pulse documentation
				<ExternalLink class="h-3.5 w-3.5" />
			</a>
		</div>
	</div>
{:else}
	<div class="space-y-8">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
				<p class="mt-1 text-sm text-muted-foreground">Overview of all connected services</p>
			</div>
			<TimeRangeSelect />
		</div>

		<!-- Stat Cards -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard label="Total Events" value={stats?.totalEvents ?? 0} trend={stats?.trend}>
				{#snippet icon()}<Activity class="h-4 w-4" />{/snippet}
			</StatCard>
			<StatCard label="Success Rate" value="{stats?.successRate ?? 100}%">
				{#snippet icon()}<CheckCircle class="h-4 w-4" />{/snippet}
			</StatCard>
			<StatCard label="Active API Keys" value={stats?.apiKeyCount ?? 0}>
				{#snippet icon()}<Key class="h-4 w-4" />{/snippet}
			</StatCard>
			<StatCard label="Connected Services" value={stats?.connectedServices ?? 0}>
				{#snippet icon()}<Wifi class="h-4 w-4" />{/snippet}
			</StatCard>
		</div>

		<!-- Charts row -->
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Line Chart -->
			<div class="rounded-2xl border border-border bg-card p-6">
				<h2 class="text-lg font-semibold">Event Volume</h2>
				<p class="mt-1 text-sm text-muted-foreground">Events per hour</p>
				<div class="mt-4">
					<LineChart data={data.timeSeries} />
				</div>
			</div>

			<!-- Service Status -->
			<div class="rounded-2xl border border-border bg-card p-6">
				<h2 class="text-lg font-semibold">Service Status</h2>
				<p class="mt-1 text-sm text-muted-foreground">Events by source</p>
				<div class="mt-4 space-y-4">
					{#each stats?.serviceStats ?? [] as service}
						<a
							href="/admin/services/{sourceSlugs[service.source]}"
							class="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
						>
							<div>
								<p class="text-sm font-medium">{sourceLabels[service.source] ?? service.source}</p>
								<p class="text-xs text-muted-foreground">
									{service.count.toLocaleString()} events
									{#if service.errors > 0}
										<span class="text-[#FA586D]">&middot; {service.errors} errors</span>
									{/if}
								</p>
							</div>
							<div class="flex items-center gap-2">
								{#if service.errors === 0 && service.count > 0}
									<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
								{:else if service.errors > 0}
									<span class="h-2 w-2 rounded-full bg-[#FA586D]"></span>
								{:else}
									<span class="h-2 w-2 rounded-full bg-neutral-500"></span>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="rounded-2xl border border-border bg-card">
			<div class="border-b border-border p-6">
				<h2 class="text-lg font-semibold">Recent Activity</h2>
				<p class="mt-1 text-sm text-muted-foreground">Latest events across all services</p>
			</div>
			<div class="divide-y divide-border">
				{#each stats?.latestEvents ?? [] as event}
					<div class="flex items-center gap-4 px-6 py-3">
						<SeverityBadge severity={event.severity} />
						<span class="flex-1 truncate text-sm">{event.summary ?? event.eventType}</span>
						<span class="text-xs text-muted-foreground">{sourceLabels[event.source] ?? event.source}</span>
						<span class="text-xs text-muted-foreground">{timeAgo(event.timestamp)}</span>
					</div>
				{:else}
					<div class="px-6 py-8 text-center text-sm text-muted-foreground">
						No events yet. Events will appear here once your integrations start sending data.
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

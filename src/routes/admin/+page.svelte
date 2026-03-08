<script lang="ts">
	import type { PageData } from './$types';
	import { timeAgo } from '$lib/utils';
	import StatCard from '$components/StatCard.svelte';
	import LineChart from '$components/LineChart.svelte';
	import SeverityBadge from '$components/SeverityBadge.svelte';
	import TimeRangeSelect from '$components/TimeRangeSelect.svelte';
	import { Activity, CheckCircle, Key, Wifi, Plus, ArrowRight } from 'lucide-svelte';

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
	<!-- Empty state -->
	<div class="flex min-h-[60vh] items-center justify-center">
		<div class="max-w-md text-center">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFBA71]/20 to-[#FF6798]/20">
				<Activity class="h-8 w-8 text-[#FF6798]" />
			</div>
			<h2 class="mt-6 text-2xl font-semibold">Welcome to Pulse</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Connect your first service to start receiving events and monitoring your stack.
			</p>
			<a
				href="/admin/integrations/add"
				class="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFBA71] to-[#FF6798] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
			>
				<Plus class="h-4 w-4" />
				Add Your First Integration
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

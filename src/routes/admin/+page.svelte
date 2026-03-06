<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, severityColor } from '$lib/utils';

	let { data } = $props();
</script>

<div class="space-y-8">
	<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>

	<!-- Stats cards -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-2xl border border-border bg-card p-6">
			<p class="text-sm text-muted-foreground">Total Events</p>
			<p class="mt-1 text-3xl font-semibold">{data.stats.totalEvents.toLocaleString()}</p>
		</div>
		<div class="rounded-2xl border border-border bg-card p-6">
			<p class="text-sm text-muted-foreground">Last 24 Hours</p>
			<p class="mt-1 text-3xl font-semibold">{data.stats.recentEvents.toLocaleString()}</p>
		</div>
		<div class="rounded-2xl border border-border bg-card p-6">
			<p class="text-sm text-muted-foreground">Errors (7d)</p>
			<p class="mt-1 text-3xl font-semibold text-[#FA586D]">
				{data.stats.criticalEvents.toLocaleString()}
			</p>
		</div>
		<div class="rounded-2xl border border-border bg-card p-6">
			<p class="text-sm text-muted-foreground">Sources Active</p>
			<p class="mt-1 text-3xl font-semibold">{data.stats.sourceBreakdown.length}</p>
		</div>
	</div>

	<!-- Source breakdown -->
	{#if data.stats.sourceBreakdown.length > 0}
		<div class="rounded-2xl border border-border bg-card p-6">
			<h2 class="text-lg font-semibold">Events by Source (7d)</h2>
			<div class="mt-4 space-y-3">
				{#each data.stats.sourceBreakdown as source}
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{source.source}</span>
						<span class="text-sm text-muted-foreground">{source.count.toLocaleString()}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Latest events -->
	<div class="rounded-2xl border border-border bg-card">
		<div class="flex items-center justify-between border-b border-border p-6">
			<h2 class="text-lg font-semibold">Latest Events</h2>
			<a
				href="/admin/events"
				class="text-sm text-muted-foreground transition-colors hover:text-[#FA586D]"
			>
				View all
			</a>
		</div>
		<div class="divide-y divide-border">
			{#each data.latestEvents as event}
				<div class="flex items-center gap-4 px-6 py-3">
					<span
						class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium {severityColor(
							event.severity
						)}"
					>
						{event.severity}
					</span>
					<span class="text-xs text-muted-foreground">{event.source}</span>
					<span class="flex-1 truncate text-sm">{event.summary ?? event.eventType}</span>
					<span class="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
				</div>
			{:else}
				<div class="px-6 py-8 text-center text-sm text-muted-foreground">
					No events yet. Configure webhooks to start receiving data.
				</div>
			{/each}
		</div>
	</div>
</div>

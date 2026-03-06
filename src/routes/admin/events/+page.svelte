<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { formatDate, severityColor } from '$lib/utils';

	let { data } = $props();

	let searchInput = $state('');
	let selectedSource = $state('');
	let selectedSeverity = $state('');
	let eventTypeInput = $state('');
	let dateFrom = $state('');
	let dateTo = $state('');
	let expandedEvent = $state<string | null>(null);

	$effect(() => {
		searchInput = data.filters.search ?? '';
		selectedSource = data.filters.source ?? '';
		selectedSeverity = data.filters.severity ?? '';
		eventTypeInput = data.filters.eventType ?? '';
		dateFrom = data.filters.dateFrom ?? '';
		dateTo = data.filters.dateTo ?? '';
	});

	function buildParams(overrides: Record<string, string | number> = {}): string {
		const params = new URLSearchParams();
		const values: Record<string, string> = {
			q: searchInput,
			source: selectedSource,
			severity: selectedSeverity,
			eventType: eventTypeInput,
			from: dateFrom,
			to: dateTo,
			...overrides
		};
		for (const [key, val] of Object.entries(values)) {
			if (val) params.set(key, String(val));
		}
		return params.toString();
	}

	function applyFilters() {
		goto(`/admin/events?${buildParams({ page: '' })}`);
	}

	function clearFilters() {
		searchInput = '';
		selectedSource = '';
		selectedSeverity = '';
		eventTypeInput = '';
		dateFrom = '';
		dateTo = '';
		goto('/admin/events');
	}

	function setQuickDate(hours: number) {
		const d = new Date(Date.now() - hours * 60 * 60 * 1000);
		dateFrom = d.toISOString().slice(0, 16);
		dateTo = '';
		applyFilters();
	}

	function toggleEvent(id: string) {
		expandedEvent = expandedEvent === id ? null : id;
	}

	const hasFilters = $derived(
		searchInput || selectedSource || selectedSeverity || eventTypeInput || dateFrom || dateTo
	);
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold tracking-tight">Events</h1>

	<!-- Filters -->
	<div class="space-y-3">
		<div class="flex flex-wrap gap-3">
			<input
				type="text"
				bind:value={searchInput}
				placeholder="Search summary, type, or email..."
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
				class="flex h-9 w-72 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			/>

			<input
				type="text"
				bind:value={eventTypeInput}
				placeholder="Event type (e.g., email.hard_bounced)"
				onkeydown={(e) => e.key === 'Enter' && applyFilters()}
				class="flex h-9 w-64 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
			/>

			<select
				bind:value={selectedSource}
				onchange={applyFilters}
				class="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
			>
				<option value="">All Sources</option>
				<option value="MAILERSEND">MailerSend</option>
				<option value="VERCEL">Vercel</option>
				<option value="PLANETSCALE">PlanetScale</option>
				<option value="APP">App</option>
			</select>

			<select
				bind:value={selectedSeverity}
				onchange={applyFilters}
				class="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
			>
				<option value="">All Severities</option>
				<option value="CRITICAL">Critical</option>
				<option value="ERROR">Error</option>
				<option value="WARN">Warning</option>
				<option value="INFO">Info</option>
				<option value="DEBUG">Debug</option>
			</select>

			<button
				onclick={applyFilters}
				class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Search
			</button>

			{#if hasFilters}
				<button
					onclick={clearFilters}
					class="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm hover:bg-accent"
				>
					Clear
				</button>
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<div class="flex items-center gap-2">
				<label for="dateFrom" class="text-xs text-muted-foreground">From</label>
				<input
					id="dateFrom"
					type="datetime-local"
					bind:value={dateFrom}
					onchange={applyFilters}
					class="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
				/>
			</div>
			<div class="flex items-center gap-2">
				<label for="dateTo" class="text-xs text-muted-foreground">To</label>
				<input
					id="dateTo"
					type="datetime-local"
					bind:value={dateTo}
					onchange={applyFilters}
					class="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
				/>
			</div>
			<div class="flex gap-1">
				<button onclick={() => setQuickDate(1)} class="h-8 rounded-md border border-input px-2 text-xs hover:bg-accent">1h</button>
				<button onclick={() => setQuickDate(6)} class="h-8 rounded-md border border-input px-2 text-xs hover:bg-accent">6h</button>
				<button onclick={() => setQuickDate(24)} class="h-8 rounded-md border border-input px-2 text-xs hover:bg-accent">24h</button>
				<button onclick={() => setQuickDate(168)} class="h-8 rounded-md border border-input px-2 text-xs hover:bg-accent">7d</button>
				<button onclick={() => setQuickDate(720)} class="h-8 rounded-md border border-input px-2 text-xs hover:bg-accent">30d</button>
			</div>
		</div>
	</div>

	<!-- Results -->
	<div class="text-sm text-muted-foreground">
		{data.pagination.total.toLocaleString()} events found
	</div>

	<div class="rounded-lg border border-border bg-card">
		<div class="divide-y divide-border">
			{#each data.events as event}
				<button
					onclick={() => toggleEvent(event.id)}
					class="flex w-full items-center gap-4 px-6 py-3 text-left hover:bg-accent/50"
				>
					<span
						class="inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium {severityColor(
							event.severity
						)}"
					>
						{event.severity}
					</span>
					<span class="shrink-0 text-xs text-muted-foreground">{event.source}</span>
					<span class="shrink-0 text-xs text-muted-foreground">{event.eventType}</span>
					<span class="flex-1 truncate text-sm">{event.summary ?? '—'}</span>
					{#if event.emailAddress}
						<span class="shrink-0 text-xs text-muted-foreground">{event.emailAddress}</span>
					{/if}
					<span class="shrink-0 text-xs text-muted-foreground">
						{formatDate(event.timestamp)}
					</span>
				</button>

				{#if expandedEvent === event.id}
					<div class="bg-muted/50 px-6 py-4">
						<dl class="grid grid-cols-2 gap-2 text-sm">
							<dt class="text-muted-foreground">Event ID</dt>
							<dd class="font-mono text-xs">{event.id}</dd>

							{#if event.emailAddress}
								<dt class="text-muted-foreground">Email</dt>
								<dd>{event.emailAddress}</dd>
							{/if}

							{#if event.externalId}
								<dt class="text-muted-foreground">External ID</dt>
								<dd class="font-mono text-xs">{event.externalId}</dd>
							{/if}

							{#if event.userId}
								<dt class="text-muted-foreground">User ID</dt>
								<dd class="font-mono text-xs">{event.userId}</dd>
							{/if}
						</dl>

						{#if event.metadata}
							<details class="mt-4">
								<summary class="cursor-pointer text-sm text-muted-foreground">
									Raw metadata
								</summary>
								<pre class="mt-2 max-h-64 overflow-auto rounded bg-background p-3 text-xs">{JSON.stringify(event.metadata, null, 2)}</pre>
							</details>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="px-6 py-8 text-center text-sm text-muted-foreground">
					No events match your filters.
				</div>
			{/each}
		</div>
	</div>

	<!-- Pagination -->
	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.pagination.page > 1}
				<a
					href="/admin/events?{buildParams({ page: data.pagination.page - 1 })}"
					class="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm hover:bg-accent"
				>
					Previous
				</a>
			{/if}
			<span class="text-sm text-muted-foreground">
				Page {data.pagination.page} of {data.pagination.totalPages}
			</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<a
					href="/admin/events?{buildParams({ page: data.pagination.page + 1 })}"
					class="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm hover:bg-accent"
				>
					Next
				</a>
			{/if}
		</div>
	{/if}
</div>

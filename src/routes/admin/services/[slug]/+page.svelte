<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import StatCard from '$components/StatCard.svelte';
	import LineChart from '$components/LineChart.svelte';
	import BarChart from '$components/BarChart.svelte';
	import EventTable from '$components/EventTable.svelte';
	import TimeRangeSelect from '$components/TimeRangeSelect.svelte';
	import { enhance } from '$app/forms';
	import { Activity, CheckCircle, AlertTriangle, BarChart3, Unplug } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let searchInput = $state('');
	let lastServerQ = '';

	$effect(() => {
		const q = data.filters.q;
		if (q !== lastServerQ) {
			searchInput = q;
			lastServerQ = q;
		}
	});

	function applyFilter(key: string, value: string) {
		const url = new URL(page.url);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function onSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			applyFilter('q', searchInput);
		}
	}
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">{data.service.name}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{data.service.description}</p>
		</div>
		<div class="flex items-center gap-3">
			<TimeRangeSelect />
			<form method="POST" action="?/disconnect" use:enhance={(e) => {
				if (!confirm(`Disconnect ${data.service.name}? This removes the integration but keeps existing event data.`)) {
					e.cancel();
					return;
				}
				return async ({ update }) => update();
			}}>
				<button type="submit" class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
					<Unplug class="h-3.5 w-3.5" />
					Disconnect
				</button>
			</form>
		</div>
	</div>

	<!-- Stat Cards -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard label="Total Events" value={data.stats.total}>
			{#snippet icon()}<Activity class="h-4 w-4" />{/snippet}
		</StatCard>
		<StatCard label="Success Rate" value="{data.stats.successRate}%">
			{#snippet icon()}<CheckCircle class="h-4 w-4" />{/snippet}
		</StatCard>
		<StatCard label="Errors" value={data.stats.errors}>
			{#snippet icon()}<AlertTriangle class="h-4 w-4" />{/snippet}
		</StatCard>
		<StatCard label="Event Types" value={data.stats.typeBreakdown.length}>
			{#snippet icon()}<BarChart3 class="h-4 w-4" />{/snippet}
		</StatCard>
	</div>

	<!-- Charts -->
	<div class="grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-border bg-card p-6">
			<h2 class="text-lg font-semibold">Event Volume</h2>
			<p class="mt-1 text-sm text-muted-foreground">Events per hour</p>
			<div class="mt-4">
				<LineChart data={data.timeSeries} />
			</div>
		</div>

		<div class="rounded-2xl border border-border bg-card p-6">
			<h2 class="text-lg font-semibold">Severity Distribution</h2>
			<p class="mt-1 text-sm text-muted-foreground">Events by severity level</p>
			<div class="mt-4">
				<BarChart data={data.severityDist} />
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3">
		<input
			type="text"
			bind:value={searchInput}
			onkeydown={onSearchKeydown}
			placeholder="Search events..."
			class="h-9 w-full max-w-sm rounded-lg border border-input bg-background px-3 text-sm"
		/>
		<select
			value={data.filters.severity}
			onchange={(e) => applyFilter('severity', (e.target as HTMLSelectElement).value)}
			class="h-9 rounded-lg border border-input bg-background px-3 text-sm"
		>
			<option value="">All severities</option>
			<option value="DEBUG">Debug</option>
			<option value="INFO">Info</option>
			<option value="WARN">Warn</option>
			<option value="ERROR">Error</option>
			<option value="CRITICAL">Critical</option>
		</select>
		{#if data.eventTypes.length > 0}
			<select
				value={data.filters.eventType}
				onchange={(e) => applyFilter('type', (e.target as HTMLSelectElement).value)}
				class="h-9 rounded-lg border border-input bg-background px-3 text-sm"
			>
				<option value="">All types</option>
				{#each data.eventTypes as type}
					<option value={type}>{type}</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- Event Table -->
	<EventTable events={data.events} columns={data.service.columns} />
</div>

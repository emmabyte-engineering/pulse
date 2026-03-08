<script lang="ts">
	import SeverityBadge from './SeverityBadge.svelte';
	import { timeAgo } from '$lib/utils';

	let {
		events,
		columns
	}: {
		events: Record<string, unknown>[];
		columns: { key: string; label: string }[];
	} = $props();
</script>

<div class="overflow-x-auto rounded-2xl border border-border bg-card">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-border">
				{#each columns as col}
					<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{col.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-border">
			{#each events as event}
				<tr class="transition-colors hover:bg-accent/50">
					{#each columns as col}
						<td class="px-4 py-3">
							{#if col.key === 'severity'}
								<SeverityBadge severity={String(event[col.key] ?? '')} />
							{:else if col.key === 'timestamp'}
								<span class="text-xs text-muted-foreground">{timeAgo(String(event[col.key]))}</span>
							{:else if col.key === 'summary'}
								<span class="max-w-xs truncate block">{event[col.key] ?? '—'}</span>
							{:else}
								<span class="text-sm">{event[col.key] ?? '—'}</span>
							{/if}
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td colspan={columns.length} class="px-4 py-8 text-center text-muted-foreground">
						No events found
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

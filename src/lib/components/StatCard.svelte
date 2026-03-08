<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		value,
		icon,
		trend
	}: {
		label: string;
		value: string | number;
		icon?: Snippet;
		trend?: number;
	} = $props();
</script>

<div class="rounded-2xl border border-border bg-card p-6">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{label}</p>
		{#if icon}
			<div class="text-muted-foreground">
				{@render icon()}
			</div>
		{/if}
	</div>
	<div class="mt-2 flex items-baseline gap-2">
		<p class="text-3xl font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
		{#if trend !== undefined && trend !== 0}
			<span
				class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {trend > 0
					? 'bg-emerald-500/10 text-emerald-500'
					: 'bg-red-500/10 text-red-500'}"
			>
				{trend > 0 ? '+' : ''}{trend}%
			</span>
		{/if}
	</div>
</div>

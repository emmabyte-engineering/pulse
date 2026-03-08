<script lang="ts">
	let {
		data
	}: {
		data: { label: string; value: number; color: string }[];
	} = $props();

	const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));
</script>

{#if data.length > 0}
	<div class="space-y-3">
		{#each data as item}
			<div class="space-y-1">
				<div class="flex items-center justify-between text-sm">
					<span class="font-medium" style="color: {item.color}">{item.label}</span>
					<span class="text-muted-foreground">{item.value.toLocaleString()}</span>
				</div>
				<div class="h-2 w-full rounded-full bg-muted">
					<div
						class="h-2 rounded-full transition-all"
						style="width: {(item.value / maxValue) * 100}%; background-color: {item.color}"
					></div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="flex items-center justify-center py-8 text-sm text-muted-foreground">
		No data available
	</div>
{/if}

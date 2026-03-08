<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const options = [
		{ value: '1', label: 'Last hour' },
		{ value: '6', label: 'Last 6 hours' },
		{ value: '24', label: 'Last 24 hours' },
		{ value: '168', label: 'Last 7 days' },
		{ value: '720', label: 'Last 30 days' }
	];

	let current = $derived(page.url.searchParams.get('range') ?? '24');

	function onChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		const url = new URL(page.url);
		url.searchParams.set('range', value);
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}
</script>

<select
	value={current}
	onchange={onChange}
	class="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
>
	{#each options as opt}
		<option value={opt.value}>{opt.label}</option>
	{/each}
</select>

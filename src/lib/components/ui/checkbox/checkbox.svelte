<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { Check, Minus } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		checked = $bindable(false),
		indeterminate = $bindable(false),
		...restProps
	}: ComponentProps<typeof CheckboxPrimitive.Root> = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	bind:indeterminate
	class={cn(
		'peer inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		{#if indeterminate}
			<Minus class="h-3.5 w-3.5 text-white" strokeWidth={3} />
		{:else if checked}
			<Check class="h-3.5 w-3.5 text-white" strokeWidth={3} />
		{/if}
	{/snippet}
</CheckboxPrimitive.Root>

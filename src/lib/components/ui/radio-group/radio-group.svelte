<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		value = $bindable(''),
		...restProps
	}: ComponentProps<typeof RadioGroupPrimitive.Root> = $props();
</script>

<RadioGroupPrimitive.Root bind:value class={cn('grid gap-2', className)} {...restProps} />

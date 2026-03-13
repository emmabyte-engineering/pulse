<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		...restProps
	}: ComponentProps<typeof DialogPrimitive.Description> = $props();
</script>

<DialogPrimitive.Description
	class={cn('text-sm text-muted-foreground', className)}
	{...restProps}
/>

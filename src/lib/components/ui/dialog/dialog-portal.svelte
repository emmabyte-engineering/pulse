<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof DialogPrimitive.Portal>;

	let { ...restProps }: Props = $props();
</script>

<DialogPrimitive.Portal {...restProps} />

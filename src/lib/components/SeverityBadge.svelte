<script lang="ts">
	import { severityColor } from '$lib/utils';

	let { severity }: { severity: string } = $props();
</script>

<span
	class="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium {severityColor(severity)}"
>
	{severity}
</span>

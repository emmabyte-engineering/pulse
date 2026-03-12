<script lang="ts">
	import '../app.css';
	import AccessibilityPanel from '$lib/components/AccessibilityPanel.svelte';

	let { children } = $props();
</script>

{@render children()}
<AccessibilityPanel />

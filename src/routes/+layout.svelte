<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import AccessibilityPanel from '$lib/components/AccessibilityPanel.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
{@render children()}
<AccessibilityPanel />

<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Pulse</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<h1 class="text-4xl font-semibold text-gray-900">{page.status}</h1>
		<p class="mt-2 text-gray-600">{page.error?.message ?? 'Something went wrong.'}</p>
		<a
			href="/"
			class="mt-6 inline-block text-sm text-gray-600 underline transition-colors hover:text-gray-900"
		>
			Back to home
		</a>
	</div>
</main>

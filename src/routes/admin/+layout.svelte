<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { data, children } = $props();

	const navItems = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/events', label: 'Events' },
		{ href: '/admin/alerts', label: 'Alerts' },
		{ href: '/admin/settings', label: 'Settings' }
	];

	async function handleSignOut() {
		await authClient.signOut();
		goto('/login');
	}
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside class="w-64 border-r border-border bg-card">
		<div class="flex h-14 items-center border-b border-border px-6">
			<a href="/admin" class="text-lg font-semibold">Pulse</a>
		</div>

		<nav class="space-y-1 p-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
						{page.url.pathname === item.href
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="absolute bottom-0 w-64 border-t border-border p-4">
			<div class="flex items-center justify-between">
				<span class="truncate text-sm text-muted-foreground">{data.user.email}</span>
				<button
					onclick={handleSignOut}
					class="text-sm text-muted-foreground hover:text-foreground"
				>
					Sign out
				</button>
			</div>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-auto">
		<div class="container py-8">
			{@render children()}
		</div>
	</main>
</div>

<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import type { Snippet } from 'svelte';
	import {
		LayoutDashboard,
		Key,
		Settings,
		Users,
		Triangle,
		Mail,
		Database,
		Globe,
		Plus
	} from 'lucide-svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const overviewItems = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/waitlist', label: 'Waitlist', icon: Users },
		{ href: '/admin/api-keys', label: 'API Keys', icon: Key },
		{ href: '/admin/settings', label: 'Settings', icon: Settings }
	];

	const serviceIcons: Record<string, typeof Triangle> = {
		triangle: Triangle,
		mail: Mail,
		database: Database,
		globe: Globe
	};

	function isActive(href: string): boolean {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}

	async function handleSignOut() {
		await authClient.signOut();
		goto('/login');
	}
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside class="sticky top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-border bg-card">
		<!-- Logo -->
		<div class="flex h-14 items-center border-b border-border px-6">
			<a href="/admin" class="flex items-center gap-2">
				<span
					class="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-[#FFBA71] to-[#FF6798]"
				></span>
				<span class="text-lg font-semibold tracking-tight">Pulse</span>
			</a>
		</div>

		<nav class="flex-1 space-y-6 p-4">
			<!-- Overview -->
			<div>
				<p class="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Overview
				</p>
				<div class="space-y-1">
					{#each overviewItems as item}
						{@const Icon = item.icon}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
								{isActive(item.href)
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
						>
							<Icon class="h-4 w-4" />
							{item.label}
						</a>
					{/each}
				</div>
			</div>

			<!-- Integrations -->
			<div>
				<p class="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Integrations
				</p>
				<div class="space-y-1">
					{#each data.integrations as integration}
						{@const Icon = serviceIcons[integration.icon] ?? Globe}
						{@const href = `/admin/services/${integration.slug}`}
						<a
							{href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
								{isActive(href)
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
						>
							<Icon class="h-4 w-4" />
							{integration.name}
						</a>
					{/each}
					<a
						href="/admin/integrations/add"
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
							{isActive('/admin/integrations')
							? 'bg-accent text-accent-foreground'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					>
						<Plus class="h-4 w-4" />
						Add Integration
					</a>
				</div>
			</div>
		</nav>

		<!-- Bottom section -->
		<div class="border-t border-border p-4">
			<div class="flex items-center justify-between px-3 py-1">
				<ThemeToggle />
			</div>
			<div class="mt-2 flex items-center justify-between px-3">
				<span class="truncate text-xs text-muted-foreground">{data.user.email}</span>
				<button
					onclick={handleSignOut}
					class="text-xs text-muted-foreground hover:text-foreground"
				>
					Sign out
				</button>
			</div>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-auto">
		<div class="mx-auto max-w-7xl px-6 py-8">
			{@render children()}
		</div>
	</main>
</div>

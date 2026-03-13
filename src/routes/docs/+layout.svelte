<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import type { Snippet } from 'svelte';
	import { BookOpen, Zap, Globe, Mail, Database, Triangle, Key, ChevronRight } from 'lucide-svelte';

	let { children }: { children: Snippet } = $props();
	let mobileNavOpen = $state(false);

	const navSections = [
		{
			title: 'Getting Started',
			items: [
				{ href: '/docs/v1', label: 'Introduction', icon: BookOpen },
				{ href: '/docs/v1/api', label: 'API Reference', icon: Zap }
			]
		},
		{
			title: 'Integrations',
			items: [
				{ href: '/docs/v1/integrations/website', label: 'Website', icon: Globe },
				{ href: '/docs/v1/integrations/mailersend', label: 'MailerSend', icon: Mail },
				{ href: '/docs/v1/integrations/vercel', label: 'Vercel', icon: Triangle },
				{ href: '/docs/v1/integrations/planetscale', label: 'PlanetScale', icon: Database }
			]
		},
		{
			title: 'Authentication',
			items: [{ href: '/docs/v1/api/keys', label: 'API Keys', icon: Key }]
		}
	];

	function isActive(href: string): boolean {
		if (href === '/docs/v1') return page.url.pathname === '/docs/v1';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="min-h-screen bg-background">
	<!-- Top nav -->
	<header class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
			<div class="flex items-center gap-6">
				<a href="/" class="flex items-center gap-2">
					<span class="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-[#FFBA71] to-[#FF6798]"></span>
					<span class="text-lg font-semibold tracking-tight">Pulse</span>
				</a>
				<span class="hidden text-sm text-muted-foreground sm:block">
					<ChevronRight class="inline h-3 w-3" />
					Documentation
				</span>
			</div>
			<div class="flex items-center gap-4">
				<a
					href="https://github.com/emmabyte/pulse"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					GitHub
				</a>
				<a
					href="/login"
					class="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign in
				</a>
				<ThemeToggle />
				<button
					aria-label="Toggle navigation"
					onclick={() => (mobileNavOpen = !mobileNavOpen)}
					class="rounded-lg p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-7xl lg:flex">
		<!-- Sidebar (desktop) -->
		<aside class="hidden w-64 shrink-0 lg:block">
			<nav class="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-6">
				{#each navSections as section}
					<div class="mb-6">
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{section.title}
						</p>
						<div class="space-y-0.5">
							{#each section.items as item}
								{@const Icon = item.icon}
								<a
									href={item.href}
									class="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors
										{isActive(item.href)
										? 'bg-accent font-medium text-foreground'
										: 'text-muted-foreground hover:text-foreground'}"
								>
									<Icon class="h-4 w-4" />
									{item.label}
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</nav>
		</aside>

		<!-- Mobile nav -->
		{#if mobileNavOpen}
			<div class="border-b border-border bg-card p-4 lg:hidden">
				{#each navSections as section}
					<div class="mb-4">
						<p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{section.title}
						</p>
						{#each section.items as item}
							{@const Icon = item.icon}
							<a
								href={item.href}
								onclick={() => (mobileNavOpen = false)}
								class="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors
									{isActive(item.href)
									? 'bg-accent font-medium text-foreground'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								<Icon class="h-4 w-4" />
								{item.label}
							</a>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Main content -->
		<main class="min-w-0 flex-1 px-6 py-10 lg:px-12">
			<article class="docs-prose mx-auto max-w-3xl">
				{@render children()}
			</article>
		</main>
	</div>
</div>

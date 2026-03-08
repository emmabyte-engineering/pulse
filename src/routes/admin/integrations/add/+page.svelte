<script lang="ts">
	import type { PageData } from './$types';
	import { Triangle, Mail, Database, Globe, CheckCircle, ArrowRight } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const icons: Record<string, typeof Triangle> = {
		triangle: Triangle,
		mail: Mail,
		database: Database,
		globe: Globe
	};
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight">Add Integration</h1>
		<p class="mt-1 text-sm text-muted-foreground">Connect a service to start receiving events</p>
	</div>

	{#if data.available.length > 0}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.available as integration}
				{@const Icon = icons[integration.icon] ?? Globe}
				<a
					href="/admin/integrations/add/{integration.slug}"
					class="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
				>
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
						<Icon class="h-5 w-5 text-muted-foreground" />
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h3 class="text-sm font-semibold">{integration.name}</h3>
							<ArrowRight class="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
						<p class="mt-1 text-xs text-muted-foreground">{integration.description}</p>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
			All available integrations are already connected.
		</div>
	{/if}

	{#if data.alreadyConnected.length > 0}
		<div>
			<p class="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Already connected</p>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each data.alreadyConnected as integration}
					{@const Icon = icons[integration.icon] ?? Globe}
					<div class="flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-4">
						<Icon class="h-5 w-5 text-muted-foreground" />
						<span class="text-sm font-medium">{integration.name}</span>
						<CheckCircle class="ml-auto h-4 w-4 text-emerald-500" />
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

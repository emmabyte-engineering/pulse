<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { timeAgo } from '$lib/utils';
	import { Plus, MoreVertical, Copy, Check } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showCreateKey = $state(false);
	let copiedKey = $state(false);
	let searchQuery = $state('');
	let openMenuId = $state<string | null>(null);

	const filteredKeys = $derived(
		searchQuery
			? data.apiKeys.filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: data.apiKeys
	);

	function copyKey(key: string) {
		navigator.clipboard.writeText(key);
		copiedKey = true;
		setTimeout(() => (copiedKey = false), 2000);
	}
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">API Keys</h1>
			<p class="mt-1 text-sm text-muted-foreground">Manage API keys for the event ingestion endpoint</p>
		</div>
		<button
			onclick={() => (showCreateKey = !showCreateKey)}
			class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFBA71] to-[#FF6798] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
		>
			<Plus class="h-4 w-4" />
			Create Key
		</button>
	</div>

	<!-- Create form -->
	{#if showCreateKey}
		<div class="rounded-2xl border border-border bg-card p-6">
			<h3 class="text-sm font-medium">Create a new API key</h3>
			<form
				method="POST"
				action="?/createKey"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showCreateKey = false;
					};
				}}
				class="mt-3 flex gap-3"
			>
				<input
					name="name"
					required
					class="flex h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
					placeholder="Key name (e.g., emmabyte-prod)"
				/>
				<button
					type="submit"
					class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Create
				</button>
			</form>
		</div>
	{/if}

	<!-- New key display -->
	{#if form?.newKey}
		<div class="rounded-2xl border border-[#FFBA71]/50 bg-[#FFBA71]/10 p-6">
			<p class="text-sm font-medium text-[#FFBA71]">API key created: {form.keyName}</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Copy this key now — it won't be shown again.
			</p>
			<div class="mt-3 flex items-center gap-2">
				<code class="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">
					{form.newKey}
				</code>
				<button
					onclick={() => copyKey(form?.newKey ?? '')}
					class="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-3 text-xs hover:bg-accent"
				>
					{#if copiedKey}
						<Check class="h-3 w-3" /> Copied
					{:else}
						<Copy class="h-3 w-3" /> Copy
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<!-- Search -->
	<input
		type="text"
		bind:value={searchQuery}
		placeholder="Search keys..."
		class="h-9 w-full max-w-sm rounded-lg border border-input bg-background px-3 text-sm"
	/>

	<!-- Key cards -->
	<div class="grid gap-4 sm:grid-cols-2">
		{#each filteredKeys as apiKey (apiKey.id)}
			<div class="relative rounded-2xl border border-border bg-card p-6">
				<div class="flex items-start justify-between">
					<div>
						<p class="font-medium">{apiKey.name}</p>
						<p class="mt-1 font-mono text-xs text-muted-foreground">{apiKey.prefix}</p>
					</div>
					<div class="flex items-center gap-2">
						{#if apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()}
							<span class="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
								Expired
							</span>
						{:else}
							<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
								Active
							</span>
						{/if}
						<button
							onclick={() => (openMenuId = openMenuId === apiKey.id ? null : apiKey.id)}
							class="rounded-lg p-1 text-muted-foreground hover:bg-accent"
						>
							<MoreVertical class="h-4 w-4" />
						</button>
					</div>
				</div>

				<div class="mt-3 flex gap-4 text-xs text-muted-foreground">
					<span>Created {timeAgo(apiKey.createdAt)}</span>
					{#if apiKey.lastUsedAt}
						<span>Last used {timeAgo(apiKey.lastUsedAt)}</span>
					{:else}
						<span>Never used</span>
					{/if}
				</div>

				{#if openMenuId === apiKey.id}
					<div class="absolute right-6 top-14 z-10 rounded-lg border border-border bg-popover p-1 shadow-lg">
						<form method="POST" action="?/deleteKey" use:enhance>
							<input type="hidden" name="id" value={apiKey.id} />
							<button
								type="submit"
								class="w-full rounded px-3 py-1.5 text-left text-sm text-red-500 hover:bg-accent"
							>
								Revoke Key
							</button>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<div class="col-span-2 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				{searchQuery ? 'No keys matching your search.' : 'No API keys yet. Create one to get started.'}
			</div>
		{/each}
	</div>
</div>

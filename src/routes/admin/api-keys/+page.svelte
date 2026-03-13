<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { timeAgo } from '$lib/utils';
	import * as Dialog from '$components/ui/dialog';
	import * as RadioGroup from '$components/ui/radio-group';
	import { Checkbox } from '$components/ui/checkbox';
	import { Label } from '$components/ui/label';
	import { Plus, MoreVertical, Copy, Check, Shield } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let dialogOpen = $state(false);
	let copiedKey = $state(false);
	let searchQuery = $state('');
	let openMenuId = $state<string | null>(null);

	// Permissions state for checkbox group
	let selectedPermissions = $state<string[]>(['ingest']);

	const filteredKeys = $derived(
		searchQuery
			? data.apiKeys.filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: data.apiKeys
	);

	const permissionLabels: Record<string, string> = {
		ingest: 'Ingest',
		'ingest:read': 'Read',
		admin: 'Admin'
	};

	const permissionOptions = [
		{ value: 'ingest', label: 'Ingest', desc: 'Send events to the ingestion API' },
		{ value: 'ingest:read', label: 'Read', desc: 'Query events and metrics' },
		{ value: 'admin', label: 'Admin', desc: 'Full access including key management' }
	];

	function copyKey(key: string) {
		navigator.clipboard.writeText(key);
		copiedKey = true;
		setTimeout(() => (copiedKey = false), 2000);
	}

	function togglePermission(value: string) {
		if (selectedPermissions.includes(value)) {
			selectedPermissions = selectedPermissions.filter((p) => p !== value);
		} else {
			selectedPermissions = [...selectedPermissions, value];
		}
	}
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">API Keys</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Manage API keys for event ingestion
			</p>
		</div>

		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger
				class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFBA71] to-[#FF6798] px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
			>
				<Plus class="h-4 w-4" />
				Create Key
			</Dialog.Trigger>

			<Dialog.Content class="max-w-md">
				<Dialog.Header>
					<Dialog.Title>Create a new API key</Dialog.Title>
					<Dialog.Description>
						The key will only be shown once after creation.
					</Dialog.Description>
				</Dialog.Header>

				<form
					method="POST"
					action="?/createKey"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							dialogOpen = false;
						};
					}}
					class="space-y-5"
				>
					<!-- Name -->
					<div class="space-y-2">
						<Label for="key-name">Name</Label>
						<input
							id="key-name"
							name="name"
							required
							class="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							placeholder="e.g., production"
						/>
					</div>

					<!-- Expiration -->
					<fieldset class="space-y-2">
						<Label>Expiration</Label>
						<RadioGroup.Root name="expiration" value="90d" orientation="horizontal" class="flex flex-wrap gap-3">
							{#each [{ value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }, { value: '1y', label: '1 year' }, { value: 'never', label: 'Never' }] as opt}
								<div class="flex items-center gap-1.5">
									<RadioGroup.Item value={opt.value} id="exp-{opt.value}" />
									<Label for="exp-{opt.value}" class="font-normal">{opt.label}</Label>
								</div>
							{/each}
						</RadioGroup.Root>
					</fieldset>

					<!-- Permissions -->
					<fieldset class="space-y-2">
						<Label>Permissions</Label>
						<div class="space-y-3">
							{#each permissionOptions as perm}
								<!-- Hidden input for form submission -->
								{#if selectedPermissions.includes(perm.value)}
									<input type="hidden" name="permissions" value={perm.value} />
								{/if}
								<div class="flex items-start gap-2">
									<Checkbox
										id="perm-{perm.value}"
										checked={selectedPermissions.includes(perm.value)}
										onCheckedChange={() => togglePermission(perm.value)}
									/>
									<div class="grid gap-0.5 leading-none">
										<Label for="perm-{perm.value}" class="font-medium">{perm.label}</Label>
										<p class="text-xs text-muted-foreground">{perm.desc}</p>
									</div>
								</div>
							{/each}
						</div>
					</fieldset>

					<Dialog.Footer>
						<Dialog.Close
							class="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent"
						>
							Cancel
						</Dialog.Close>
						<button
							type="submit"
							class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
						>
							Create
						</button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

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

				<!-- Permissions badges -->
				<div class="mt-2 flex flex-wrap gap-1.5">
					{#each apiKey.permissions as perm}
						<span class="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
							<Shield class="h-2.5 w-2.5" />
							{permissionLabels[perm] ?? perm}
						</span>
					{/each}
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

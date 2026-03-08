<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Bell, Trash2, Check, Power, PowerOff, Pencil, Mail, Server, MessageSquare, CheckSquare, Plug } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let addingChannelType = $state<string | null>(null);
	let editingChannelId = $state<string | null>(null);

	const channelIcons: Record<string, typeof Mail> = {
		mailersend: Mail,
		smtp: Server,
		slack: MessageSquare,
		clickup: CheckSquare
	};
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight">Settings</h1>
		<p class="mt-1 text-sm text-muted-foreground">Notification channels and endpoint configuration</p>
	</div>

	{#if form?.channelCreated || form?.channelUpdated}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			{form?.channelCreated ? 'Channel added' : 'Channel updated'} successfully
		</div>
	{/if}

	{#if form?.error}
		<div class="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{form.error}</div>
	{/if}

	<!-- Integrations link -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Plug class="h-5 w-5 text-muted-foreground" />
				<div>
					<h2 class="text-lg font-semibold">Integrations</h2>
					<p class="text-sm text-muted-foreground">Webhook secrets are configured per-integration during setup.</p>
				</div>
			</div>
			<a href="/admin/integrations/add" class="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">
				Manage Integrations
			</a>
		</div>
	</div>

	<!-- Notification Channels -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Bell class="h-5 w-5 text-muted-foreground" />
				<h2 class="text-lg font-semibold">Notification Channels</h2>
			</div>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			Configure where alert notifications are sent. Add multiple channels — all enabled channels receive every alert.
		</p>

		<!-- Existing channels -->
		{#if data.channels.length > 0}
			<div class="mt-6 space-y-4">
				{#each data.channels as channel (channel.id)}
					{@const typeDef = data.channelTypes.find((t) => t.type === channel.type)}
					{@const Icon = channelIcons[channel.type] ?? Bell}
					<div class="rounded-lg border border-border p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Icon class="h-4 w-4 text-muted-foreground" />
								<div>
									<p class="text-sm font-medium">{channel.name}</p>
									<p class="text-xs text-muted-foreground">{typeDef?.name ?? channel.type}</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								{#if channel.enabled}
									<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">Active</span>
								{:else}
									<span class="rounded-full bg-neutral-500/10 px-2 py-0.5 text-xs font-medium text-neutral-500">Disabled</span>
								{/if}
							</div>
						</div>

						{#if editingChannelId === channel.id && typeDef}
							{@const existingConfig = data.channelConfigs[channel.id] ?? {}}
							<form
								method="POST"
								action="?/updateChannel"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										editingChannelId = null;
									};
								}}
								class="mt-4 space-y-3"
							>
								<input type="hidden" name="id" value={channel.id} />
								<div>
									<label for="ch-name-{channel.id}" class="text-xs font-medium text-muted-foreground">Name</label>
									<input id="ch-name-{channel.id}" name="name" value={channel.name} class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" />
								</div>
								{#each typeDef.fields as field}
									<div>
										<label for="ch-{field.key}-{channel.id}" class="text-xs font-medium text-muted-foreground">
											{field.label} {field.required ? '*' : ''}
										</label>
										{#if field.type === 'select' && field.options}
											<select id="ch-{field.key}-{channel.id}" name="config.{field.key}" class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
												{#each field.options as opt}
													<option value={opt.value} selected={existingConfig[field.key] === opt.value}>{opt.label}</option>
												{/each}
											</select>
										{:else}
											<input
												id="ch-{field.key}-{channel.id}"
												name="config.{field.key}"
												type={field.type}
												value={existingConfig[field.key] ?? ''}
												placeholder={field.type === 'password' ? 'Leave blank to keep current' : (field.placeholder ?? '')}
												class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm"
											/>
										{/if}
									</div>
								{/each}
								<div class="flex gap-2">
									<button type="submit" class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save</button>
									<button type="button" onclick={() => (editingChannelId = null)} class="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancel</button>
								</div>
							</form>
						{:else}
							<div class="mt-3 flex gap-2">
								<button onclick={() => (editingChannelId = channel.id)} class="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-3 text-xs hover:bg-accent">
									<Pencil class="h-3 w-3" /> Edit
								</button>
								<form method="POST" action="?/toggleChannel" use:enhance>
									<input type="hidden" name="id" value={channel.id} />
									<input type="hidden" name="enabled" value={channel.enabled ? 'false' : 'true'} />
									<button type="submit" class="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-3 text-xs hover:bg-accent">
										{#if channel.enabled}
											<PowerOff class="h-3 w-3" /> Disable
										{:else}
											<Power class="h-3 w-3" /> Enable
										{/if}
									</button>
								</form>
								<form method="POST" action="?/deleteChannel" use:enhance>
									<input type="hidden" name="id" value={channel.id} />
									<button type="submit" class="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-3 text-xs text-red-500 hover:bg-accent">
										<Trash2 class="h-3 w-3" /> Delete
									</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
				No notification channels configured. Add one below to start receiving alerts.
			</div>
		{/if}

		<!-- Add channel -->
		{#if addingChannelType}
			{@const typeDef = data.channelTypes.find((t) => t.type === addingChannelType)}
			{#if typeDef}
				<div class="mt-6 rounded-lg border border-border p-4">
					<h3 class="text-sm font-medium">Add {typeDef.name} channel</h3>
					<form
						method="POST"
						action="?/createChannel"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
								addingChannelType = null;
							};
						}}
						class="mt-3 space-y-3"
					>
						<input type="hidden" name="type" value={typeDef.type} />
						<div>
							<label for="new-ch-name" class="text-xs font-medium text-muted-foreground">Channel Name *</label>
							<input id="new-ch-name" name="name" required placeholder="e.g. Production Slack" class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" />
						</div>
						{#each typeDef.fields as field}
							<div>
								<label for="new-{field.key}" class="text-xs font-medium text-muted-foreground">
									{field.label} {field.required ? '*' : ''}
								</label>
								{#if field.type === 'select' && field.options}
									<select id="new-{field.key}" name="config.{field.key}" class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
										{#each field.options as opt}
											<option value={opt.value}>{opt.label}</option>
										{/each}
									</select>
								{:else}
									<input
										id="new-{field.key}"
										name="config.{field.key}"
										type={field.type}
										placeholder={field.placeholder ?? ''}
										required={field.required}
										class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm"
									/>
								{/if}
							</div>
						{/each}
						<div class="flex gap-2">
							<button type="submit" class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add Channel</button>
							<button type="button" onclick={() => (addingChannelType = null)} class="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">Cancel</button>
						</div>
					</form>
				</div>
			{/if}
		{:else}
			<div class="mt-6">
				<p class="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Add a channel</p>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{#each data.channelTypes as typeDef}
						{@const Icon = channelIcons[typeDef.type] ?? Bell}
						<button
							onclick={() => (addingChannelType = typeDef.type)}
							class="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 text-left transition-colors hover:border-primary hover:bg-accent"
						>
							<Icon class="h-5 w-5 text-muted-foreground" />
							<div>
								<p class="text-sm font-medium">{typeDef.name}</p>
								<p class="text-xs text-muted-foreground">{typeDef.description}</p>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Webhook Endpoints -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-lg font-semibold">Webhook Endpoints</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Configure these URLs in your external services to start receiving events.
		</p>
		<dl class="mt-4 space-y-3">
			<div>
				<dt class="text-sm font-medium">MailerSend Webhook</dt>
				<dd class="mt-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs">POST /api/webhooks/mailersend</dd>
			</div>
			<div>
				<dt class="text-sm font-medium">Vercel Log Drain</dt>
				<dd class="mt-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs">POST /api/webhooks/vercel</dd>
			</div>
			<div>
				<dt class="text-sm font-medium">Event Ingestion API</dt>
				<dd class="mt-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs">POST /api/ingest (requires API key)</dd>
			</div>
		</dl>
	</div>

	<!-- Health Check -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-lg font-semibold">Health Check</h2>
		<p class="mt-1 text-sm text-muted-foreground">Use this endpoint to verify the service is running.</p>
		<code class="mt-3 block rounded-lg bg-muted px-3 py-2 font-mono text-xs">GET /api/health</code>
	</div>
</div>

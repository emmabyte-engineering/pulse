<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let showCreate = $state(false);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Alert Rules</h1>
		<button
			onclick={() => (showCreate = !showCreate)}
			class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			{showCreate ? 'Cancel' : 'New Alert'}
		</button>
	</div>

	<!-- Create form -->
	{#if showCreate}
		<form method="POST" action="?/create" use:enhance class="rounded-lg border border-border bg-card p-6">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label for="name" class="text-sm font-medium">Name</label>
					<input
						id="name"
						name="name"
						required
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
						placeholder="Hard bounce detected"
					/>
				</div>
				<div class="space-y-2">
					<label for="source" class="text-sm font-medium">Source</label>
					<select
						id="source"
						name="source"
						required
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
					>
						<option value="MAILERSEND">MailerSend</option>
						<option value="VERCEL">Vercel</option>
						<option value="APP">App</option>
						<option value="PLANETSCALE">PlanetScale</option>
					</select>
				</div>
				<div class="space-y-2">
					<label for="eventType" class="text-sm font-medium">Event Type (optional)</label>
					<input
						id="eventType"
						name="eventType"
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
						placeholder="email.hard_bounced"
					/>
				</div>
				<div class="space-y-2">
					<label for="conditionType" class="text-sm font-medium">Condition Type</label>
					<select
						id="conditionType"
						name="conditionType"
						required
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
					>
						<option value="OCCURRENCE">Occurrence (any match)</option>
						<option value="THRESHOLD">Threshold (count exceeds)</option>
						<option value="RATE">Rate (percentage exceeds)</option>
					</select>
				</div>
				<div class="space-y-2">
					<label for="conditionValue" class="text-sm font-medium">Condition Value</label>
					<input
						id="conditionValue"
						name="conditionValue"
						type="number"
						step="0.01"
						required
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
						placeholder="1"
					/>
				</div>
				<div class="space-y-2">
					<label for="windowMinutes" class="text-sm font-medium">Window (minutes)</label>
					<input
						id="windowMinutes"
						name="windowMinutes"
						type="number"
						value="60"
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
					/>
				</div>
				<div class="space-y-2 md:col-span-2">
					<label for="notifyEmail" class="text-sm font-medium">Notify Email</label>
					<input
						id="notifyEmail"
						name="notifyEmail"
						type="email"
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
						placeholder="admin@emmabyte.io"
					/>
				</div>
			</div>
			<div class="mt-4">
				<button
					type="submit"
					class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Create Alert
				</button>
			</div>
		</form>
	{/if}

	<!-- Alert list -->
	<div class="rounded-lg border border-border bg-card">
		<div class="divide-y divide-border">
			{#each data.alerts as alert}
				<div class="flex items-center gap-4 px-6 py-4">
					<div
						class="h-2 w-2 rounded-full {alert.enabled ? 'bg-green-500' : 'bg-gray-500'}"
					></div>
					<div class="flex-1">
						<p class="text-sm font-medium">{alert.name}</p>
						<p class="text-xs text-muted-foreground">
							{alert.source} / {alert.eventType ?? 'any'} — {alert.conditionType} &ge; {alert.conditionValue}
							(window: {alert.windowMinutes}m)
						</p>
					</div>
					<div class="flex gap-2">
						<form method="POST" action="?/toggle" use:enhance>
							<input type="hidden" name="id" value={alert.id} />
							<button
								type="submit"
								class="text-xs text-muted-foreground hover:text-foreground"
							>
								{alert.enabled ? 'Disable' : 'Enable'}
							</button>
						</form>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={alert.id} />
							<button type="submit" class="text-xs text-red-400 hover:text-red-300">
								Delete
							</button>
						</form>
					</div>
				</div>
			{:else}
				<div class="px-6 py-8 text-center text-sm text-muted-foreground">
					No alert rules configured.
				</div>
			{/each}
		</div>
	</div>
</div>

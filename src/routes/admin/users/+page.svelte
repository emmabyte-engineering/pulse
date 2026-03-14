<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Users, UserPlus, Trash2, Check, Shield, User, Clock, Send } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showInviteForm = $state(false);

	const roleIcons: Record<string, typeof Shield> = {
		admin: Shield,
		user: User
	};
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Users</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Manage users and invite new people to this Pulse instance
			</p>
		</div>
		<button
			onclick={() => (showInviteForm = !showInviteForm)}
			class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			<UserPlus class="h-4 w-4" />
			Invite User
		</button>
	</div>

	{#if form?.invited}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			Invite sent to {form.email}
		</div>
	{/if}

	{#if form?.roleChanged}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			Role updated
		</div>
	{/if}

	{#if form?.userRemoved}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			User removed
		</div>
	{/if}

	{#if form?.revoked}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			Invite revoked
		</div>
	{/if}

	{#if form?.error}
		<div class="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{form.error}</div>
	{/if}

	<!-- Invite form -->
	{#if showInviteForm}
		<div class="rounded-2xl border border-border bg-card p-6">
			<h2 class="text-sm font-medium mb-3">Invite a new user</h2>
			<p class="text-xs text-muted-foreground mb-4">
				They'll receive an email with a link to create their account.
			</p>
			<form
				method="POST"
				action="?/invite"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showInviteForm = false;
					};
				}}
				class="flex flex-wrap gap-3"
			>
				<input
					name="email"
					type="email"
					required
					placeholder="email@example.com"
					class="flex h-9 flex-1 min-w-[250px] rounded-lg border border-input bg-background px-3 text-sm"
				/>
				<button
					type="submit"
					class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					<Send class="h-4 w-4" />
					Send Invite
				</button>
				<button
					type="button"
					onclick={() => (showInviteForm = false)}
					class="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent"
				>
					Cancel
				</button>
			</form>
		</div>
	{/if}

	<!-- Current Users -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center gap-2 mb-6">
			<Users class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-lg font-semibold">Active Users</h2>
			<span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
				{data.users.length}
			</span>
		</div>

		<div class="space-y-2">
			{#each data.users as user (user.id)}
				{@const RoleIcon = roleIcons[user.role] ?? User}
				<div class="flex items-center justify-between rounded-lg border border-border p-3">
					<div class="flex items-center gap-3">
						{#if user.image}
							<img src={user.image} alt="" class="h-8 w-8 rounded-full object-cover" />
						{:else}
							<span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
								{user.name?.charAt(0).toUpperCase() ?? '?'}
							</span>
						{/if}
						<div>
							<p class="text-sm font-medium">{user.name}</p>
							<p class="text-xs text-muted-foreground">{user.email}</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
							<RoleIcon class="h-3.5 w-3.5" />
							<span class="capitalize">{user.role}</span>
						</div>
						<span class="text-xs text-muted-foreground">
							Joined {new Date(user.createdAt).toLocaleDateString()}
						</span>
						<div class="flex items-center gap-1">
							<form method="POST" action="?/changeRole" use:enhance class="inline">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="role" value={user.role === 'admin' ? 'user' : 'admin'} />
								<button
									type="submit"
									class="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
								>
									{user.role === 'admin' ? 'Demote' : 'Promote'}
								</button>
							</form>
							<form method="POST" action="?/removeUser" use:enhance class="inline">
								<input type="hidden" name="userId" value={user.id} />
								<button type="submit" class="rounded p-1 text-red-500 hover:bg-accent">
									<Trash2 class="h-3.5 w-3.5" />
								</button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Pending Invites -->
	{#if data.pendingInvites.length > 0}
		<div class="rounded-2xl border border-border bg-card p-6">
			<div class="flex items-center gap-2 mb-6">
				<Clock class="h-5 w-5 text-muted-foreground" />
				<h2 class="text-lg font-semibold">Pending Invites</h2>
				<span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
					{data.pendingInvites.length}
				</span>
			</div>

			<div class="space-y-2">
				{#each data.pendingInvites as invite (invite.id)}
					<div class="flex items-center justify-between rounded-lg border border-dashed border-border p-3">
						<div>
							<p class="text-sm font-medium">{invite.email}</p>
							<p class="text-xs text-muted-foreground">
								Sent {new Date(invite.createdAt).toLocaleDateString()} &middot;
								Expires {new Date(invite.expiresAt).toLocaleDateString()}
							</p>
						</div>
						<div class="flex items-center gap-2">
							<form method="POST" action="?/invite" use:enhance class="inline">
								<input type="hidden" name="email" value={invite.email} />
								<button type="submit" class="text-xs text-muted-foreground hover:text-foreground">
									Resend
								</button>
							</form>
							<form method="POST" action="?/revokeInvite" use:enhance class="inline">
								<input type="hidden" name="id" value={invite.id} />
								<button type="submit" class="text-xs text-red-500 hover:text-red-600">
									Revoke
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

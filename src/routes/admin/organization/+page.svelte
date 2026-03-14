<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Check, Building2, Users, UserPlus, Trash2, Crown, Shield, User } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showInviteForm = $state(false);

	const roleIcons: Record<string, typeof Crown> = {
		owner: Crown,
		admin: Shield,
		member: User
	};

	const planColors: Record<string, string> = {
		free: 'bg-neutral-500/10 text-neutral-500',
		pro: 'bg-blue-500/10 text-blue-500',
		enterprise: 'bg-purple-500/10 text-purple-500'
	};
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight">Organization</h1>
		<p class="mt-1 text-sm text-muted-foreground">Manage your organization and team members</p>
	</div>

	{#if form?.orgUpdated || form?.inviteSent || form?.memberRemoved || form?.roleChanged || form?.inviteCanceled}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			{#if form?.orgUpdated}Organization updated successfully
			{:else if form?.inviteSent}Invite sent successfully
			{:else if form?.memberRemoved}Member removed
			{:else if form?.roleChanged}Role updated
			{:else if form?.inviteCanceled}Invite canceled
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div class="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{form.error}</div>
	{/if}

	{#if !data.organization}
		<div class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
			You are not a member of any organization.
		</div>
	{:else}
		<!-- Organization Details -->
		<div class="rounded-2xl border border-border bg-card p-6">
			<div class="flex items-center gap-2 mb-6">
				<Building2 class="h-5 w-5 text-muted-foreground" />
				<h2 class="text-lg font-semibold">Organization Details</h2>
				<span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize {planColors[data.organization.plan] ?? planColors.free}">
					{data.organization.plan}
				</span>
			</div>

			<form method="POST" action="?/updateOrg" use:enhance class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="org-name" class="text-xs font-medium text-muted-foreground">Name</label>
						<input
							id="org-name"
							name="name"
							value={data.organization.name}
							required
							disabled={data.userRole !== 'owner'}
							class="mt-1 flex h-9 w-full rounded-lg border border-input px-3 text-sm {data.userRole !== 'owner' ? 'bg-muted text-muted-foreground' : 'bg-background'}"
						/>
					</div>
					<div>
						<label for="org-slug" class="text-xs font-medium text-muted-foreground">Slug</label>
						<input
							id="org-slug"
							name="slug"
							value={data.organization.slug}
							required
							disabled={data.userRole !== 'owner'}
							pattern="[a-z0-9-]+"
							class="mt-1 flex h-9 w-full rounded-lg border border-input px-3 font-mono text-sm {data.userRole !== 'owner' ? 'bg-muted text-muted-foreground' : 'bg-background'}"
						/>
					</div>
				</div>
				{#if data.userRole === 'owner'}
					<button type="submit" class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
						Save Changes
					</button>
				{/if}
			</form>
		</div>

		<!-- Members -->
		<div class="rounded-2xl border border-border bg-card p-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-2">
					<Users class="h-5 w-5 text-muted-foreground" />
					<h2 class="text-lg font-semibold">Members</h2>
					<span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
						{data.members.length}
					</span>
				</div>
				{#if ['owner', 'admin'].includes(data.userRole)}
					<button
						onclick={() => (showInviteForm = !showInviteForm)}
						class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						<UserPlus class="h-4 w-4" />
						Invite Member
					</button>
				{/if}
			</div>

			{#if showInviteForm}
				<div class="mb-6 rounded-lg border border-border p-4">
					<h3 class="text-sm font-medium mb-3">Invite a new member</h3>
					<form
						method="POST"
						action="?/inviteMember"
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
							class="flex h-9 flex-1 min-w-[200px] rounded-lg border border-input bg-background px-3 text-sm"
						/>
						<select name="role" class="flex h-9 rounded-lg border border-input bg-background px-3 text-sm">
							<option value="member">Member</option>
							<option value="admin">Admin</option>
						</select>
						<button type="submit" class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
							Send Invite
						</button>
						<button type="button" onclick={() => (showInviteForm = false)} class="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent">
							Cancel
						</button>
					</form>
				</div>
			{/if}

			<div class="space-y-2">
				{#each data.members as member (member.id)}
					{@const RoleIcon = roleIcons[member.role] ?? User}
					<div class="flex items-center justify-between rounded-lg border border-border p-3">
						<div class="flex items-center gap-3">
							<RoleIcon class="h-4 w-4 text-muted-foreground" />
							<div>
								<p class="text-sm font-medium">{member.user.name}</p>
								<p class="text-xs text-muted-foreground">{member.user.email}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
								{member.role}
							</span>
							{#if data.userRole === 'owner' && member.role !== 'owner'}
								<form method="POST" action="?/changeRole" use:enhance class="inline">
									<input type="hidden" name="memberId" value={member.id} />
									<input type="hidden" name="role" value={member.role === 'admin' ? 'member' : 'admin'} />
									<button type="submit" class="text-xs text-muted-foreground hover:text-foreground">
										{member.role === 'admin' ? 'Demote' : 'Promote'}
									</button>
								</form>
								<form method="POST" action="?/removeMember" use:enhance class="inline">
									<input type="hidden" name="memberId" value={member.id} />
									<button type="submit" class="text-red-500 hover:text-red-600">
										<Trash2 class="h-3.5 w-3.5" />
									</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Pending Invites -->
			{#if data.invites.length > 0}
				<div class="mt-6">
					<h3 class="text-sm font-medium text-muted-foreground mb-3">Pending Invites</h3>
					<div class="space-y-2">
						{#each data.invites as invite (invite.id)}
							<div class="flex items-center justify-between rounded-lg border border-dashed border-border p-3">
								<div>
									<p class="text-sm font-medium">{invite.email}</p>
									<p class="text-xs text-muted-foreground">
										Invited as {invite.role} &middot; Expires {new Date(invite.expiresAt).toLocaleDateString()}
									</p>
								</div>
								{#if ['owner', 'admin'].includes(data.userRole)}
									<form method="POST" action="?/cancelInvite" use:enhance>
										<input type="hidden" name="inviteId" value={invite.id} />
										<button type="submit" class="text-xs text-red-500 hover:text-red-600">Cancel</button>
									</form>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

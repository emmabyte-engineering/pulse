<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Check, UserCircle, Lock } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight">Profile</h1>
		<p class="mt-1 text-sm text-muted-foreground">Manage your account details</p>
	</div>

	{#if form?.profileUpdated}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			Profile updated successfully
		</div>
	{/if}

	{#if form?.passwordChanged}
		<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
			<Check class="h-4 w-4" />
			Password changed successfully
		</div>
	{/if}

	{#if form?.error}
		<div class="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{form.error}</div>
	{/if}

	<!-- Profile Details -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center gap-2 mb-6">
			<UserCircle class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-lg font-semibold">Profile Details</h2>
		</div>

		<form method="POST" action="?/updateProfile" use:enhance class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="name" class="text-xs font-medium text-muted-foreground">Name</label>
					<input
						id="name"
						name="name"
						value={data.profile.name}
						required
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
					/>
				</div>
				<div>
					<label for="email" class="text-xs font-medium text-muted-foreground">Email</label>
					<input
						id="email"
						value={data.profile.email}
						disabled
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
					/>
				</div>
				<div>
					<label for="image" class="text-xs font-medium text-muted-foreground">Avatar URL</label>
					<input
						id="image"
						name="image"
						value={data.profile.image ?? ''}
						placeholder="https://example.com/avatar.png"
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
					/>
				</div>
				<div>
					<label for="role" class="text-xs font-medium text-muted-foreground">Role</label>
					<input
						id="role"
						value={data.profile.role}
						disabled
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm capitalize text-muted-foreground"
					/>
				</div>
			</div>

			<div>
				<label for="created-at" class="text-xs font-medium text-muted-foreground">Account Created</label>
				<input
					id="created-at"
					value={new Date(data.profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
					disabled
					class="mt-1 flex h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground sm:max-w-xs"
				/>
			</div>

			<button type="submit" class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
				Save Changes
			</button>
		</form>
	</div>

	<!-- Change Password -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center gap-2 mb-6">
			<Lock class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-lg font-semibold">Change Password</h2>
		</div>

		<form method="POST" action="?/changePassword" use:enhance class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-3">
				<div>
					<label for="currentPassword" class="text-xs font-medium text-muted-foreground">Current Password</label>
					<input
						id="currentPassword"
						name="currentPassword"
						type="password"
						required
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
					/>
				</div>
				<div>
					<label for="newPassword" class="text-xs font-medium text-muted-foreground">New Password</label>
					<input
						id="newPassword"
						name="newPassword"
						type="password"
						required
						minlength={8}
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
					/>
				</div>
				<div>
					<label for="confirmPassword" class="text-xs font-medium text-muted-foreground">Confirm New Password</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minlength={8}
						class="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
					/>
				</div>
			</div>

			<button type="submit" class="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
				Change Password
			</button>
		</form>
	</div>
</div>

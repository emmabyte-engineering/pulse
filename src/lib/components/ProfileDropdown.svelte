<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { ChevronDown, LayoutDashboard, UserCircle, LogOut } from 'lucide-svelte';

	let { user }: { user: { name: string; email: string; image?: string | null; role?: string } } =
		$props();
	let open = $state(false);

	function close() {
		open = false;
	}

	async function handleSignOut() {
		close();
		await authClient.signOut();
		goto('/login');
	}
</script>

<svelte:window
	onclick={(e) => {
		if (open && !(e.target as HTMLElement)?.closest('[data-profile-dropdown]')) {
			close();
		}
	}}
/>

<div class="relative" data-profile-dropdown>
	<button
		onclick={() => (open = !open)}
		class="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		{#if user.image}
			<img src={user.image} alt="" class="h-6 w-6 rounded-full object-cover" />
		{:else}
			<span
				class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
			>
				{user.name?.charAt(0).toUpperCase() ?? '?'}
			</span>
		{/if}
		<span class="hidden sm:inline">{user.name}</span>
		<ChevronDown class="h-3 w-3" />
	</button>

	{#if open}
		<div
			class="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg"
		>
			<div class="border-b border-border px-3 py-2">
				<p class="text-sm font-medium">{user.name}</p>
				<p class="truncate text-xs text-muted-foreground">{user.email}</p>
			</div>
			<div class="py-1">
				{#if user.role === 'admin'}
					<a
						href="/admin"
						onclick={close}
						class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
					>
						<LayoutDashboard class="h-4 w-4" />
						Dashboard
					</a>
				{/if}
				<a
					href="/admin/profile"
					onclick={close}
					class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<UserCircle class="h-4 w-4" />
					Profile
				</a>
			</div>
			<div class="border-t border-border py-1">
				<button
					onclick={handleSignOut}
					class="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<LogOut class="h-4 w-4" />
					Sign out
				</button>
			</div>
		</div>
	{/if}
</div>

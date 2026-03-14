<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Building2 } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-background">
	<div class="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
		<Building2 class="mx-auto h-12 w-12 text-muted-foreground" />

		{#if !data.valid}
			<h1 class="mt-4 text-xl font-semibold">Invalid Invite</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				This invite link is invalid or has expired.
			</p>
			<a
				href="/login"
				class="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Go to Login
			</a>
		{:else}
			<h1 class="mt-4 text-xl font-semibold">Join {data.orgName}</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				You've been invited to join <strong>{data.orgName}</strong> on Pulse.
			</p>

			{#if form?.error}
				<div class="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{form.error}</div>
			{/if}

			<form method="POST" use:enhance class="mt-6">
				<button
					type="submit"
					class="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Join Organization
				</button>
			</form>
		{/if}
	</div>
</div>

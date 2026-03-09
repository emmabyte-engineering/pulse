<script lang="ts">
	import type { PageData } from './$types';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let name = $state('');
	let password = $state('');
	let orgName = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSignup() {
		loading = true;
		error = '';

		if (!name.trim()) {
			error = 'Name is required';
			loading = false;
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			loading = false;
			return;
		}

		// Register with better-auth
		const result = await authClient.signUp.email({
			email: data.email,
			password,
			name: name.trim()
		});

		if (result.error) {
			error = result.error.message ?? 'Registration failed. Please try again.';
			loading = false;
			return;
		}

		// Mark invite as used and create org via API
		await fetch(`/api/invite/complete`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: data.token,
				orgName: orgName.trim() || undefined
			})
		});

		goto('/admin');
	}
</script>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<!-- Background -->
	<div class="pointer-events-none absolute inset-0">
		<div
			class="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-[drift_20s_ease-in-out_infinite] rounded-full bg-[#FA586D]/8 blur-[120px]"
		></div>
		<div
			class="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] animate-[drift_25s_ease-in-out_infinite_reverse] rounded-full bg-[#FFBA71]/8 blur-[120px]"
		></div>
	</div>
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"
	></div>

	<div class="relative z-10 w-full max-w-sm space-y-6 px-6">
		<!-- Logo -->
		<div class="text-center">
			<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
				<div
					class="h-4 w-4 rounded-full bg-gradient-to-br from-[#FFBA71] to-[#FF6798] shadow-[0_0_20px_rgba(250,88,109,.5)]"
				></div>
			</div>
			<h1 class="text-2xl font-semibold">Create your account</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				You've been invited to join Pulse
			</p>
		</div>

		<form onsubmit={handleSignup} class="space-y-4">
			{#if error}
				<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<div class="space-y-2">
				<label for="email" class="text-sm font-medium">Email</label>
				<input
					id="email"
					type="email"
					value={data.email}
					disabled
					class="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
				/>
			</div>

			<div class="space-y-2">
				<label for="name" class="text-sm font-medium">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					placeholder="Your name"
					class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>

			<div class="space-y-2">
				<label for="password" class="text-sm font-medium">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength={8}
					placeholder="At least 8 characters"
					class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>

			<div class="space-y-2">
				<label for="orgName" class="text-sm font-medium">
					Organization name
					<span class="font-normal text-muted-foreground">(optional)</span>
				</label>
				<input
					id="orgName"
					type="text"
					bind:value={orgName}
					placeholder="Your company or team"
					class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="inline-flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] text-sm font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(250,88,109,.3)] disabled:opacity-50"
			>
				{loading ? 'Creating account...' : 'Create Account'}
			</button>
		</form>

		<p class="text-center text-xs text-muted-foreground">
			Already have an account?
			<a href="/login" class="text-foreground hover:underline">Sign in</a>
		</p>
	</div>
</div>

<style>
	@keyframes drift {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		25% {
			transform: translate(30px, -40px) scale(1.05);
		}
		50% {
			transform: translate(-20px, 20px) scale(0.95);
		}
		75% {
			transform: translate(40px, 30px) scale(1.02);
		}
	}
</style>

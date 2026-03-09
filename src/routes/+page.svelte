<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Activity, Bell, Plug, Shield, Check } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const user = $derived(data.user);
	const waitlistCount = $derived(data.waitlistCount);

	const features = [
		{
			icon: Activity,
			title: 'Real-time Events',
			description: 'Stream webhooks and logs from every service as they happen.'
		},
		{
			icon: Bell,
			title: 'Smart Alerts',
			description: 'Set thresholds and get notified before issues escalate.'
		},
		{
			icon: Plug,
			title: 'Integrations',
			description: 'Connect MailerSend, Vercel, GitHub, AWS, and more.'
		},
		{
			icon: Shield,
			title: 'Self-hosted or Cloud',
			description: 'Run on your own infrastructure or let us handle it.'
		}
	];
</script>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<!-- Animated gradient background -->
	<div class="pointer-events-none absolute inset-0">
		<div
			class="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-[drift_20s_ease-in-out_infinite] rounded-full bg-[#FA586D]/8 blur-[120px]"
		></div>
		<div
			class="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] animate-[drift_25s_ease-in-out_infinite_reverse] rounded-full bg-[#FFBA71]/8 blur-[120px]"
		></div>
		<div
			class="absolute left-1/3 top-1/2 h-[400px] w-[400px] animate-[drift_18s_ease-in-out_infinite_2s] rounded-full bg-[#FF6798]/5 blur-[100px]"
		></div>
	</div>

	<!-- Grid overlay -->
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"
	></div>

	<!-- Content -->
	<div class="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
		<!-- Pulse icon / animated ring -->
		<div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
			<div class="absolute h-20 w-20 animate-ping rounded-full bg-[#FA586D]/20"></div>
			<div
				class="absolute h-16 w-16 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s] rounded-full bg-[#FA586D]/15"
			></div>
			<div
				class="relative h-5 w-5 rounded-full bg-gradient-to-br from-[#FFBA71] to-[#FF6798] shadow-[0_0_20px_rgba(250,88,109,.5)]"
			></div>
		</div>

		<h1
			class="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl"
		>
			Observability, simplified.
		</h1>

		<p class="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
			Stop juggling dashboards. Pulse brings your webhooks, logs, and alerts into one place.
		</p>

		<!-- Feature cards -->
		<div class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each features as feature}
				{@const Icon = feature.icon}
				<div
					class="rounded-xl border border-border/50 bg-card/50 p-5 text-left backdrop-blur-sm transition-colors hover:border-border"
				>
					<Icon class="mb-3 h-5 w-5 text-[#FFBA71]" />
					<h3 class="text-sm font-medium text-foreground">{feature.title}</h3>
					<p class="mt-1 text-sm text-muted-foreground">{feature.description}</p>
				</div>
			{/each}
		</div>

		<!-- CTA -->
		<div class="mt-12">
			{#if user}
				<a
					href="/admin"
					class="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] px-8 text-sm font-medium text-white transition-all hover:shadow-[0_0_24px_rgba(250,88,109,.4)]"
				>
					Open Dashboard
					<svg
						class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
			{:else if form?.success}
				<div class="mx-auto flex max-w-md flex-col items-center gap-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10"
					>
						<Check class="h-6 w-6 text-emerald-500" />
					</div>
					<p class="text-sm font-medium text-foreground">You're on the list!</p>
					<p class="text-sm text-muted-foreground">
						We'll let you know when Pulse is ready for you.
					</p>
				</div>
			{:else}
				<form method="POST" action="?/joinWaitlist" use:enhance class="mx-auto max-w-md">
					<div class="flex gap-2">
						<input
							type="email"
							name="email"
							placeholder="you@company.com"
							required
							class="h-12 flex-1 rounded-xl border border-border/50 bg-card/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm focus:border-[#FF9185] focus:outline-none focus:ring-1 focus:ring-[#FF9185]"
						/>
						<input type="hidden" name="source" value="landing" />
						<button
							type="submit"
							class="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] px-6 text-sm font-medium text-white transition-all hover:shadow-[0_0_24px_rgba(250,88,109,.4)]"
						>
							Join Waitlist
						</button>
					</div>
					{#if form?.error}
						<p class="mt-2 text-sm text-red-400">{form.error}</p>
					{/if}
				</form>
				{#if waitlistCount > 0}
					<p class="mt-4 text-sm text-muted-foreground/60">
						Join {waitlistCount.toLocaleString()}+ others on the waitlist
					</p>
				{/if}
			{/if}
		</div>

		<!-- Footer -->
		<div class="mt-16 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
			<a href="/login" class="transition-colors hover:text-muted-foreground">
				Already have access? Sign in
			</a>
		</div>
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

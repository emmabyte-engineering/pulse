<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();

	const user = $derived(data.user);
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
	<div class="relative z-10 mx-auto max-w-2xl px-6 text-center">
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
			Pulse
		</h1>

		<p class="mt-4 text-lg text-muted-foreground">
			Observability for <span class="text-foreground">Emmabyte</span> infrastructure.
			<br class="hidden sm:block" />
			Webhooks, logs, and alerts in one place.
		</p>

		<!-- Feature pills -->
		<div class="mt-8 flex flex-wrap items-center justify-center gap-2">
			{#each ['MailerSend', 'Vercel', 'PlanetScale', 'App Events'] as source}
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-[#FFBA71]"></span>
					{source}
				</span>
			{/each}
		</div>

		<!-- CTA -->
		<div class="mt-10 flex items-center justify-center gap-4">
			{#if user}
				<a
					href="/admin"
					class="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] px-8 text-sm font-medium text-white transition-all hover:shadow-[0_0_24px_rgba(250,88,109,.4)]"
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
			{:else}
				<a
					href="/login"
					class="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] px-8 text-sm font-medium text-white transition-all hover:shadow-[0_0_24px_rgba(250,88,109,.4)]"
				>
					Sign In
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
				<a
					href="/login"
					class="inline-flex h-11 items-center justify-center rounded-xl border border-border/50 bg-card/50 px-6 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					View Docs
				</a>
			{/if}
		</div>

		<!-- Status line -->
		<div class="mt-16 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
			<span class="relative flex h-2 w-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFBA71] opacity-75"
				></span>
				<span class="relative inline-flex h-2 w-2 rounded-full bg-[#FFBA71]"></span>
			</span>
			All systems operational
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

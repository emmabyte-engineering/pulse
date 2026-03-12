<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import {
		Activity,
		Bell,
		Plug,
		Shield,
		Check,
		Search,
		BarChart3,
		Code2,
		Zap,
		ArrowRight
	} from 'lucide-svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const waitlistCount = $derived(data.waitlistCount);

	const features = [
		{
			icon: Activity,
			title: 'Real-time Monitoring',
			description: 'Watch your metrics update in real-time with sub-second latency dashboards.',
			available: true
		},
		{
			icon: Bell,
			title: 'Smart Alerts',
			description: 'Set thresholds and get notified before issues escalate.',
			available: true
		},
		{
			icon: Plug,
			title: 'Integrations',
			description: 'Connect MailerSend, Vercel, and more via webhooks and APIs.',
			available: true
		},
		{
			icon: Shield,
			title: 'Self-hosted or Cloud',
			description: 'Run on your own infrastructure or let us handle it.',
			available: true
		},
		{
			icon: Search,
			title: 'Full-text Search',
			description: 'Search through all your logs and events in milliseconds.',
			available: false
		},
		{
			icon: BarChart3,
			title: 'Custom Dashboards',
			description: 'Build dashboards with the metrics that matter to your team.',
			available: false
		},
		{
			icon: Code2,
			title: 'Developer SDK',
			description: 'Send custom events from any app with our lightweight SDK.',
			available: false
		},
		{
			icon: Zap,
			title: 'Instant Setup',
			description: 'Get started in minutes with Docker Compose or our cloud platform.',
			available: false
		}
	];

	const integrations = [
		{ name: 'MailerSend', available: true },
		{ name: 'Vercel', available: true },
		{ name: 'GitHub', available: false },
		{ name: 'AWS', available: false },
		{ name: 'Slack', available: false },
		{ name: 'PagerDuty', available: false },
		{ name: 'Docker', available: false },
		{ name: 'PostgreSQL', available: false }
	];

	const stats = [
		{ label: 'Total Requests', value: '2.4M', change: '+12%', positive: true },
		{ label: 'Error Rate', value: '0.02%', change: '-5%', positive: true },
		{ label: 'Avg. Response', value: '89ms', change: '-18%', positive: true },
		{ label: 'Active Users', value: '12.8K', change: '+8%', positive: true }
	];
</script>

<svelte:head>
	<title>Pulse — Unified Observability for Modern Teams</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Nav -->
	<nav class="border-b border-border" aria-label="Main navigation">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
			<div class="flex items-center gap-2">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFBA71]/20 to-[#FF6798]/20"
				>
					<Zap class="h-4 w-4 text-[#b93a54]" />
				</div>
				<span class="text-lg font-semibold text-foreground">Pulse</span>
			</div>
			<div class="flex items-center gap-4">
				<ThemeToggle />
				<a href="/login" class="text-sm text-muted-foreground transition-colors hover:text-foreground">
					Log in
				</a>
			</div>
		</div>
	</nav>

	<main>
	<!-- Hero -->
	<section class="relative overflow-x-hidden">
		<!-- Background gradient blobs -->
		<div class="pointer-events-none absolute inset-0">
			<div
				class="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#FFBA71]/10 to-[#FF6798]/10 blur-[80px]"
			></div>
			<div
				class="absolute -left-32 top-1/2 h-[400px] w-[400px] rounded-full bg-[#FF6798]/5 blur-[80px]"
			></div>
		</div>

		<div class="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-center sm:pt-28">
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
				Unified observability
				<br />
				<span
					class="bg-gradient-to-r from-[#e85d75] to-[#c94e65] bg-clip-text text-transparent"
				>
					for modern teams
				</span>
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
				Integrate logs, metrics, and traces from all your platforms. Debug faster, monitor
				smarter, and ship with confidence.
			</p>

			<!-- Waitlist / CTA -->
			<div class="mt-10">
				{#if form?.success}
					<div class="mx-auto flex max-w-md flex-col items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10"
						>
							<Check class="h-6 w-6 text-emerald-700" />
						</div>
						<p class="text-sm font-medium text-foreground">You're on the list!</p>
						<p class="text-sm text-muted-foreground">
							We'll let you know when Pulse is ready for you.
						</p>
					</div>
				{:else}
					<form method="POST" action="?/joinWaitlist" use:enhance class="mx-auto max-w-md">
						<div class="flex gap-2">
							<label for="waitlist-email" class="sr-only">Email address</label>
							<input
								id="waitlist-email"
								type="email"
								name="email"
								placeholder="you@company.com"
								required
								aria-label="Email address"
								class="h-12 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#e85d75] focus:outline-none focus:ring-1 focus:ring-[#e85d75]"
							/>
							<input type="hidden" name="source" value="landing" />
							<button
								type="submit"
								class="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] px-6 text-sm font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(250,88,109,.3)]"
							>
								Join Waitlist
								<ArrowRight
									class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
								/>
							</button>
						</div>
						{#if form?.error}
							<p class="mt-2 text-sm text-red-500">{form.error}</p>
						{/if}
					</form>
					{#if waitlistCount > 0}
						<p class="mt-3 text-sm text-muted-foreground">
							Join {waitlistCount.toLocaleString()}+ others on the waitlist
						</p>
					{/if}
				{/if}
			</div>
		</div>
	</section>

	<!-- Dashboard Preview -->
	<section class="px-6 pb-24">
		<div class="mx-auto max-w-5xl">
			<div class="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
				<!-- Browser chrome -->
				<div class="flex items-center gap-2 border-b border-border px-4 py-3">
					<div class="flex gap-1.5">
						<div class="h-3 w-3 rounded-full bg-[#FF5F57]"></div>
						<div class="h-3 w-3 rounded-full bg-[#FEBC2E]"></div>
						<div class="h-3 w-3 rounded-full bg-[#28C840]"></div>
					</div>
					<div class="flex-1 text-center text-xs text-muted-foreground">pulse.emmabyte.io/dashboard</div>
				</div>
				<!-- Stats row -->
				<div class="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
					{#each stats as stat}
						<div class="rounded-lg border border-border p-4">
							<p class="text-xs text-muted-foreground">{stat.label}</p>
							<p class="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
							<p class="mt-1 text-xs {stat.positive ? 'text-emerald-700' : 'text-red-500'}">
								{stat.change} from last week
							</p>
						</div>
					{/each}
				</div>
				<!-- Chart + Events -->
				<div class="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2">
					<div class="rounded-lg border border-border p-4">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium text-foreground">Request Volume</p>
							<p class="text-xs text-muted-foreground">Last 24h</p>
						</div>
						<div class="mt-4 flex items-end gap-1">
							{#each [35, 42, 28, 55, 48, 62, 45, 70, 58, 75, 68, 82] as h}
								<div
									class="flex-1 rounded-sm bg-gradient-to-t from-[#e85d75] to-[#e8788c]"
									style="height: {h}px"
								></div>
							{/each}
						</div>
					</div>
					<div class="rounded-lg border border-border p-4">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium text-foreground">Recent Events</p>
							<p class="text-xs text-[#b93a54]">View all</p>
						</div>
						<div class="mt-4 space-y-3">
							<div class="flex items-start gap-2">
								<div class="mt-1.5 h-2 w-2 rounded-full bg-blue-400"></div>
								<div>
									<p class="text-sm text-foreground">Deployment completed successfully</p>
									<p class="text-xs text-muted-foreground">2m ago</p>
								</div>
							</div>
							<div class="flex items-start gap-2">
								<div class="mt-1.5 h-2 w-2 rounded-full bg-amber-400"></div>
								<div>
									<p class="text-sm text-foreground">High latency detected on /api/users</p>
									<p class="text-xs text-muted-foreground">5m ago</p>
								</div>
							</div>
							<div class="flex items-start gap-2">
								<div class="mt-1.5 h-2 w-2 rounded-full bg-emerald-400"></div>
								<div>
									<p class="text-sm text-foreground">Database migration completed</p>
									<p class="text-xs text-muted-foreground">12m ago</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="border-t border-border bg-muted/50 py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="text-center">
				<p class="text-sm font-semibold uppercase tracking-wider text-[#b93a54]">Features</p>
				<h2 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Everything you need to monitor your stack
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-muted-foreground">
					Powerful tools designed for developers who demand reliability and performance from
					their applications.
				</p>
			</div>
			<div class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each features as feature}
					{@const Icon = feature.icon}
					<div
						class="relative rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
					>
						{#if !feature.available}
							<span
								class="absolute right-3 top-3 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
							>
								Coming soon
							</span>
						{/if}
						<div
							class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg {feature.available ? 'bg-[#e85d75]/8' : 'bg-muted'}"
						>
							<Icon class="h-5 w-5 {feature.available ? 'text-[#b93a54]' : 'text-muted-foreground'}" />
						</div>
						<h3 class="text-sm font-semibold {feature.available ? 'text-foreground' : 'text-muted-foreground'}">{feature.title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Integrations -->
	<section class="border-t border-border py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="text-center">
				<p class="text-sm font-semibold uppercase tracking-wider text-[#b93a54]">
					Integrations
				</p>
				<h2 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Connect everything in your stack
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-muted-foreground">
					Native integrations to collect logs, metrics, and events from all your services
					automatically.
				</p>
			</div>
			<div class="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-4">
				{#each integrations as integration}
					<div
						class="relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-4 transition-shadow hover:shadow-md"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground"
						>
							{integration.name.slice(0, 2)}
						</div>
						<span class="text-xs text-muted-foreground">{integration.name}</span>
						{#if !integration.available}
							<span class="text-xs font-medium text-muted-foreground">Coming soon</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA Banner -->
	<section class="px-6 py-24">
		<div class="mx-auto max-w-5xl">
			<div
				class="overflow-hidden rounded-2xl bg-gradient-to-br from-[#e07080] to-[#c94e65] px-6 py-20 text-center"
			>
				<h2 class="text-3xl font-bold text-white sm:text-4xl">Ready to see everything?</h2>
				<p class="mx-auto mt-4 max-w-lg text-lg text-white/80">
					Join the waitlist and be first to try Pulse when we launch.
				</p>
				<div class="mt-8">
					{#if form?.success}
						<div class="flex flex-col items-center gap-2">
							<Check class="h-8 w-8 text-white" />
							<p class="text-sm font-medium text-white">You're on the list!</p>
						</div>
					{:else}
						<form
							method="POST"
							action="?/joinWaitlist"
							use:enhance
							class="mx-auto flex max-w-md gap-2"
						>
							<label for="cta-email" class="sr-only">Email address</label>
							<input
								id="cta-email"
								type="email"
								name="email"
								placeholder="you@company.com"
								required
								aria-label="Email address"
								class="h-12 flex-1 rounded-xl border border-white/30 bg-card/15 px-4 text-sm text-white placeholder:text-white/80 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
							/>
							<input type="hidden" name="source" value="landing" />
							<button
								type="submit"
								class="group inline-flex h-12 items-center gap-2 rounded-xl bg-card px-6 text-sm font-medium text-[#b93a54] transition-shadow hover:shadow-lg"
							>
								Join Waitlist
								<ArrowRight
									class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
								/>
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</section>

	</main>

	<!-- Footer -->
	<footer class="border-t border-border">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row"
		>
			<div class="flex items-center gap-4 text-sm text-muted-foreground">
				<span>&copy; {new Date().getFullYear()} Pulse</span>
				<span class="text-border">|</span>
				<span>
					A product of
					<a
						href="https://emmabyte.io"
						class="text-muted-foreground transition-colors hover:text-foreground"
						target="_blank"
						rel="noopener noreferrer"
					>
						Emmabyte Engineering, Inc.
					</a>
				</span>
			</div>
			<div class="flex items-center gap-6 text-sm text-muted-foreground">
				<a href="/login" class="transition-colors hover:text-muted-foreground">Sign in</a>
			</div>
		</div>
	</footer>
</div>

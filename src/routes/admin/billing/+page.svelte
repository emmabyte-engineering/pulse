<script lang="ts">
	import type { PageData } from './$types';
	import { CreditCard, Zap, BarChart3, Check } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const planDefs = [
		{
			name: 'Free',
			key: 'free',
			price: '$0',
			period: 'forever',
			features: ['1,000 events/month', '7-day retention', '1 integration', 'Email alerts']
		},
		{
			name: 'Pro',
			key: 'pro',
			price: '$29',
			period: '/month',
			features: [
				'100,000 events/month',
				'90-day retention',
				'Unlimited integrations',
				'Slack + email alerts',
				'Custom alert rules'
			],
			highlighted: true
		},
		{
			name: 'Enterprise',
			key: 'enterprise',
			price: 'Custom',
			period: '',
			features: [
				'Unlimited events',
				'1-year retention',
				'Unlimited integrations',
				'All notification channels',
				'Priority support',
				'SSO / SAML'
			]
		}
	];

	const eventLimits: Record<string, number> = {
		free: 1000,
		pro: 100000,
		enterprise: Infinity
	};

	let limit = $derived(eventLimits[data.plan] ?? 1000);
	let usagePercent = $derived(limit === Infinity ? 0 : Math.min(100, (data.eventCount / limit) * 100));
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight">Billing</h1>
		<p class="mt-1 text-sm text-muted-foreground">Manage your plan and usage</p>
	</div>

	<!-- Current Plan -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center gap-2 mb-4">
			<CreditCard class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-lg font-semibold">Current Plan</h2>
		</div>
		<div class="flex items-center justify-between">
			<div>
				<p class="text-2xl font-bold capitalize">{data.plan}</p>
				{#if data.subscription}
					<p class="text-sm text-muted-foreground">
						Status: <span class="capitalize">{data.subscription.status}</span>
						{#if data.subscription.cancelAtPeriodEnd}
							&middot; Cancels at period end
						{/if}
					</p>
				{:else}
					<p class="text-sm text-muted-foreground">No active subscription</p>
				{/if}
			</div>
			{#if data.plan === 'free'}
				<button
					disabled
					class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
				>
					<Zap class="h-4 w-4" />
					Upgrade to Pro (Coming Soon)
				</button>
			{/if}
		</div>
	</div>

	<!-- Usage Summary -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center gap-2 mb-4">
			<BarChart3 class="h-5 w-5 text-muted-foreground" />
			<h2 class="text-lg font-semibold">Usage This Month</h2>
		</div>
		<div class="space-y-3">
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Events ingested</span>
				<span class="font-medium">
					{data.eventCount.toLocaleString()}
					{#if limit !== Infinity}
						/ {limit.toLocaleString()}
					{:else}
						(unlimited)
					{/if}
				</span>
			</div>
			{#if limit !== Infinity}
				<div class="h-2 rounded-full bg-muted overflow-hidden">
					<div
						class="h-full rounded-full transition-all {usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-emerald-500'}"
						style="width: {usagePercent}%"
					></div>
				</div>
				<p class="text-xs text-muted-foreground">
					Since {new Date(data.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
				</p>
			{/if}
		</div>
	</div>

	<!-- Plan Comparison -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<h2 class="text-lg font-semibold mb-6">Compare Plans</h2>
		<div class="grid gap-6 sm:grid-cols-3">
			{#each planDefs as planDef}
				<div class="rounded-xl border p-5 {planDef.highlighted ? 'border-primary bg-primary/5' : 'border-border'}">
					<h3 class="text-lg font-semibold">{planDef.name}</h3>
					<div class="mt-2">
						<span class="text-3xl font-bold">{planDef.price}</span>
						{#if planDef.period}
							<span class="text-sm text-muted-foreground">{planDef.period}</span>
						{/if}
					</div>
					<ul class="mt-4 space-y-2">
						{#each planDef.features as feature}
							<li class="flex items-center gap-2 text-sm">
								<Check class="h-4 w-4 text-emerald-500 shrink-0" />
								{feature}
							</li>
						{/each}
					</ul>
					<div class="mt-5">
						{#if planDef.key === data.plan}
							<span class="inline-flex h-9 w-full items-center justify-center rounded-lg border border-input text-sm font-medium text-muted-foreground">
								Current Plan
							</span>
						{:else}
							<button
								disabled
								class="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
							>
								Coming Soon
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

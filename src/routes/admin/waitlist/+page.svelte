<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Users, Download, Send, UserCheck, Mail } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let batchCount = $state(10);

	const statusColors: Record<string, string> = {
		waiting: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500',
		invited: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
		converted: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
	};

	function timeAgo(date: string | Date): string {
		const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	function exportCsv() {
		const header = 'email,source,referrer,status,created_at';
		const rows = data.entries.map(
			(e) =>
				`${e.email},${e.source ?? ''},${e.referrer ?? ''},${e.status},${new Date(e.createdAt).toISOString()}`
		);
		const csv = [header, ...rows].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `pulse-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	const waitingCount = $derived(data.totalCount - data.invitedCount - data.convertedCount);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Waitlist</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Manage signups and send invites.
			</p>
		</div>
		<button
			onclick={exportCsv}
			class="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
		>
			<Download class="h-4 w-4" />
			Export CSV
		</button>
	</div>

	<!-- Feedback banners -->
	{#if form?.invited}
		<div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
			Invite sent to {form.email}
		</div>
	{/if}
	{#if form?.batchResult}
		<div class="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-500">
			Batch complete: {form.batchResult.sent} sent, {form.batchResult.failed} failed
		</div>
	{/if}
	{#if form?.error}
		<div class="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<!-- Stats -->
	<div class="flex flex-wrap gap-4">
		<div class="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9185]/10">
				<Users class="h-5 w-5 text-[#FF9185]" />
			</div>
			<div>
				<p class="text-2xl font-semibold">{data.totalCount.toLocaleString()}</p>
				<p class="text-xs text-muted-foreground">Total signups</p>
			</div>
		</div>
		<div class="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
				<Mail class="h-5 w-5 text-yellow-500" />
			</div>
			<div>
				<p class="text-2xl font-semibold">{waitingCount.toLocaleString()}</p>
				<p class="text-xs text-muted-foreground">Waiting</p>
			</div>
		</div>
		<div class="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
				<Send class="h-5 w-5 text-blue-500" />
			</div>
			<div>
				<p class="text-2xl font-semibold">{data.invitedCount.toLocaleString()}</p>
				<p class="text-xs text-muted-foreground">Invited</p>
			</div>
		</div>
		<div class="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
				<UserCheck class="h-5 w-5 text-emerald-500" />
			</div>
			<div>
				<p class="text-2xl font-semibold">{data.convertedCount.toLocaleString()}</p>
				<p class="text-xs text-muted-foreground">Converted</p>
			</div>
		</div>
	</div>

	<!-- Batch invite -->
	{#if waitingCount > 0}
		<div class="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
			<form method="POST" action="?/batchInvite" use:enhance class="flex items-center gap-3">
				<span class="text-sm text-muted-foreground">Send next</span>
				<input
					type="number"
					name="count"
					bind:value={batchCount}
					min="1"
					max={waitingCount}
					class="h-9 w-20 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<span class="text-sm text-muted-foreground">invites</span>
				<button
					type="submit"
					class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFBA71] via-[#FF9185] to-[#FF6798] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(250,88,109,.3)]"
				>
					<Send class="h-3.5 w-3.5" />
					Send Batch
				</button>
			</form>
		</div>
	{/if}

	<!-- Table -->
	{#if data.entries.length === 0}
		<div class="rounded-xl border border-border bg-card p-12 text-center">
			<p class="text-sm text-muted-foreground">No waitlist entries yet.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border border-border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/50">
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Source</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Signed up</th>
						<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.entries as entry}
						<tr class="border-b border-border last:border-0">
							<td class="px-4 py-3 font-medium">{entry.email}</td>
							<td class="px-4 py-3 text-muted-foreground">
								{#if entry.source}
									<span
										class="inline-flex rounded-full border border-border px-2 py-0.5 text-xs"
									>
										{entry.source}
									</span>
								{:else}
									<span class="text-muted-foreground/50">-</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium {statusColors[entry.status] ?? ''}"
								>
									{entry.status}
								</span>
							</td>
							<td class="px-4 py-3 text-muted-foreground" title={new Date(entry.createdAt).toLocaleString()}>
								{timeAgo(entry.createdAt)}
							</td>
							<td class="px-4 py-3 text-right">
								{#if entry.status === 'waiting'}
									<form method="POST" action="?/invite" use:enhance class="inline">
										<input type="hidden" name="email" value={entry.email} />
										<button
											type="submit"
											class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
										>
											<Send class="h-3 w-3" />
											Invite
										</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

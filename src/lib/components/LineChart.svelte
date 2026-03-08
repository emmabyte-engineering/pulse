<script lang="ts">
	let {
		data,
		color = '#FF6798',
		height = 200
	}: {
		data: { label: string; value: number }[];
		color?: string;
		height?: number;
	} = $props();

	const padding = { top: 20, right: 20, bottom: 30, left: 50 };
	const chartWidth = 600;

	const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));
	const xStep = $derived(data.length > 1 ? (chartWidth - padding.left - padding.right) / (data.length - 1) : 0);

	const points = $derived(
		data.map((d, i) => {
			const x = padding.left + i * xStep;
			const y = padding.top + (1 - d.value / maxValue) * (height - padding.top - padding.bottom);
			return { x, y, ...d };
		})
	);

	const polylinePoints = $derived(points.map((p) => `${p.x},${p.y}`).join(' '));
	const areaPoints = $derived(
		points.length > 0
			? `${padding.left},${height - padding.bottom} ${polylinePoints} ${padding.left + (data.length - 1) * xStep},${height - padding.bottom}`
			: ''
	);

	const yTicks = $derived(
		[0, 0.25, 0.5, 0.75, 1].map((pct) => ({
			value: Math.round(maxValue * pct),
			y: padding.top + (1 - pct) * (height - padding.top - padding.bottom)
		}))
	);
</script>

{#if data.length > 0}
	<svg viewBox="0 0 {chartWidth} {height}" class="w-full" preserveAspectRatio="xMidYMid meet">
		<defs>
			<linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={color} stop-opacity="0.3" />
				<stop offset="100%" stop-color={color} stop-opacity="0" />
			</linearGradient>
		</defs>

		<!-- Y axis -->
		{#each yTicks as tick}
			<line
				x1={padding.left}
				y1={tick.y}
				x2={chartWidth - padding.right}
				y2={tick.y}
				stroke="currentColor"
				stroke-opacity="0.1"
			/>
			<text
				x={padding.left - 8}
				y={tick.y + 4}
				text-anchor="end"
				class="fill-muted-foreground"
				font-size="11"
			>
				{tick.value}
			</text>
		{/each}

		<!-- Area -->
		<polygon points={areaPoints} fill="url(#area-fill)" />

		<!-- Line -->
		<polyline points={polylinePoints} fill="none" stroke={color} stroke-width="2" />

		<!-- Dots -->
		{#each points as point}
			<circle cx={point.x} cy={point.y} r="3" fill={color} />
		{/each}

		<!-- X labels -->
		{#each points as point, i}
			{#if i % Math.max(1, Math.floor(data.length / 6)) === 0}
				<text
					x={point.x}
					y={height - 8}
					text-anchor="middle"
					class="fill-muted-foreground"
					font-size="11"
				>
					{point.label}
				</text>
			{/if}
		{/each}
	</svg>
{:else}
	<div class="flex items-center justify-center text-sm text-muted-foreground" style="height: {height}px">
		No data available
	</div>
{/if}

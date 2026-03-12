<script lang="ts">
	import { Accessibility, Plus, Minus, X, RotateCcw } from 'lucide-svelte';

	let open = $state(false);

	// Load preferences from localStorage
	function loadPref(key: string, fallback: string): string {
		if (typeof window === 'undefined') return fallback;
		return localStorage.getItem(`a11y-${key}`) ?? fallback;
	}

	function savePref(key: string, value: string) {
		localStorage.setItem(`a11y-${key}`, value);
	}

	let fontSize = $state(100);
	let highContrast = $state(false);
	let reducedMotion = $state(false);
	let dyslexiaFont = $state(false);
	let largeSpacing = $state(false);

	// Initialize from localStorage on mount
	$effect(() => {
		fontSize = parseInt(loadPref('font-size', '100'));
		highContrast = loadPref('high-contrast', 'false') === 'true';
		reducedMotion = loadPref('reduced-motion', 'false') === 'true';
		dyslexiaFont = loadPref('dyslexia-font', 'false') === 'true';
		largeSpacing = loadPref('large-spacing', 'false') === 'true';
		applyPreferences();
	});

	function applyPreferences() {
		const html = document.documentElement;

		// Font size
		html.style.fontSize = `${fontSize}%`;

		// High contrast
		html.classList.toggle('a11y-high-contrast', highContrast);

		// Reduced motion
		html.classList.toggle('a11y-reduced-motion', reducedMotion);

		// Dyslexia font
		html.classList.toggle('a11y-dyslexia-font', dyslexiaFont);

		// Large spacing
		html.classList.toggle('a11y-large-spacing', largeSpacing);
	}

	function adjustFontSize(delta: number) {
		fontSize = Math.min(150, Math.max(75, fontSize + delta));
		savePref('font-size', String(fontSize));
		applyPreferences();
	}

	function toggleHighContrast() {
		highContrast = !highContrast;
		savePref('high-contrast', String(highContrast));
		applyPreferences();
	}

	function toggleReducedMotion() {
		reducedMotion = !reducedMotion;
		savePref('reduced-motion', String(reducedMotion));
		applyPreferences();
	}

	function toggleDyslexiaFont() {
		dyslexiaFont = !dyslexiaFont;
		savePref('dyslexia-font', String(dyslexiaFont));
		applyPreferences();
	}

	function toggleLargeSpacing() {
		largeSpacing = !largeSpacing;
		savePref('large-spacing', String(largeSpacing));
		applyPreferences();
	}

	function resetAll() {
		fontSize = 100;
		highContrast = false;
		reducedMotion = false;
		dyslexiaFont = false;
		largeSpacing = false;
		['font-size', 'high-contrast', 'reduced-motion', 'dyslexia-font', 'large-spacing'].forEach(
			(key) => localStorage.removeItem(`a11y-${key}`)
		);
		applyPreferences();
	}

	const hasCustomizations = $derived(
		fontSize !== 100 || highContrast || reducedMotion || dyslexiaFont || largeSpacing
	);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed bottom-6 right-6 z-50">
	<!-- Toggle button -->
	<button
		onclick={() => (open = !open)}
		class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-white dark:text-gray-900"
		aria-label={open ? 'Close accessibility options' : 'Open accessibility options'}
		aria-expanded={open}
		aria-controls="a11y-panel"
	>
		{#if open}
			<X class="h-5 w-5" />
		{:else}
			<Accessibility class="h-5 w-5" />
		{/if}
		{#if hasCustomizations && !open}
			<span
				class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#b93a54] ring-2 ring-white dark:ring-gray-900"
			></span>
		{/if}
	</button>

	<!-- Panel -->
	{#if open}
		<div
			id="a11y-panel"
			role="dialog"
			aria-label="Accessibility preferences"
			class="absolute bottom-16 right-0 w-72 rounded-xl border border-border bg-card p-4 shadow-xl"
		>
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-card-foreground">Accessibility</h2>
				{#if hasCustomizations}
					<button
						onclick={resetAll}
						class="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-card-foreground"
						aria-label="Reset all accessibility preferences"
					>
						<RotateCcw class="h-3 w-3" />
						Reset
					</button>
				{/if}
			</div>

			<div class="space-y-3">
				<!-- Text size -->
				<div class="flex items-center justify-between">
					<span class="text-sm text-card-foreground">Text size</span>
					<div class="flex items-center gap-2">
						<button
							onclick={() => adjustFontSize(-10)}
							disabled={fontSize <= 75}
							class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-card-foreground transition-colors hover:bg-accent disabled:opacity-40"
							aria-label="Decrease text size"
						>
							<Minus class="h-3.5 w-3.5" />
						</button>
						<span class="w-10 text-center text-xs text-muted-foreground">{fontSize}%</span>
						<button
							onclick={() => adjustFontSize(10)}
							disabled={fontSize >= 150}
							class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-card-foreground transition-colors hover:bg-accent disabled:opacity-40"
							aria-label="Increase text size"
						>
							<Plus class="h-3.5 w-3.5" />
						</button>
					</div>
				</div>

				<!-- High contrast -->
				<button
					onclick={toggleHighContrast}
					class="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm text-card-foreground transition-colors hover:bg-accent"
					role="switch"
					aria-checked={highContrast}
				>
					<span>High contrast</span>
					<span
						class="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors {highContrast
							? 'bg-[#b93a54]'
							: 'bg-muted'}"
					>
						<span
							class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform {highContrast
								? 'translate-x-3.5'
								: 'translate-x-0'}"
						></span>
					</span>
				</button>

				<!-- Reduced motion -->
				<button
					onclick={toggleReducedMotion}
					class="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm text-card-foreground transition-colors hover:bg-accent"
					role="switch"
					aria-checked={reducedMotion}
				>
					<span>Reduced motion</span>
					<span
						class="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors {reducedMotion
							? 'bg-[#b93a54]'
							: 'bg-muted'}"
					>
						<span
							class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform {reducedMotion
								? 'translate-x-3.5'
								: 'translate-x-0'}"
						></span>
					</span>
				</button>

				<!-- Dyslexia-friendly font -->
				<button
					onclick={toggleDyslexiaFont}
					class="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm text-card-foreground transition-colors hover:bg-accent"
					role="switch"
					aria-checked={dyslexiaFont}
				>
					<span>Dyslexia-friendly font</span>
					<span
						class="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors {dyslexiaFont
							? 'bg-[#b93a54]'
							: 'bg-muted'}"
					>
						<span
							class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform {dyslexiaFont
								? 'translate-x-3.5'
								: 'translate-x-0'}"
						></span>
					</span>
				</button>

				<!-- Large spacing -->
				<button
					onclick={toggleLargeSpacing}
					class="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm text-card-foreground transition-colors hover:bg-accent"
					role="switch"
					aria-checked={largeSpacing}
				>
					<span>Large spacing</span>
					<span
						class="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors {largeSpacing
							? 'bg-[#b93a54]'
							: 'bg-muted'}"
					>
						<span
							class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform {largeSpacing
								? 'translate-x-3.5'
								: 'translate-x-0'}"
						></span>
					</span>
				</button>
			</div>
		</div>
	{/if}
</div>

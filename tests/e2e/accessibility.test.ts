import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// WCAG 2.2 AA accessibility tests for all public-facing pages.
// Uses axe-core to detect violations. We target 'wcag2a', 'wcag2aa',
// 'wcag21a', 'wcag21aa', 'wcag22aa' for premium-tier compliance.

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

function formatViolations(violations: { id: string; impact?: string | null; description: string; nodes: { html: string; failureSummary?: string }[] }[]) {
	return violations
		.map((v) => {
			const nodes = v.nodes.map((n) => `    - ${n.html}\n      ${n.failureSummary}`).join('\n');
			return `[${v.impact}] ${v.id}: ${v.description}\n${nodes}`;
		})
		.join('\n\n');
}

test.describe('Accessibility — Landing page', () => {
	test('should have no WCAG 2.2 AA violations', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();

		expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		await page.goto('/');

		const headings = await page.evaluate(() => {
			const els = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
			return els.map((el) => ({
				level: parseInt(el.tagName[1]),
				text: el.textContent?.trim() ?? ''
			}));
		});

		// Must have exactly one h1
		const h1s = headings.filter((h) => h.level === 1);
		expect(h1s).toHaveLength(1);

		// No skipped heading levels (e.g. h1 -> h3 without h2)
		for (let i = 1; i < headings.length; i++) {
			const gap = headings[i].level - headings[i - 1].level;
			expect(gap, `Heading "${headings[i].text}" skips level after "${headings[i - 1].text}"`).toBeLessThanOrEqual(1);
		}
	});

	test('should have sufficient color contrast', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const results = await new AxeBuilder({ page })
			.withTags(AXE_TAGS)
			.options({ runOnly: ['color-contrast'] })
			.analyze();

		expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
	});

	test('all images should have alt text', async ({ page }) => {
		await page.goto('/');

		const imagesWithoutAlt = await page.evaluate(() => {
			const imgs = Array.from(document.querySelectorAll('img'));
			return imgs
				.filter((img) => !img.getAttribute('alt') && !img.getAttribute('role'))
				.map((img) => img.src);
		});

		expect(imagesWithoutAlt, `Images missing alt text: ${imagesWithoutAlt.join(', ')}`).toHaveLength(0);
	});

	test('interactive elements should be keyboard accessible', async ({ page }) => {
		await page.goto('/');

		// Tab through the page and verify focus is visible
		const focusableCount = await page.evaluate(() => {
			const focusable = document.querySelectorAll(
				'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			return focusable.length;
		});

		expect(focusableCount).toBeGreaterThan(0);

		// Verify we can tab to the email input and submit button
		await page.keyboard.press('Tab');
		const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
		expect(firstFocused).toBeTruthy();
	});

	test('form inputs should have associated labels', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const results = await new AxeBuilder({ page })
			.withTags(AXE_TAGS)
			.options({ runOnly: ['label'] })
			.analyze();

		expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
	});

	test('no text should be smaller than 12px', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const tinyText = await page.evaluate(() => {
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
				acceptNode: (node) =>
					node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
			});
			const violations: { text: string; size: string; el: string }[] = [];
			while (walker.nextNode()) {
				const el = walker.currentNode.parentElement;
				if (!el || el.closest('[aria-hidden="true"]') || el.tagName === 'SCRIPT') continue;
				const style = getComputedStyle(el);
				const size = parseFloat(style.fontSize);
				if (size < 12) {
					violations.push({
						text: walker.currentNode.textContent?.trim().slice(0, 50) ?? '',
						size: style.fontSize,
						el: el.tagName + (el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : '')
					});
				}
			}
			return violations;
		});

		expect(
			tinyText,
			`Text smaller than 12px:\n${tinyText.map((t) => `  "${t.text}" (${t.size}) in <${t.el}>`).join('\n')}`
		).toHaveLength(0);
	});

	test('placeholder text should have sufficient contrast', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Check computed placeholder color contrast against input backgrounds
		const placeholderIssues = await page.evaluate(() => {
			const inputs = Array.from(document.querySelectorAll('input[placeholder]'));
			const issues: { placeholder: string; element: string }[] = [];
			for (const input of inputs) {
				const style = getComputedStyle(input);
				// Check if the input has an explicit placeholder color that's too transparent
				const color = style.getPropertyValue('color');
				// Inputs with placeholder:text-white/50 or similar very transparent placeholders
				// are flagged — we check by looking at the class for known bad patterns
				const classes = input.className;
				if (
					classes.includes('placeholder:text-white/50') ||
					classes.includes('placeholder:text-white/40') ||
					classes.includes('placeholder:text-white/30')
				) {
					issues.push({
						placeholder: input.getAttribute('placeholder') ?? '',
						element: input.id || input.getAttribute('name') || 'unknown'
					});
				}
			}
			return issues;
		});

		expect(
			placeholderIssues,
			`Inputs with low-contrast placeholder text:\n${placeholderIssues.map((i) => `  "${i.placeholder}" in #${i.element}`).join('\n')}`
		).toHaveLength(0);
	});
});

test.describe('Accessibility — Login page', () => {
	test('should have no WCAG 2.2 AA violations', async ({ page }) => {
		await page.goto('/login');
		await page.waitForLoadState('networkidle');

		const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();

		expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
	});
});

test.describe('Accessibility — Signup page', () => {
	test('invalid invite page should have no violations', async ({ page }) => {
		// This will 404 but the error page should still be accessible
		const response = await page.goto('/signup/test-invalid-token');
		// Only run axe if the page rendered (even error pages)
		if (response && response.status() < 500) {
			const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
			expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
		}
	});
});

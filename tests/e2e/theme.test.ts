import { test, expect } from '@playwright/test';

test.describe('Dark mode toggle', () => {
	test('landing page toggle switches to dark mode', async ({ page }) => {
		await page.goto('/');

		// Should start in light mode (no .dark class on html)
		const htmlEl = page.locator('html');
		await expect(htmlEl).not.toHaveClass(/dark/);

		// Click the theme toggle
		await page.getByRole('button', { name: /toggle theme/i }).click();

		// Should now have dark class
		await expect(htmlEl).toHaveClass(/dark/, { timeout: 2000 });
	});

	test('dark mode persists across navigation', async ({ page }) => {
		await page.goto('/');

		// Enable dark mode
		await page.getByRole('button', { name: /toggle theme/i }).click();
		await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 2000 });

		// Navigate to login page
		await page.goto('/login');

		// Dark mode should persist
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('toggle switches back to light mode', async ({ page }) => {
		await page.goto('/');

		const toggle = page.getByRole('button', { name: /toggle theme/i });
		const htmlEl = page.locator('html');

		// Toggle to dark
		await toggle.click();
		await expect(htmlEl).toHaveClass(/dark/, { timeout: 2000 });

		// Toggle back to light
		await toggle.click();
		await expect(htmlEl).not.toHaveClass(/dark/, { timeout: 2000 });
	});
});

test.describe('Landing page scrolling', () => {
	test('page scrolls continuously without stuck sections', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Get the dashboard preview section position before scrolling
		const dashboardCard = page.locator('.shadow-xl').first();
		await expect(dashboardCard).toBeVisible();

		const initialPosition = await dashboardCard.boundingBox();
		expect(initialPosition).toBeTruthy();

		// Scroll down
		await page.evaluate(() => window.scrollBy(0, 500));
		await page.waitForTimeout(200);

		// Dashboard card should have moved up with the scroll
		const afterScroll = await dashboardCard.boundingBox();
		expect(afterScroll).toBeTruthy();
		expect(afterScroll!.y).toBeLessThan(initialPosition!.y);
	});
});

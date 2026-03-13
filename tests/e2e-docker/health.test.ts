import { test, expect } from '@playwright/test';

test.describe('Container Health', () => {
	test('health endpoint returns ok', async ({ request }) => {
		const res = await request.get('/api/health');
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('ok');
	});

	test('homepage loads', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('unauthenticated /admin redirects to /login', async ({ page }) => {
		await page.goto('/admin');
		await expect(page).toHaveURL(/\/login/);
	});
});

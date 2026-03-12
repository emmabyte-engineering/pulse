import { test, expect } from '@playwright/test';

test('health endpoint returns ok', async ({ request }) => {
	const response = await request.get('/api/health');
	expect(response.ok()).toBeTruthy();
	const body = await response.json();
	expect(body.status).toBe('ok');
});

test('homepage loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('unauthenticated users are redirected from admin', async ({ page }) => {
	await page.goto('/admin');
	await expect(page).toHaveURL(/\/login/);
});

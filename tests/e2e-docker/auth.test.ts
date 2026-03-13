import { test, expect, type APIRequestContext } from '@playwright/test';

let testCounter = 0;

async function createAdminUser(request: APIRequestContext) {
	const id = `${Date.now()}-${++testCounter}-${Math.random().toString(36).slice(2, 8)}`;
	const email = `e2e-${id}@emmabyte.io`;
	const password = 'TestPassword123!';
	const name = 'E2E Test Admin';

	const res = await request.post('/api/auth/sign-up/email', {
		data: { name, email, password }
	});
	expect(res.ok(), `Sign-up failed (${res.status()}): ${await res.text()}`).toBeTruthy();

	const storageState = await request.storageState();
	return { email, password, cookies: storageState.cookies };
}

test.describe('Authentication', () => {
	test('login page renders the sign-in form', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
	});

	test('login with valid admin credentials redirects to dashboard', async ({
		page,
		request
	}) => {
		const { email, password } = await createAdminUser(request);

		await page.goto('/login');
		await page.getByLabel('Email').fill(email);
		await page.getByLabel('Password').fill(password);
		await page.getByRole('button', { name: /sign in/i }).click();

		await page.waitForURL(/\/admin/, { timeout: 15000 });
	});

	test('authenticated admin can access /admin', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);
		await page.goto('/admin');

		await expect(page).toHaveURL(/\/admin/);
		await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
	});

	test('sign out redirects to login', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);
		await page.goto('/admin');
		await expect(page).toHaveURL(/\/admin/);

		await page.getByRole('button', { name: /sign out/i }).click();
		await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
	});
});

import { test, expect, type APIRequestContext } from '@playwright/test';

let testCounter = 0;

/**
 * Sign up a test user via better-auth API and return session cookies.
 * Uses @emmabyte.io domain so the user gets admin role via databaseHooks.
 */
async function createAdminUser(request: APIRequestContext) {
	const id = `${Date.now()}-${++testCounter}-${Math.random().toString(36).slice(2, 8)}`;
	const email = `e2e-${id}@emmabyte.io`;
	const password = 'TestPassword123!';
	const name = 'E2E Test Admin';

	const res = await request.post('/api/auth/sign-up/email', {
		data: { name, email, password }
	});
	expect(res.ok(), `Sign-up failed (${res.status()}): ${await res.text()}`).toBeTruthy();

	// Sign-up sets session cookies — extract them for browser context injection
	const storageState = await request.storageState();
	return { email, password, cookies: storageState.cookies };
}

test.describe('Login flow', () => {
	test('login page renders the sign-in form', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
	});

	test('login with invalid credentials shows error', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('nobody@emmabyte.io');
		await page.getByLabel('Password').fill('wrongpassword');
		await page.getByRole('button', { name: /sign in/i }).click();

		await expect(page.getByText(/failed|invalid|error/i)).toBeVisible({ timeout: 5000 });
	});

	test('login with valid admin credentials redirects to dashboard', async ({
		page,
		request
	}) => {
		const { email, password } = await createAdminUser(request);

		// Sign in via the login form (new browser context, no cookies)
		await page.goto('/login');
		await page.getByLabel('Email').fill(email);
		await page.getByLabel('Password').fill(password);
		await page.getByRole('button', { name: /sign in/i }).click();

		await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
	});
});

test.describe('Dashboard accessibility', () => {
	test('authenticated admin can access /admin', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);
		await page.goto('/admin');

		await expect(page).toHaveURL(/\/admin/);
		// Verify we see the admin layout (sidebar with navigation links)
		await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
	});

	test('authenticated admin can access /admin/settings', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);
		await page.goto('/admin/settings');
		await expect(page).toHaveURL(/\/admin\/settings/);
	});

	test('admin sidebar navigation is present', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);
		await page.goto('/admin');

		await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /api keys/i })).toBeVisible();
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

test.describe('Auth redirects', () => {
	test('unauthenticated user visiting /admin is redirected to /login', async ({ page }) => {
		await page.goto('/admin');
		await expect(page).toHaveURL(/\/login/);
	});

	test('no redirect loop for unauthenticated user', async ({ page }) => {
		const response = await page.goto('/admin');
		expect(response?.status()).toBeLessThan(400);
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
	});

	test('admin user on /login is redirected to /admin', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);
		await page.goto('/login');

		await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });
	});
});

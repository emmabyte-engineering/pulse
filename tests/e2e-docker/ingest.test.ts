import { test, expect, type APIRequestContext } from '@playwright/test';

let testCounter = 0;

async function createAdminUser(request: APIRequestContext) {
	const id = `${Date.now()}-${++testCounter}-${Math.random().toString(36).slice(2, 8)}`;
	const email = `e2e-${id}@emmabyte.io`;
	const password = 'TestPassword123!';

	const res = await request.post('/api/auth/sign-up/email', {
		data: { name: 'E2E Test Admin', email, password }
	});
	expect(res.ok(), `Sign-up failed (${res.status()}): ${await res.text()}`).toBeTruthy();

	const storageState = await request.storageState();
	return { email, password, cookies: storageState.cookies };
}

test.describe('Event Ingestion Pipeline', () => {
	test('create API key and ingest event', async ({ page, request }) => {
		const { cookies } = await createAdminUser(request);
		await page.context().addCookies(cookies);

		// Navigate to API keys page
		await page.goto('/admin/api-keys');
		await expect(page).toHaveURL(/\/admin\/api-keys/);

		// Open create dialog and fill form
		await page.getByRole('button', { name: /create key/i }).click();
		await page.getByLabel('Name').fill('e2e-docker-test-key');
		await page.getByRole('button', { name: /^create$/i }).click();

		// Wait for key banner and extract the key
		const keyDisplay = page.locator('code').first();
		await expect(keyDisplay).toBeVisible({ timeout: 10000 });
		const apiKey = (await keyDisplay.textContent())?.trim();
		expect(apiKey).toBeTruthy();
		expect(apiKey).toMatch(/^pk_/);

		// Ingest an event via API
		const ingestRes = await request.post('/api/ingest', {
			headers: { Authorization: `Bearer ${apiKey}` },
			data: {
				source: 'APP',
				eventType: 'e2e.docker.test',
				severity: 'INFO',
				summary: `Docker e2e test event ${Date.now()}`
			}
		});
		expect(ingestRes.ok(), `Ingest failed: ${await ingestRes.text()}`).toBeTruthy();
		const ingestBody = await ingestRes.json();
		expect(ingestBody.ok).toBe(true);
		expect(ingestBody.id).toBeTruthy();
	});

	test('ingest rejects unauthenticated requests', async ({ request }) => {
		const res = await request.post('/api/ingest', {
			data: { source: 'APP', eventType: 'test', summary: 'should fail' }
		});
		expect(res.status()).toBe(401);
	});

	test('ingest rejects invalid API key', async ({ request }) => {
		const res = await request.post('/api/ingest', {
			headers: { Authorization: 'Bearer pk_invalid.key' },
			data: { source: 'APP', eventType: 'test', summary: 'should fail' }
		});
		expect(res.status()).toBe(403);
	});
});

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
		await page.waitForLoadState('networkidle');

		// Open the create key dialog
		await page.getByRole('button', { name: /create key/i }).click();

		// Fill the form inside the dialog
		const nameInput = page.getByLabel('Name');
		await expect(nameInput).toBeVisible({ timeout: 5000 });
		await nameInput.fill('e2e-ingest-key');

		// Submit the form and wait for the action response
		const [response] = await Promise.all([
			page.waitForResponse((res) => res.url().includes('/admin/api-keys') && res.request().method() === 'POST'),
			page.locator('button[type="submit"]').click()
		]);
		expect(response.status(), `Form action returned ${response.status()}`).toBe(200);

		// Wait for the key banner to appear after dialog closes
		const keyCode = page.locator('code');
		await expect(keyCode).toBeVisible({ timeout: 15000 });
		const apiKey = (await keyCode.textContent())?.trim();
		expect(apiKey, 'API key should be present in code element').toBeTruthy();
		expect(apiKey, `Expected pk_ prefix but got: ${apiKey}`).toMatch(/^pk_/);

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

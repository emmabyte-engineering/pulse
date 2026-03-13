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

		// Navigate to API keys page to establish session cookies and CSRF
		await page.goto('/admin/api-keys');
		await page.waitForLoadState('networkidle');

		// Create API key via programmatic form action (bypasses dialog UI fragility)
		const actionResponse = await page.evaluate(async () => {
			const body = new FormData();
			body.append('name', 'e2e-ingest-key');
			body.append('permissions', 'ingest');
			body.append('expiration', 'never');

			const res = await fetch('/admin/api-keys?/createKey', {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});

			return { status: res.status, text: await res.text() };
		});

		expect(
			actionResponse.status,
			`Form action failed (${actionResponse.status}): ${actionResponse.text.substring(0, 500)}`
		).toBe(200);

		// Extract pk_ key from the devalue-serialized action response
		const keyMatch = actionResponse.text.match(/pk_[a-zA-Z0-9._-]+/);
		expect(
			keyMatch,
			`Could not find API key in response: ${actionResponse.text.substring(0, 500)}`
		).toBeTruthy();
		const apiKey = keyMatch![0];

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

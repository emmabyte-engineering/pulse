import { json, error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processVercelLogDrain } from '$server/webhooks/vercel';
import { getIntegrationSecret } from '$server/integrations';
import { getSettingWithFallback } from '$server/settings';

// Vercel sends a GET request to verify the endpoint
export const GET: RequestHandler = async ({ url }) => {
	const challenge = url.searchParams.get('challenge');
	if (challenge) {
		return text(challenge);
	}
	return json({ ok: true });
};

export const POST: RequestHandler = async ({ request }) => {
	const secret =
		(await getIntegrationSecret('VERCEL', 'webhookSecret')) ??
		(await getSettingWithFallback('VERCEL_WEBHOOK_SECRET'));
	if (secret) {
		const verify = request.headers.get('x-vercel-verify');
		if (verify !== secret) {
			error(401, 'Invalid verification header');
		}
	}

	try {
		const entries = await request.json();
		const logEntries = Array.isArray(entries) ? entries : [entries];
		await processVercelLogDrain(logEntries);
		return json({ ok: true });
	} catch (err) {
		console.error('Vercel log drain error:', err);
		error(500, 'Failed to process log drain');
	}
};

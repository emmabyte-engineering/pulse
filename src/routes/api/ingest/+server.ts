import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ingestEvent, ingestBatch } from '$server/events';
import { validateApiKey } from '$server/api-keys';

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const apiKey = authHeader?.replace('Bearer ', '');

	if (!apiKey) {
		error(401, 'Missing API key. Use Authorization: Bearer <key>');
	}

	const valid = await validateApiKey(apiKey);
	if (!valid) {
		error(403, 'Invalid or expired API key');
	}

	try {
		const body = await request.json();

		if (body.events && Array.isArray(body.events)) {
			const result = await ingestBatch(body.events);
			return json({ ok: true, count: result.count });
		}

		const event = await ingestEvent(body);
		return json({ ok: true, id: event.id });
	} catch (err) {
		console.error('Ingest error:', err);
		error(400, 'Invalid event payload');
	}
};

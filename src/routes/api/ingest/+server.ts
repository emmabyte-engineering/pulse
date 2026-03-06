import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ingestEvent, ingestBatch } from '$server/events';

/**
 * Public event ingestion API.
 * Used by external services (e.g., emmabyte.io) to push events into Pulse.
 *
 * POST /api/ingest
 *
 * Body (single event):
 * {
 *   "source": "APP",
 *   "eventType": "email.sent",
 *   "severity": "INFO",
 *   "summary": "Email sent to user@example.com",
 *   "metadata": { ... }
 * }
 *
 * Body (batch):
 * {
 *   "events": [{ ... }, { ... }]
 * }
 *
 * Headers:
 *   Authorization: Bearer <API_KEY> (TODO: implement API key auth)
 */
export const POST: RequestHandler = async ({ request }) => {
	// TODO: API key authentication for external services
	// const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');

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

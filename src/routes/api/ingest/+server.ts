import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ingestEvent, ingestBatch } from '$server/events';
import { validateApiKey } from '$server/api-keys';

// Simple sliding window rate limiter: 100 requests per minute per key
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(key);

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return true;
	}

	entry.count++;
	return entry.count <= RATE_LIMIT;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of rateLimitMap) {
		if (now > entry.resetAt) rateLimitMap.delete(key);
	}
}, 5 * 60 * 1000);

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		error(401, 'Missing API key. Use Authorization: Bearer <key>');
	}
	const apiKey = authHeader.slice(7);

	const valid = await validateApiKey(apiKey);
	if (!valid) {
		error(403, 'Invalid or expired API key');
	}

	if (!checkRateLimit(apiKey)) {
		error(429, 'Rate limit exceeded. Max 100 requests per minute.');
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

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateApiKey, hasPermission } from '$server/api-keys';
import { handleIngest } from '$server/ingest';

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		error(401, 'Missing API key. Use Authorization: Bearer <key>');
	}
	const apiKey = authHeader.slice(7);

	const validated = await validateApiKey(apiKey);
	if (!validated) {
		error(403, 'Invalid or expired API key');
	}

	if (!hasPermission(validated, 'ingest')) {
		error(403, 'API key lacks ingest permission');
	}

	return handleIngest(request, validated.keyId ?? validated.id);
};

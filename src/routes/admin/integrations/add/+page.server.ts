import type { PageServerLoad } from './$types';
import { INTEGRATION_TYPES } from '$server/integrations';
import { db } from '$server/db';

export const load: PageServerLoad = async () => {
	const connected = await db.integration.findMany({ select: { source: true } });
	const connectedSources = new Set(connected.map((c) => c.source));

	const available = INTEGRATION_TYPES.filter((t) => !connectedSources.has(t.source));
	const alreadyConnected = INTEGRATION_TYPES.filter((t) => connectedSources.has(t.source));

	return { available, alreadyConnected };
};

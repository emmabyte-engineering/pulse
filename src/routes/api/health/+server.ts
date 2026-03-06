import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';

export const GET: RequestHandler = async () => {
	try {
		await db.$queryRaw`SELECT 1`;
		return json({ status: 'ok', database: 'connected' });
	} catch {
		return json({ status: 'error', database: 'disconnected' }, { status: 503 });
	}
};

import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { startScheduler } from '$lib/server/scheduler';

startScheduler();

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	return resolve(event);
};

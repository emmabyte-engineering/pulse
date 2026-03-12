import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { startScheduler } from '$lib/server/scheduler';

const PLATFORM_DOMAIN = 'emmabyte.io';

startScheduler();

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	let user = (session?.user as App.Locals['user']) ?? null;

	// Auto-heal: existing @emmabyte.io users who signed up before
	// additionalFields was configured may have role='user' instead of 'admin'
	if (user && user.email?.endsWith(`@${PLATFORM_DOMAIN}`) && user.role !== 'admin') {
		await db.user.update({
			where: { id: user.id },
			data: { role: 'admin' }
		});
		user = { ...user, role: 'admin' };
	}

	event.locals.user = user;
	event.locals.session = session?.session ?? null;

	return resolve(event);
};

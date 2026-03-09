import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { createAndSendInvite, batchInvite } from '$server/invites';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const [entries, totalCount, invitedCount, convertedCount] = await Promise.all([
		db.waitlistEntry.findMany({
			orderBy: { createdAt: 'desc' },
			take: 200
		}),
		db.waitlistEntry.count(),
		db.waitlistEntry.count({ where: { status: 'invited' } }),
		db.waitlistEntry.count({ where: { status: 'converted' } })
	]);

	return { entries, totalCount, invitedCount, convertedCount };
};

export const actions: Actions = {
	invite: async ({ request }) => {
		const form = await request.formData();
		const email = form.get('email') as string;

		if (!email) return fail(400, { error: 'Email is required' });

		const result = await createAndSendInvite(email);
		if (!result.success) {
			return fail(500, { error: result.error ?? 'Failed to send invite' });
		}

		return { invited: true, email };
	},

	batchInvite: async ({ request }) => {
		const form = await request.formData();
		const count = parseInt(form.get('count') as string) || 10;

		// Get the next batch of "waiting" entries
		const waitingEntries = await db.waitlistEntry.findMany({
			where: { status: 'waiting' },
			orderBy: { createdAt: 'asc' },
			take: count
		});

		if (waitingEntries.length === 0) {
			return fail(400, { error: 'No waiting entries to invite' });
		}

		const emails = waitingEntries.map((e) => e.email);
		const result = await batchInvite(emails);

		return { batchResult: result };
	}
};

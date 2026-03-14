import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { createAndSendInvite } from '$server/invites';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const [users, pendingInvites] = await Promise.all([
		db.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				image: true,
				createdAt: true,
				_count: { select: { sessions: true } }
			},
			orderBy: { createdAt: 'asc' }
		}),
		db.inviteToken.findMany({
			where: { usedAt: null, expiresAt: { gt: new Date() } },
			orderBy: { createdAt: 'desc' }
		})
	]);

	return { users, pendingInvites };
};

export const actions: Actions = {
	invite: async ({ request }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim().toLowerCase();

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Please enter a valid email address' });
		}

		// Check if user already exists
		const existing = await db.user.findUnique({ where: { email } });
		if (existing) {
			return fail(400, { error: 'A user with this email already exists' });
		}

		const result = await createAndSendInvite(email);
		if (!result.success) {
			return fail(500, { error: result.error ?? 'Failed to send invite' });
		}

		return { invited: true, email };
	},

	revokeInvite: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		await db.inviteToken.delete({ where: { id } }).catch(() => {});
		return { revoked: true };
	},

	changeRole: async ({ request, locals }) => {
		const form = await request.formData();
		const userId = form.get('userId') as string;
		const newRole = form.get('role') as string;

		if (!['admin', 'user'].includes(newRole)) {
			return fail(400, { error: 'Invalid role' });
		}

		if (userId === locals.user!.id) {
			return fail(400, { error: 'You cannot change your own role' });
		}

		await db.user.update({
			where: { id: userId },
			data: { role: newRole }
		});

		return { roleChanged: true };
	},

	removeUser: async ({ request, locals }) => {
		const form = await request.formData();
		const userId = form.get('userId') as string;

		if (userId === locals.user!.id) {
			return fail(400, { error: 'You cannot remove yourself' });
		}

		await db.user.delete({ where: { id: userId } });
		return { userRemoved: true };
	}
};

import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const invite = await db.organizationInvite.findUnique({
		where: { token: params.token },
		include: { organization: { select: { name: true } } }
	});

	if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
		return { valid: false, orgName: null, email: null };
	}

	if (!locals.user) {
		redirect(302, `/login?redirect=/join/${params.token}`);
	}

	return {
		valid: true,
		orgName: invite.organization.name,
		email: invite.email
	};
};

export const actions: Actions = {
	default: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'You must be logged in to accept an invite' });
		}

		const invite = await db.organizationInvite.findUnique({
			where: { token: params.token }
		});

		if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
			return fail(400, { error: 'This invite is invalid or has expired' });
		}

		if (invite.email !== locals.user.email) {
			return fail(403, { error: 'This invite was sent to a different email address' });
		}

		// Check if already a member
		const existing = await db.organizationMember.findUnique({
			where: {
				organizationId_userId: {
					organizationId: invite.organizationId,
					userId: locals.user.id
				}
			}
		});

		if (existing) {
			await db.organizationInvite.update({
				where: { id: invite.id },
				data: { acceptedAt: new Date() }
			});
			redirect(302, '/admin');
		}

		await db.$transaction([
			db.organizationMember.create({
				data: {
					organizationId: invite.organizationId,
					userId: locals.user.id,
					role: invite.role
				}
			}),
			db.organizationInvite.update({
				where: { id: invite.id },
				data: { acceptedAt: new Date() }
			})
		]);

		redirect(302, '/admin');
	}
};

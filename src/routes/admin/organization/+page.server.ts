import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { sendEmail } from '$server/email';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

export const load: PageServerLoad = async ({ locals }) => {
	const membership = await db.organizationMember.findFirst({
		where: { userId: locals.user!.id },
		include: {
			organization: {
				include: {
					members: {
						include: { user: { select: { id: true, name: true, email: true, image: true } } },
						orderBy: { createdAt: 'asc' }
					},
					invites: {
						where: { acceptedAt: null, expiresAt: { gt: new Date() } },
						orderBy: { createdAt: 'desc' }
					}
				}
			}
		}
	});

	if (!membership) {
		return { organization: null, members: [], invites: [], userRole: 'member' };
	}

	return {
		organization: {
			id: membership.organization.id,
			name: membership.organization.name,
			slug: membership.organization.slug,
			plan: membership.organization.plan
		},
		members: membership.organization.members.map((m) => ({
			id: m.id,
			userId: m.userId,
			role: m.role,
			createdAt: m.createdAt,
			user: m.user
		})),
		invites: membership.organization.invites.map((inv) => ({
			id: inv.id,
			email: inv.email,
			role: inv.role,
			createdAt: inv.createdAt,
			expiresAt: inv.expiresAt
		})),
		userRole: membership.role
	};
};

export const actions: Actions = {
	updateOrg: async ({ request, locals }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const slug = form.get('slug') as string;

		if (!name?.trim()) return fail(400, { error: 'Organization name is required' });
		if (!slug?.trim()) return fail(400, { error: 'Slug is required' });

		if (!/^[a-z0-9-]+$/.test(slug.trim())) {
			return fail(400, { error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
		}

		const membership = await db.organizationMember.findFirst({
			where: { userId: locals.user!.id }
		});

		if (!membership || membership.role !== 'owner') {
			return fail(403, { error: 'Only the organization owner can update settings' });
		}

		try {
			await db.organization.update({
				where: { id: membership.organizationId },
				data: { name: name.trim(), slug: slug.trim() }
			});
		} catch {
			return fail(400, { error: 'Slug is already taken' });
		}

		return { orgUpdated: true };
	},

	inviteMember: async ({ request, locals }) => {
		const form = await request.formData();
		const email = form.get('email') as string;
		const role = form.get('role') as string;

		if (!email?.trim()) return fail(400, { error: 'Email is required' });
		if (!['member', 'admin'].includes(role)) return fail(400, { error: 'Invalid role' });

		const membership = await db.organizationMember.findFirst({
			where: { userId: locals.user!.id },
			include: { organization: true }
		});

		if (!membership || !['owner', 'admin'].includes(membership.role)) {
			return fail(403, { error: 'You do not have permission to invite members' });
		}

		// Check if already a member
		const existingMember = await db.organizationMember.findFirst({
			where: {
				organizationId: membership.organizationId,
				user: { email: email.trim() }
			}
		});
		if (existingMember) return fail(400, { error: 'User is already a member' });

		const token = crypto.randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		try {
			await db.organizationInvite.upsert({
				where: {
					organizationId_email: {
						organizationId: membership.organizationId,
						email: email.trim()
					}
				},
				update: { token, role, expiresAt, invitedById: locals.user!.id, acceptedAt: null },
				create: {
					organizationId: membership.organizationId,
					email: email.trim(),
					role,
					token,
					expiresAt,
					invitedById: locals.user!.id
				}
			});
		} catch {
			return fail(500, { error: 'Failed to create invite' });
		}

		const baseUrl = env.BETTER_AUTH_URL ?? 'http://localhost:5173';
		const joinUrl = `${baseUrl}/join/${token}`;

		await sendEmail({
			to: email.trim(),
			subject: `You're invited to join ${membership.organization.name} on Pulse`,
			text: `You've been invited to join ${membership.organization.name} as a ${role}.\n\nAccept the invite: ${joinUrl}\n\nThis link expires in 7 days.`,
			html: `<p>You've been invited to join <strong>${membership.organization.name}</strong> as a ${role}.</p><p><a href="${joinUrl}">Accept the invite</a></p><p>This link expires in 7 days.</p>`
		});

		return { inviteSent: true };
	},

	removeMember: async ({ request, locals }) => {
		const form = await request.formData();
		const memberId = form.get('memberId') as string;

		const membership = await db.organizationMember.findFirst({
			where: { userId: locals.user!.id }
		});

		if (!membership || !['owner', 'admin'].includes(membership.role)) {
			return fail(403, { error: 'You do not have permission to remove members' });
		}

		const target = await db.organizationMember.findUnique({ where: { id: memberId } });
		if (!target || target.organizationId !== membership.organizationId) {
			return fail(404, { error: 'Member not found' });
		}
		if (target.role === 'owner') {
			return fail(400, { error: 'Cannot remove the organization owner' });
		}

		await db.organizationMember.delete({ where: { id: memberId } });
		return { memberRemoved: true };
	},

	changeRole: async ({ request, locals }) => {
		const form = await request.formData();
		const memberId = form.get('memberId') as string;
		const newRole = form.get('role') as string;

		if (!['member', 'admin'].includes(newRole)) {
			return fail(400, { error: 'Invalid role' });
		}

		const membership = await db.organizationMember.findFirst({
			where: { userId: locals.user!.id }
		});

		if (!membership || membership.role !== 'owner') {
			return fail(403, { error: 'Only the owner can change roles' });
		}

		const target = await db.organizationMember.findUnique({ where: { id: memberId } });
		if (!target || target.organizationId !== membership.organizationId) {
			return fail(404, { error: 'Member not found' });
		}
		if (target.role === 'owner') {
			return fail(400, { error: 'Cannot change the owner role' });
		}

		await db.organizationMember.update({ where: { id: memberId }, data: { role: newRole } });
		return { roleChanged: true };
	},

	cancelInvite: async ({ request, locals }) => {
		const form = await request.formData();
		const inviteId = form.get('inviteId') as string;

		const membership = await db.organizationMember.findFirst({
			where: { userId: locals.user!.id }
		});

		if (!membership || !['owner', 'admin'].includes(membership.role)) {
			return fail(403, { error: 'You do not have permission to cancel invites' });
		}

		const invite = await db.organizationInvite.findUnique({ where: { id: inviteId } });
		if (!invite || invite.organizationId !== membership.organizationId) {
			return fail(404, { error: 'Invite not found' });
		}

		await db.organizationInvite.delete({ where: { id: inviteId } });
		return { inviteCanceled: true };
	}
};

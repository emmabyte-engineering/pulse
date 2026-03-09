import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateInviteToken, markInviteUsed } from '$server/invites';
import { db } from '$server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Not authenticated');
	}

	const { token, orgName } = await request.json();

	if (!token) {
		error(400, 'Token is required');
	}

	const invite = await validateInviteToken(token);
	if (!invite) {
		error(400, 'Invalid or expired invite token');
	}

	// Mark the invite as used
	await markInviteUsed(invite.id);

	// Create org for the user if they provided a name
	const slug = (orgName || locals.user.email.split('@')[0])
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	// Ensure unique slug
	let finalSlug = slug;
	let counter = 0;
	while (await db.organization.findUnique({ where: { slug: finalSlug } })) {
		counter++;
		finalSlug = `${slug}-${counter}`;
	}

	const org = await db.organization.create({
		data: {
			name: orgName || locals.user.name,
			slug: finalSlug,
			plan: 'free'
		}
	});

	await db.organizationMember.create({
		data: {
			organizationId: org.id,
			userId: locals.user.id,
			role: 'owner'
		}
	});

	return json({ success: true, organizationId: org.id });
};

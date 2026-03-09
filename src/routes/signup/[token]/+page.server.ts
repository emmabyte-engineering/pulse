import type { PageServerLoad } from './$types';
import { validateInviteToken } from '$server/invites';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const invite = await validateInviteToken(params.token);

	if (!invite) {
		error(404, 'This invite link is invalid or has expired.');
	}

	return {
		email: invite.email,
		token: params.token
	};
};

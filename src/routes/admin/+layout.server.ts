import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { listIntegrations } from '$server/integrations';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (locals.user.role !== 'admin') {
		redirect(302, '/');
	}

	const integrations = await listIntegrations();

	return {
		user: locals.user,
		integrations
	};
};

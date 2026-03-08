import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getIntegrationType, connectIntegration, getIntegrationBySlug, type IntegrationConfig } from '$server/integrations';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const typeDef = getIntegrationType(params.slug);
	if (!typeDef) {
		error(404, 'Unknown integration type');
	}

	// Already connected? Redirect to service page
	const existing = await getIntegrationBySlug(params.slug);
	if (existing) {
		redirect(302, `/admin/services/${params.slug}`);
	}

	return { integration: typeDef };
};

export const actions: Actions = {
	connect: async ({ request, params }) => {
		const typeDef = getIntegrationType(params.slug);
		if (!typeDef) return fail(400, { error: 'Unknown integration type' });

		const form = await request.formData();
		const config: IntegrationConfig = {};

		for (const field of typeDef.fields) {
			const val = form.get(field.key) as string;
			if (field.required && !val?.trim()) {
				return fail(400, { error: `${field.label} is required` });
			}
			if (val?.trim()) config[field.key] = val.trim();
		}

		await connectIntegration(typeDef.source, typeDef.name, config);
		redirect(303, `/admin/services/${params.slug}`);
	}
};

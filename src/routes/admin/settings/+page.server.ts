import type { PageServerLoad, Actions } from './$types';
import { createApiKey, deleteApiKey, listApiKeys } from '$server/api-keys';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const apiKeys = await listApiKeys();
	return { apiKeys };
};

export const actions: Actions = {
	createKey: async ({ request, locals }) => {
		const form = await request.formData();
		const name = form.get('name') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Name is required' });
		}

		const result = await createApiKey(name.trim(), locals.user!.id);

		return { newKey: result.key, keyName: result.name };
	},

	deleteKey: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Key ID is required' });
		}

		await deleteApiKey(id);
		return { success: true };
	}
};

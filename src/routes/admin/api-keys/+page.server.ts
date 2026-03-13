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

		// Parse expiration
		const expiration = form.get('expiration') as string;
		let expiresAt: Date | null = null;
		if (expiration && expiration !== 'never') {
			const days: Record<string, number> = { '30d': 30, '90d': 90, '1y': 365 };
			const d = days[expiration];
			if (d) {
				expiresAt = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
			}
		}

		// Parse permissions
		const permissions = form.getAll('permissions') as string[];
		if (permissions.length === 0) {
			permissions.push('ingest');
		}

		const result = await createApiKey({
			name: name.trim(),
			createdById: locals.user!.id,
			permissions,
			expiresAt
		});

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

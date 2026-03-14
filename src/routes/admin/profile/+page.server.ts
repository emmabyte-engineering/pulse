import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { auth } from '$server/auth';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		profile: {
			id: locals.user!.id,
			name: locals.user!.name,
			email: locals.user!.email,
			image: locals.user!.image ?? null,
			role: locals.user!.role,
			createdAt: locals.user!.createdAt
		}
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const image = form.get('image') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Name is required' });
		}

		await db.user.update({
			where: { id: locals.user!.id },
			data: {
				name: name.trim(),
				image: image?.trim() || null
			}
		});

		return { profileUpdated: true };
	},

	changePassword: async ({ request }) => {
		const form = await request.formData();
		const currentPassword = form.get('currentPassword') as string;
		const newPassword = form.get('newPassword') as string;
		const confirmPassword = form.get('confirmPassword') as string;

		if (!currentPassword || !newPassword) {
			return fail(400, { error: 'All password fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New passwords do not match' });
		}

		if (newPassword.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		try {
			await auth.api.changePassword({
				headers: request.headers,
				body: {
					currentPassword,
					newPassword
				}
			});
		} catch {
			return fail(400, { error: 'Current password is incorrect' });
		}

		return { passwordChanged: true };
	}
};

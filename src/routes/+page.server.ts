import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Admin users should go straight to the dashboard
	if (locals.user?.role === 'admin') {
		throw redirect(302, '/admin');
	}

	const waitlistCount = await db.waitlistEntry.count();
	return { waitlistCount };
};

export const actions: Actions = {
	joinWaitlist: async ({ request }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim().toLowerCase();

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Please enter a valid email address.' });
		}

		const source = (form.get('source') as string) || 'landing';
		const referrer = (form.get('referrer') as string) || null;

		try {
			await db.waitlistEntry.create({
				data: { email, source, referrer }
			});
		} catch (err: unknown) {
			// P2002 = unique constraint violation (duplicate email)
			// Return success anyway to avoid leaking whether email exists
			const prismaError = err as { code?: string };
			if (prismaError.code !== 'P2002') {
				return fail(500, { error: 'Something went wrong. Please try again.' });
			}
		}

		return { success: true };
	}
};

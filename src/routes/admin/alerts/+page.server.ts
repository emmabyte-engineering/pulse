import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const alerts = await db.alertRule.findMany({
		orderBy: { createdAt: 'desc' }
	});

	return { alerts };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const source = form.get('source') as string;
		const eventType = form.get('eventType') as string;
		const conditionType = form.get('conditionType') as string;
		const conditionValue = Number(form.get('conditionValue'));
		const windowMinutes = Number(form.get('windowMinutes')) || 60;
		const notifyEmail = form.get('notifyEmail') as string;

		if (!name || !source || !conditionType || isNaN(conditionValue)) {
			return fail(400, { error: 'Missing required fields' });
		}

		await db.alertRule.create({
			data: {
				name,
				source: source as 'MAILERSEND' | 'VERCEL' | 'PLANETSCALE' | 'APP',
				eventType: eventType || null,
				conditionType,
				conditionValue,
				windowMinutes,
				notifyEmail: notifyEmail || null
			}
		});

		return { success: true };
	},

	toggle: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		const alert = await db.alertRule.findUnique({ where: { id } });
		if (!alert) return fail(404, { error: 'Alert not found' });

		await db.alertRule.update({
			where: { id },
			data: { enabled: !alert.enabled }
		});

		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		await db.alertRule.delete({ where: { id } });
		return { success: true };
	}
};

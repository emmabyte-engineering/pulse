import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	verifyMailerSendSignature,
	processMailerSendWebhook
} from '$server/webhooks/mailersend';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();

	if (env.MAILERSEND_WEBHOOK_SECRET) {
		const signature = request.headers.get('signature') ?? '';
		if (!verifyMailerSendSignature(body, signature, env.MAILERSEND_WEBHOOK_SECRET)) {
			error(401, 'Invalid signature');
		}
	}

	try {
		const payload = JSON.parse(body);
		await processMailerSendWebhook(payload);
		return json({ ok: true });
	} catch (err) {
		console.error('MailerSend webhook error:', err);
		error(500, 'Failed to process webhook');
	}
};

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	verifyMailerSendSignature,
	processMailerSendWebhook
} from '$server/webhooks/mailersend';
import { getIntegrationSecret } from '$server/integrations';
import { getSettingWithFallback } from '$server/settings';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();

	const secret =
		(await getIntegrationSecret('MAILERSEND', 'webhookSecret')) ??
		(await getSettingWithFallback('MAILERSEND_WEBHOOK_SECRET'));
	if (!secret) {
		console.warn('MailerSend webhook received but no secret configured — rejecting');
		error(401, 'Webhook secret not configured');
	}
	const signature = request.headers.get('signature') ?? '';
	if (!verifyMailerSendSignature(body, signature, secret)) {
		error(401, 'Invalid signature');
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

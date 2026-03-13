import { db } from '$server/db';
import { toJsonField } from '$server/db-compat';
import type { EventSource, Severity } from '../db-types';
import crypto from 'node:crypto';

const EVENT_TYPE_MAP: Record<string, { eventType: string; severity: Severity }> = {
	'activity.sent': { eventType: 'email.sent', severity: 'INFO' },
	'activity.delivered': { eventType: 'email.delivered', severity: 'INFO' },
	'activity.soft_bounced': { eventType: 'email.soft_bounced', severity: 'WARN' },
	'activity.hard_bounced': { eventType: 'email.hard_bounced', severity: 'ERROR' },
	'activity.spam_complaint': { eventType: 'email.spam_complaint', severity: 'CRITICAL' },
	'activity.opened': { eventType: 'email.opened', severity: 'DEBUG' },
	'activity.clicked': { eventType: 'email.clicked', severity: 'DEBUG' },
	'activity.unsubscribed': { eventType: 'email.unsubscribed', severity: 'WARN' }
};

export function verifyMailerSendSignature(
	payload: string,
	signature: string,
	secret: string
): boolean {
	const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
	const sigBuf = Buffer.from(signature);
	const expBuf = Buffer.from(expected);
	if (sigBuf.length !== expBuf.length) return false;
	return crypto.timingSafeEqual(sigBuf, expBuf);
}

export async function processMailerSendWebhook(body: Record<string, unknown>) {
	const type = body.type as string;
	const data = body.data as Record<string, unknown>;

	const mapping = EVENT_TYPE_MAP[type];
	if (!mapping) {
		console.warn(`Unknown MailerSend event type: ${type}`);
		return;
	}

	const email = (data?.email as Record<string, unknown>)?.recipients as
		| Array<{ email: string }>
		| undefined;
	const recipient = email?.[0]?.email ?? (data?.email as Record<string, unknown>)?.to as string | undefined;
	const messageId = (data?.email as Record<string, unknown>)?.message_id as string | undefined;
	const subject = (data?.email as Record<string, unknown>)?.subject as string | undefined;

	await db.event.create({
		data: {
			source: 'MAILERSEND' as EventSource,
			eventType: mapping.eventType,
			severity: mapping.severity,
			emailAddress: recipient,
			externalId: messageId,
			summary: buildSummary(mapping.eventType, recipient, subject),
			metadata: toJsonField(body) as string,
			retainUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
		}
	});
}

function buildSummary(
	eventType: string,
	recipient: string | undefined,
	subject: string | undefined
): string {
	const action = eventType.split('.')[1]?.replace('_', ' ') ?? eventType;
	const to = recipient ? ` to ${recipient}` : '';
	const subj = subject ? ` "${subject}"` : '';
	return `Email ${action}${to}${subj}`;
}

import crypto from 'node:crypto';
import { db } from './db';
import { sendEmail } from './email';
import { env } from '$env/dynamic/private';

const INVITE_EXPIRY_DAYS = 14;

function generateToken(): string {
	return crypto.randomBytes(32).toString('base64url');
}

function getBaseUrl(): string {
	return env.BETTER_AUTH_URL ?? 'http://localhost:5173';
}

/**
 * Create an invite token for a specific email and send the invite email.
 */
export async function createAndSendInvite(email: string): Promise<{ success: boolean; error?: string }> {
	const token = generateToken();
	const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

	await db.inviteToken.create({
		data: { email, token, expiresAt }
	});

	// Update waitlist entry status
	await db.waitlistEntry.updateMany({
		where: { email },
		data: { status: 'invited', invitedAt: new Date() }
	});

	const signupUrl = `${getBaseUrl()}/signup/${token}`;

	const sent = await sendEmail({
		to: email,
		subject: "You're invited to Pulse",
		text: [
			"You're in! You've been invited to join Pulse — observability, simplified.",
			'',
			`Create your account: ${signupUrl}`,
			'',
			`This link expires in ${INVITE_EXPIRY_DAYS} days.`,
			'',
			'— The Pulse team'
		].join('\n'),
		html: `
			<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
				<div style="text-align: center; margin-bottom: 32px;">
					<div style="display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #FFBA71, #FF6798);"></div>
				</div>
				<h1 style="font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 16px;">You're invited to Pulse</h1>
				<p style="color: #6b7280; text-align: center; margin-bottom: 32px;">Observability, simplified. Your webhooks, logs, and alerts in one place.</p>
				<div style="text-align: center; margin-bottom: 32px;">
					<a href="${signupUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(to right, #FFBA71, #FF9185, #FF6798); color: white; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 14px;">Create Your Account</a>
				</div>
				<p style="color: #9ca3af; font-size: 13px; text-align: center;">This link expires in ${INVITE_EXPIRY_DAYS} days.</p>
			</div>
		`
	});

	if (!sent) {
		return { success: false, error: 'Failed to send invite email. Check notification channel settings.' };
	}

	return { success: true };
}

/**
 * Validate an invite token. Returns the email if valid, null if expired/used/invalid.
 */
export async function validateInviteToken(token: string): Promise<{ email: string; id: string } | null> {
	const invite = await db.inviteToken.findUnique({ where: { token } });

	if (!invite) return null;
	if (invite.usedAt) return null;
	if (invite.expiresAt < new Date()) return null;

	return { email: invite.email, id: invite.id };
}

/**
 * Mark an invite token as used.
 */
export async function markInviteUsed(tokenId: string): Promise<void> {
	await db.inviteToken.update({
		where: { id: tokenId },
		data: { usedAt: new Date() }
	});

	// Also get the email to update waitlist status
	const invite = await db.inviteToken.findUnique({ where: { id: tokenId } });
	if (invite) {
		await db.waitlistEntry.updateMany({
			where: { email: invite.email },
			data: { status: 'converted' }
		});
	}
}

/**
 * Batch invite multiple waitlist entries. Returns count of invites sent.
 */
export async function batchInvite(emails: string[]): Promise<{ sent: number; failed: number }> {
	let sent = 0;
	let failed = 0;

	for (const email of emails) {
		const result = await createAndSendInvite(email);
		if (result.success) {
			sent++;
		} else {
			failed++;
		}
	}

	return { sent, failed };
}

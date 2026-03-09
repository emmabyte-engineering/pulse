import { getEnabledChannels } from './notification-channels';

interface EmailMessage {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

/**
 * Send a transactional email using the first enabled MailerSend channel.
 * Returns true if sent successfully, false if no channel available or send failed.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
	const channels = await getEnabledChannels();
	const mailersend = channels.find((ch) => ch.type === 'mailersend');

	if (!mailersend) {
		console.warn('No enabled MailerSend channel found — cannot send email');
		return false;
	}

	const { config } = mailersend;

	const body: Record<string, unknown> = {
		from: { email: config.fromEmail, name: config.fromName ?? 'Pulse' },
		to: [{ email: message.to }],
		subject: message.subject,
		text: message.text
	};

	if (message.html) {
		body.html = message.html;
	}

	const response = await fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.apiKey}`
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		console.error(`Email send failed: ${response.status} ${await response.text()}`);
		return false;
	}

	return true;
}

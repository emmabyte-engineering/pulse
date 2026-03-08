import { getEnabledChannels, type ChannelConfig } from './notification-channels';

export interface AlertNotification {
	alertName: string;
	description?: string | null;
	source: string;
	eventType?: string | null;
	conditionType: string;
	conditionValue: number;
	actualValue: number;
	windowMinutes: number;
}

function formatAlertMessage(alert: AlertNotification): string {
	const condition =
		alert.conditionType === 'OCCURRENCE'
			? `${alert.actualValue} occurrence(s)`
			: alert.conditionType === 'RATE'
				? `rate ${(alert.actualValue * 100).toFixed(1)}% (threshold: ${(Number(alert.conditionValue) * 100).toFixed(1)}%)`
				: `${alert.actualValue} events (threshold: ${alert.conditionValue})`;

	const scope = alert.eventType ? `${alert.source}/${alert.eventType}` : alert.source;

	return `[Pulse Alert] ${alert.alertName}\n\nSource: ${scope}\nCondition: ${condition}\nWindow: ${alert.windowMinutes} minutes\n${alert.description ? `\n${alert.description}` : ''}`;
}

// ─── Channel Dispatchers ─────────────────────────────────────────────────────

async function sendViaMailerSend(config: ChannelConfig, to: string | null, alert: AlertNotification): Promise<void> {
	const recipient = to ?? config.fromEmail;
	const response = await fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.apiKey}`
		},
		body: JSON.stringify({
			from: { email: config.fromEmail, name: config.fromName ?? 'Pulse Alerts' },
			to: [{ email: recipient }],
			subject: `[Pulse] ${alert.alertName}`,
			text: formatAlertMessage(alert)
		})
	});

	if (!response.ok) {
		console.error(`MailerSend notification failed: ${response.status} ${await response.text()}`);
	}
}

async function sendViaSmtp(config: ChannelConfig, to: string | null, alert: AlertNotification): Promise<void> {
	// Use Node's built-in net/tls for a minimal SMTP send
	// For now, log a warning — full SMTP requires nodemailer or similar
	// This can be swapped in when nodemailer is added as a dependency
	console.warn(`SMTP channel configured but not yet implemented. Would send to ${to ?? config.fromEmail} via ${config.host}:${config.port}`);
}

async function sendViaSlack(config: ChannelConfig, alert: AlertNotification): Promise<void> {
	const response = await fetch(config.webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			text: formatAlertMessage(alert),
			blocks: [
				{
					type: 'header',
					text: { type: 'plain_text', text: `🚨 ${alert.alertName}` }
				},
				{
					type: 'section',
					fields: [
						{
							type: 'mrkdwn',
							text: `*Source:*\n${alert.eventType ? `${alert.source}/${alert.eventType}` : alert.source}`
						},
						{
							type: 'mrkdwn',
							text: `*Condition:*\n${alert.conditionType}`
						},
						{
							type: 'mrkdwn',
							text: `*Value:*\n${alert.conditionType === 'RATE' ? `${(alert.actualValue * 100).toFixed(1)}%` : alert.actualValue}`
						},
						{
							type: 'mrkdwn',
							text: `*Window:*\n${alert.windowMinutes}m`
						}
					]
				}
			]
		})
	});

	if (!response.ok) {
		console.error(`Slack notification failed: ${response.status} ${await response.text()}`);
	}
}

async function sendViaClickUp(config: ChannelConfig, alert: AlertNotification): Promise<void> {
	const response = await fetch(`https://api.clickup.com/api/v2/list/${config.listId}/task`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: config.apiToken
		},
		body: JSON.stringify({
			name: `[Pulse Alert] ${alert.alertName}`,
			description: formatAlertMessage(alert),
			priority: alert.conditionType === 'OCCURRENCE' ? 2 : 1,
			status: 'to do'
		})
	});

	if (!response.ok) {
		console.error(`ClickUp notification failed: ${response.status} ${await response.text()}`);
	}
}

// ─── Main Dispatcher ─────────────────────────────────────────────────────────

async function dispatchToChannel(
	channel: { type: string; name: string; config: ChannelConfig },
	alert: AlertNotification,
	emailRecipient: string | null
): Promise<void> {
	try {
		switch (channel.type) {
			case 'mailersend':
				await sendViaMailerSend(channel.config, emailRecipient, alert);
				break;
			case 'smtp':
				await sendViaSmtp(channel.config, emailRecipient, alert);
				break;
			case 'slack':
				await sendViaSlack(channel.config, alert);
				break;
			case 'clickup':
				await sendViaClickUp(channel.config, alert);
				break;
			default:
				console.warn(`Unknown notification channel type: ${channel.type}`);
		}
	} catch (err) {
		console.error(`Notification failed for channel "${channel.name}" (${channel.type}):`, err);
	}
}

export async function sendAlertNotifications(
	alert: AlertNotification,
	notifyEmailAddr?: string | null,
	_notifySlackUrl?: string | null
): Promise<void> {
	const channels = await getEnabledChannels();

	if (channels.length === 0) {
		return;
	}

	await Promise.allSettled(
		channels.map((ch) => dispatchToChannel(ch, alert, notifyEmailAddr ?? null))
	);
}

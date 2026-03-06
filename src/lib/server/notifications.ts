import { env } from '$env/dynamic/private';

interface AlertNotification {
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

export async function notifySlack(alert: AlertNotification): Promise<void> {
	const webhookUrl = env.SLACK_WEBHOOK_URL;
	if (!webhookUrl) return;

	try {
		const response = await fetch(webhookUrl, {
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
	} catch (err) {
		console.error('Slack notification error:', err);
	}
}

export async function notifyEmail(
	to: string,
	alert: AlertNotification
): Promise<void> {
	const apiKey = env.MAILERSEND_API_KEY;
	const from = env.ALERT_FROM_EMAIL;
	if (!apiKey || !from) return;

	try {
		const response = await fetch('https://api.mailersend.com/v1/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				from: { email: from, name: 'Pulse Alerts' },
				to: [{ email: to }],
				subject: `[Pulse] ${alert.alertName}`,
				text: formatAlertMessage(alert)
			})
		});

		if (!response.ok) {
			console.error(`Email notification failed: ${response.status} ${await response.text()}`);
		}
	} catch (err) {
		console.error('Email notification error:', err);
	}
}

export async function sendAlertNotifications(
	alert: AlertNotification,
	notifyEmailAddr?: string | null,
	notifySlackUrl?: string | null
): Promise<void> {
	const promises: Promise<void>[] = [];

	// Always try the global Slack webhook
	promises.push(notifySlack(alert));

	// Send email if configured on the alert rule
	if (notifyEmailAddr) {
		promises.push(notifyEmail(notifyEmailAddr, alert));
	}

	await Promise.allSettled(promises);
}

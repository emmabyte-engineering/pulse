import { db } from './db';
import type { EventSource } from '../generated/prisma/client';
import { sendAlertNotifications } from './notifications';

export async function evaluateAlerts(): Promise<void> {
	const rules = await db.alertRule.findMany({
		where: { enabled: true }
	});

	for (const rule of rules) {
		try {
			await evaluateRule(rule);
		} catch (err) {
			console.error(`Alert evaluation failed for "${rule.name}" (${rule.id}):`, err);
		}
	}
}

interface AlertRule {
	id: string;
	name: string;
	description: string | null;
	source: string;
	eventType: string | null;
	conditionType: string;
	conditionValue: unknown;
	windowMinutes: number;
	lastTriggeredAt: Date | null;
	notifyEmail: string | null;
	notifySlack: string | null;
}

async function evaluateRule(rule: AlertRule): Promise<void> {
	// Cooldown: don't re-trigger within the window period
	if (rule.lastTriggeredAt) {
		const cooldownUntil = new Date(
			rule.lastTriggeredAt.getTime() + rule.windowMinutes * 60 * 1000
		);
		if (new Date() < cooldownUntil) return;
	}

	const windowStart = new Date(Date.now() - rule.windowMinutes * 60 * 1000);

	const where: { source: EventSource; timestamp: { gte: Date }; eventType?: string } = {
		source: rule.source as EventSource,
		timestamp: { gte: windowStart }
	};
	if (rule.eventType) {
		where.eventType = rule.eventType;
	}

	const threshold = Number(rule.conditionValue);
	let triggered = false;
	let actualValue = 0;

	switch (rule.conditionType) {
		case 'OCCURRENCE': {
			const count = await db.event.count({ where });
			actualValue = count;
			triggered = count > 0;
			break;
		}
		case 'THRESHOLD': {
			const count = await db.event.count({ where });
			actualValue = count;
			triggered = count >= threshold;
			break;
		}
		case 'RATE': {
			// Rate = matching events / total events from the same source in the window
			const [matchCount, totalCount] = await Promise.all([
				db.event.count({ where }),
				db.event.count({
					where: {
						source: rule.source as EventSource,
						timestamp: { gte: windowStart }
					}
				})
			]);
			actualValue = totalCount > 0 ? matchCount / totalCount : 0;
			triggered = actualValue >= threshold;
			break;
		}
	}

	if (triggered) {
		await db.alertRule.update({
			where: { id: rule.id },
			data: { lastTriggeredAt: new Date() }
		});

		await sendAlertNotifications(
			{
				alertName: rule.name,
				description: rule.description,
				source: rule.source,
				eventType: rule.eventType,
				conditionType: rule.conditionType,
				conditionValue: threshold,
				actualValue,
				windowMinutes: rule.windowMinutes
			},
			rule.notifyEmail,
			rule.notifySlack
		);

		console.log(`Alert triggered: "${rule.name}" (${rule.conditionType}: ${actualValue})`);
	}
}

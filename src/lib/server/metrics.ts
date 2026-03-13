import { db } from './db';
import type { EventSource } from './db-types';

const SOURCES: EventSource[] = ['MAILERSEND', 'VERCEL', 'PLANETSCALE', 'APP'];

export async function aggregateMetrics(): Promise<void> {
	const now = new Date();
	// Round down to the start of the current hour
	const periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
	const periodStart = new Date(periodEnd.getTime() - 60 * 60 * 1000);

	for (const source of SOURCES) {
		try {
			await aggregateSourceMetrics(source, periodStart, periodEnd);
		} catch (err) {
			console.error(`Metric aggregation failed for ${source}:`, err);
		}
	}
}

async function aggregateSourceMetrics(
	source: EventSource,
	periodStart: Date,
	periodEnd: Date
): Promise<void> {
	const where = {
		source,
		timestamp: { gte: periodStart, lt: periodEnd }
	};

	const totalCount = await db.event.count({ where });
	if (totalCount === 0) return;

	// Total event count for this source
	await upsertMetric(`${source.toLowerCase()}.event_count`, source, periodStart, periodEnd, totalCount);

	// Error count
	const errorCount = await db.event.count({
		where: { ...where, severity: { in: ['ERROR', 'CRITICAL'] } }
	});
	await upsertMetric(`${source.toLowerCase()}.error_count`, source, periodStart, periodEnd, errorCount);

	// Source-specific metrics
	if (source === 'MAILERSEND') {
		await aggregateEmailMetrics(periodStart, periodEnd, totalCount);
	}
}

async function aggregateEmailMetrics(
	periodStart: Date,
	periodEnd: Date,
	totalCount: number
): Promise<void> {
	const timeFilter = { timestamp: { gte: periodStart, lt: periodEnd } };

	const [sendCount, deliveredCount, bounceCount, spamCount] = await Promise.all([
		db.event.count({
			where: { source: 'MAILERSEND', eventType: 'email.sent', ...timeFilter }
		}),
		db.event.count({
			where: { source: 'MAILERSEND', eventType: 'email.delivered', ...timeFilter }
		}),
		db.event.count({
			where: {
				source: 'MAILERSEND',
				eventType: { in: ['email.hard_bounced', 'email.soft_bounced'] },
				...timeFilter
			}
		}),
		db.event.count({
			where: { source: 'MAILERSEND', eventType: 'email.spam_complaint', ...timeFilter }
		})
	]);

	await Promise.all([
		upsertMetric('email.send_count', 'MAILERSEND', periodStart, periodEnd, sendCount),
		upsertMetric('email.delivered_count', 'MAILERSEND', periodStart, periodEnd, deliveredCount),
		upsertMetric('email.bounce_count', 'MAILERSEND', periodStart, periodEnd, bounceCount),
		upsertMetric('email.spam_count', 'MAILERSEND', periodStart, periodEnd, spamCount),
		upsertMetric(
			'email.bounce_rate',
			'MAILERSEND',
			periodStart,
			periodEnd,
			totalCount > 0 ? bounceCount / totalCount : 0
		),
		upsertMetric(
			'email.delivery_rate',
			'MAILERSEND',
			periodStart,
			periodEnd,
			totalCount > 0 ? deliveredCount / totalCount : 0
		)
	]);
}

async function upsertMetric(
	metricName: string,
	source: EventSource,
	periodStart: Date,
	periodEnd: Date,
	value: number
): Promise<void> {
	// Check if metric already exists for this period
	const existing = await db.metric.findFirst({
		where: { metricName, source, periodStart }
	});

	if (existing) {
		await db.metric.update({
			where: { id: existing.id },
			data: { value }
		});
	} else {
		await db.metric.create({
			data: { metricName, source, periodStart, periodEnd, value }
		});
	}
}

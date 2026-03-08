import { db } from './db';
import type { EventSource } from '$lib/generated/prisma/client';

interface TimeSeriesPoint {
	label: string;
	value: number;
}

export async function getEventTimeSeries(
	hours: number = 24,
	source?: EventSource
): Promise<TimeSeriesPoint[]> {
	const since = new Date(Date.now() - hours * 60 * 60 * 1000);

	const rows = source
		? await db.$queryRawUnsafe<{ bucket: Date; count: bigint }[]>(
				`SELECT date_trunc('hour', "timestamp") as bucket, COUNT(*) as count
				 FROM "event"
				 WHERE "timestamp" >= $1 AND "source" = $2
				 GROUP BY bucket
				 ORDER BY bucket ASC`,
				since,
				source
			)
		: await db.$queryRawUnsafe<{ bucket: Date; count: bigint }[]>(
				`SELECT date_trunc('hour', "timestamp") as bucket, COUNT(*) as count
				 FROM "event"
				 WHERE "timestamp" >= $1
				 GROUP BY bucket
				 ORDER BY bucket ASC`,
				since
			);

	return rows.map((r) => ({
		label: new Date(r.bucket).toLocaleTimeString('en-US', { hour: 'numeric' }),
		value: Number(r.count)
	}));
}

export async function getServiceStats(source: EventSource, hours: number = 24) {
	const since = new Date(Date.now() - hours * 60 * 60 * 1000);

	const [total, errors, typeBreakdown] = await Promise.all([
		db.event.count({ where: { source, timestamp: { gte: since } } }),
		db.event.count({
			where: { source, severity: { in: ['ERROR', 'CRITICAL'] }, timestamp: { gte: since } }
		}),
		db.event.groupBy({
			by: ['eventType'],
			_count: true,
			where: { source, timestamp: { gte: since } },
			orderBy: { _count: { eventType: 'desc' } },
			take: 10
		})
	]);

	return {
		total,
		errors,
		successRate: total > 0 ? Math.round(((total - errors) / total) * 100) : 100,
		typeBreakdown: typeBreakdown.map((t) => ({ type: t.eventType, count: t._count }))
	};
}

export async function getSeverityDistribution(source?: EventSource, hours: number = 24) {
	const since = new Date(Date.now() - hours * 60 * 60 * 1000);

	const where = {
		timestamp: { gte: since },
		...(source ? { source } : {})
	};

	const groups = await db.event.groupBy({
		by: ['severity'],
		_count: true,
		where
	});

	const colorMap: Record<string, string> = {
		DEBUG: '#737373',
		INFO: '#60a5fa',
		WARN: '#FFBA71',
		ERROR: '#FF6798',
		CRITICAL: '#FA586D'
	};

	return groups.map((g) => ({
		label: g.severity,
		value: g._count,
		color: colorMap[g.severity] ?? '#737373'
	}));
}

export async function getDashboardStats(hours: number = 24, connectedSources?: EventSource[]) {
	const now = new Date();
	const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
	const previousSince = new Date(now.getTime() - hours * 2 * 60 * 60 * 1000);

	const sourceFilter = connectedSources?.length
		? { source: { in: connectedSources } }
		: {};

	const [totalCurrent, totalPrevious, errorCount, apiKeyCount, latestEvents] =
		await Promise.all([
			db.event.count({ where: { timestamp: { gte: since }, ...sourceFilter } }),
			db.event.count({ where: { timestamp: { gte: previousSince, lt: since }, ...sourceFilter } }),
			db.event.count({
				where: { severity: { in: ['ERROR', 'CRITICAL'] }, timestamp: { gte: since }, ...sourceFilter }
			}),
			db.apiKey.count(),
			db.event.findMany({
				where: sourceFilter,
				take: 10,
				orderBy: { timestamp: 'desc' }
			})
		]);

	const trend =
		totalPrevious > 0 ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100) : 0;
	const successRate =
		totalCurrent > 0 ? Math.round(((totalCurrent - errorCount) / totalCurrent) * 100) : 100;

	// Per-service stats (only connected sources)
	const sources = connectedSources ?? (['VERCEL', 'MAILERSEND', 'PLANETSCALE', 'APP'] as EventSource[]);
	const serviceStats = await Promise.all(
		sources.map(async (source) => {
			const count = await db.event.count({ where: { source, timestamp: { gte: since } } });
			const errors = await db.event.count({
				where: { source, severity: { in: ['ERROR', 'CRITICAL'] }, timestamp: { gte: since } }
			});
			return { source, count, errors };
		})
	);

	return {
		totalEvents: totalCurrent,
		trend,
		successRate,
		apiKeyCount,
		connectedServices: sources.length,
		serviceStats,
		latestEvents
	};
}

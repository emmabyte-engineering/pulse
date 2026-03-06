import type { PageServerLoad } from './$types';
import { db } from '$server/db';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	const [totalEvents, recentEvents, criticalEvents, sourceBreakdown] = await Promise.all([
		db.event.count(),
		db.event.count({ where: { timestamp: { gte: oneDayAgo } } }),
		db.event.count({
			where: {
				severity: { in: ['ERROR', 'CRITICAL'] },
				timestamp: { gte: oneWeekAgo }
			}
		}),
		db.event.groupBy({
			by: ['source'],
			_count: true,
			where: { timestamp: { gte: oneWeekAgo } }
		})
	]);

	const latestEvents = await db.event.findMany({
		take: 10,
		orderBy: { timestamp: 'desc' }
	});

	return {
		stats: {
			totalEvents,
			recentEvents,
			criticalEvents,
			sourceBreakdown: sourceBreakdown.map((s) => ({
				source: s.source,
				count: s._count
			}))
		},
		latestEvents
	};
};

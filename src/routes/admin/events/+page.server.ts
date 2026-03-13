import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import { fromJsonField, containsInsensitive } from '$server/db-compat';


export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const perPage = 50;
	const source = url.searchParams.get('source');
	const severity = url.searchParams.get('severity');
	const eventType = url.searchParams.get('eventType');
	const search = url.searchParams.get('q');
	const dateFrom = url.searchParams.get('from');
	const dateTo = url.searchParams.get('to');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const where: Record<string, any> = {};

	if (source) {
		where.source = source;
	}
	if (severity) {
		where.severity = severity;
	}
	if (eventType) {
		where.eventType = containsInsensitive(eventType);
	}
	if (dateFrom || dateTo) {
		where.timestamp = {};
		if (dateFrom) (where.timestamp as Record<string, Date>).gte = new Date(dateFrom);
		if (dateTo) (where.timestamp as Record<string, Date>).lte = new Date(dateTo);
	}
	if (search) {
		where.OR = [
			{ summary: containsInsensitive(search) },
			{ eventType: containsInsensitive(search) },
			{ emailAddress: containsInsensitive(search) }
		];
	}

	const [events, total] = await Promise.all([
		db.event.findMany({
			where,
			take: perPage,
			skip: (page - 1) * perPage,
			orderBy: { timestamp: 'desc' }
		}),
		db.event.count({ where })
	]);

	return {
		events: events.map((e) => ({ ...e, metadata: fromJsonField(e.metadata) })),
		pagination: {
			page,
			perPage,
			total,
			totalPages: Math.ceil(total / perPage)
		},
		filters: { source, severity, eventType, search, dateFrom, dateTo }
	};
};

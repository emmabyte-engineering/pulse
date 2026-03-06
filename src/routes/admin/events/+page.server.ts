import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import type { Prisma } from '$lib/generated/prisma/client';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const perPage = 50;
	const source = url.searchParams.get('source');
	const severity = url.searchParams.get('severity');
	const eventType = url.searchParams.get('eventType');
	const search = url.searchParams.get('q');
	const dateFrom = url.searchParams.get('from');
	const dateTo = url.searchParams.get('to');

	const where: Prisma.EventWhereInput = {};

	if (source) {
		where.source = source as Prisma.EnumEventSourceFilter;
	}
	if (severity) {
		where.severity = severity as Prisma.EnumSeverityFilter;
	}
	if (eventType) {
		where.eventType = { contains: eventType, mode: 'insensitive' };
	}
	if (dateFrom || dateTo) {
		where.timestamp = {};
		if (dateFrom) (where.timestamp as Record<string, Date>).gte = new Date(dateFrom);
		if (dateTo) (where.timestamp as Record<string, Date>).lte = new Date(dateTo);
	}
	if (search) {
		where.OR = [
			{ summary: { contains: search, mode: 'insensitive' } },
			{ eventType: { contains: search, mode: 'insensitive' } },
			{ emailAddress: { contains: search, mode: 'insensitive' } }
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
		events,
		pagination: {
			page,
			perPage,
			total,
			totalPages: Math.ceil(total / perPage)
		},
		filters: { source, severity, eventType, search, dateFrom, dateTo }
	};
};

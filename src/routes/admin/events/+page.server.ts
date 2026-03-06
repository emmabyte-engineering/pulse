import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import type { Prisma } from '@prisma/client';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const perPage = 50;
	const source = url.searchParams.get('source');
	const severity = url.searchParams.get('severity');
	const search = url.searchParams.get('q');

	const where: Prisma.EventWhereInput = {};

	if (source) {
		where.source = source as Prisma.EnumEventSourceFilter;
	}
	if (severity) {
		where.severity = severity as Prisma.EnumSeverityFilter;
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
		filters: { source, severity, search }
	};
};

import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getIntegrationType, getIntegrationBySlug, disconnectIntegration } from '$server/integrations';
import { getEventTimeSeries, getServiceStats, getSeverityDistribution } from '$server/stats';
import { db } from '$server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const typeDef = getIntegrationType(params.slug);
	if (!typeDef) {
		redirect(302, '/admin');
	}

	// Not connected? Send to setup wizard
	const integration = await getIntegrationBySlug(params.slug);
	if (!integration) {
		redirect(302, `/admin/integrations/add/${params.slug}`);
	}

	const hours = Number(url.searchParams.get('range') ?? '24');
	const q = url.searchParams.get('q') ?? '';
	const severity = url.searchParams.get('status') ?? '';
	const eventType = url.searchParams.get('type') ?? '';

	const [stats, timeSeries, severityDist] = await Promise.all([
		getServiceStats(typeDef.source, hours),
		getEventTimeSeries(hours, typeDef.source),
		getSeverityDistribution(typeDef.source, hours)
	]);

	// Build event filter
	const since = new Date(Date.now() - hours * 60 * 60 * 1000);
	const where: Record<string, unknown> = {
		source: typeDef.source,
		timestamp: { gte: since }
	};
	if (q) {
		where.OR = [
			{ summary: { contains: q, mode: 'insensitive' } },
			{ eventType: { contains: q, mode: 'insensitive' } }
		];
	}
	if (severity) {
		where.severity = severity;
	}
	if (eventType) {
		where.eventType = eventType;
	}

	const events = await db.event.findMany({
		where,
		take: 50,
		orderBy: { timestamp: 'desc' }
	});

	// Extract metadata fields into flat objects for table display
	const flatEvents = events.map((e) => {
		const meta = (e.metadata ?? {}) as Record<string, unknown>;
		return {
			id: e.id,
			eventType: e.eventType,
			severity: e.severity,
			summary: e.summary,
			emailAddress: e.emailAddress,
			userId: e.userId,
			timestamp: e.timestamp,
			...Object.fromEntries(
				typeDef.columns
					.filter((c) => c.extractFrom === 'metadata')
					.map((c) => [c.key, meta[c.key] ?? null])
			)
		};
	});

	return {
		service: {
			slug: typeDef.slug,
			name: typeDef.name,
			description: typeDef.description,
			columns: typeDef.columns
		},
		stats,
		timeSeries,
		severityDist,
		events: flatEvents,
		eventTypes: stats.typeBreakdown.map((t) => t.type),
		filters: { q, severity, eventType, hours }
	};
};

export const actions: Actions = {
	disconnect: async ({ params }) => {
		const typeDef = getIntegrationType(params.slug);
		if (!typeDef) return fail(400, { error: 'Unknown integration' });

		await disconnectIntegration(typeDef.source);
		redirect(303, '/admin');
	}
};

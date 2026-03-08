import type { PageServerLoad } from './$types';
import { getDashboardStats, getEventTimeSeries, getSeverityDistribution } from '$server/stats';
import { getConnectedSources } from '$server/integrations';

export const load: PageServerLoad = async ({ url }) => {
	const hours = Math.min(Math.max(Number(url.searchParams.get('range') ?? '24') || 24, 1), 720);
	const connectedSources = await getConnectedSources();

	const hasIntegrations = connectedSources.length > 0;

	const [stats, timeSeries, severityDist] = hasIntegrations
		? await Promise.all([
				getDashboardStats(hours, connectedSources),
				getEventTimeSeries(hours),
				getSeverityDistribution(undefined, hours)
			])
		: [null, [], []];

	return {
		hasIntegrations,
		stats,
		timeSeries: timeSeries as { label: string; value: number }[],
		severityDist
	};
};

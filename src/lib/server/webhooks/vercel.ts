import { db } from '$server/db';
import type { EventSource, Severity } from '@prisma/client';

interface VercelLogEntry {
	id?: string;
	message: string;
	timestamp: number;
	type?: string;
	source?: string;
	projectId?: string;
	deploymentId?: string;
	host?: string;
	path?: string;
	statusCode?: number;
	level?: string;
	proxy?: Record<string, unknown>;
}

function mapSeverity(level: string | undefined, statusCode: number | undefined): Severity {
	if (level === 'error' || (statusCode && statusCode >= 500)) return 'ERROR';
	if (level === 'warning' || (statusCode && statusCode >= 400)) return 'WARN';
	return 'INFO';
}

export async function processVercelLogDrain(entries: VercelLogEntry[]) {
	const events = entries.map((entry) => ({
		source: 'VERCEL' as EventSource,
		eventType: `vercel.${entry.source ?? entry.type ?? 'log'}`,
		severity: mapSeverity(entry.level, entry.statusCode),
		timestamp: new Date(entry.timestamp),
		externalId: entry.id,
		summary: entry.message.slice(0, 500),
		metadata: entry as object,
		retainUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
	}));

	if (events.length > 0) {
		await db.event.createMany({ data: events });
	}
}

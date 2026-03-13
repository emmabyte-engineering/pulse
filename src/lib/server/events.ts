import { db } from './db';
import { toJsonField } from './db-compat';
import type { EventSource, Severity } from './db-types';

interface IngestEventParams {
	source: EventSource;
	eventType: string;
	severity?: Severity;
	userId?: string;
	organizationId?: string;
	emailAddress?: string;
	summary?: string;
	metadata?: Record<string, unknown> | unknown;
	externalId?: string;
	retainUntil?: Date;
}

/**
 * Ingest a single event into the observability store.
 * Use this from application code to log audit/email events.
 */
export async function ingestEvent(params: IngestEventParams) {
	return db.event.create({
		data: {
			source: params.source,
			eventType: params.eventType,
			severity: params.severity ?? 'INFO',
			userId: params.userId,
			organizationId: params.organizationId,
			emailAddress: params.emailAddress,
			summary: params.summary,
			metadata: toJsonField(params.metadata) as string,
			externalId: params.externalId,
			retainUntil: params.retainUntil
		}
	});
}

/**
 * Ingest events via the public REST API.
 * Used by external services (e.g., emmabyte.io) to send events.
 */
export async function ingestBatch(events: IngestEventParams[]) {
	return db.event.createMany({
		data: events.map((e) => ({
			source: e.source,
			eventType: e.eventType,
			severity: e.severity ?? 'INFO',
			userId: e.userId,
			organizationId: e.organizationId,
			emailAddress: e.emailAddress,
			summary: e.summary,
			metadata: toJsonField(e.metadata) as string,
			externalId: e.externalId,
			retainUntil: e.retainUntil
		}))
	});
}

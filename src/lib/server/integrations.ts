import { db } from './db';
import { encrypt, decrypt } from './settings';
import type { EventSource } from '$lib/generated/prisma/client';

// ─── Integration Type Definitions ────────────────────────────────────────────

export interface SetupField {
	key: string;
	label: string;
	type: 'text' | 'password';
	placeholder?: string;
	description?: string;
	required?: boolean;
}

export interface IntegrationTypeDefinition {
	source: EventSource;
	slug: string;
	name: string;
	description: string;
	icon: string;
	fields: SetupField[];
	setupSteps: string[];
	webhookEndpoint: string;
	columns: { key: string; label: string; extractFrom?: string }[];
}

export const INTEGRATION_TYPES: IntegrationTypeDefinition[] = [
	{
		source: 'VERCEL',
		slug: 'vercel',
		name: 'Vercel',
		description: 'Deployments, builds, and serverless function logs',
		icon: 'triangle',
		fields: [
			{
				key: 'webhookSecret',
				label: 'Webhook Verification Secret',
				type: 'password',
				required: true,
				description: 'The verification token from your Vercel log drain settings'
			}
		],
		setupSteps: [
			'Go to your Vercel project Settings → Log Drains',
			'Add a new log drain with the endpoint URL shown below',
			'Copy the verification secret and paste it here'
		],
		webhookEndpoint: '/api/webhooks/vercel',
		columns: [
			{ key: 'eventType', label: 'Type' },
			{ key: 'severity', label: 'Severity' },
			{ key: 'summary', label: 'Message' },
			{ key: 'projectName', label: 'Project', extractFrom: 'metadata' },
			{ key: 'timestamp', label: 'Time' }
		]
	},
	{
		source: 'MAILERSEND',
		slug: 'mailersend',
		name: 'MailerSend',
		description: 'Email delivery, bounces, and engagement tracking',
		icon: 'mail',
		fields: [
			{
				key: 'webhookSecret',
				label: 'Webhook Signing Secret',
				type: 'password',
				required: true,
				description: 'Found in MailerSend → Domains → Webhooks → Signing Secret'
			}
		],
		setupSteps: [
			'Go to MailerSend → Domains → select your domain → Webhooks',
			'Add a webhook with the endpoint URL shown below',
			'Select the events to track (delivery, bounce, open, click, etc.)',
			'Copy the signing secret and paste it here'
		],
		webhookEndpoint: '/api/webhooks/mailersend',
		columns: [
			{ key: 'eventType', label: 'Type' },
			{ key: 'severity', label: 'Severity' },
			{ key: 'emailAddress', label: 'Recipient' },
			{ key: 'summary', label: 'Message' },
			{ key: 'timestamp', label: 'Time' }
		]
	},
	{
		source: 'PLANETSCALE',
		slug: 'planetscale',
		name: 'PlanetScale',
		description: 'Database queries, performance, and error tracking',
		icon: 'database',
		fields: [],
		setupSteps: [
			'PlanetScale events are ingested via the API endpoint',
			'Create an API key on the API Keys page',
			'Send events using POST requests with your API key'
		],
		webhookEndpoint: '/api/ingest',
		columns: [
			{ key: 'eventType', label: 'Type' },
			{ key: 'severity', label: 'Severity' },
			{ key: 'summary', label: 'Message' },
			{ key: 'timestamp', label: 'Time' }
		]
	},
	{
		source: 'APP',
		slug: 'website',
		name: 'Website',
		description: 'Application events, errors, and user activity',
		icon: 'globe',
		fields: [],
		setupSteps: [
			'Application events are sent via the ingest API',
			'Create an API key on the API Keys page',
			'Instrument your app to send events with your API key'
		],
		webhookEndpoint: '/api/ingest',
		columns: [
			{ key: 'eventType', label: 'Type' },
			{ key: 'severity', label: 'Severity' },
			{ key: 'summary', label: 'Message' },
			{ key: 'userId', label: 'User' },
			{ key: 'timestamp', label: 'Time' }
		]
	}
];

export function getIntegrationType(slug: string): IntegrationTypeDefinition | undefined {
	return INTEGRATION_TYPES.find((t) => t.slug === slug);
}

export function getIntegrationTypeBySource(source: EventSource): IntegrationTypeDefinition | undefined {
	return INTEGRATION_TYPES.find((t) => t.source === source);
}

// ─── Integration CRUD ────────────────────────────────────────────────────────

export interface IntegrationConfig {
	[key: string]: string;
}

export async function listIntegrations() {
	const integrations = await db.integration.findMany({ orderBy: { connectedAt: 'asc' } });
	return integrations.map((i) => {
		const typeDef = getIntegrationTypeBySource(i.source);
		return {
			id: i.id,
			source: i.source,
			slug: typeDef?.slug ?? i.source.toLowerCase(),
			name: i.name,
			icon: typeDef?.icon ?? 'box',
			enabled: i.enabled,
			connectedAt: i.connectedAt
		};
	});
}

export async function getIntegrationBySlug(slug: string) {
	const typeDef = getIntegrationType(slug);
	if (!typeDef) return null;
	return db.integration.findUnique({ where: { source: typeDef.source } });
}

export async function connectIntegration(source: EventSource, name: string, config: IntegrationConfig) {
	return db.integration.create({
		data: {
			source,
			name,
			config: encrypt(JSON.stringify(config)),
			enabled: true
		}
	});
}

export async function updateIntegrationConfig(source: EventSource, config: IntegrationConfig) {
	return db.integration.update({
		where: { source },
		data: { config: encrypt(JSON.stringify(config)) }
	});
}

export async function disconnectIntegration(source: EventSource) {
	return db.integration.delete({ where: { source } });
}

export async function getIntegrationSecret(source: EventSource, configKey: string): Promise<string | null> {
	const integration = await db.integration.findUnique({ where: { source } });
	if (!integration) return null;
	try {
		const config = JSON.parse(decrypt(integration.config)) as IntegrationConfig;
		return config[configKey] ?? null;
	} catch {
		return null;
	}
}

export async function getConnectedSources(): Promise<EventSource[]> {
	const integrations = await db.integration.findMany({
		where: { enabled: true },
		select: { source: true }
	});
	return integrations.map((i) => i.source);
}

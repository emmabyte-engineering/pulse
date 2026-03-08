import { db } from './db';
import { encrypt, decrypt } from './settings';

// ─── Channel Type Definitions ────────────────────────────────────────────────

export interface ChannelField {
	key: string;
	label: string;
	type: 'text' | 'password' | 'email' | 'number' | 'select';
	placeholder?: string;
	required?: boolean;
	options?: { value: string; label: string }[];
}

export interface ChannelTypeDefinition {
	type: string;
	name: string;
	description: string;
	icon: string;
	fields: ChannelField[];
}

export const CHANNEL_TYPES: ChannelTypeDefinition[] = [
	{
		type: 'mailersend',
		name: 'MailerSend',
		description: 'Send alert emails via the MailerSend API',
		icon: 'mail',
		fields: [
			{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'mlsn.xxx...', required: true },
			{ key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'alerts@emmabyte.io', required: true },
			{ key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Pulse Alerts' }
		]
	},
	{
		type: 'smtp',
		name: 'SMTP',
		description: 'Send alert emails via any SMTP server',
		icon: 'server',
		fields: [
			{ key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.example.com', required: true },
			{ key: 'port', label: 'Port', type: 'number', placeholder: '587', required: true },
			{ key: 'username', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
			{ key: 'password', label: 'Password', type: 'password', required: true },
			{ key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'alerts@example.com', required: true },
			{ key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Pulse Alerts' },
			{
				key: 'secure',
				label: 'Encryption',
				type: 'select',
				options: [
					{ value: 'tls', label: 'TLS (port 587)' },
					{ value: 'ssl', label: 'SSL (port 465)' },
					{ value: 'none', label: 'None' }
				]
			}
		]
	},
	{
		type: 'slack',
		name: 'Slack',
		description: 'Send alert notifications to a Slack channel via incoming webhook',
		icon: 'message-square',
		fields: [
			{ key: 'webhookUrl', label: 'Webhook URL', type: 'password', placeholder: 'https://hooks.slack.com/services/...', required: true }
		]
	},
	{
		type: 'clickup',
		name: 'ClickUp',
		description: 'Create tasks in ClickUp when alerts fire',
		icon: 'check-square',
		fields: [
			{ key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'pk_xxx...', required: true },
			{ key: 'listId', label: 'List ID', type: 'text', placeholder: 'Target list for alert tasks', required: true }
		]
	}
];

export function getChannelType(type: string): ChannelTypeDefinition | undefined {
	return CHANNEL_TYPES.find((t) => t.type === type);
}

// ─── Channel CRUD ────────────────────────────────────────────────────────────

export interface ChannelConfig {
	[key: string]: string;
}

export async function listChannels() {
	const channels = await db.notificationChannel.findMany({ orderBy: { createdAt: 'asc' } });
	return channels.map((ch) => ({
		id: ch.id,
		type: ch.type,
		name: ch.name,
		enabled: ch.enabled,
		createdAt: ch.createdAt,
		updatedAt: ch.updatedAt
	}));
}

export async function getChannel(id: string) {
	const ch = await db.notificationChannel.findUnique({ where: { id } });
	if (!ch) return null;
	const config = JSON.parse(decrypt(ch.config)) as ChannelConfig;
	return { ...ch, config };
}

export async function getChannelConfig(id: string): Promise<ChannelConfig | null> {
	const ch = await db.notificationChannel.findUnique({ where: { id } });
	if (!ch) return null;
	return JSON.parse(decrypt(ch.config)) as ChannelConfig;
}

export async function createChannel(type: string, name: string, config: ChannelConfig) {
	return db.notificationChannel.create({
		data: {
			type,
			name,
			config: encrypt(JSON.stringify(config)),
			enabled: true
		}
	});
}

export async function updateChannel(id: string, data: { name?: string; config?: ChannelConfig; enabled?: boolean }) {
	const update: Record<string, unknown> = {};
	if (data.name !== undefined) update.name = data.name;
	if (data.enabled !== undefined) update.enabled = data.enabled;
	if (data.config !== undefined) update.config = encrypt(JSON.stringify(data.config));
	return db.notificationChannel.update({ where: { id }, data: update });
}

export async function deleteChannel(id: string) {
	return db.notificationChannel.delete({ where: { id } });
}

export async function getEnabledChannels() {
	const channels = await db.notificationChannel.findMany({ where: { enabled: true } });
	return channels.map((ch) => ({
		id: ch.id,
		type: ch.type,
		name: ch.name,
		config: JSON.parse(decrypt(ch.config)) as ChannelConfig
	}));
}

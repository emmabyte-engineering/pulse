import type { PageServerLoad, Actions } from './$types';
import {
	listChannels,
	getChannel,
	createChannel,
	updateChannel,
	deleteChannel,
	getChannelConfig,
	CHANNEL_TYPES,
	type ChannelConfig
} from '$server/notification-channels';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const channels = await listChannels();

	// Load decrypted configs for editing (mask sensitive fields)
	const channelConfigs: Record<string, Record<string, string>> = {};
	for (const ch of channels) {
		const config = await getChannelConfig(ch.id);
		if (config) {
			const typeDef = CHANNEL_TYPES.find((t) => t.type === ch.type);
			const masked: Record<string, string> = {};
			for (const [key, val] of Object.entries(config)) {
				const field = typeDef?.fields.find((f) => f.key === key);
				// Mask password fields, show others
				masked[key] = field?.type === 'password' ? '' : val;
			}
			channelConfigs[ch.id] = masked;
		}
	}

	return { channels, channelTypes: CHANNEL_TYPES, channelConfigs };
};

export const actions: Actions = {
	createChannel: async ({ request }) => {
		const form = await request.formData();
		const type = form.get('type') as string;
		const name = form.get('name') as string;

		const typeDef = CHANNEL_TYPES.find((t) => t.type === type);
		if (!typeDef) return fail(400, { error: 'Invalid channel type' });
		if (!name?.trim()) return fail(400, { error: 'Name is required' });

		const config: ChannelConfig = {};
		for (const field of typeDef.fields) {
			const val = form.get(`config.${field.key}`) as string;
			if (field.required && !val?.trim()) {
				return fail(400, { error: `${field.label} is required` });
			}
			if (val?.trim()) config[field.key] = val.trim();
		}

		await createChannel(type, name.trim(), config);
		return { channelCreated: true };
	},

	updateChannel: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const name = form.get('name') as string;

		const existing = await getChannel(id);
		if (!existing) return fail(404, { error: 'Channel not found' });

		const typeDef = CHANNEL_TYPES.find((t) => t.type === existing.type);
		if (!typeDef) return fail(400, { error: 'Invalid channel type' });

		const config: ChannelConfig = { ...existing.config };
		for (const field of typeDef.fields) {
			const val = form.get(`config.${field.key}`) as string;
			if (val?.trim()) {
				config[field.key] = val.trim();
			} else if (field.required && !config[field.key]) {
				return fail(400, { error: `${field.label} is required` });
			}
			// If password field left empty, keep existing value (already in config from spread)
		}

		await updateChannel(id, { name: name?.trim() || existing.name, config });
		return { channelUpdated: true };
	},

	toggleChannel: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const enabled = form.get('enabled') === 'true';

		await updateChannel(id, { enabled });
		return { channelToggled: true };
	},

	deleteChannel: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		await deleteChannel(id);
		return { channelDeleted: true };
	}
};

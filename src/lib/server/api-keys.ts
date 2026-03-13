import { db } from './db';
import crypto from 'node:crypto';

function hashKey(key: string): string {
	return crypto.createHash('sha256').update(key).digest('hex');
}

/** Generate a new-format key: pk_<keyId>.<secret> */
export function generateApiKey(): { key: string; keyId: string; prefix: string; hash: string } {
	const keyId = crypto.randomBytes(9).toString('base64url'); // 12 chars
	const secret = crypto.randomBytes(32).toString('hex');
	const key = `pk_${keyId}.${secret}`;
	const prefix = `pk_${keyId}...`;
	const hash = hashKey(key);
	return { key, keyId, prefix, hash };
}

export interface ValidatedApiKey {
	id: string;
	keyId: string | null;
	permissions: string[];
}

export async function createApiKey({
	name,
	createdById,
	permissions = ['ingest'],
	expiresAt
}: {
	name: string;
	createdById: string;
	permissions?: string[];
	expiresAt?: Date | null;
}) {
	const { key, keyId, prefix, hash } = generateApiKey();

	const apiKey = await db.apiKey.create({
		data: {
			name,
			keyId,
			keyHash: hash,
			prefix,
			permissions,
			expiresAt: expiresAt ?? null,
			createdById
		}
	});

	return { ...apiKey, key };
}

/** Validate an API key and return its metadata, or null if invalid/expired. */
export async function validateApiKey(key: string): Promise<ValidatedApiKey | null> {
	let apiKey;

	if (key.includes('.')) {
		// New format: pk_<keyId>.<secret>
		const match = key.match(/^pk_([A-Za-z0-9_-]{12})\./);
		if (!match) return null;

		const keyId = match[1];
		apiKey = await db.apiKey.findUnique({ where: { keyId } });
		if (!apiKey) return null;

		// Verify hash matches
		const hash = hashKey(key);
		if (hash !== apiKey.keyHash) return null;
	} else {
		// Legacy format: pk_<hex> — hash-only fallback lookup
		const hash = hashKey(key);
		apiKey = await db.apiKey.findUnique({ where: { keyHash: hash } });
		if (!apiKey) return null;
	}

	if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

	// Debounce: only update lastUsedAt if stale by 5+ minutes
	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
	if (!apiKey.lastUsedAt || apiKey.lastUsedAt < fiveMinutesAgo) {
		await db.apiKey.update({
			where: { id: apiKey.id },
			data: { lastUsedAt: new Date() }
		});
	}

	return {
		id: apiKey.id,
		keyId: apiKey.keyId,
		permissions: apiKey.permissions
	};
}

export function hasPermission(validated: ValidatedApiKey, scope: string): boolean {
	return validated.permissions.includes(scope) || validated.permissions.includes('admin');
}

export async function listApiKeys() {
	return db.apiKey.findMany({
		orderBy: { createdAt: 'desc' },
		include: { createdBy: { select: { name: true, email: true } } }
	});
}

export async function deleteApiKey(id: string) {
	return db.apiKey.delete({ where: { id } });
}

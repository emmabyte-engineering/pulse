import { db } from './db';
import crypto from 'node:crypto';

function hashKey(key: string): string {
	return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
	const key = `pk_${crypto.randomBytes(32).toString('hex')}`;
	const prefix = key.slice(0, 11) + '...';
	const hash = hashKey(key);
	return { key, prefix, hash };
}

export async function createApiKey(name: string, createdById: string, expiresAt?: Date) {
	const { key, prefix, hash } = generateApiKey();

	const apiKey = await db.apiKey.create({
		data: {
			name,
			keyHash: hash,
			prefix,
			expiresAt: expiresAt ?? null,
			createdById
		}
	});

	return { ...apiKey, key };
}

export async function validateApiKey(key: string): Promise<boolean> {
	const hash = hashKey(key);

	const apiKey = await db.apiKey.findUnique({
		where: { keyHash: hash }
	});

	if (!apiKey) return false;
	if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return false;

	await db.apiKey.update({
		where: { id: apiKey.id },
		data: { lastUsedAt: new Date() }
	});

	return true;
}

export async function deleteApiKey(id: string) {
	return db.apiKey.delete({ where: { id } });
}

export async function listApiKeys() {
	return db.apiKey.findMany({
		orderBy: { createdAt: 'desc' },
		include: { createdBy: { select: { name: true, email: true } } }
	});
}

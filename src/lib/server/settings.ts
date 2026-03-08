import { db } from './db';
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

function getEncryptionKey(): Buffer {
	const secret = env.BETTER_AUTH_SECRET;
	if (!secret) throw new Error('BETTER_AUTH_SECRET is required for settings encryption');
	return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(plaintext: string): string {
	const key = getEncryptionKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [iv.toString('base64'), encrypted.toString('base64'), tag.toString('base64')].join('.');
}

export function decrypt(ciphertext: string): string {
	const key = getEncryptionKey();
	const [ivB64, encB64, tagB64] = ciphertext.split('.');
	const iv = Buffer.from(ivB64, 'base64');
	const encrypted = Buffer.from(encB64, 'base64');
	const tag = Buffer.from(tagB64, 'base64');
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);
	return decipher.update(encrypted) + decipher.final('utf8');
}

export async function getSetting(key: string): Promise<string | null> {
	const row = await db.setting.findUnique({ where: { key } });
	if (!row) return null;
	return row.secret ? decrypt(row.value) : row.value;
}

export async function setSetting(key: string, value: string, secret: boolean = false) {
	const stored = secret ? encrypt(value) : value;
	await db.setting.upsert({
		where: { key },
		update: { value: stored, secret },
		create: { key, value: stored, secret }
	});
}

export async function deleteSetting(key: string) {
	await db.setting.deleteMany({ where: { key } });
}

export async function listSettings(): Promise<{ key: string; hasValue: boolean; updatedAt: Date }[]> {
	const rows = await db.setting.findMany({ orderBy: { key: 'asc' } });
	return rows.map((r) => ({ key: r.key, hasValue: !!r.value, updatedAt: r.updatedAt }));
}

/** Get a setting value, falling back to the corresponding env var */
export async function getSettingWithFallback(key: string): Promise<string | null> {
	const dbValue = await getSetting(key);
	if (dbValue) return dbValue;
	return env[key] ?? null;
}

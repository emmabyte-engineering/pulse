import { isPostgres } from './db-provider';

/** Case-insensitive contains filter. PostgreSQL needs explicit mode; SQLite LIKE is case-insensitive for ASCII. */
export function containsInsensitive(value: string): { contains: string; mode?: 'insensitive' } {
	if (isPostgres()) return { contains: value, mode: 'insensitive' };
	return { contains: value };
}

/** Serialize a permissions array for storage. PostgreSQL uses native arrays; SQLite uses comma-separated strings. */
export function serializePermissions(perms: string[]): string[] | string {
	if (isPostgres()) return perms;
	return perms.join(',');
}

/** Deserialize permissions from storage back to a string array. */
export function deserializePermissions(raw: string[] | string): string[] {
	if (Array.isArray(raw)) return raw;
	if (typeof raw === 'string' && raw.length > 0) return raw.split(',');
	return [];
}

/** Serialize a value for a JSON field. PostgreSQL uses native JSON; SQLite stores as a string. */
export function toJsonField(value: unknown): unknown {
	if (isPostgres()) return value;
	return value != null ? JSON.stringify(value) : null;
}

/** Deserialize a JSON field value. PostgreSQL returns parsed objects; SQLite returns strings. */
export function fromJsonField<T = unknown>(raw: unknown): T | null {
	if (raw == null) return null;
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}
	return raw as T;
}

import { env } from '$env/dynamic/private';

export function getDbProvider(): 'postgresql' | 'sqlite' {
	const url = env.DATABASE_URL ?? '';
	if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
		return 'postgresql';
	}
	return 'sqlite';
}

export function isPostgres(): boolean {
	return getDbProvider() === 'postgresql';
}

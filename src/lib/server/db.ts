import { PrismaClient } from '../generated/prisma/client';
import { isPostgres } from './db-provider';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

async function createClient(): Promise<PrismaClient> {
	if (isPostgres()) {
		const { default: pg } = await import('pg');
		const { PrismaPg } = await import('@prisma/adapter-pg');
		const { env } = await import('$env/dynamic/private');
		const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
		const adapter = new PrismaPg(pool);
		return new PrismaClient({ adapter });
	}
	const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
	const { env } = await import('$env/dynamic/private');
	const url = env.DATABASE_URL ?? 'file:/app/data/pulse.db';
	const adapter = new PrismaBetterSqlite3({ url });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return new PrismaClient({ adapter } as any);
}

export const db = globalForPrisma.prisma ?? (await createClient());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

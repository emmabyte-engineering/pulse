import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const databaseUrl = env('DATABASE_URL', { optional: true }) ?? 'file:/app/data/pulse.db';
const isPostgres =
	databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

export default defineConfig({
	schema: isPostgres ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.sqlite.prisma',
	migrations: {
		path: isPostgres ? 'prisma/migrations' : 'prisma/migrations-sqlite'
	},
	datasource: {
		url: databaseUrl
	}
});

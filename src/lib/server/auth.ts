import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { db } from './db';
import { env } from '$env/dynamic/private';

const ALLOWED_DOMAIN = 'emmabyte.io';

const socialProviders: Record<string, unknown> = {};
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
	socialProviders.google = {
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET
	};
}

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
	database: prismaAdapter(db, {
		provider: 'postgresql'
	}),
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true
	},
	socialProviders,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60 // 5 minutes
		}
	},
	account: {
		accountLinking: {
			enabled: true
		}
	},
	databaseHooks: {
		user: {
			create: {
				async before(user) {
					const email = (user as { email?: string }).email;
					if (!email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
						return false;
					}
				}
			}
		}
	}
});

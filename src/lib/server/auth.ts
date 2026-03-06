import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { db } from './db';
import { env } from '$env/dynamic/private';

const ALLOWED_DOMAIN = 'emmabyte.io';

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql'
	}),
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!
		}
	},
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
	user: {
		async beforeCreate(user) {
			const email = user.email;
			if (!email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
				throw new Error(`Only @${ALLOWED_DOMAIN} accounts are allowed`);
			}
			return user;
		}
	}
});

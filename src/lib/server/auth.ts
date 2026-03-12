import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { db } from './db';
import { env } from '$env/dynamic/private';

const PLATFORM_DOMAIN = 'emmabyte.io';

const socialProviders: Record<string, unknown> = {};
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
	socialProviders.google = {
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET
	};
}

async function getOrCreatePlatformOrg() {
	const existing = await db.organization.findUnique({ where: { slug: 'emmabyte' } });
	if (existing) return existing;
	try {
		return await db.organization.create({
			data: { name: 'Emmabyte', slug: 'emmabyte', plan: 'enterprise' }
		});
	} catch {
		// Handle race condition: another request may have created it concurrently
		const org = await db.organization.findUnique({ where: { slug: 'emmabyte' } });
		if (org) return org;
		throw new Error('Failed to get or create platform organization');
	}
}

/**
 * Check if an email has a valid (unused, unexpired) invite token.
 */
async function hasValidInvite(email: string): Promise<boolean> {
	const invite = await db.inviteToken.findFirst({
		where: {
			email,
			usedAt: null,
			expiresAt: { gt: new Date() }
		}
	});
	return !!invite;
}

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
	trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
		? env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((o) => o.trim())
		: [],
	database: prismaAdapter(db, {
		provider: 'postgresql'
	}),
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'user',
				input: false
			}
		}
	},
	socialProviders,
	session: {
		cookieCache: {
			enabled: false
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
					if (!email) return false;

					const isPlatformStaff = email.endsWith(`@${PLATFORM_DOMAIN}`);
					const isInvited = await hasValidInvite(email);

					// Allow platform staff and invited users
					if (!isPlatformStaff && !isInvited) {
						return false;
					}

					return {
						data: {
							...user,
							role: isPlatformStaff ? 'admin' : 'user'
						}
					};
				},
				async after(user) {
					const typedUser = user as { id: string; email?: string };
					if (!typedUser.email) return;

					if (typedUser.email.endsWith(`@${PLATFORM_DOMAIN}`)) {
						// Auto-join Emmabyte platform org
						const org = await getOrCreatePlatformOrg();
						await db.organizationMember.create({
							data: {
								organizationId: org.id,
								userId: typedUser.id,
								role: 'owner'
							}
						});
					}
				}
			}
		}
	}
});

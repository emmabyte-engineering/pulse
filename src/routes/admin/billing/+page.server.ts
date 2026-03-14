import type { PageServerLoad } from './$types';
import { db } from '$server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const membership = await db.organizationMember.findFirst({
		where: { userId: locals.user!.id },
		include: {
			organization: {
				include: { subscription: true }
			}
		}
	});

	const plan = membership?.organization.plan ?? 'free';

	// Count events this billing period (current calendar month)
	const now = new Date();
	const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const eventCount = membership
		? await db.event.count({
				where: {
					organizationId: membership.organizationId,
					createdAt: { gte: periodStart }
				}
			})
		: 0;

	return {
		plan,
		subscription: membership?.organization.subscription
			? {
					status: membership.organization.subscription.status,
					currentPeriodEnd: membership.organization.subscription.currentPeriodEnd,
					cancelAtPeriodEnd: membership.organization.subscription.cancelAtPeriodEnd
				}
			: null,
		eventCount,
		periodStart: periodStart.toISOString()
	};
};

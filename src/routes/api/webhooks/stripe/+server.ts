import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: Verify Stripe webhook signature using STRIPE_WEBHOOK_SECRET
// TODO: Handle checkout.session.completed — create/update Subscription
// TODO: Handle customer.subscription.updated — sync plan/status changes
// TODO: Handle customer.subscription.deleted — mark subscription canceled
// TODO: Handle invoice.payment_failed — update subscription status to past_due

export const POST: RequestHandler = async () => {
	return json({ received: true });
};

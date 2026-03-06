import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
	// Create default alert rules from the spec
	const alerts = [
		{
			name: 'Hard bounce detected',
			source: 'MAILERSEND' as const,
			eventType: 'email.hard_bounced',
			conditionType: 'OCCURRENCE',
			conditionValue: 1,
			windowMinutes: 1,
			notifyEmail: 'admin@emmabyte.io'
		},
		{
			name: 'Spam complaint',
			source: 'MAILERSEND' as const,
			eventType: 'email.spam_complaint',
			conditionType: 'OCCURRENCE',
			conditionValue: 1,
			windowMinutes: 1,
			notifyEmail: 'admin@emmabyte.io'
		},
		{
			name: 'Bounce rate spike',
			source: 'MAILERSEND' as const,
			eventType: null,
			conditionType: 'RATE',
			conditionValue: 0.05,
			windowMinutes: 60,
			notifyEmail: 'admin@emmabyte.io'
		},
		{
			name: 'Function error spike',
			source: 'VERCEL' as const,
			eventType: null,
			conditionType: 'THRESHOLD',
			conditionValue: 10,
			windowMinutes: 5,
			notifyEmail: 'admin@emmabyte.io'
		}
	];

	for (const alert of alerts) {
		await db.alertRule.upsert({
			where: { id: alert.name.toLowerCase().replace(/\s+/g, '-') },
			update: {},
			create: alert
		});
	}

	console.log('Seed complete: default alert rules created');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => db.$disconnect());

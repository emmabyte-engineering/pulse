import type { Session, User } from 'better-auth';

interface PulseUser extends User {
	role: string;
}

declare global {
	namespace App {
		interface Locals {
			user: PulseUser | null;
			session: Session | null;
		}
	}
}

export {};

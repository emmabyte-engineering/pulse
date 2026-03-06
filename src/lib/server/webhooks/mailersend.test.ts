import { describe, it, expect } from 'vitest';
import { verifyMailerSendSignature } from './mailersend';
import crypto from 'node:crypto';

describe('verifyMailerSendSignature', () => {
	it('returns true for a valid signature', () => {
		const secret = 'test-secret';
		const payload = '{"type":"activity.sent"}';
		const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

		expect(verifyMailerSendSignature(payload, signature, secret)).toBe(true);
	});

	it('returns false for an invalid signature', () => {
		const payload = '{"type":"activity.sent"}';
		expect(verifyMailerSendSignature(payload, 'a'.repeat(64), 'test-secret')).toBe(false);
	});
});

import { describe, it, expect } from 'vitest';
import { cn, severityColor } from './utils';

describe('cn', () => {
	it('merges class names', () => {
		expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
	});

	it('handles tailwind conflicts', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
	});

	it('handles conditional classes', () => {
		expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
	});
});

describe('severityColor', () => {
	it('returns red for CRITICAL', () => {
		expect(severityColor('CRITICAL')).toContain('red-500');
	});

	it('returns blue for INFO', () => {
		expect(severityColor('INFO')).toContain('blue-400');
	});

	it('returns gray for unknown', () => {
		expect(severityColor('UNKNOWN')).toContain('gray-400');
	});
});

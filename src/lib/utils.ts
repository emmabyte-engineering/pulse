import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function severityColor(severity: string): string {
	switch (severity) {
		case 'CRITICAL':
			return 'text-[#FA586D] bg-[#FA586D]/10';
		case 'ERROR':
			return 'text-[#FF6798] bg-[#FF6798]/10';
		case 'WARN':
			return 'text-[#FFBA71] bg-[#FFBA71]/10';
		case 'INFO':
			return 'text-blue-400 bg-blue-400/10';
		case 'DEBUG':
			return 'text-neutral-500 bg-neutral-500/10';
		default:
			return 'text-neutral-500 bg-neutral-500/10';
	}
}

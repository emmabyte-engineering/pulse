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
			return 'text-red-500 bg-red-500/10';
		case 'ERROR':
			return 'text-red-400 bg-red-400/10';
		case 'WARN':
			return 'text-yellow-400 bg-yellow-400/10';
		case 'INFO':
			return 'text-blue-400 bg-blue-400/10';
		case 'DEBUG':
			return 'text-gray-400 bg-gray-400/10';
		default:
			return 'text-gray-400 bg-gray-400/10';
	}
}

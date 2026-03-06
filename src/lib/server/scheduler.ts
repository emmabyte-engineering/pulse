import { evaluateAlerts } from './alert-evaluator';
import { aggregateMetrics } from './metrics';

const ALERT_INTERVAL_MS = 60 * 1000; // 1 minute
const METRIC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let started = false;

export function startScheduler(): void {
	if (started) return;
	started = true;

	console.log('Scheduler started: alerts every 1m, metrics every 5m');

	setInterval(async () => {
		try {
			await evaluateAlerts();
		} catch (err) {
			console.error('Alert evaluation error:', err);
		}
	}, ALERT_INTERVAL_MS);

	setInterval(async () => {
		try {
			await aggregateMetrics();
		} catch (err) {
			console.error('Metric aggregation error:', err);
		}
	}, METRIC_INTERVAL_MS);

	// Run both immediately on startup (after a short delay for DB readiness)
	setTimeout(async () => {
		try {
			await evaluateAlerts();
		} catch (err) {
			console.error('Initial alert evaluation error:', err);
		}
		try {
			await aggregateMetrics();
		} catch (err) {
			console.error('Initial metric aggregation error:', err);
		}
	}, 5000);
}

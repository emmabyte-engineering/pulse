/**
 * Shared types for event source and severity.
 * PostgreSQL uses native enums; SQLite uses plain strings.
 * These string union types work with both schemas.
 */
export type EventSource = 'MAILERSEND' | 'VERCEL' | 'PLANETSCALE' | 'APP';
export type Severity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

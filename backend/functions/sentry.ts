// Purpose: Shared Sentry client for all backend functions (@sentry/node 10.x)
// Inputs: SENTRY_DSN_BACKEND env var (optional; if absent, Sentry is a no-op: no client, no transport, no network)
// Outputs: Sentry namespace ready for captureException + flush; initSentry() for tests and explicit init
// Constraints: Must call Sentry.flush() before handler return in serverless context
// SPORT: F08 backend functions observability

import * as Sentry from '@sentry/node';

/**
 * Initialise Sentry once.
 *
 * Purpose: single init site; the DSN decides whether a client exists at all.
 * Inputs: dsn (defaults to SENTRY_DSN_BACKEND), overrides (test seam, e.g. a stub transport).
 * Outputs: true when init ran, false when no DSN (nothing is created, nothing can be sent).
 * Constraints: v10 init options only; tracesSampleRate stays 0.1; callers never pass a real DSN from tests.
 */
export function initSentry(
  dsn: string | undefined = process.env.SENTRY_DSN_BACKEND,
  overrides: Partial<Sentry.NodeOptions> = {},
): boolean {
  if (!dsn) return false;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
    ...overrides,
  });
  return true;
}

initSentry();

export { Sentry };

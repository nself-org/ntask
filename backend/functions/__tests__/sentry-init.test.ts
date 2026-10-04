/**
 * Purpose: Prove the @sentry/node 10 init path in sentry.ts without sending an event anywhere.
 *   1. DSN unset: importing sentry.ts creates no client and the capture/flush API is a harmless no-op.
 *   2. DSN set: initSentry() accepts the v10 options, events reach only an in-memory stub transport.
 *
 * Why: Sentry 8 -> 10 is a major upgrade on the only error-reporting site. A broken init would
 *   silently drop production errors; this test fails first.
 *
 * Constraints:
 *   - Every outbound path (fetch, http/https request, TCP connect) is counted; the assertion is zero.
 *   - The DSN used in test 2 is a fake on the reserved .invalid TLD; no real DSN is read or needed.
 *   - Each test file runs in its own node process, so the global Sentry init cannot leak elsewhere.
 * SPORT: F08 backend functions observability.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

const FAKE_DSN = 'https://0123456789abcdef@o0.ingest.sentry.invalid/1';

const calls: string[] = [];
const restore: Array<() => void> = [];

/** Replace obj[key] with a counter that refuses to talk to the network. */
function trap(obj: Record<string, unknown>, key: string, label: string): void {
  const original = obj[key];
  obj[key] = (...args: unknown[]) => {
    calls.push(`${label}(${String(args[0] ?? '')})`);
    throw new Error(`network blocked in test: ${label}`);
  };
  restore.push(() => {
    obj[key] = original;
  });
}

describe('sentry.ts with @sentry/node 10', () => {
  let mod: typeof import('../sentry.js');

  before(async () => {
    delete process.env.SENTRY_DSN_BACKEND;
    trap(globalThis as unknown as Record<string, unknown>, 'fetch', 'fetch');
    trap(http as unknown as Record<string, unknown>, 'request', 'http.request');
    trap(https as unknown as Record<string, unknown>, 'request', 'https.request');
    trap(net.Socket.prototype as unknown as Record<string, unknown>, 'connect', 'net.connect');
    mod = await import('../sentry.js');
  });

  after(() => {
    for (const undo of restore) undo();
  });

  test('no DSN: no client is created and nothing touches the network', async () => {
    const { Sentry, initSentry } = mod;
    assert.equal(initSentry(undefined), false, 'initSentry without a DSN must not init');
    assert.equal(Sentry.getClient(), undefined, 'no client without a DSN');
    assert.doesNotThrow(() => Sentry.captureException(new Error('no-dsn probe')));
    await Sentry.flush(200);
    assert.deepEqual(calls, [], 'no network call without a DSN');
  });

  test('DSN set: v10 init works and events go only to the stub transport', async () => {
    const { Sentry, initSentry } = mod;
    const envelopes: unknown[] = [];
    const ran = initSentry(FAKE_DSN, {
      transport: () => ({
        send: async (envelope: unknown) => {
          envelopes.push(envelope);
          return {};
        },
        flush: async () => true,
      }),
    });
    assert.equal(ran, true);

    const client = Sentry.getClient();
    assert.ok(client, 'client exists once a DSN is given');
    const opts = client.getOptions();
    assert.equal(opts.dsn, FAKE_DSN);
    assert.equal(opts.tracesSampleRate, 0.1);
    assert.equal(opts.environment, process.env.NODE_ENV || 'production');

    Sentry.captureException(new Error('stub transport probe'), { tags: { function: 'sentry-init-test' } });
    assert.equal(await Sentry.flush(2000), true);
    assert.ok(envelopes.length >= 1, 'the error event reached the stub transport');
    assert.deepEqual(calls, [], 'no real network call, even with a DSN set');
    await Sentry.close(0);
  });
});

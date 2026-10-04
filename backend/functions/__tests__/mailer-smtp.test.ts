/**
 * Purpose: Prove the send path end to end. A REAL nodemailer SMTP transport
 *   (not a stub) talks to an in-process SMTP server on 127.0.0.1, and the test
 *   asserts what the server received: envelope from/to, subject and body.
 *
 * Why: nodemailer 9 -> 10 is a major upgrade on a path that carries invites and
 *   verification mail. A mocked transport cannot show that v10 still speaks SMTP;
 *   this does. invite-email.test.ts keeps covering the stubbed failure cases.
 *
 * Constraints:
 *   - The sink binds 127.0.0.1 on an ephemeral port; nothing leaves the machine.
 *   - TLS is off for the sink only. The transport options under test (host,
 *     port, secure, auth) have the same shape defaultTransport() builds.
 *   - Message bodies and credentials are asserted, never printed.
 * SPORT: F08 backend functions — outbound email.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import nodemailer from 'nodemailer';
import { SMTPServer } from 'smtp-server';
import { sendMail, type MailerConfig, type MailTransport } from '../lib/mailer.js';

interface Received {
  mailFrom: string;
  rcptTo: string[];
  raw: string;
  authUser?: string;
}

const SINK_USER = 'sink-user';
const SINK_PASS = 'sink-pass';

let sink: SMTPServer;
let sinkPort = 0;
const received: Received[] = [];

function startSink(): Promise<void> {
  sink = new SMTPServer({
    authOptional: true,
    allowInsecureAuth: true,
    disabledCommands: ['STARTTLS'],
    logger: false,
    onAuth(auth, _session, cb) {
      if (auth.username === SINK_USER && auth.password === SINK_PASS) {
        cb(null, { user: auth.username });
      } else {
        cb(new Error('Invalid credentials'));
      }
    },
    onData(stream, session, cb) {
      const chunks: Buffer[] = [];
      stream.on('data', (c: Buffer) => chunks.push(c));
      stream.on('end', () => {
        received.push({
          mailFrom: session.envelope.mailFrom ? session.envelope.mailFrom.address : '',
          rcptTo: session.envelope.rcptTo.map((r) => r.address),
          raw: Buffer.concat(chunks).toString('utf8'),
          ...(session.user ? { authUser: String(session.user) } : {}),
        });
        cb();
      });
    },
  });
  return new Promise((resolve, reject) => {
    sink.on('error', reject);
    sink.listen(0, '127.0.0.1', () => {
      sinkPort = (sink.server.address() as AddressInfo).port;
      resolve();
    });
  });
}

/** An ephemeral port nothing listens on: bind, read the port, release it. */
function closedPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address() as AddressInfo;
      s.close(() => resolve(port));
    });
  });
}

function configFor(port: number, extra: Partial<MailerConfig> = {}): MailerConfig {
  return {
    host: '127.0.0.1', port, secure: false, from: 'no-reply@task.example.test', ...extra,
  };
}

/** Same option shape as defaultTransport() in lib/mailer.ts, pointed at the sink. */
function realTransport(cfg: MailerConfig): MailTransport {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    ...(cfg.user && cfg.pass ? { auth: { user: cfg.user, pass: cfg.pass } } : {}),
  }) as unknown as MailTransport;
}

describe('mailer over a real SMTP transport', () => {
  before(startSink);
  after(() => new Promise<void>((resolve) => { sink.close(() => resolve()); }));

  test('delivers one message: envelope, subject, recipient and body arrive', async () => {
    received.length = 0;
    const cfg = configFor(sinkPort);
    const result = await sendMail(
      {
        to: 'invitee@example.test',
        subject: 'You are invited to Groceries',
        html: '<p>Open the invite: https://task.example.test/i/tok-123</p>',
        text: 'Open the invite: https://task.example.test/i/tok-123',
      },
      { config: cfg, transport: realTransport(cfg) },
    );

    assert.deepEqual(result, { sent: true });
    assert.equal(received.length, 1);
    const msg = received[0]!;
    assert.equal(msg.mailFrom, 'no-reply@task.example.test');
    assert.deepEqual(msg.rcptTo, ['invitee@example.test']);
    assert.match(msg.raw, /^Subject: You are invited to Groceries\r?$/m);
    assert.match(msg.raw, /^From: .*no-reply@task\.example\.test/m);
    assert.match(msg.raw, /^To: .*invitee@example\.test/m);
    assert.ok(msg.raw.includes('Content-Type: text/html'), 'html part present');
    assert.ok(msg.raw.includes('Content-Type: text/plain'), 'text part present');
    assert.ok(msg.raw.includes('https://task.example.test/i/tok-123'), 'body link present');
    assert.equal(msg.authUser, undefined, 'no auth configured, none sent');
  });

  test('authenticates with the configured user and pass', async () => {
    received.length = 0;
    const cfg = configFor(sinkPort, { user: SINK_USER, pass: SINK_PASS });
    const result = await sendMail(
      { to: 'a@example.test', subject: 'auth check', html: '<p>hi</p>' },
      { config: cfg, transport: realTransport(cfg) },
    );

    assert.deepEqual(result, { sent: true });
    assert.equal(received.length, 1);
    assert.equal(received[0]!.authUser, SINK_USER);
  });

  test('wrong credentials come back as sent:false with the server reason', async () => {
    received.length = 0;
    const cfg = configFor(sinkPort, { user: SINK_USER, pass: 'not-the-password' });
    const result = await sendMail(
      { to: 'a@example.test', subject: 'bad auth', html: '<p>hi</p>' },
      { config: cfg, transport: realTransport(cfg) },
    );

    assert.equal(result.sent, false);
    assert.match(result.gate ?? '', /^SMTP send failed: /);
    assert.equal(received.length, 0, 'nothing delivered');
  });

  test('a refused connection yields the failure result, not a throw', async () => {
    const cfg = configFor(await closedPort());
    const result = await sendMail(
      { to: 'a@example.test', subject: 'unreachable', html: '<p>hi</p>' },
      { config: cfg, transport: realTransport(cfg) },
    );

    assert.equal(result.sent, false);
    assert.match(result.gate ?? '', /^SMTP send failed: .*(ECONNREFUSED|Connection)/i);
  });
});

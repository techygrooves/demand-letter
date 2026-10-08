import { describe, expect, it, vi } from 'vitest';
import { buildPayload, endpointProvider, looksAutomated, resolveProvider, submitIntake } from '@/lib/intake/submit';
import { emptyIntake } from '@/lib/intake/validation';

const human = { honeypot: '', elapsedMs: 60_000 };
const payload = buildPayload({ ...emptyIntake(), fullName: 'Jane' }, human, '/get-started/');

describe('resolveProvider', () => {
  it('defaults to "none" (not configured)', async () => {
    const provider = resolveProvider({});
    expect(provider.name).toBe('none');
    expect(await provider.submit(payload)).toEqual({ status: 'not_configured' });
  });

  it('requires an https endpoint for the endpoint provider', () => {
    expect(resolveProvider({ provider: 'endpoint' }).name).toBe('none');
    expect(resolveProvider({ provider: 'endpoint', endpoint: 'http://insecure.test' }).name).toBe('none');
    expect(resolveProvider({ provider: 'endpoint', endpoint: 'https://forms.test/x' }).name).toBe('endpoint');
  });

  it('never enables the demo provider outside development', () => {
    expect(resolveProvider({ provider: 'demo', isDev: false }).name).toBe('none');
    expect(resolveProvider({ provider: 'demo', isDev: true }).name).toBe('demo');
  });
});

describe('endpointProvider', () => {
  it('reports delivered only for a 2xx response', async () => {
    const ok = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    expect(await endpointProvider('https://forms.test', 1000, ok).submit(payload)).toEqual({ status: 'delivered' });
    const body = JSON.parse(ok.mock.calls[0][1].body);
    expect(body.data.fullName).toBe('Jane');
    expect(body.summary).toContain('Full name: Jane');

    const fail = vi.fn().mockResolvedValue(new Response('nope', { status: 500 }));
    expect(await endpointProvider('https://forms.test', 1000, fail).submit(payload)).toEqual({
      status: 'error',
      reason: 'server',
    });
  });

  it('reports network failures as errors', async () => {
    const down = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await endpointProvider('https://forms.test', 1000, down).submit(payload)).toEqual({
      status: 'error',
      reason: 'network',
    });
  });
});

describe('spam screening', () => {
  it('flags a filled honeypot or an implausibly fast submission', () => {
    expect(looksAutomated({ honeypot: 'http://spam', elapsedMs: 60_000 }, 4000)).toBe(true);
    expect(looksAutomated({ honeypot: '', elapsedMs: 500 }, 4000)).toBe(true);
    expect(looksAutomated(human, 4000)).toBe(false);
  });

  it('does not send automated submissions and never reports them as delivered', async () => {
    const send = vi.fn();
    const provider = { name: 'endpoint', submit: send };
    const bot = buildPayload(emptyIntake(), { honeypot: 'x', elapsedMs: 60_000 }, '/');
    const outcome = await submitIntake(provider, bot, 4000);
    expect(send).not.toHaveBeenCalled();
    expect(outcome.status).not.toBe('delivered');
  });
});

describe('formspree provider', async () => {
  const { formspreeBody, formspreeProvider } = await import('@/lib/intake/submit');
  const { submission } = await import('@/config/intake');

  const data = {
    ...emptyIntake(),
    fullName: 'Jane Client',
    email: 'jane@example.com',
    phone: '9545550123',
    disputeState: 'FL',
    disputeType: 'unpaid-debt',
    opposingParty: 'Acme LLC',
    description: 'They owe me for work completed in March and have stopped responding.',
    resolution: 'Payment of $2,500.',
    hasDeadline: 'no',
    acknowledgment: true,
  };
  const formPayload = buildPayload(data, human, '/get-started/');

  it('is the default delivery method, pointing at the firm’s Formspree form', () => {
    expect(submission.provider).toBe('formspree');
    expect(resolveProvider({ provider: submission.provider, endpoint: submission.endpoint }).name).toBe('formspree');
  });

  it('only accepts genuine Formspree form URLs', () => {
    expect(resolveProvider({ provider: 'formspree', endpoint: 'https://evil.test/f/abc' }).name).toBe('none');
    expect(resolveProvider({ provider: 'formspree', endpoint: 'http://formspree.io/f/abc' }).name).toBe('none');
  });

  it('sends readable labelled fields with reply-to and subject', () => {
    const body = formspreeBody(formPayload);
    expect(body._subject).toBe('Demand letter request: Jane Client');
    expect(body.email).toBe('jane@example.com');
    expect(body._replyto).toBe('jane@example.com');
    expect(body._gotcha).toBe('');
    expect(body['Phone']).toBe('(954) 555-0123');
    expect(body['State where the dispute arose']).toBe('Florida');
    expect(body['Dispute type']).toBe('Unpaid debt or money owed');
    expect(body['Resolution sought']).toBe('Payment of $2,500.');
    expect(body['Acknowledged inquiry terms']).toBe('Yes');
    expect(Object.values(body).every((v) => typeof v === 'string')).toBe(true);
  });

  it('reports delivered only when Formspree accepts the submission', async () => {
    const ok = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    expect(await formspreeProvider(submission.endpoint, 1000, ok).submit(formPayload)).toEqual({ status: 'delivered' });
    expect(ok.mock.calls[0][0]).toBe('https://formspree.io/f/xbgdoylb');
    expect(ok.mock.calls[0][1].headers.Accept).toBe('application/json');

    const rejected = vi.fn().mockResolvedValue(new Response('{"errors":[]}', { status: 422 }));
    expect((await formspreeProvider(submission.endpoint, 1000, rejected).submit(formPayload)).status).toBe('error');
  });
});

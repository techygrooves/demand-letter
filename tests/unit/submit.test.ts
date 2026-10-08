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

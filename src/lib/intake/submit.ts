/**
 * Intake submission layer.
 *
 * The form calls `submitIntake()` and renders whatever outcome comes back. It
 * never reports success unless a configured provider confirmed delivery.
 *
 * Providers (set PUBLIC_INTAKE_PROVIDER at build time, see .env.example):
 *  - "none" (default) No backend. Returns `not_configured`; the UI explains that
 *                     nothing was sent and offers phone/email.
 *  - "formspree"      POSTs labelled, flat fields to a Formspree form endpoint so the
 *                     notification email is readable. A 2xx response counts as delivered.
 *  - "endpoint"       POSTs the full JSON payload to PUBLIC_INTAKE_ENDPOINT (e.g. the
 *                     firm's own handler). A 2xx response counts as delivered.
 *  - "demo"           Development only. Simulates a successful submission and is
 *                     labelled as a demo in the UI. Ignored in production builds.
 *
 * To add a provider, implement `IntakeProvider` and register it in `resolveProvider`.
 */
import type { IntakeData } from './validation';
import { summarize, summaryText } from './summary';

export interface SpamSignals {
  /** Value of the hidden honeypot field; humans leave it empty. */
  honeypot: string;
  /** Milliseconds between form render and submit. */
  elapsedMs: number;
}

export interface IntakePayload {
  data: IntakeData;
  summary: string;
  submittedAt: string;
  source: string;
  spam: SpamSignals;
}

export type SubmitOutcome =
  | { status: 'delivered'; demo?: boolean }
  | { status: 'not_configured' }
  | { status: 'error'; reason: 'network' | 'server' | 'timeout' };

export interface IntakeProvider {
  readonly name: string;
  submit(payload: IntakePayload): Promise<SubmitOutcome>;
}

export interface ProviderConfig {
  provider?: string;
  endpoint?: string;
  isDev?: boolean;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

const notConfigured: IntakeProvider = {
  name: 'none',
  submit: async () => ({ status: 'not_configured' }),
};

const demo: IntakeProvider = {
  name: 'demo',
  submit: () => new Promise((resolve) => setTimeout(() => resolve({ status: 'delivered', demo: true }), 900)),
};

async function postJson(
  endpoint: string,
  body: unknown,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<SubmitOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return response.ok ? { status: 'delivered' } : { status: 'error', reason: 'server' };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    return { status: 'error', reason: aborted ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

export function endpointProvider(endpoint: string, timeoutMs = 15000, fetchImpl: typeof fetch = fetch): IntakeProvider {
  return { name: 'endpoint', submit: (payload) => postJson(endpoint, payload, timeoutMs, fetchImpl) };
}

/**
 * Formspree body: one labelled field per answer, in form order, plus Formspree's
 * special fields (`email` / `_replyto` set the reply-to address, `_subject` the
 * email subject, `_gotcha` is its built-in honeypot).
 */
export function formspreeBody(payload: IntakePayload): Record<string, string> {
  const { data } = payload;
  const body: Record<string, string> = {
    _subject: `Demand letter request: ${data.fullName.trim()}`,
    email: data.email.trim(),
    _replyto: data.email.trim(),
    _gotcha: payload.spam.honeypot,
  };
  for (const section of summarize(data)) {
    for (const row of section.rows) body[row.label] = row.value;
  }
  body['Acknowledged inquiry terms'] = data.acknowledgment ? 'Yes' : 'No';
  body['Submitted from'] = payload.source;
  body['Submitted at'] = payload.submittedAt;
  return body;
}

export function formspreeProvider(endpoint: string, timeoutMs = 15000, fetchImpl: typeof fetch = fetch): IntakeProvider {
  return { name: 'formspree', submit: (payload) => postJson(endpoint, formspreeBody(payload), timeoutMs, fetchImpl) };
}

export function resolveProvider(config: ProviderConfig): IntakeProvider {
  const provider = (config.provider ?? 'none').trim().toLowerCase();
  const secure = Boolean(config.endpoint && /^https:\/\//i.test(config.endpoint));
  if (provider === 'formspree' && secure && /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(config.endpoint!)) {
    return formspreeProvider(config.endpoint!, config.timeoutMs, config.fetchImpl);
  }
  if (provider === 'endpoint' && secure) {
    return endpointProvider(config.endpoint!, config.timeoutMs, config.fetchImpl);
  }
  if (provider === 'demo' && config.isDev) return demo;
  return notConfigured;
}

export function buildPayload(data: IntakeData, spam: SpamSignals, source: string): IntakePayload {
  return { data, summary: summaryText(data), submittedAt: new Date().toISOString(), source, spam };
}

/** Basic client-side spam screening. A real backend should repeat these checks. */
export function looksAutomated(spam: SpamSignals, minFillTimeMs: number): boolean {
  return spam.honeypot.trim() !== '' || spam.elapsedMs < minFillTimeMs;
}

export async function submitIntake(
  provider: IntakeProvider,
  payload: IntakePayload,
  minFillTimeMs: number,
): Promise<SubmitOutcome> {
  // Automated submissions are dropped without contacting the backend. They are never
  // reported as delivered: in the rare case a person trips the check (for example a
  // browser autofilling the hidden field) they see the error screen with phone/email.
  if (looksAutomated(payload.spam, minFillTimeMs)) {
    return provider.name === 'none' ? { status: 'not_configured' } : { status: 'error', reason: 'server' };
  }
  return provider.submit(payload);
}

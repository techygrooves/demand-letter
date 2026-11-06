import { describe, expect, it } from 'vitest';
import { MatterError, parseMatter, greetingName, type Matter } from '@/lib/comms/matter';
import { RenderError, renderEmail, wrap } from '@/lib/comms/render';
import { stages, stageIds } from '@/lib/comms/stages';
import { firm, offer } from '@/config/site';

const base = {
  reference: '2026-001',
  clientName: 'Jane Client',
  clientEmail: 'jane@example.com',
  disputeType: 'unpaid-debt',
  opposingParty: 'Acme Roofing LLC',
};

/** A matter carrying every optional field, so any stage can be rendered. */
const fullMatter = (): Matter =>
  parseMatter({
    ...base,
    disputeState: 'FL',
    amount: '2,500',
    resolution: 'Return of the deposit.',
    clientPhone: '(954) 555-0123',
    questions: ['Do you have the written estimate?'],
    declineReason: 'outside-scope',
    declineNote: 'The amount is below what makes this worthwhile for you.',
    paymentLink: 'https://pay.example.com/2026-001',
    deliveryMethod: 'certified mail and email',
    responseDeadline: '19 November 2026',
    responseSummary: 'their attorney denies that any deposit was paid',
    nextSteps: ['Send them the bank record.'],
    reviewPoints: ['The date the deposit was paid.'],
    note: 'Thank you for the documents you sent.',
  });

describe('parseMatter', () => {
  it('accepts a minimal matter and trims its values', () => {
    const matter = parseMatter({ ...base, clientName: '  Jane Client  ' });
    expect(matter.clientName).toBe('Jane Client');
    expect(matter.reference).toBe('2026-001');
  });

  it('lists every missing required field at once', () => {
    expect(() => parseMatter({})).toThrow(MatterError);
    try {
      parseMatter({});
    } catch (error) {
      const message = (error as Error).message;
      for (const field of ['reference', 'clientName', 'clientEmail', 'disputeType', 'opposingParty']) {
        expect(message).toContain(`"${field}" is required`);
      }
    }
  });

  it('rejects a bad email, a non-https payment link and unknown fields', () => {
    expect(() => parseMatter({ ...base, clientEmail: 'jane@' })).toThrow(/valid email/);
    expect(() => parseMatter({ ...base, paymentLink: 'http://pay.example.com' })).toThrow(/https/);
    expect(() => parseMatter({ ...base, clinetName: 'typo' })).toThrow(/Unknown field "clinetName"/);
  });

  it('rejects a list field that is not a list of strings', () => {
    expect(() => parseMatter({ ...base, questions: 'one question' })).toThrow(/list of non-empty strings/);
    expect(() => parseMatter({ ...base, questions: ['ok', ''] })).toThrow(/list of non-empty strings/);
  });

  it('rejects anything that is not a single object', () => {
    expect(() => parseMatter([base])).toThrow(/single JSON object/);
    expect(() => parseMatter(null)).toThrow(/single JSON object/);
  });
});

describe('greetingName', () => {
  it('uses the first name, or the explicit salutation', () => {
    expect(greetingName(parseMatter(base))).toBe('Jane');
    expect(greetingName(parseMatter({ ...base, salutation: 'Ms Client' }))).toBe('Ms Client');
  });
});

describe('wrap', () => {
  it('keeps lines within the width without breaking words', () => {
    const text = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron';
    const lines = wrap(text, 30).split('\n');
    expect(lines.every((line) => line.length <= 30)).toBe(true);
    expect(lines.join(' ')).toBe(text);
  });

  it('does not break a single word longer than the width', () => {
    expect(wrap('https://example.com/a/very/long/path/indeed', 10)).toBe(
      'https://example.com/a/very/long/path/indeed',
    );
  });
});

describe('renderEmail', () => {
  it('renders every stage from a complete matter', () => {
    const matter = fullMatter();
    for (const id of stageIds) {
      const email = renderEmail(matter, id);
      expect(email.subject).toContain(matter.reference);
      expect(email.to).toBe(matter.clientEmail);
      expect(email.body).toContain('Dear Jane,');
      expect(email.checklist.length).toBeGreaterThan(0);
    }
  });

  it('refuses an unknown stage and lists the real ones', () => {
    expect(() => renderEmail(parseMatter(base), 'letter-posted')).toThrow(RenderError);
    expect(() => renderEmail(parseMatter(base), 'letter-posted')).toThrow(/inquiry-received/);
  });

  it('refuses to render a stage whose required fields are missing', () => {
    const matter = parseMatter(base);
    expect(() => renderEmail(matter, 'accepted')).toThrow(/"paymentLink"/);
    expect(() => renderEmail(matter, 'declined')).toThrow(/"declineReason"/);
    expect(() => renderEmail(matter, 'information-requested')).toThrow(/"questions"/);
    expect(() => renderEmail(matter, 'letter-sent')).toThrow(/"deliveryMethod"/);
    expect(() => renderEmail(matter, 'response-received')).toThrow(/"responseSummary"/);
  });

  it('renders the stages that need nothing extra from a minimal matter', () => {
    const matter = parseMatter(base);
    for (const id of ['inquiry-received', 'payment-received', 'draft-for-review', 'deadline-passed', 'matter-closed']) {
      expect(() => renderEmail(matter, id)).not.toThrow();
    }
  });

  it('marks the file as an unsent draft and puts the checklist above the email', () => {
    const email = renderEmail(fullMatter(), 'accepted');
    expect(email.document).toContain('DRAFT — NOT SENT');
    expect(email.document.indexOf('Before sending, confirm:')).toBeLessThan(
      email.document.indexOf('Dear Jane,'),
    );
    // The checklist is wrapped in the file, so compare without line breaks.
    const flat = email.document.replace(/\s+/g, ' ');
    for (const item of email.checklist) {
      expect(flat).toContain(item.replace(/\s+/g, ' '));
    }
  });

  it('signs with the firm, and with an overriding attorney when given', () => {
    expect(renderEmail(fullMatter(), 'payment-received').body).toContain(firm.attorney);
    const other = parseMatter({ ...base, attorney: 'A. N. Associate' });
    expect(renderEmail(other, 'payment-received').body).toContain('A. N. Associate');
  });

  it('wraps the body to a readable width', () => {
    for (const id of stageIds) {
      const lines = renderEmail(fullMatter(), id).body.split('\n');
      const tooLong = lines.filter((line) => line.length > 80 && /\s/.test(line.trim()));
      expect(tooLong).toEqual([]);
    }
  });
});

/*
 * These are the promises the website makes. An email that contradicts them is
 * worse than no email, so they are asserted rather than left to review.
 */
describe('what the emails must and must not say', () => {
  const bodies = () => stageIds.map((id) => ({ id, body: renderEmail(fullMatter(), id).body }));

  it('never promises a turnaround time or a delivery date', () => {
    for (const { id, body } of bodies()) {
      expect(body, id).not.toMatch(/within \d+ (business )?(hours|days|weeks)/i);
      expect(body, id).not.toMatch(/\b(24|48|72) hours\b/i);
      expect(body, id).not.toMatch(/by (the )?end of (the )?(day|week)/i);
    }
  });

  it('never guarantees or predicts an outcome', () => {
    for (const { id, body } of bodies()) {
      // "Results are not guaranteed" is required, so only positive claims are barred.
      expect(body, id).not.toMatch(/\bwe guarantee\b|\bis guaranteed\b|\bwill recover\b|\bwill win\b/i);
      expect(body, id).not.toMatch(/\bthey will (pay|settle|respond|comply)\b/i);
    }
  });

  it('never claims a demand letter affects a legal deadline', () => {
    for (const { id, body } of bodies()) {
      expect(body, id).not.toMatch(/\b(stops|pauses|extends|tolls) the statute\b/i);
    }
  });

  it('asks for no payment before the matter is accepted', () => {
    for (const id of ['inquiry-received', 'information-requested', 'declined']) {
      const body = renderEmail(fullMatter(), id).body;
      expect(body, id).not.toContain('https://pay.example.com/2026-001');
      expect(body, id).not.toMatch(/\bpay (the|your) \$500\b/i);
    }
  });

  it('says plainly, before engagement, that there is no attorney-client relationship', () => {
    for (const id of ['inquiry-received', 'information-requested', 'declined']) {
      // Line-wrapped, so the phrase can straddle a newline.
      const body = renderEmail(fullMatter(), id).body.replace(/\s+/g, ' ').toLowerCase();
      expect(body, id).toContain('attorney-client relationship');
    }
  });

  it('states the fixed fee only as the figure the site publishes', () => {
    for (const { id, body } of bodies()) {
      const amounts = body.match(/\$\d[\d,]*/g) ?? [];
      const feeMentions = amounts.filter((a) => /^\$\d{3,}$/.test(a));
      for (const mention of feeMentions) expect(mention, id).toBe(offer.priceDisplay);
    }
  });

  it('tells the client, after the letter, that further work is a separate agreement', () => {
    for (const id of ['letter-sent', 'deadline-passed', 'response-received']) {
      const body = renderEmail(fullMatter(), id).body.toLowerCase();
      expect(body, id).toContain('separate agreement');
    }
  });

  it('carries the firm signature and a disclaimer on every stage', () => {
    for (const { id, body } of bodies()) {
      expect(body, id).toContain(firm.legalName);
      expect(body, id).toContain(firm.phone.display);
      expect(body, id).toMatch(/not legal advice|Results are not guaranteed/);
    }
  });

  it('has a unique id, a description and a checklist for every stage', () => {
    expect(new Set(stageIds).size).toBe(stages.length);
    for (const stage of stages) {
      expect(stage.when, stage.id).toMatch(/\.$/);
      expect(stage.build(fullMatter()).checklist.length, stage.id).toBeGreaterThan(0);
    }
  });
});

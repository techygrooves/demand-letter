import { describe, expect, it } from 'vitest';
import { parseMatter, type Matter } from '@/lib/comms/matter';
import {
  CrmError,
  DEMAND_TYPE,
  buildDemandCase,
  crmId,
  parseFee,
  splitName,
} from '@/lib/crm/demand-case';

const base = {
  reference: '2026-001',
  clientName: 'Jane Client',
  clientEmail: 'jane@example.com',
  disputeType: 'unpaid-debt',
  opposingParty: 'Acme Roofing LLC',
};

const matter = (extra: Record<string, unknown> = {}): Matter => parseMatter({ ...base, ...extra });

const build = (extra: Record<string, unknown> = {}, allowUnpaid = true) =>
  buildDemandCase(matter(extra), {
    id: 'fixedid1234567',
    now: new Date('2026-11-05T12:00:00Z'),
    allowUnpaid,
  });

describe('splitName', () => {
  it('treats the last word as the surname', () => {
    expect(splitName('Jane Client')).toEqual({ firstName: 'Jane', lastName: 'Client' });
    expect(splitName('Mary Anne Van Der Berg')).toEqual({
      firstName: 'Mary Anne Van Der',
      lastName: 'Berg',
    });
  });

  it('leaves the surname blank rather than guessing from one word', () => {
    expect(splitName('Prince')).toEqual({ firstName: 'Prince', lastName: '' });
  });
});

describe('parseFee', () => {
  it('accepts the forms an attorney would actually type', () => {
    expect(parseFee('500')).toBe(500);
    expect(parseFee('$500')).toBe(500);
    expect(parseFee('1,250.50')).toBe(1250.5);
    expect(parseFee(500)).toBe(500);
  });

  it('treats absent and empty as no fee recorded', () => {
    expect(parseFee(undefined)).toBe('');
    expect(parseFee('')).toBe('');
  });

  it('refuses anything it would have to guess at', () => {
    expect(() => parseFee('five hundred')).toThrow(CrmError);
    expect(() => parseFee('500 USD')).toThrow(CrmError);
    expect(() => parseFee(-5)).toThrow(CrmError);
  });
});

describe('crmId', () => {
  it('matches the CRM’s own id format', () => {
    const id = crmId(1762300000000, 0.123456789);
    expect(id).toMatch(/^[0-9a-z]+$/);
    expect(id.length).toBeGreaterThan(8);
    expect(crmId()).not.toBe(crmId());
  });
});

describe('buildDemandCase', () => {
  it('files the case under Demand Letters', () => {
    const record = build().matters[0]!;
    expect(record.caseType).toBe(DEMAND_TYPE);
    expect(record.firstName).toBe('Jane');
    expect(record.lastName).toBe('Client');
    expect(record.recipient).toBe('Acme Roofing LLC');
    expect(record.status).toBe('Active');
  });

  it('emits every collection the importer expects, with only the matter filled', () => {
    const bundle = build();
    expect(Object.keys(bundle).sort()).toEqual(
      ['deadlines', 'events', 'invoices', 'matters', 'notes', 'payments', 'piCases'].sort(),
    );
    expect(bundle.matters).toHaveLength(1);
    for (const key of ['piCases', 'notes', 'events', 'deadlines', 'payments', 'invoices'] as const) {
      expect(bundle[key], key).toEqual([]);
    }
  });

  /*
   * The CRM reads a demand letter's revenue from `amountPaid` on the matter,
   * dated by `dateSent`. A row in `payments` drives the fee-plan logic for
   * criminal and PI matters and would not show in the Demand Letters totals,
   * so emitting one would quietly lose the money.
   */
  it('records the fee on the matter and never as a payment row', () => {
    const bundle = build({ feePaid: '500', letterSentDate: '2026-11-05' });
    expect(bundle.matters[0]!.amountPaid).toBe(500);
    expect(bundle.matters[0]!.dateSent).toBe('2026-11-05');
    expect(bundle.payments).toEqual([]);
  });

  it('leaves the fee empty when opening an unpaid case deliberately', () => {
    expect(build().matters[0]!.amountPaid).toBe('');
  });

  /* The firm opens a demand letter case only once the fee is paid in full. */
  it('refuses to open a case with no fee unless told to', () => {
    expect(() => build({}, false)).toThrow(/paid in full/);
    expect(() => build({ feePaid: '500' }, false)).not.toThrow();
  });

  it('defaults dateOpened to today so a fee always lands in a month', () => {
    expect(build({ feePaid: '500' }).matters[0]!.dateOpened).toBe('2026-11-05');
  });

  it('carries the Drive folder link onto the case', () => {
    const url = 'https://drive.google.com/drive/folders/abc123';
    expect(build({ driveUrl: url }).matters[0]!.driveUrl).toBe(url);
  });

  it('includes the blank fields the CRM’s own form writes', () => {
    const record = build().matters[0]!;
    expect(record.caseNumber).toBe('');
    expect(record.prosecutor).toEqual({});
    expect(record.billing).toEqual({ flatFee: 0, retainer: 0, plan: { freq: 'none' } });
  });

  it('refuses a client name it cannot file by surname', () => {
    expect(() => build({ clientName: 'Prince' })).toThrow(/full name/);
  });

  it('refuses a date that is not YYYY-MM-DD', () => {
    expect(() => build({ letterSentDate: '5 November 2026' })).toThrow(/YYYY-MM-DD/);
    expect(() => build({ dateOpened: '2026/10/28' })).toThrow(/YYYY-MM-DD/);
  });

  it('refuses a status the CRM does not have', () => {
    expect(() => build({ crmStatus: 'Pending' })).toThrow(/Active or Closed/);
  });

  it('refuses a Closed case with no closing date', () => {
    expect(() => build({ crmStatus: 'Closed' })).toThrow(/dateClosed/);
    expect(() => build({ crmStatus: 'Closed', dateClosed: '2026-11-05' })).not.toThrow();
  });

  it('refuses a Drive link that is not https', () => {
    expect(() => build({ driveUrl: 'drive.google.com/drive/folders/abc' })).toThrow(/https/);
  });
});

import { describe, expect, it } from 'vitest';
import {
  containsSensitiveNumbers,
  emptyIntake,
  firstInvalidStep,
  phoneDigits,
  validateAll,
  validateField,
  validateStep,
  type IntakeData,
} from '@/lib/intake/validation';

const valid = (): IntakeData => ({
  ...emptyIntake(),
  fullName: 'Jane Client',
  email: 'jane@example.com',
  phone: '(954) 555-0123',
  disputeState: 'FL',
  disputeType: 'unpaid-debt',
  opposingParty: 'Acme Roofing LLC',
  opposingLocation: 'Miami, FL',
  amount: '2,500',
  description: 'I paid a deposit in March for roof repairs. The work was never started and calls go unanswered.',
  resolution: 'Return of my $2,500 deposit.',
  hasDeadline: 'no',
  deadlineDetails: '',
  acknowledgment: true,
});

describe('validateAll', () => {
  it('accepts a complete, valid submission', () => {
    expect(validateAll(valid())).toEqual({});
    expect(firstInvalidStep(valid())).toBe(-1);
  });

  it('requires every mandatory field on an empty form', () => {
    const errors = validateAll(emptyIntake());
    expect(Object.keys(errors).sort()).toEqual(
      ['acknowledgment', 'description', 'disputeState', 'disputeType', 'email', 'fullName', 'hasDeadline', 'opposingParty', 'phone', 'resolution'].sort(),
    );
  });

  it('treats optional fields as optional', () => {
    const data = { ...valid(), opposingLocation: '', amount: '' };
    expect(validateAll(data)).toEqual({});
  });
});

describe('field rules', () => {
  it('validates email format', () => {
    expect(validateField('email', { ...valid(), email: 'not-an-email' })).toMatch(/valid email/);
    expect(validateField('email', { ...valid(), email: 'a@b.co' })).toBeUndefined();
  });

  it('requires a 10-digit US phone number, allowing a leading 1', () => {
    expect(validateField('phone', { ...valid(), phone: '555-0123' })).toMatch(/10-digit/);
    expect(validateField('phone', { ...valid(), phone: '+1 954 555 0123' })).toBeUndefined();
    expect(phoneDigits('1-954-555-0123')).toBe('9545550123');
  });

  it('only accepts listed states and dispute types', () => {
    expect(validateField('disputeState', { ...valid(), disputeState: 'XX' })).toBeDefined();
    expect(validateField('disputeType', { ...valid(), disputeType: 'criminal' })).toBeDefined();
  });

  it('accepts common amount formats and rejects text', () => {
    for (const amount of ['2500', '2,500', '$2,500.00', '1000000']) {
      expect(validateField('amount', { ...valid(), amount })).toBeUndefined();
    }
    expect(validateField('amount', { ...valid(), amount: 'about two grand' })).toBeDefined();
  });

  it('requires a minimum description length', () => {
    expect(validateField('description', { ...valid(), description: 'Too short.' })).toMatch(/more detail/);
  });

  it('requires deadline details only when a deadline is indicated', () => {
    expect(validateField('deadlineDetails', { ...valid(), hasDeadline: 'yes', deadlineDetails: '' })).toBeDefined();
    expect(validateField('deadlineDetails', { ...valid(), hasDeadline: 'no', deadlineDetails: '' })).toBeUndefined();
  });

  it('requires the acknowledgment', () => {
    expect(validateStep(3, { ...valid(), acknowledgment: false })).toHaveProperty('acknowledgment');
  });
});

describe('sensitive data screening', () => {
  it('flags SSNs and card/account-length numbers', () => {
    expect(containsSensitiveNumbers('My SSN is 123-45-6789')).toBe(true);
    expect(containsSensitiveNumbers('ssn 123456789')).toBe(true);
    expect(containsSensitiveNumbers('Card 4111 1111 1111 1111')).toBe(true);
    expect(containsSensitiveNumbers('Account 000123456789')).toBe(true);
  });

  it('does not flag phone numbers, dates or amounts', () => {
    expect(containsSensitiveNumbers('Call me at (954) 555-0123 or 954-555-0123')).toBe(false);
    expect(containsSensitiveNumbers('On 2026-03-15 I paid $12,500.00')).toBe(false);
  });

  it('blocks sensitive numbers in free-text fields', () => {
    const data = { ...valid(), description: `${valid().description} My SSN is 123-45-6789.` };
    expect(validateField('description', data)).toMatch(/Social Security/);
  });
});

describe('summary formatting', async () => {
  const { formatPhone, formatAmount, summaryText } = await import('@/lib/intake/summary');

  it('formats phone numbers and amounts for display', () => {
    expect(formatPhone('9545550123')).toBe('(954) 555-0123');
    expect(formatPhone('+1 954.555.0123')).toBe('(954) 555-0123');
    expect(formatAmount('2,500')).toBe('$2,500');
    expect(formatAmount('$ 2,500')).toBe('$2,500');
  });

  it('produces a readable plain-text summary', () => {
    const text = summaryText(valid());
    expect(text).toContain('CONTACT DETAILS');
    expect(text).toContain('State where the dispute arose: Florida');
    expect(text).toContain('Dispute type: Unpaid debt or money owed');
    expect(text).toContain('Deadline or court date: No');
  });
});

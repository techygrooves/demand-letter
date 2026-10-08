/**
 * Intake validation. Pure functions with no DOM access so they can be unit
 * tested and reused by a server-side handler later.
 */
import { disputeOptions, deadlineOptions, usStates, limits } from '@/config/intake';

export interface IntakeData {
  fullName: string;
  email: string;
  phone: string;
  disputeState: string;
  disputeType: string;
  opposingParty: string;
  opposingLocation: string;
  amount: string;
  description: string;
  resolution: string;
  hasDeadline: string;
  deadlineDetails: string;
  acknowledgment: boolean;
}

export type FieldName = keyof IntakeData;
export type FieldErrors = Partial<Record<FieldName, string>>;

/** Fields validated on each step, in display order (used for error summaries and focus). */
export const stepFields: Record<number, FieldName[]> = {
  0: ['fullName', 'email', 'phone', 'disputeState'],
  1: ['disputeType'],
  2: ['opposingParty', 'opposingLocation', 'amount', 'description', 'resolution', 'hasDeadline', 'deadlineDetails'],
  3: ['acknowledgment'],
};

export const emptyIntake = (): IntakeData => ({
  fullName: '',
  email: '',
  phone: '',
  disputeState: '',
  disputeType: '',
  opposingParty: '',
  opposingLocation: '',
  amount: '',
  description: '',
  resolution: '',
  hasDeadline: '',
  deadlineDetails: '',
  acknowledgment: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AMOUNT_RE = /^\$?\s*\d{1,3}(,?\d{3})*(\.\d{1,2})?$/;

/** Digits only, ignoring a leading US country code. */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/**
 * Detects data the firm does not want sent through the form: Social Security
 * numbers and long digit runs that look like card or bank account numbers.
 */
export function containsSensitiveNumbers(text: string): boolean {
  if (/\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/.test(text)) return true; // SSN format
  const runs = text.match(/\d[\d\s-]{7,}\d/g) ?? [];
  return runs.some((run) => {
    const digits = run.replace(/\D/g, '');
    // 9 digits (unformatted SSN) or 12+ digits (card/account numbers). Phone numbers are 10–11 digits.
    return digits.length === 9 || digits.length >= 12;
  });
}

const SENSITIVE_MESSAGE =
  'Please remove Social Security, bank account or card numbers. This form should not be used for that information.';

const isOneOf = (value: string, options: readonly { value: string }[]) => options.some((o) => o.value === value);

export function validateField(name: FieldName, data: IntakeData): string | undefined {
  const raw = data[name];
  const value = typeof raw === 'string' ? raw.trim() : raw;

  switch (name) {
    case 'fullName':
      if (!value) return 'Please enter your full name.';
      if ((value as string).length < 2) return 'Please enter your full name.';
      if ((value as string).length > limits.name) return `Please keep your name under ${limits.name} characters.`;
      return;
    case 'email':
      if (!value) return 'Please enter your email address.';
      if (!EMAIL_RE.test(value as string) || (value as string).length > limits.email)
        return 'Please enter a valid email address, such as name@example.com.';
      return;
    case 'phone': {
      if (!value) return 'Please enter your phone number.';
      const digits = phoneDigits(value as string);
      if (digits.length !== 10) return 'Please enter a 10-digit U.S. phone number, such as (954) 555-0123.';
      return;
    }
    case 'disputeState':
      if (!value) return 'Please select the state where the dispute arose.';
      if (!usStates.some(([code]) => code === value)) return 'Please select a state from the list.';
      return;
    case 'disputeType':
      if (!value) return 'Please select the type of dispute.';
      if (!isOneOf(value as string, disputeOptions)) return 'Please select a dispute type from the list.';
      return;
    case 'opposingParty':
      if (!value) return 'Please enter the name of the person or business you have a dispute with.';
      if ((value as string).length > limits.opposingParty)
        return `Please keep this under ${limits.opposingParty} characters.`;
      return;
    case 'opposingLocation':
      if ((value as string).length > limits.opposingLocation)
        return `Please keep this under ${limits.opposingLocation} characters.`;
      return;
    case 'amount':
      if (value && !AMOUNT_RE.test(value as string))
        return 'Please enter an approximate dollar amount using numbers only, such as 2,500.';
      return;
    case 'description': {
      const text = value as string;
      if (!text) return 'Please describe what happened.';
      if (text.length < limits.description.min)
        return `Please add a little more detail (at least ${limits.description.min} characters).`;
      if (text.length > limits.description.max)
        return `Please shorten your description to ${limits.description.max} characters or fewer.`;
      if (containsSensitiveNumbers(text)) return SENSITIVE_MESSAGE;
      return;
    }
    case 'resolution': {
      const text = value as string;
      if (!text) return 'Please tell us what resolution you are seeking.';
      if (text.length < limits.resolution.min) return 'Please describe the resolution you are seeking.';
      if (text.length > limits.resolution.max)
        return `Please shorten this to ${limits.resolution.max} characters or fewer.`;
      if (containsSensitiveNumbers(text)) return SENSITIVE_MESSAGE;
      return;
    }
    case 'hasDeadline':
      if (!value) return 'Please let us know whether there is a deadline or upcoming court date.';
      if (!isOneOf(value as string, deadlineOptions)) return 'Please choose one of the options.';
      return;
    case 'deadlineDetails':
      if (data.hasDeadline === 'yes' && !value) return 'Please briefly describe the deadline or court date.';
      if ((value as string).length > limits.deadlineDetails)
        return `Please keep this under ${limits.deadlineDetails} characters.`;
      if (containsSensitiveNumbers(value as string)) return SENSITIVE_MESSAGE;
      return;
    case 'acknowledgment':
      if (value !== true) return 'Please confirm that you have read and understand these statements.';
      return;
  }
}

export function validateStep(step: number, data: IntakeData): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of stepFields[step] ?? []) {
    const message = validateField(field, data);
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateAll(data: IntakeData): FieldErrors {
  return Object.keys(stepFields).reduce<FieldErrors>(
    (all, step) => ({ ...all, ...validateStep(Number(step), data) }),
    {},
  );
}

/** First step containing an error, or -1 when the data is valid. */
export function firstInvalidStep(data: IntakeData): number {
  for (const step of Object.keys(stepFields).map(Number)) {
    if (Object.keys(validateStep(step, data)).length) return step;
  }
  return -1;
}

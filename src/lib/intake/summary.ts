/** Human-readable labels and summaries of intake data (review screen, email fallback, payloads). */
import { disputeOptions, deadlineOptions, usStates } from '@/config/intake';
import { phoneDigits, type IntakeData } from './validation';

const labelFor = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

export const stateLabel = (code: string) => usStates.find(([c]) => c === code)?.[1] ?? code;

export interface SummarySection {
  step: number;
  title: string;
  rows: { label: string; value: string }[];
}

const orNone = (value: string) => value.trim() || 'Not provided';

export function summarize(data: IntakeData): SummarySection[] {
  const deadline =
    data.hasDeadline === 'yes' && data.deadlineDetails.trim()
      ? `Yes: ${data.deadlineDetails.trim()}`
      : labelFor(deadlineOptions, data.hasDeadline) || 'Not provided';

  return [
    {
      step: 0,
      title: 'Contact details',
      rows: [
        { label: 'Full name', value: orNone(data.fullName) },
        { label: 'Email', value: orNone(data.email) },
        { label: 'Phone', value: orNone(formatPhone(data.phone)) },
        { label: 'State where the dispute arose', value: orNone(stateLabel(data.disputeState)) },
      ],
    },
    {
      step: 1,
      title: 'Type of dispute',
      rows: [{ label: 'Dispute type', value: orNone(labelFor(disputeOptions, data.disputeType)) }],
    },
    {
      step: 2,
      title: 'Dispute information',
      rows: [
        { label: 'Opposing party', value: orNone(data.opposingParty) },
        { label: 'Opposing party location', value: orNone(data.opposingLocation) },
        { label: 'Approximate amount', value: data.amount.trim() ? formatAmount(data.amount) : 'Not provided' },
        { label: 'What happened', value: orNone(data.description) },
        { label: 'Resolution sought', value: orNone(data.resolution) },
        { label: 'Deadline or court date', value: deadline },
      ],
    },
  ];
}

/** Formats a 10-digit US number as (954) 555-0123; leaves anything else as entered. */
export function formatPhone(phone: string): string {
  const digits = phoneDigits(phone);
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : phone.trim();
}

export function formatAmount(amount: string): string {
  const trimmed = amount.trim().replace(/^\$\s*/, '');
  return trimmed ? `$${trimmed}` : '';
}

/** Plain-text version for email fallback and server payloads. */
export function summaryText(data: IntakeData): string {
  return summarize(data)
    .map((section) => [section.title.toUpperCase(), ...section.rows.map((r) => `${r.label}: ${r.value}`)].join('\n'))
    .join('\n\n');
}

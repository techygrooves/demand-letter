/**
 * The matter record the client-email generator reads.
 *
 * A matter file holds client data, so it never belongs in this repository.
 * Keep matter JSON outside the checkout, or in the git-ignored `matters/`
 * directory. Nothing in `src/lib/comms/` contains client information.
 */
import { disputeOptions } from '@/config/intake';
import { formatPhone, stateLabel } from '@/lib/intake/summary';

/** Why a matter was not accepted. Chooses the wording of the declining email. */
export type DeclineReason =
  | 'outside-scope'
  | 'conflict'
  | 'needs-litigation'
  | 'outside-florida'
  | 'insufficient-information'
  | 'other';

export interface Matter {
  /** The firm's own file reference, printed in the subject line. */
  reference: string;
  clientName: string;
  clientEmail: string;
  /** How to address the client. Defaults to the first word of `clientName`. */
  salutation?: string;
  /** An intake `disputeOptions` value, or free text if none fits. */
  disputeType: string;
  opposingParty: string;
  /** Two-letter code for the state the dispute arose in. */
  disputeState?: string;
  /** Approximate amount in dispute, digits only (e.g. "2,500"). */
  amount?: string;
  /** The resolution the client is seeking, in the client's own terms. */
  resolution?: string;
  clientPhone?: string;

  /** Follow-up questions for the `information-requested` stage. */
  questions?: string[];
  /** Required by the `declined` stage. */
  declineReason?: DeclineReason;
  /** One or two sentences of specifics added to the declining email. */
  declineNote?: string;
  /** Secure payment URL, required by the `accepted` stage. */
  paymentLink?: string;
  /** How the letter was issued, e.g. "certified mail, return receipt requested, and email". */
  deliveryMethod?: string;
  /** The date stated in the letter by which the opposing party must respond. */
  responseDeadline?: string;
  /** What the other side said, for the `response-received` stage. */
  responseSummary?: string;
  /** Options the attorney is offering next. Rendered as a list. */
  nextSteps?: string[];
  /** Points the client should check in the draft letter. */
  reviewPoints?: string[];
  /** Overrides the signing attorney. Defaults to the firm's attorney. */
  attorney?: string;
  /** Free-text note appended above the signature, used by any stage. */
  note?: string;
}

export class MatterError extends Error {}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const STRING_FIELDS = [
  'reference', 'clientName', 'clientEmail', 'salutation', 'disputeType', 'opposingParty',
  'disputeState', 'amount', 'resolution', 'clientPhone', 'declineReason', 'declineNote',
  'paymentLink', 'deliveryMethod', 'responseDeadline', 'responseSummary', 'attorney', 'note',
] as const;

const LIST_FIELDS = ['questions', 'nextSteps', 'reviewPoints'] as const;

const REQUIRED = ['reference', 'clientName', 'clientEmail', 'disputeType', 'opposingParty'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates and normalises a parsed matter file. Throws `MatterError` with
 * every problem listed, so a mistyped matter file is fixed in one pass.
 */
export function parseMatter(input: unknown): Matter {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new MatterError('The matter file must contain a single JSON object.');
  }

  const raw = input as Record<string, unknown>;
  const problems: string[] = [];
  const matter: Record<string, unknown> = {};

  const known = new Set<string>([...STRING_FIELDS, ...LIST_FIELDS]);
  for (const key of Object.keys(raw)) {
    if (!known.has(key)) problems.push(`Unknown field "${key}".`);
  }

  for (const field of STRING_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value !== 'string') {
      problems.push(`"${field}" must be text.`);
      continue;
    }
    matter[field] = value.trim();
  }

  for (const field of LIST_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null) continue;
    if (!Array.isArray(value) || value.some((item) => !isNonEmptyString(item))) {
      problems.push(`"${field}" must be a list of non-empty strings.`);
      continue;
    }
    matter[field] = value.map((item) => (item as string).trim());
  }

  for (const field of REQUIRED) {
    if (!isNonEmptyString(matter[field])) problems.push(`"${field}" is required.`);
  }

  if (isNonEmptyString(matter.clientEmail) && !EMAIL_RE.test(matter.clientEmail)) {
    problems.push('"clientEmail" is not a valid email address.');
  }

  if (isNonEmptyString(matter.paymentLink) && !matter.paymentLink.startsWith('https://')) {
    problems.push('"paymentLink" must be an https:// URL.');
  }

  if (problems.length) {
    throw new MatterError(`The matter file has ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  }

  return matter as unknown as Matter;
}

/** The name to open the email with. */
export function greetingName(matter: Matter): string {
  if (matter.salutation) return matter.salutation;
  return matter.clientName.trim().split(/\s+/)[0] ?? matter.clientName;
}

/**
 * The dispute in a form that reads naturally mid-sentence. An intake option
 * value becomes its label; anything else is used as written.
 */
export function disputeLabel(matter: Matter): string {
  const option = disputeOptions.find((o) => o.value === matter.disputeType);
  return (option ? option.label : matter.disputeType).toLowerCase();
}

/** "your dispute with Acme Roofing LLC in Florida" — the state only when known. */
export function disputeDescription(matter: Matter): string {
  const where = matter.disputeState ? ` in ${stateLabel(matter.disputeState)}` : '';
  return `your dispute with ${matter.opposingParty}${where}`;
}

export const matterPhone = (matter: Matter): string =>
  matter.clientPhone ? formatPhone(matter.clientPhone) : '';

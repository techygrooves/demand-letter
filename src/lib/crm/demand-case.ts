/**
 * Builds a Hoffman Legal Case Management import file from a matter.
 *
 * The CRM is a single-page app that keeps its data in the browser. It has no
 * API, so a case is opened by generating a backup-shaped JSON file and using
 * **Merge (add only)** in the app's header. That import is add-only: records
 * whose id already exists are skipped, and existing records are never edited
 * or deleted, so re-importing the same file twice changes nothing.
 *
 * The constants and record shape below mirror the live app. The app is the
 * source of truth; if a field is renamed there, change it here to match.
 *
 * Money: a demand letter's revenue is read from `amountPaid` on the matter
 * and dated by `dateSent` (falling back to `dateOpened`). The separate
 * `payments` collection and the `billing` fields drive the fee-plan logic for
 * criminal and PI matters, not demand letters — a payment row written against
 * a demand matter would not appear in the Demand Letters totals at all. So
 * the fee goes in `amountPaid` and no payment record is emitted.
 */
import { offer } from '@/config/site';
import { type Matter } from '@/lib/comms/matter';

/** `caseType` that files a matter under Demand Letters in the CRM. */
export const DEMAND_TYPE = 'Demand Letter';

export const DEMAND_STATUSES = ['Active', 'Closed'] as const;
export type DemandStatus = (typeof DEMAND_STATUSES)[number];

export class CrmError extends Error {}

/** A matter record as the CRM's own "New demand letter" form creates one. */
export interface CrmMatter {
  id: string;
  createdAt: string;
  updatedAt: string;
  caseType: typeof DEMAND_TYPE;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  recipient: string;
  dateSent: string;
  amountPaid: number | '';
  status: DemandStatus;
  driveUrl: string;
  dateOpened: string;
  dateClosed: string;
  caseNumber: string;
  court: string;
  county: string;
  charges: string;
  arrestDate: string;
  leadSource: string;
  referredBy: string;
  prosecutor: Record<string, never>;
  emergency: Record<string, never>;
  billing: { flatFee: number; retainer: number; plan: { freq: string } };
}

/** The file handed to Merge (add only). */
export interface CrmImport {
  matters: CrmMatter[];
  piCases: never[];
  notes: never[];
  events: never[];
  deadlines: never[];
  payments: never[];
  invoices: never[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Matches the CRM's own id generator so imported records look native. */
export function crmId(now: number = Date.now(), random: number = Math.random()): string {
  return now.toString(36) + random.toString(36).slice(2, 9);
}

export const todayISO = (date: Date = new Date()): string => date.toISOString().slice(0, 10);

/**
 * Splits a full name the way the CRM's two fields expect: the last word is the
 * surname and everything before it the forename(s). A single word becomes the
 * first name, leaving the surname blank rather than guessing.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1]! };
}

function checkDate(label: string, value: string | undefined): string {
  if (!value) return '';
  if (!ISO_DATE.test(value)) throw new CrmError(`"${label}" must be a date as YYYY-MM-DD, not "${value}".`);
  return value;
}

/** Accepts "500", "$500", "1,250.50"; rejects anything else. */
export function parseFee(value: string | number | undefined): number | '' {
  if (value === undefined || value === '') return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) throw new CrmError(`"feePaid" must be a positive amount.`);
    return Math.round(value * 100) / 100;
  }
  const cleaned = value.trim().replace(/^\$\s*/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new CrmError(`"feePaid" must be an amount such as 500 or 1,250.50, not "${value}".`);
  }
  return Number(cleaned);
}

export interface BuildOptions {
  /** Overrides the id, for reproducible output in tests. */
  id?: string;
  /** Overrides "now", for reproducible output in tests. */
  now?: Date;
  /**
   * Opens a case with no fee recorded. Off by default: see the firm rule in
   * `buildDemandCase`.
   */
  allowUnpaid?: boolean;
}

/**
 * Builds the import file. Throws `CrmError` rather than emitting a record the
 * CRM would accept but display wrongly.
 */
export function buildDemandCase(matter: Matter, options: BuildOptions = {}): CrmImport {
  const now = options.now ?? new Date();
  const stamp = now.toISOString();
  const { firstName, lastName } = splitName(matter.clientName);

  if (!lastName) {
    throw new CrmError(
      `"clientName" is "${matter.clientName}". The CRM files cases by surname, so give the client's full name.`,
    );
  }

  const status = (matter.crmStatus ?? 'Active') as DemandStatus;
  if (!DEMAND_STATUSES.includes(status)) {
    throw new CrmError(`"crmStatus" must be ${DEMAND_STATUSES.join(' or ')}, not "${matter.crmStatus}".`);
  }

  if (matter.driveUrl && !/^https:\/\//.test(matter.driveUrl)) {
    throw new CrmError('"driveUrl" must be an https:// link to the client\'s Drive folder.');
  }

  const dateSent = checkDate('letterSentDate', matter.letterSentDate);
  const dateOpened = checkDate('dateOpened', matter.dateOpened) || todayISO(now);
  const dateClosed = checkDate('dateClosed', matter.dateClosed);
  const amountPaid = parseFee(matter.feePaid);

  if (status === 'Closed' && !dateClosed) {
    throw new CrmError('A Closed case needs "dateClosed".');
  }

  /*
   * Firm rule, for demand letters only: the case is not opened until the flat
   * fee is paid in full. Enforced here rather than left to memory, because a
   * case opened early sits in Demand Letters looking like unpaid work.
   *
   * Criminal and PI matters take retainers, partial payments and payment
   * plans; they are billed through the CRM's own billing fields and payments
   * collection, which this module never writes.
   */
  if (amountPaid === '' && !options.allowUnpaid) {
    throw new CrmError(
      'No fee recorded. A demand letter case is opened only once the fee is paid in full — ' +
        'give "feePaid" (or --fee). Pass --allow-unpaid to override deliberately.',
    );
  }

  /*
   * The money lands on dateSent, or dateOpened when the letter has not gone
   * out yet. Both blank would put the fee in no month at all, which silently
   * loses it from the revenue tiles.
   */
  if (amountPaid !== '' && !dateSent && !dateOpened) {
    throw new CrmError('A fee needs "letterSentDate" or "dateOpened" so it counts in a month.');
  }

  const record: CrmMatter = {
    id: options.id ?? crmId(now.getTime()),
    createdAt: stamp,
    updatedAt: stamp,
    caseType: DEMAND_TYPE,
    firstName,
    lastName,
    phone: matter.clientPhone ?? '',
    email: matter.clientEmail,
    address: matter.clientAddress ?? '',
    recipient: matter.opposingParty,
    dateSent,
    amountPaid,
    status,
    driveUrl: matter.driveUrl ?? '',
    dateOpened,
    dateClosed,
    // Blank on a demand letter, but present so the record matches the app's own.
    caseNumber: '',
    court: '',
    county: '',
    charges: '',
    arrestDate: '',
    leadSource: matter.leadSource ?? '',
    referredBy: '',
    prosecutor: {},
    emergency: {},
    billing: { flatFee: 0, retainer: 0, plan: { freq: 'none' } },
  };

  return { matters: [record], piCases: [], notes: [], events: [], deadlines: [], payments: [], invoices: [] };
}

/** One line per case, for the terminal summary. */
export function describeCase(record: CrmMatter): string[] {
  return [
    `Client:    ${record.firstName} ${record.lastName}`,
    `Demand to: ${record.recipient}`,
    `Status:    ${record.status}`,
    `Date sent: ${record.dateSent || '— not sent yet'}`,
    `Fee taken: ${record.amountPaid === '' ? '— none recorded' : `$${record.amountPaid.toFixed(2)}`}`,
    `Drive:     ${record.driveUrl || '— none'}`,
  ];
}

/** The default fee, for callers that want the published figure. */
export const standardFee = offer.price;

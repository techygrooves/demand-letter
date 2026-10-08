/**
 * Single source of truth for firm details, navigation and offer content.
 * Edit values here; components and pages read from this file.
 */
import { url } from '@/lib/url';

export const firm = {
  name: 'Hoffman Legal',
  legalName: 'Hoffman Legal, PLLC',
  attorney: 'David Hoffman',
  website: 'https://hoffman.legal',
  phone: {
    display: '(954) 459-4236',
    href: 'tel:+19544594236',
    e164: '+1-954-459-4236',
  },
  email: 'david@hoffman.legal',
  address: {
    street: '101 SW 1st Street, Suite CW12',
    city: 'Dania Beach',
    region: 'FL',
    postalCode: '33004',
    country: 'US',
  },
  areaServed: 'Florida',
} as const;

export const site = {
  title: 'Attorney Demand Letters in Florida | $500 Flat Fee | Hoffman Legal',
  shortTitle: 'Demand Letters',
  description:
    'Attorney-prepared demand letters for a $500 flat fee. Hoffman Legal prepares individualized demand letters on firm letterhead for unpaid debts, contract breaches, deposits, property damage and other Florida civil disputes.',
  locale: 'en_US',
  /** Image path (from /public) for social sharing previews. */
  ogImage: url('/og-image.png'),
} as const;

/**
 * The $500 service. This is the single source of truth for scope and pricing
 * language. Do not add promises (delivery method, deadlines, revisions,
 * follow-up correspondence) here without the attorney's confirmation.
 */
export const offer = {
  price: 500,
  priceDisplay: '$500',
  priceLabel: 'Flat fee',
  serviceName: 'Attorney Demand Letter',
  /** Shown beneath the price. */
  priceNote: 'A fixed fee for one attorney-prepared demand letter. No hourly billing.',
  /** The four headline promises shown in the hero. */
  highlights: [
    '$500 flat fee',
    'Attorney-prepared demand letter',
    'Individualized to your dispute',
    'Professional Hoffman Legal letterhead',
  ],
  /** Core service scope. Used on the pricing card and everywhere scope is listed. */
  scope: [
    'One attorney-prepared demand letter',
    'Individualized review of your dispute',
    'Professional Hoffman Legal letterhead',
    'Clear statement of your requested resolution',
  ],
  /** Expanded descriptions of each scope item, in the same order as `scope`. */
  scopeDetail: [
    {
      icon: 'letter',
      title: 'One attorney-prepared demand letter',
      text: 'A single demand letter prepared by an attorney for your matter, written to communicate your position clearly and professionally.',
    },
    {
      icon: 'search',
      title: 'Individualized review of your dispute',
      text: 'Your facts, the opposing party and your supporting documents are reviewed by a Florida attorney before the letter is written.',
    },
    {
      icon: 'file',
      title: 'Professional Hoffman Legal letterhead',
      text: 'The letter is issued on Hoffman Legal letterhead, showing the other party that you have legal representation.',
    },
    {
      icon: 'target',
      title: 'Clear statement of your requested resolution',
      text: 'The letter states what you are asking for, whether payment, a refund, repairs or performance under an agreement.',
    },
  ],
  /** Work outside the standard service that may require a separate engagement. */
  additionalWork: [
    { title: 'Litigation', text: 'Filing or defending a lawsuit, including small claims, and any court appearances.' },
    { title: 'Settlement negotiations', text: 'Ongoing negotiation with the other party or their attorney after the letter.' },
    { title: 'Additional letters', text: 'Follow-up letters, replies or other correspondence beyond the one demand letter.' },
    { title: 'Extensive investigation', text: 'Substantial fact-finding, records gathering or review of large volumes of documents.' },
  ],
  additionalWorkNote:
    'If your matter needs more than the standard service, we will explain the options and any additional fees before any further work begins. Additional work requires a separate agreement.',
  /** Payment and engagement assurances. Wording reviewed for consistency site-wide. */
  payment: {
    headline: 'Secure Payment Following Case Acceptance',
    noUpfront: 'No payment is required to submit a request.',
    suitability: 'Suitability is reviewed before any payment is requested.',
    engagement: 'Representation is subject to a signed engagement agreement.',
  },
} as const;

/**
 * Types of disputes. These are examples of potential matters, not a promise
 * that every dispute qualifies. Every matter is subject to attorney assessment.
 * Order = display order. The last item (`other: true`) renders as a wide card.
 */
export const disputeTypes = [
  {
    icon: 'cash',
    title: 'Unpaid Debts and Outstanding Payments',
    text: 'Unpaid invoices, personal loans, overdue payments and money owed.',
  },
  {
    icon: 'contract',
    title: 'Breach of Contract',
    text: 'Broken agreements, unfulfilled contractual obligations and disputes over contract terms.',
  },
  {
    icon: 'key',
    title: 'Landlord-Tenant Disputes',
    text: 'Security deposits, lease disagreements, property damage and other suitable rental disputes.',
  },
  {
    icon: 'home',
    title: 'Property and Real Estate Disputes',
    text: 'Property damage, boundary disagreements, contractor issues and other appropriate civil property claims.',
  },
  {
    icon: 'cart',
    title: 'Consumer Complaints',
    text: 'Defective goods, refund disputes, unfair billing and failures to deliver promised services.',
  },
  {
    icon: 'building',
    title: 'Business and Commercial Disputes',
    text: 'Vendor disagreements, unpaid business invoices, service contract breaches and payment disagreements.',
  },
  {
    icon: 'tools',
    title: 'Contractor and Construction Disputes',
    text: 'Incomplete work, defective workmanship, payment issues and alleged failures to perform.',
  },
  {
    icon: 'briefcase',
    title: 'Employment-Related Civil Claims',
    text: 'Unpaid compensation, contractual payment disputes and other suitable pre-litigation matters, subject to legal review.',
  },
  {
    icon: 'shield',
    title: 'Insurance and Reimbursement Disputes',
    text: 'Disputed payments, reimbursement requests and appropriate insurance-related demands.',
  },
  {
    icon: 'scale',
    title: 'Other Civil Disputes',
    text: 'Suitable civil matters not specifically listed above. Tell us what happened and the attorney will assess whether a demand letter is an appropriate next step.',
    other: true,
  },
] as const;

/** Limitations shown alongside the dispute categories. */
export const disputeNotices = {
  assessment: 'All matters are subject to attorney assessment.',
  items: [
    'The categories above are examples of potential matters, not a promise that every dispute qualifies.',
    'This service does not guarantee that any statutory notice or legally required pre-suit procedure is satisfied.',
    'Criminal defense, contested litigation and specialized claims are not included in the $500 fee.',
  ],
} as const;

/**
 * Process steps. Avoid promising specific turnaround times or delivery
 * methods here; timing is discussed with each client after review.
 */
export const steps = [
  {
    icon: 'clipboard',
    title: 'Tell Us About Your Dispute',
    text: 'Complete a short online intake describing the dispute, the opposing party and the resolution you want.',
    details: ['What happened and when', 'Who the opposing party is', 'What you want them to do', 'No payment required to submit'],
  },
  {
    icon: 'search',
    title: 'Attorney Reviews the Matter',
    text: `Hoffman Legal reviews your information to determine whether the matter is suitable for the $500 fixed-fee service.`,
    details: ['Review of your facts and documents', 'Conflict check', 'We may ask follow-up questions', 'You will be told if it is not a fit'],
  },
  {
    icon: 'lock',
    title: 'Engagement and Payment',
    text: 'If your matter is accepted, you receive the engagement terms and complete secure payment of the $500 fee.',
    details: ['Clear engagement terms', 'Signed engagement agreement', 'Secure Payment Following Case Acceptance'],
  },
  {
    icon: 'pen',
    title: 'Preparation of Demand Letter',
    text: 'The attorney prepares an individualized demand letter addressing the relevant facts, your legal position where appropriate and your requested resolution.',
    details: ['Individualized to your dispute', 'Prepared on Hoffman Legal letterhead', 'States your requested resolution'],
  },
] as const;

export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: 'How It Works', href: url('/how-it-works/') },
  { label: 'Disputes', href: url('/disputes/') },
  { label: 'Pricing', href: url('/pricing/') },
  { label: 'About', href: url('/about/') },
  { label: 'FAQ', href: url('/faq/') },
  { label: 'Contact', href: url('/contact/') },
];

export const legalNav: NavItem[] = [
  { label: 'Legal Disclaimer', href: url('/disclaimer/') },
  { label: 'Privacy Policy', href: url('/privacy/') },
  { label: 'Terms of Use', href: url('/terms/') },
];

export const cta = {
  primary: { label: 'Get Started — $500', href: url('/get-started/') },
  request: { label: 'Start Your Demand Letter Request', href: url('/get-started/') },
  secondary: { label: 'Discuss Your Situation', href: url('/contact/') },
  short: { label: 'Get Started', href: url('/get-started/') },
} as const;

/**
 * Attorney profile. Only facts confirmed by the firm belong here.
 *
 * Do not add credentials, education, bar admission dates, prior positions,
 * awards, results or testimonials unless they are confirmed against
 * https://hoffman.legal or the attorney's official Florida Bar profile.
 * Items that still need confirmation are listed in `toVerify` and are
 * NOT rendered anywhere on the site.
 */
export const attorneyProfile = {
  name: firm.attorney,
  role: 'Attorney',
  firm: firm.legalName,
  officeCity: `${firm.address.city}, Florida`,
  firmWebsiteLabel: 'hoffman.legal',
  toVerify: [
    'Florida Bar admission year and bar number',
    'Law school and graduation year',
    'Prior positions (third-party search summaries mention public defender experience)',
    'Practice areas listed on hoffman.legal',
  ],
} as const;

/**
 * Links to Hoffman Legal's existing policies on the firm's main website.
 * Leave empty until the exact URLs are confirmed; the site then links to the
 * firm homepage and to this site's own privacy and terms pages instead.
 */
export const firmPolicyLinks = {
  privacy: '',
  terms: '',
} as const;

/** Florida Bar public member search, for visitors who wish to verify an attorney's license. */
export const barLookupUrl = 'https://www.floridabar.org/directories/find-mbr/';

/** Attorney-advertising and website disclaimers. Shown in the footer and on the legal pages. */
export const disclaimers = {
  advertising:
    'The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.',
  attorneyAdvertising: 'This website is an advertisement for legal services.',
  noRelationship:
    'The information on this website is for general information purposes only and is not legal advice. Submitting an inquiry or contacting Hoffman Legal does not create an attorney-client relationship. An attorney-client relationship is formed only after a conflict check and a signed engagement agreement.',
  results: 'Results are not guaranteed. Past results do not guarantee a similar outcome in any other matter.',
  jurisdiction:
    'Hoffman Legal is a Florida law firm. This service is focused on disputes connected to Florida and is not available for every matter or in every jurisdiction.',
} as const;

/**
 * Service safeguards, shown in the "Important information" notice.
 * Keep consistent with `offer` and the FAQ.
 */
export const serviceNotices = [
  {
    title: 'Results are not guaranteed',
    text: 'No attorney can guarantee how another party will respond to a demand letter or that a dispute will be resolved.',
  },
  {
    title: 'Litigation is not automatically included',
    text: 'The $500 fee covers one demand letter. Lawsuits, court proceedings, settlement negotiations and other work require a separate engagement.',
  },
  {
    title: 'The engagement agreement governs the scope',
    text: 'If your matter is accepted, the scope of the representation is defined by the written engagement agreement you sign.',
  },
  {
    title: 'An inquiry does not create an attorney-client relationship',
    text: 'Submitting a request or contacting the firm does not make Hoffman Legal your attorney. Representation begins only after acceptance, a conflict check and a signed engagement agreement.',
  },
  {
    title: 'Legal deadlines still apply',
    text: 'Sending a demand letter does not stop, pause or extend a statute of limitations or any other legal deadline. If a deadline may be approaching, tell us right away and consider seeking legal advice promptly.',
  },
  {
    title: 'Florida law firm',
    text: 'Hoffman Legal is a Florida law firm. This service is focused on disputes connected to Florida and is not available nationwide.',
  },
] as const;

/**
 * Single source of truth for firm details, navigation and offer content.
 * Edit values here; components and pages read from this file.
 */

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
  ogImage: '/og-image.png',
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

/** Common situations where a demand letter may help. Order = display order. */
export const disputeTypes = [
  {
    icon: 'invoice',
    title: 'Unpaid Invoices',
    text: 'A client or customer has not paid for work you performed or goods you delivered.',
  },
  {
    icon: 'cash',
    title: 'Money Owed & Personal Loans',
    text: 'Someone borrowed money or agreed to repay you and has not followed through.',
  },
  {
    icon: 'contract',
    title: 'Breach of Contract',
    text: 'A party did not perform under a written or verbal agreement, and you suffered a loss.',
  },
  {
    icon: 'home',
    title: 'Security Deposits & Leases',
    text: 'A deposit was wrongfully withheld, or a lease obligation was not honored.',
  },
  {
    icon: 'tools',
    title: 'Contractor & Home Improvement',
    text: 'Work was left incomplete, performed poorly or abandoned after you paid.',
  },
  {
    icon: 'shield',
    title: 'Property Damage',
    text: 'Another person or business damaged your vehicle, home or personal property.',
  },
  {
    icon: 'cart',
    title: 'Consumer Disputes',
    text: 'A seller refused a refund, failed to deliver or sold you a defective product.',
  },
  {
    icon: 'building',
    title: 'Business-to-Business Disputes',
    text: 'A vendor, partner or customer has not met its payment or performance obligations.',
  },
] as const;

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
  { label: 'How It Works', href: '/how-it-works/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'About', href: '/about/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Contact', href: '/contact/' },
];

export const legalNav: NavItem[] = [
  { label: 'Legal Disclaimer', href: '/disclaimer/' },
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Service', href: '/terms/' },
];

export const cta = {
  primary: { label: 'Get Started — $500', href: '/get-started/' },
  request: { label: 'Start Your Demand Letter Request', href: '/get-started/' },
  secondary: { label: 'Discuss Your Situation', href: '/contact/' },
  short: { label: 'Get Started', href: '/get-started/' },
} as const;

/** Florida attorney-advertising and website disclaimers shown in the footer. */
export const disclaimers = {
  advertising:
    'The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.',
  noRelationship:
    'The information on this website is for general information purposes only and is not legal advice. Contacting Hoffman Legal does not create an attorney-client relationship. An attorney-client relationship is formed only after a conflict check and a signed engagement agreement. Past results do not guarantee a similar outcome.',
} as const;

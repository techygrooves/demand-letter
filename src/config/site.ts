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
    'Attorney-prepared demand letters for a $500 flat fee. Hoffman Legal drafts and signs firm demand letters for unpaid debts, contract breaches, deposits, property damage and other Florida civil disputes.',
  locale: 'en_US',
  /** Image path (from /public) for social sharing previews. */
  ogImage: '/og-image.png',
} as const;

export const offer = {
  price: 500,
  priceDisplay: '$500',
  priceLabel: 'Flat fee',
  /** Shown beneath the price. Keep it accurate to the engagement terms. */
  priceNote: 'One attorney-prepared demand letter. No hourly billing.',
  /** The four headline promises shown in the hero. */
  highlights: [
    '$500 flat fee',
    'Attorney-prepared demand letter',
    'Individualized to your dispute',
    'Professional Hoffman Legal letterhead',
  ],
  /** Short list used on the pricing card. */
  included: [
    'Attorney review of your facts and supporting documents',
    'A demand letter written for your specific dispute',
    'Prepared on Hoffman Legal letterhead',
    'Signed by attorney David Hoffman',
    'A clear demand and a deadline to respond',
    'A copy of the final letter for your records',
  ],
  /** Detailed breakdown used in the "What's included" section. */
  includedDetail: [
    {
      icon: 'search',
      title: 'Attorney review of your matter',
      text: 'Your facts, timeline and supporting documents are reviewed by a Florida attorney before anything is written.',
    },
    {
      icon: 'pen',
      title: 'Individualized drafting',
      text: 'Your letter is written for your dispute. It is not a fill-in-the-blank template with your name added.',
    },
    {
      icon: 'letter',
      title: 'Hoffman Legal letterhead',
      text: 'The letter is issued on professional law firm letterhead, signaling that you have legal representation.',
    },
    {
      icon: 'signature',
      title: 'Attorney signature',
      text: 'Attorney David Hoffman signs the final letter, putting the weight of a law firm behind your position.',
    },
    {
      icon: 'target',
      title: 'A specific, reasonable demand',
      text: 'The letter states exactly what you are asking for and sets a clear deadline for the recipient to respond.',
    },
    {
      icon: 'file',
      title: 'A copy for your records',
      text: 'You receive a copy of the final letter, creating a written record of your demand.',
    },
  ],
  /** What the flat fee does not cover. */
  excluded:
    'The flat fee covers one demand letter. Lawsuits, court filings, extended negotiations and other representation are not included. If your matter needs more, we will discuss options and any additional fees with you before any further work begins.',
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
 * Process steps. Avoid promising specific turnaround times here; timing is
 * discussed with each client after review.
 */
export const steps = [
  {
    title: 'Get started',
    text: 'Tell us what happened, who is involved, what you are owed and what outcome you want.',
  },
  {
    title: 'Attorney review',
    text: 'David Hoffman reviews your information and documents to confirm a demand letter is a suitable next step.',
  },
  {
    title: 'Drafting',
    text: 'Your letter is drafted for your specific dispute, states your position clearly and requests a specific resolution.',
  },
  {
    title: 'Signed and sent',
    text: 'The final letter is signed on Hoffman Legal letterhead and sent to the other party, and you receive a copy.',
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

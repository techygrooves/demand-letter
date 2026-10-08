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
  included: [
    'Review of your facts and supporting documents by a Florida attorney',
    'A persuasive demand letter drafted for your specific dispute',
    'Prepared on Hoffman Legal letterhead and signed by the attorney',
    'Clear deadline and next steps stated to the recipient',
    'Delivery to the opposing party',
    'A copy of the final letter for your records',
  ],
} as const;

/** Types of civil disputes promoted on the site. Order = display order. */
export const disputeTypes = [
  {
    icon: 'invoice',
    title: 'Unpaid Invoices & Debts',
    text: 'Money owed for work performed, goods delivered or personal loans that were never repaid.',
  },
  {
    icon: 'contract',
    title: 'Breach of Contract',
    text: 'A party failed to perform under a written or verbal agreement and you have suffered a loss.',
  },
  {
    icon: 'home',
    title: 'Security Deposits & Leases',
    text: 'Landlord and tenant disputes, including wrongfully withheld deposits and lease violations.',
  },
  {
    icon: 'tools',
    title: 'Contractor Disputes',
    text: 'Incomplete, defective or abandoned work by contractors, builders and service providers.',
  },
  {
    icon: 'shield',
    title: 'Property Damage',
    text: 'Damage to your vehicle, home or belongings caused by another person or business.',
  },
  {
    icon: 'cart',
    title: 'Consumer & Business Disputes',
    text: 'Refund refusals, defective products and business-to-business payment disputes.',
  },
] as const;

export const steps = [
  {
    title: 'Tell us about your dispute',
    text: 'Share the essential facts, the amount at issue and any documents that support your position.',
  },
  {
    title: 'Attorney review',
    text: 'David Hoffman reviews your matter to confirm it is suitable for a demand letter.',
  },
  {
    title: 'Letter drafted and signed',
    text: 'Your demand letter is prepared on firm letterhead, tailored to your facts and signed by the attorney.',
  },
  {
    title: 'Demand delivered',
    text: 'The letter is sent to the other party with a firm deadline to resolve the matter.',
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
  primary: { label: 'Get Started for $500', href: '/get-started/' },
  short: { label: 'Get Started', href: '/get-started/' },
} as const;

/** Florida attorney-advertising and website disclaimers shown in the footer. */
export const disclaimers = {
  advertising:
    'The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.',
  noRelationship:
    'The information on this website is for general information purposes only and is not legal advice. Contacting Hoffman Legal does not create an attorney-client relationship. An attorney-client relationship is formed only after a conflict check and a signed engagement agreement. Past results do not guarantee a similar outcome.',
} as const;

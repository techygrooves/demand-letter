/**
 * FAQ content. Review with the attorney before launch.
 *
 * Rules for this copy: no promised results, delivery times or legal remedies;
 * scope and payment language must match `offer` in src/config/site.ts.
 *
 * Tags choose where an item appears in addition to /faq/:
 *   featured → home page, pricing → /pricing/, process → /how-it-works/
 */

export interface FaqLink {
  label: string;
  href: string;
}

export interface FaqItem {
  /** Stable anchor id, e.g. /faq/#cost */
  id: string;
  question: string;
  /** One or more paragraphs. */
  answer: string[];
  /** Optional bullet list shown after the first paragraph. */
  list?: string[];
  links?: FaqLink[];
  featured?: boolean;
  pricing?: boolean;
  process?: boolean;
}

export const faqs: FaqItem[] = [
  {
    id: 'what-is-a-demand-letter',
    featured: true,
    question: 'What is a demand letter?',
    answer: [
      'A demand letter is a formal written request sent to a person or business you are in a dispute with. It explains the relevant facts, states your position and asks for a specific resolution, such as payment, a refund, a repair or performance under an agreement, usually by a stated date.',
      'When a demand letter is prepared by an attorney and issued on law firm letterhead, it shows the other party that you are taking the matter seriously and have sought legal counsel.',
    ],
  },
  {
    id: 'cost',
    featured: true,
    pricing: true,
    question: 'How much does a demand letter cost?',
    answer: [
      'The fee is a flat $500 for one attorney-prepared demand letter in a matter that has been reviewed and accepted for this service. There is no hourly billing for the standard service.',
      'There is no charge to submit a request. Payment is requested only after your matter has been reviewed, accepted and you have received the engagement terms. Any work outside the standard service is quoted separately and only undertaken by agreement.',
    ],
    links: [{ label: 'See pricing details', href: '/pricing/' }],
  },
  {
    id: 'whats-included',
    featured: true,
    pricing: true,
    question: 'What is included in the $500 fee?',
    answer: [
      'The standard service includes:',
      'The exact scope of the representation is set out in the engagement agreement you sign. Litigation, settlement negotiations, additional letters and extensive investigation are not included and may require a separate engagement.',
    ],
    list: [
      'One attorney-prepared demand letter',
      'Individualized review of your dispute',
      'Preparation on professional Hoffman Legal letterhead',
      'A clear statement of your requested resolution',
    ],
    links: [{ label: 'Compare the standard service and additional work', href: '/pricing/#scope' }],
  },
  {
    id: 'avoid-a-lawsuit',
    featured: true,
    question: 'Can a demand letter help avoid a lawsuit?',
    answer: [
      'It may. A demand letter gives the other party a formal opportunity to resolve the dispute before anyone goes to court, and some disputes are resolved at this stage.',
      'However, no one can guarantee how the other party will respond. A demand letter does not prevent either side from filing a lawsuit, and it is not a substitute for legal action if legal action becomes necessary.',
    ],
  },
  {
    id: 'qualifying-disputes',
    featured: true,
    question: 'What types of disputes qualify?',
    answer: [
      'Hoffman Legal considers demand letters for a range of civil disputes, for example unpaid debts, breach of contract, landlord-tenant and property disputes, consumer complaints, business and contractor disputes, and certain employment-related and insurance or reimbursement matters.',
      'These are examples only. Every matter is subject to attorney assessment, and criminal defense, contested litigation and specialized claims are not included in the $500 fee.',
    ],
    links: [{ label: 'View types of disputes', href: '/disputes/' }],
  },
  {
    id: 'ignored-letter',
    question: 'What if the other party ignores the letter?',
    answer: [
      'If the other party does not respond, or refuses your request, you can consider your next steps. Depending on the situation, these may include further negotiation, small claims court or other legal action. That work is not part of the $500 service and would require a separate engagement.',
      'Please keep in mind that sending a demand letter does not stop, pause or extend a statute of limitations or any other legal deadline. If a deadline may be approaching, tell us right away and consider seeking legal advice promptly.',
    ],
  },
  {
    id: 'court-proceedings',
    featured: true,
    pricing: true,
    question: 'Does the $500 fee cover court proceedings?',
    answer: [
      'No. The $500 fee covers one demand letter. It does not include filing or defending a lawsuit, small claims representation, court appearances, settlement negotiations or other litigation work.',
      'If your matter later requires additional work, the scope and fees would be discussed with you and set out in a separate engagement agreement before any further work begins.',
    ],
  },
  {
    id: 'against-a-business',
    question: 'Can I request a demand letter against a business?',
    answer: [
      'Yes. A demand letter can be directed to an individual or to a business, such as a company, contractor, landlord, vendor or service provider. If you can, provide the business’s correct legal name and address.',
      'As with every request, the matter is subject to attorney review, including a conflict check. Claims against government agencies can involve special notice rules and may not be suitable for this service.',
    ],
  },
  {
    id: 'information-to-provide',
    process: true,
    question: 'What information should I provide?',
    answer: ['A short, factual summary is enough to begin. It helps to include:'],
    list: [
      'Your contact details',
      'The name and, if known, the address of the person or business you have a dispute with',
      'A brief timeline of what happened, including key dates',
      'The amount in dispute, if any, and the resolution you are seeking',
      'Any upcoming deadline or court date',
    ],
    links: [{ label: 'Start your request', href: '/get-started/' }],
  },
  {
    id: 'how-long',
    process: true,
    question: 'How long does the process take?',
    answer: [
      'Timing depends on the details of your dispute and on how quickly the information and documents needed are available. After your request is reviewed, we will let you know whether the matter is accepted and what to expect.',
      'We do not promise a specific turnaround time. If you have an upcoming deadline or court date, please say so in your request and do not rely on this service to meet it.',
    ],
  },
  {
    id: 'attorney-client-relationship',
    featured: true,
    process: true,
    question: 'Does submitting the form create an attorney-client relationship?',
    answer: [
      'No. Submitting the form, calling or emailing the firm does not create an attorney-client relationship. A relationship is formed only if your matter is accepted, a conflict check is completed and you sign an engagement agreement.',
      'Until then, Hoffman Legal does not represent you. Please do not send confidential or highly sensitive information until you are asked to, and do not delay taking action on any legal deadline.',
    ],
  },
  {
    id: 'not-suitable',
    process: true,
    question: 'What if my matter is not suitable for this service?',
    answer: [
      'Not every dispute is a good fit for a fixed-fee demand letter. For example, a matter may be too complex, too urgent, already in litigation, outside Florida or in a specialized area of law. If your matter is not suitable, we will let you know, and you will not be charged for the review of your request.',
      'Where appropriate, we may discuss whether Hoffman Legal can help in another way, or you may wish to consult another attorney. Either way, do not delay in protecting your rights, because legal deadlines may apply.',
    ],
  },
];

/** Plain-text answer for structured data. */
export const faqPlainText = (item: FaqItem) =>
  [item.answer[0], ...(item.list ?? []), ...item.answer.slice(1)].join(' ');

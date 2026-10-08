import type { FaqItem } from '@/components/FaqList.astro';

/**
 * FAQ copy. Review with the attorney before launch.
 * Scope and payment language must match `offer` in src/config/site.ts.
 *
 * `featured` items appear on the home page; `pricing` items on /pricing/;
 * `process` items on /how-it-works/; all items appear on /faq/.
 */
export const faqs: (FaqItem & { featured?: boolean; pricing?: boolean; process?: boolean })[] = [
  {
    featured: true,
    question: 'What is a demand letter?',
    answer:
      'A demand letter is a formal written notice sent to the person or business you are in a dispute with. It communicates your position, requests a specific resolution, such as payment, a refund or performance under an agreement, and may help resolve the dispute without immediately filing a lawsuit.',
  },
  {
    featured: true,
    question: 'Why should an attorney prepare my demand letter?',
    answer:
      'A letter prepared by an attorney and issued on law firm letterhead shows the other party that you are serious and have legal counsel. An attorney can also present the facts in a measured, professional way and clearly state the resolution you are requesting.',
  },
  {
    featured: true,
    pricing: true,
    question: 'What does the $500 fee include?',
    answer:
      'The standard service includes one attorney-prepared demand letter, an individualized review of your dispute, preparation on professional Hoffman Legal letterhead and a clear statement of your requested resolution. There is no hourly billing for the standard service.',
  },
  {
    pricing: true,
    question: 'What is not included in the $500 fee?',
    answer:
      'Litigation, settlement negotiations, additional letters and extensive investigation are not part of the standard service and may require a separate engagement. If your matter needs more, we will explain the options and any additional fees before any further work begins.',
  },
  {
    featured: true,
    pricing: true,
    process: true,
    question: 'Do I have to pay to submit a request?',
    answer:
      'No. Submitting a request is free. The attorney first reviews your matter to determine whether it is suitable for the $500 fixed-fee service. Payment is requested only after your matter is accepted and you have received the engagement terms.',
  },
  {
    pricing: true,
    process: true,
    question: 'How does payment work?',
    answer:
      'If your matter is accepted, you will receive the engagement terms and a secure way to pay the $500 fee. Representation begins only after the engagement agreement is signed and payment is received.',
  },
  {
    process: true,
    question: 'What if my matter is not accepted?',
    answer:
      'Not every dispute is a good fit for a fixed-fee demand letter. If your matter is not suitable, we will let you know. You will not be charged for the review of your request.',
  },
  {
    featured: true,
    question: 'Will a demand letter resolve my dispute?',
    answer:
      'No attorney can guarantee how another party will respond. A demand letter gives the other side a formal opportunity to resolve the matter and may help you avoid immediately filing a lawsuit, but some disputes require further action.',
  },
  {
    featured: true,
    question: 'What types of disputes do you handle?',
    answer:
      'Hoffman Legal prepares demand letters for many kinds of civil disputes, including unpaid invoices, money owed, breach of contract, security deposits, contractor disputes, property damage, consumer disputes and business-to-business disputes. Each matter is reviewed to confirm a demand letter is appropriate.',
  },
  {
    featured: true,
    process: true,
    question: 'How long does it take?',
    answer:
      'Timing depends on the complexity of your dispute and how quickly we receive the information and documents we need. After reviewing your matter, we will let you know what to expect.',
  },
  {
    question: 'What happens if the other party ignores the letter?',
    answer:
      'You can decide on next steps, which may include small claims court or other legal action. Representation beyond the demand letter is not included in the $500 fee and would require a separate engagement, but we can discuss your options.',
  },
  {
    question: 'Do I need to be in Florida?',
    answer:
      'This service focuses on disputes governed by Florida law or involving parties in Florida. If you are unsure whether your matter qualifies, contact us before getting started.',
  },
  {
    process: true,
    question: 'What information should I have ready?',
    answer:
      'It helps to have the names and contact information of the parties involved, a brief timeline of what happened, the amount or outcome you are seeking, and any supporting documents such as contracts, invoices, receipts, photos or messages.',
  },
  {
    question: 'Does contacting Hoffman Legal make you my attorney?',
    answer:
      'No. Representation is subject to a signed engagement agreement, and an attorney-client relationship is formed only after a conflict check and a signed agreement. Please do not send confidential information until you are asked to do so.',
  },
];

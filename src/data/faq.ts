import type { FaqItem } from '@/components/FaqList.astro';

/**
 * Draft FAQ copy. Review with the attorney before launch.
 * `featured` items also appear on the home page.
 */
export const faqs: (FaqItem & { featured?: boolean })[] = [
  {
    featured: true,
    question: 'What is a demand letter?',
    answer:
      'A demand letter is a formal written request that another party pay money owed, perform an obligation or stop specific conduct by a stated deadline. A letter from an attorney shows that you are serious and have legal representation.',
  },
  {
    featured: true,
    question: 'What does the $500 flat fee include?',
    answer:
      'The flat fee covers attorney review of your facts and documents, drafting a demand letter tailored to your dispute, preparation on Hoffman Legal letterhead with the attorney’s signature, and delivery to the other party. There is no hourly billing for the letter.',
  },
  {
    featured: true,
    question: 'What types of disputes do you handle?',
    answer:
      'Hoffman Legal prepares demand letters for a wide range of civil disputes, including unpaid invoices and loans, breach of contract, security deposits, contractor disputes, property damage and consumer or business disputes. Each matter is reviewed to confirm it is suitable for a demand letter.',
  },
  {
    featured: true,
    question: 'Do I need to live in Florida?',
    answer:
      'Our demand letter service is focused on disputes governed by Florida law or involving parties in Florida. If you are unsure whether your matter qualifies, contact us before getting started.',
  },
  {
    question: 'Is a demand letter guaranteed to work?',
    answer:
      'No attorney can guarantee how another party will respond. A well-prepared demand letter often prompts payment or negotiation, but some disputes require further action. If your matter needs more than a letter, we can discuss options with you.',
  },
  {
    question: 'Does contacting you make you my attorney?',
    answer:
      'No. An attorney-client relationship is formed only after a conflict check and a signed engagement agreement. Please do not send confidential information until you are asked to do so.',
  },
  {
    question: 'What happens if the other party ignores the letter?',
    answer:
      'If the deadline passes without a satisfactory response, you can decide on next steps, which may include small claims court or other legal action. Additional representation beyond the demand letter is not included in the flat fee.',
  },
];

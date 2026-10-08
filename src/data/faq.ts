import type { FaqItem } from '@/components/FaqList.astro';

/**
 * FAQ copy. Review with the attorney before launch.
 * `featured` items appear on the home page; all items appear on /faq/.
 */
export const faqs: (FaqItem & { featured?: boolean })[] = [
  {
    featured: true,
    question: 'What is a demand letter?',
    answer:
      'A demand letter is a formal written notice sent to the person or business you are in a dispute with. It explains your position, requests a specific resolution, such as payment, a refund or performance under an agreement, and sets a deadline to respond.',
  },
  {
    featured: true,
    question: 'Why should an attorney prepare my demand letter?',
    answer:
      'A letter prepared by an attorney and issued on law firm letterhead shows the other party that you are serious and have legal counsel. An attorney can also present the facts in a measured, professional way and make a clear, specific demand.',
  },
  {
    featured: true,
    question: 'What does the $500 flat fee include?',
    answer:
      'The flat fee includes attorney review of your facts and documents, an individualized demand letter drafted for your dispute, preparation on Hoffman Legal letterhead, the attorney’s signature and a copy of the final letter for your records. There is no hourly billing for the letter.',
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
    question: 'How long does it take?',
    answer:
      'Timing depends on the complexity of your dispute and how quickly we receive the information and documents we need. After reviewing your matter, we will let you know what to expect.',
  },
  {
    featured: true,
    question: 'What happens if the other party ignores the letter?',
    answer:
      'If the deadline passes without a satisfactory response, you can decide on next steps, which may include small claims court or other legal action. Representation beyond the demand letter is not included in the flat fee, but we can discuss your options.',
  },
  {
    question: 'Do I need to be in Florida?',
    answer:
      'This service focuses on disputes governed by Florida law or involving parties in Florida. If you are unsure whether your matter qualifies, contact us before getting started.',
  },
  {
    question: 'What information should I have ready?',
    answer:
      'It helps to have the names and contact information of the parties involved, a brief timeline of what happened, the amount or outcome you are seeking, and any supporting documents such as contracts, invoices, receipts, photos or messages.',
  },
  {
    question: 'Does contacting Hoffman Legal make you my attorney?',
    answer:
      'No. An attorney-client relationship is formed only after a conflict check and a signed engagement agreement. Please do not send confidential information until you are asked to do so.',
  },
];

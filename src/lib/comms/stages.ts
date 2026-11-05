/**
 * Client email templates, one per stage of a demand-letter matter.
 *
 * Every template is a draft for the attorney to read, edit and send. Nothing
 * here sends mail. The wording is deliberately constrained:
 *
 *  - No turnaround times, delivery dates or outcome predictions. The website
 *    makes no such promise and neither should an email.
 *  - No legal advice, and no statement that a deadline is or is not met.
 *  - Before acceptance, nothing that implies an attorney-client relationship
 *    or asks for payment. The site promises that no payment is required to
 *    submit a request and that suitability is reviewed first.
 *  - Scope language matches `offer` in `src/config/site.ts`: one letter,
 *    $500, anything further by separate agreement.
 *
 * Keep it that way. If the firm wants to promise something new, change
 * `src/config/site.ts` first so the site and these emails cannot disagree.
 */
import { barLookupUrl, firm, offer } from '@/config/site';
import {
  disputeDescription,
  greetingName,
  type DeclineReason,
  type Matter,
} from './matter';

/** A paragraph, or a bulleted list. */
export type Block = string | { list: string[] };

export interface Draft {
  subject: string;
  blocks: Block[];
  /** What the attorney must confirm before this draft goes out. */
  checklist: string[];
}

export interface Stage {
  id: string;
  /** One line describing when this email is sent. */
  when: string;
  /** Matter fields this stage cannot be rendered without. */
  requires: (keyof Matter)[];
  build: (matter: Matter) => Draft;
}

const signingAttorney = (matter: Matter) => matter.attorney ?? firm.attorney;

const subjectFor = (matter: Matter, headline: string) => `${headline} — ref ${matter.reference}`;

/** Shared closing offer to talk. Used by most stages. */
const reachUs = `If anything above is wrong or incomplete, or you would rather talk it through, reply to this email or call ${firm.phone.display}.`;

/* ------------------------------------------------------------------ *
 * Before acceptance: no engagement, no payment, no advice.
 * ------------------------------------------------------------------ */

const inquiryReceived: Stage = {
  id: 'inquiry-received',
  when: 'Immediately after the intake form is submitted.',
  requires: [],
  build: (matter) => ({
    subject: subjectFor(matter, 'We have your demand letter request'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `Thank you for contacting ${firm.name}. We have received your request about ${disputeDescription(matter)} and it is with ${signingAttorney(matter)} for review.`,
      `The next step is ours. ${signingAttorney(matter)} will review what you have told us, run a conflict check and decide whether your matter is suitable for the ${offer.priceDisplay} fixed-fee demand letter service. We will come back to you either way, and we may have follow-up questions first.`,
      'Two things to keep in mind in the meantime:',
      {
        list: [
          `${offer.payment.noUpfront} ${offer.payment.suitability}`,
          'Sending us this request does not make us your attorney. An attorney-client relationship begins only after the matter is accepted, a conflict check is completed and you sign an engagement agreement.',
          'If there is a court date, a contractual notice period or any other deadline approaching in your matter, tell us now by reply or by phone. A deadline does not wait for our review.',
        ],
      },
      'Please do not send Social Security numbers, bank account numbers or card numbers by email.',
      reachUs,
    ],
    checklist: [
      'Confirm the dispute and opposing party read back correctly.',
      'Check the intake for a deadline the client flagged; if there is one, handle it before sending a routine acknowledgement.',
    ],
  }),
};

const informationRequested: Stage = {
  id: 'information-requested',
  when: 'During review, when the attorney needs more before deciding on suitability.',
  requires: ['questions'],
  build: (matter) => ({
    subject: subjectFor(matter, 'A few questions about your demand letter request'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `${signingAttorney(matter)} has started reviewing your request about ${disputeDescription(matter)}. Before deciding whether the matter is suitable for the ${offer.priceDisplay} fixed-fee service, we need a little more from you:`,
      { list: matter.questions ?? [] },
      'Short answers are fine. If you have documents that show what you have described — a contract, invoices, a lease, texts or emails, photographs, receipts — attaching them helps more than a long explanation.',
      `We are still at the review stage, so nothing has been agreed and no payment is due. ${offer.payment.suitability}`,
      reachUs,
    ],
    checklist: [
      'Every question is one the suitability decision actually turns on.',
      'No question asks for a Social Security, bank or card number.',
      'Nothing in the questions reads as advice about what the client should do.',
    ],
  }),
};

const DECLINE_WORDING: Record<DeclineReason, string> = {
  'outside-scope':
    `after reviewing it, this matter is not one we can take on as a ${offer.priceDisplay} fixed-fee demand letter`,
  conflict:
    'our conflict check means we are not able to act for you in this matter',
  'needs-litigation':
    `this matter needs more than the one demand letter the ${offer.priceDisplay} service covers`,
  'outside-florida':
    `this matter is not connected closely enough to Florida for us to handle it. ${firm.name} is a Florida law firm and this service is focused on Florida disputes`,
  'insufficient-information':
    'we do not have enough information to assess this matter, and we are closing our file rather than leaving your request open',
  other: 'we are not able to take on this matter',
};

const declined: Stage = {
  id: 'declined',
  when: 'When the matter is not accepted, for any reason.',
  requires: ['declineReason'],
  build: (matter) => {
    const reason = DECLINE_WORDING[(matter.declineReason ?? 'other') as DeclineReason];
    return {
      subject: subjectFor(matter, 'Your demand letter request'),
      blocks: [
        `Dear ${greetingName(matter)},`,
        `Thank you for telling us about ${disputeDescription(matter)}, and for your patience while we reviewed it. I am writing to let you know that ${reason}.`,
        ...(matter.declineNote ? [matter.declineNote] : []),
        'I want to be clear about what this does and does not mean:',
        {
          list: [
            'We are not your attorneys and we have not advised you on this dispute. No attorney-client relationship was created.',
            'This is not an opinion that your claim is weak or that you should not pursue it. It only means this matter is not a fit for this particular fixed-fee service.',
            'Any legal deadline in your matter is still running. A statute of limitations, a notice period in your contract or a court date is unaffected by our review, and some are short.',
            'You have been charged nothing.',
          ],
        },
        `Because of that third point, I would encourage you to speak with another attorney promptly rather than waiting. The Florida Bar keeps a public directory of its members at ${barLookupUrl}, and also runs a lawyer referral service, which is a reasonable place to start if you do not have someone in mind.`,
        `If you think we have misunderstood something important about your matter, you are welcome to reply and tell me. Otherwise we will close our file and will not keep working on this.`,
      ],
      checklist: [
        'The reason stated matches the real reason, and does not hint at a view on the merits.',
        'If this is a conflict declination, say nothing beyond the fact of the conflict.',
        'The client has not been charged, and any intake payment link already sent has been withdrawn.',
        'Deadline warning is present and the client has not been told whether any particular deadline is met.',
        'Close the file in the firm’s own records after sending.',
      ],
    };
  },
};

/* ------------------------------------------------------------------ *
 * Acceptance and engagement.
 * ------------------------------------------------------------------ */

const accepted: Stage = {
  id: 'accepted',
  when: 'The matter is accepted: engagement agreement and payment request go out.',
  requires: ['paymentLink'],
  build: (matter) => ({
    subject: subjectFor(matter, `Your demand letter: engagement agreement and ${offer.priceDisplay} fee`),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `Good news. ${signingAttorney(matter)} has reviewed ${disputeDescription(matter)} and we are able to take it on as a ${offer.priceDisplay} fixed-fee demand letter.`,
      'There are two steps to complete, and the work begins once both are done:',
      {
        list: [
          'Read and sign the engagement agreement attached to this email. It sets out the scope of the work and is what makes us your attorneys for this matter.',
          `Pay the ${offer.priceDisplay} flat fee here: ${matter.paymentLink}`,
        ],
      },
      `Please read the engagement agreement rather than skimming it, because it, and not this email or our website, governs what we are doing for you. In short: the fee covers one attorney-prepared demand letter about this dispute, individualized to your facts and issued on ${firm.legalName} letterhead, stating the resolution you are asking for.`,
      'What it does not cover is just as important:',
      {
        list: offer.additionalWork.map((item) => `${item.title}. ${item.text}`),
      },
      `${offer.additionalWorkNote}`,
      'I cannot tell you how the other side will react. No attorney can. A demand letter is a serious, professional statement of your position, and it often prompts a response where phone calls and messages have not — but the outcome is not something we are able to promise.',
      'Sending the letter also does not stop or extend any legal deadline in your matter. If a deadline is close, tell me now.',
      reachUs,
    ],
    checklist: [
      'Conflict check completed and recorded.',
      'The engagement agreement is attached, and its scope matches what this email describes.',
      'The payment link is the correct one for this client and this fee.',
      'The description of the dispute is accurate enough to define the scope of the letter.',
      'No turnaround date or predicted outcome has been added.',
    ],
  }),
};

const paymentReceived: Stage = {
  id: 'payment-received',
  when: 'The signed engagement agreement and the fee have both arrived.',
  requires: [],
  build: (matter) => ({
    subject: subjectFor(matter, 'Payment received — your demand letter is in preparation'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `Thank you. We have your signed engagement agreement and your ${offer.priceDisplay} payment, and ${signingAttorney(matter)} is now preparing your demand letter about ${disputeDescription(matter)}.`,
      'You do not need to do anything else at this point. I will come back to you with the draft letter so that you can check the facts in it before it goes anywhere.',
      'If you come across any further documents, or if anything changes — the other side gets in touch, makes a payment, or you receive anything in writing from them — send it to me rather than replying to them yourself.',
      reachUs,
    ],
    checklist: [
      'Payment has actually cleared, not merely been initiated.',
      'The signed engagement agreement is on file.',
      'No delivery date for the draft has been added.',
    ],
  }),
};

/* ------------------------------------------------------------------ *
 * The letter.
 * ------------------------------------------------------------------ */

const draftForReview: Stage = {
  id: 'draft-for-review',
  when: 'The draft letter goes to the client to confirm the facts.',
  requires: [],
  build: (matter) => ({
    subject: subjectFor(matter, 'Draft demand letter for your review'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `The draft demand letter to ${matter.opposingParty} is attached. Please read it carefully before I issue it.`,
      'I am asking you to check the facts, not the legal wording. In particular:',
      {
        list: [
          ...(matter.reviewPoints ?? []),
          'Names, addresses and dates are correct and spelled as they appear in your documents.',
          'The amounts are right, and match your records.',
          'The account of what happened is accurate, and nothing important has been left out.',
          'The resolution the letter asks for is the one you actually want.',
        ],
      },
      `A demand letter has to be something you can stand behind, so if a sentence overstates what you can show, tell me and I will change it. If something is missing, tell me that too.`,
      'Reply with any corrections, or reply to confirm it is accurate and I will issue it.',
      reachUs,
    ],
    checklist: [
      'The draft letter is attached, and it is the current version.',
      'Every factual assertion in the letter is traceable to something the client provided.',
      'Any amount, date or deadline in the letter has been checked against the documents.',
      'The letter does not threaten anything the firm is not instructed and prepared to do.',
    ],
  }),
};

const letterSent: Stage = {
  id: 'letter-sent',
  when: 'The letter has been issued to the opposing party.',
  requires: ['deliveryMethod'],
  build: (matter) => ({
    subject: subjectFor(matter, 'Your demand letter has been sent'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `Your demand letter to ${matter.opposingParty} was issued today by ${matter.deliveryMethod}. A copy is attached for your records.`,
      ...(matter.responseDeadline
        ? [`The letter asks for a response by ${matter.responseDeadline}.`]
        : []),
      'From here, a few points of practical advice:',
      {
        list: [
          'Send anything you receive from the other side to me rather than responding yourself, including a phone call you were not expecting. What you say now can matter later.',
          'Keep your documents together and keep a note of any contact, with dates.',
          'If a payment arrives, tell me — particularly if it is less than the full amount, or arrives with conditions attached.',
        ],
      },
      `This completes the ${offer.priceDisplay} fixed-fee service, which covers the one demand letter. ${offer.additionalWorkNote}`,
      'I cannot say how the other side will respond, and silence is a common outcome rather than an unusual one. If the date in the letter passes without a response, get in touch and we can talk about what your options are.',
      'Sending this letter has not changed any legal deadline in your matter.',
      reachUs,
    ],
    checklist: [
      'The letter has genuinely gone out, by the method named here.',
      'The delivery method and any response date match the letter as issued.',
      'A copy of the issued letter is attached.',
      'Proof of mailing or delivery is saved to the file.',
      'The email makes clear that the fixed-fee scope ends here.',
    ],
  }),
};

/* ------------------------------------------------------------------ *
 * After the letter.
 * ------------------------------------------------------------------ */

const deadlinePassed: Stage = {
  id: 'deadline-passed',
  when: 'The response date in the letter has passed with no reply.',
  requires: [],
  build: (matter) => ({
    subject: subjectFor(matter, 'No response to your demand letter — your options'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `${matter.responseDeadline ? `The date your demand letter gave ${matter.opposingParty} to respond — ${matter.responseDeadline} — has passed` : `The date your demand letter gave ${matter.opposingParty} to respond has passed`}, and as far as I am aware nothing has come back. If you have heard from them directly, tell me, because that changes the picture.`,
      'Assuming not, here is where things stand. A demand letter that goes unanswered is not a wasted step: you now have a documented, dated demand on attorney letterhead, which is useful if this goes further. But it does mean a decision about whether to press on.',
      ...(matter.nextSteps?.length
        ? ['The options I would want to discuss with you:', { list: matter.nextSteps } as Block]
        : [
            'The usual options are to leave it, to pursue the claim in court, or to try a further approach to the other side. Which of those makes sense depends on the amount, the documents and whether the other side has anything worth recovering — so it is worth a conversation rather than an email.',
          ]),
      `Each of those would be new work beyond the one letter the ${offer.priceDisplay} fee covered, so it would need a separate agreement and we would tell you the fee before starting anything.`,
      'One thing I would not leave: if a limitation period applies to your claim, it has been running throughout and is not affected by the letter. If you are thinking of going to court, that is a reason not to sit on it.',
      `Let me know how you would like to proceed, or call ${firm.phone.display} and we can talk it through.`,
    ],
    checklist: [
      'The file has been checked for a response before saying none arrived.',
      'The response date quoted matches the letter as issued.',
      'No specific limitation period has been stated as applying, or not applying, without checking it.',
      'Any further work is described as a separate engagement with a fee quoted in advance.',
    ],
  }),
};

const responseReceived: Stage = {
  id: 'response-received',
  when: 'The opposing party or their attorney has replied.',
  requires: ['responseSummary'],
  build: (matter) => ({
    subject: subjectFor(matter, `Response from ${matter.opposingParty}`),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `We have heard back about ${disputeDescription(matter)}. In summary: ${matter.responseSummary}`,
      'A copy of what they sent is attached so that you can read it yourself rather than only my summary of it.',
      ...(matter.nextSteps?.length
        ? ['What I would suggest we consider:', { list: matter.nextSteps } as Block]
        : []),
      `Responding to this, negotiating with them or acting on anything they have offered is work beyond the one demand letter the ${offer.priceDisplay} fee covered. I am glad to take it on under a separate agreement, and I would quote you the fee before doing anything.`,
      'Please do not reply to them directly, and do not accept, cash or sign anything they have sent until we have spoken. An offer can carry conditions that matter more than the amount.',
      `If their letter mentions a date or a deadline, send it to me straight away. Call ${firm.phone.display} if it is urgent.`,
    ],
    checklist: [
      'The summary is accurate and neutral, and the response itself is attached.',
      'Any deadline in their response has been diarised.',
      'The client has not been advised to accept or reject anything in this email.',
      'Further work is described as a separate engagement with a fee quoted in advance.',
    ],
  }),
};

const matterClosed: Stage = {
  id: 'matter-closed',
  when: 'The engagement is concluded and the file is being closed.',
  requires: [],
  build: (matter) => ({
    subject: subjectFor(matter, 'Closing our file on your matter'),
    blocks: [
      `Dear ${greetingName(matter)},`,
      `This is to confirm that our work on ${disputeDescription(matter)} is complete and we are closing our file. The ${offer.priceDisplay} fixed fee covered the preparation and issuing of your demand letter, and that is done.`,
      ...(matter.note ? [matter.note] : []),
      'What that means from today:',
      {
        list: [
          `We are no longer acting for you on this matter, and we are not monitoring it, watching for a response or tracking any deadline in it.`,
          'Any legal deadline that applies to your claim continues to run, and it is now yours to keep track of. If you may want to go to court, that is worth attention sooner rather than later.',
          'Keep the copy of the demand letter and your documents. They are the record of the demand you made and when you made it.',
        ],
      },
      `If something changes and you want us to look at it again — a response arrives, or you decide to take the claim further — just get in touch. It would be a new engagement, and we would set out the scope and fee before starting.`,
      `It was good to work with you. If you have any questions about what we did, call ${firm.phone.display} or reply to this email.`,
    ],
    checklist: [
      'All work within the engagement really is finished.',
      'Nothing is outstanding on the firm’s side, including documents to return.',
      'The client has been told plainly that the firm is no longer monitoring deadlines.',
      'The file is closed in the firm’s own records.',
    ],
  }),
};

export const stages: Stage[] = [
  inquiryReceived,
  informationRequested,
  declined,
  accepted,
  paymentReceived,
  draftForReview,
  letterSent,
  deadlinePassed,
  responseReceived,
  matterClosed,
];

export const stageIds = stages.map((s) => s.id);

export const findStage = (id: string): Stage | undefined => stages.find((s) => s.id === id);

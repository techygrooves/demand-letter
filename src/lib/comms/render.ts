/**
 * Turns a matter and a stage into a plain-text email draft.
 *
 * The output is never sent. It is written to a file for the attorney to read,
 * edit and then send from the firm's own mail client, which keeps the sent
 * copy in the place the firm already keeps its correspondence.
 */
import { disclaimers, firm } from '@/config/site';
import { findStage, stageIds, type Block, type Stage } from './stages';
import { type Matter } from './matter';

export class RenderError extends Error {}

export interface RenderedEmail {
  stage: string;
  to: string;
  subject: string;
  /** The email body, ready to paste into a mail client. */
  body: string;
  /** Checks the attorney must make before sending. Not part of the body. */
  checklist: string[];
  /** The full file written to disk: review header, then the email. */
  document: string;
}

const WRAP = 78;

/** Hard-wraps a paragraph at `WRAP` columns without breaking words. */
export function wrap(text: string, width = WRAP, indent = ''): string {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length + indent.length > width && line) {
      lines.push(indent + line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(indent + line);
  return lines.join('\n');
}

/** "- item", with continuation lines indented under the text, not the dash. */
const bullet = (item: string): string =>
  `- ${wrap(item, WRAP - 2).split('\n').join('\n  ')}`;

const renderBlock = (block: Block): string =>
  typeof block === 'string' ? wrap(block) : block.list.map(bullet).join('\n');

function signature(matter: Matter): string {
  return [
    'Sincerely,',
    '',
    matter.attorney ?? firm.attorney,
    firm.legalName,
    firm.address.street,
    `${firm.address.city}, ${firm.address.region} ${firm.address.postalCode}`,
    firm.phone.display,
    firm.email,
  ].join('\n');
}

/** Stages sent before there is a signed engagement, and therefore no client. */
const PRE_ENGAGEMENT = ['inquiry-received', 'information-requested', 'declined'];

/*
 * The website's `disclaimers.noRelationship` says "this website", which is
 * wrong in an email. The substance is the same and deliberately so: the
 * footer must not be more generous than the site.
 */
const NO_RELATIONSHIP_EMAIL =
  'This email is not legal advice and does not create an attorney-client relationship. ' +
  `${firm.legalName} becomes your attorney only after the matter is accepted, a conflict ` +
  'check is completed and you sign an engagement agreement.';

const CONFIDENTIAL_EMAIL =
  'This email is intended only for the client named above and is not legal advice to anyone else. ' +
  'If you have received it in error, please tell us and delete it.';

/** The disclaimer every outgoing client email carries. */
function footer(stage: Stage): string {
  const relationship = PRE_ENGAGEMENT.includes(stage.id) ? NO_RELATIONSHIP_EMAIL : CONFIDENTIAL_EMAIL;
  return [wrap(relationship), wrap(disclaimers.results)].join('\n\n');
}

export function renderEmail(matter: Matter, stageId: string): RenderedEmail {
  const stage = findStage(stageId);
  if (!stage) {
    throw new RenderError(`Unknown stage "${stageId}". Available stages:\n  - ${stageIds.join('\n  - ')}`);
  }

  const missing = stage.requires.filter((field) => {
    const value = matter[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
  if (missing.length) {
    throw new RenderError(
      `Stage "${stage.id}" needs ${missing.map((f) => `"${f}"`).join(', ')} in the matter file.`,
    );
  }

  const draft = stage.build(matter);
  const body = [
    draft.blocks.map(renderBlock).join('\n\n'),
    signature(matter),
    '-'.repeat(WRAP),
    footer(stage),
  ].join('\n\n');

  const document = [
    '='.repeat(WRAP),
    'DRAFT — NOT SENT. Read, edit and send this yourself.',
    '='.repeat(WRAP),
    `Matter:  ${matter.reference}`,
    `Stage:   ${stage.id} (${stage.when})`,
    `To:      ${matter.clientName} <${matter.clientEmail}>`,
    `Subject: ${draft.subject}`,
    '',
    'Before sending, confirm:',
    ...draft.checklist.map((item) => wrap(`[ ] ${item}`, WRAP, '').replace(/\n/g, '\n     ')),
    '',
    '='.repeat(WRAP),
    '',
    body,
    '',
  ].join('\n');

  return {
    stage: stage.id,
    to: matter.clientEmail,
    subject: draft.subject,
    body,
    checklist: draft.checklist,
    document,
  };
}

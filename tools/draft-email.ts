/**
 * Drafts a client email for one stage of a demand-letter matter.
 *
 *   npm run draft -- --matter matters/2026-014.json --stage letter-sent
 *   npm run draft -- --list
 *   npm run draft -- --matter matters/2026-014.json --stage accepted --print
 *
 * Nothing is sent. The draft is written to `drafts/` (git-ignored) for the
 * attorney to read, edit and send. See docs/CLIENT-EMAILS.md.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MatterError, parseMatter } from '../src/lib/comms/matter.ts';
import { RenderError, renderEmail } from '../src/lib/comms/render.ts';
import { stages } from '../src/lib/comms/stages.ts';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface Options {
  matter?: string;
  stage?: string;
  out: string;
  list: boolean;
  print: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { out: join(REPO, 'drafts'), list: false, print: false, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) throw new Error(`${arg} needs a value.`);
      i += 1;
      return next;
    };

    switch (arg) {
      case '--matter': case '-m': options.matter = value(); break;
      case '--stage': case '-s': options.stage = value(); break;
      case '--out': case '-o': options.out = resolve(value()); break;
      case '--list': case '-l': options.list = true; break;
      case '--print': case '-p': options.print = true; break;
      case '--help': case '-h': options.help = true; break;
      default: throw new Error(`Unknown option "${arg}". Try --help.`);
    }
  }
  return options;
}

const USAGE = `
Draft a client email for a demand-letter matter. Nothing is sent.

  npm run draft -- --matter <file.json> --stage <stage-id>

Options
  -m, --matter <file>  Matter JSON. Keep these out of the repository, or in
                       the git-ignored matters/ directory.
  -s, --stage <id>     Which email to draft. See --list.
  -o, --out <dir>      Where to write the draft (default: drafts/).
  -p, --print          Also print the draft to the terminal.
  -l, --list           List the stages and what each one needs.
  -h, --help           This message.
`.trim();

function listStages(): void {
  console.log('Stages:\n');
  for (const stage of stages) {
    const needs = stage.requires.length ? `  (needs: ${stage.requires.join(', ')})` : '';
    console.log(`  ${stage.id.padEnd(24)}${stage.when}${needs}`);
  }
  console.log('\nEvery stage also needs: reference, clientName, clientEmail, disputeType, opposingParty.');
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) return console.log(USAGE);
  if (options.list) return listStages();

  if (!options.matter || !options.stage) {
    console.error('Both --matter and --stage are required.\n');
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  const matterPath = resolve(options.matter);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(matterPath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read ${matterPath}: ${(error as Error).message}`);
  }

  const matter = parseMatter(parsed);
  const email = renderEmail(matter, options.stage);

  const safeRef = matter.reference.replace(/[^A-Za-z0-9._-]+/g, '-');
  const stamp = new Date().toISOString().slice(0, 10);
  const file = join(options.out, `${safeRef}--${email.stage}--${stamp}.txt`);

  mkdirSync(options.out, { recursive: true });
  writeFileSync(file, email.document, 'utf8');

  if (options.print) console.log(`\n${email.document}`);

  console.log(`Draft written to ${file}`);
  console.log(`  To:      ${matter.clientName} <${email.to}>`);
  console.log(`  Subject: ${email.subject}`);
  console.log(`\n${email.checklist.length} item(s) to confirm before you send it. They are at the top of the file.`);
  console.log('Nothing has been sent.');
}

try {
  main();
} catch (error) {
  if (error instanceof MatterError || error instanceof RenderError) {
    console.error(error.message);
  } else {
    console.error((error as Error).message);
  }
  process.exitCode = 1;
}

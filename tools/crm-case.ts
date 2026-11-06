/**
 * Builds a Hoffman Legal Case Management import file that opens a demand
 * letter case, with the fee and the Drive folder link on it.
 *
 *   npm run crm -- --matter matters/2026-014.json
 *   npm run crm -- --matter matters/2026-014.json --fee 500 --sent 2026-11-05
 *
 * Then in the CRM: header → **Merge (add only)** → choose the file. That
 * import never edits or deletes anything that is already there, and skips
 * records whose id it already has, so importing twice is harmless.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MatterError, parseMatter, type Matter } from '../src/lib/comms/matter.ts';
import { CrmError, buildDemandCase, describeCase, standardFee } from '../src/lib/crm/demand-case.ts';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface Options {
  matter?: string;
  out: string;
  fee?: string;
  sent?: string;
  drive?: string;
  status?: string;
  allowUnpaid: boolean;
  print: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { out: join(REPO, 'drafts'), allowUnpaid: false, print: false, help: false };

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
      case '--out': case '-o': options.out = resolve(value()); break;
      case '--fee': case '-f': options.fee = value(); break;
      case '--sent': options.sent = value(); break;
      case '--drive': options.drive = value(); break;
      case '--status': options.status = value(); break;
      case '--allow-unpaid': options.allowUnpaid = true; break;
      case '--print': case '-p': options.print = true; break;
      case '--help': case '-h': options.help = true; break;
      default: throw new Error(`Unknown option "${arg}". Try --help.`);
    }
  }
  return options;
}

const USAGE = `
Build a CRM import file that opens a demand letter case.

  npm run crm -- --matter <file.json> [options]

Options
  -m, --matter <file>  Matter JSON (required)
  -f, --fee <amount>   Fee taken in, e.g. 500. Overrides "feePaid".
                       Use --fee ${standardFee} for the standard flat fee.
      --sent <date>    Date the letter went out, YYYY-MM-DD. The CRM counts
                       the fee in the month of this date.
      --drive <url>    Link to the client's Demand Letters folder in Drive.
      --status <s>     Active (default) or Closed.
      --allow-unpaid   Open a case with no fee recorded. A case is normally
                       opened only once the fee is paid in full.
  -o, --out <dir>      Where to write it (default: drafts/)
  -p, --print          Also print the JSON
  -h, --help           This message

Import it with **Merge (add only)** in the CRM header, never "Import
(replace all)". Merge is add-only and cannot damage existing records.
`.trim();

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return console.log(USAGE);

  if (!options.matter) {
    console.error('--matter is required.\n');
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

  const matter: Matter = parseMatter(parsed);

  // Command-line values win over the matter file, so one file serves a matter
  // as it moves along without being rewritten each time.
  const withOverrides: Matter = {
    ...matter,
    ...(options.fee !== undefined ? { feePaid: options.fee } : {}),
    ...(options.sent !== undefined ? { letterSentDate: options.sent } : {}),
    ...(options.drive !== undefined ? { driveUrl: options.drive } : {}),
    ...(options.status !== undefined ? { crmStatus: options.status } : {}),
  };

  const bundle = buildDemandCase(withOverrides, { allowUnpaid: options.allowUnpaid });
  const record = bundle.matters[0]!;
  const json = `${JSON.stringify(bundle, null, 2)}\n`;

  const safeRef = matter.reference.replace(/[^A-Za-z0-9._-]+/g, '-');
  const file = join(options.out, `crm-case--${safeRef}.json`);
  mkdirSync(options.out, { recursive: true });
  writeFileSync(file, json, 'utf8');

  if (options.print) console.log(`\n${json}`);

  console.log(`CRM import file written to ${file}\n`);
  for (const line of describeCase(record)) console.log(`  ${line}`);
  console.log('\nIn the CRM: Merge (add only) — not Import (replace all).');
  if (record.amountPaid === '') {
    console.log(`No fee recorded (--allow-unpaid). The firm rule is to open a case only once`);
    console.log(`the fee is paid in full: normally --fee ${standardFee}.`);
  }
  if (!record.driveUrl) {
    console.log('No Drive folder linked. Add --drive <url> to join the case to its folder.');
  }
}

try {
  main();
} catch (error) {
  if (error instanceof MatterError || error instanceof CrmError) {
    console.error(error.message);
  } else {
    console.error((error as Error).message);
  }
  process.exitCode = 1;
}

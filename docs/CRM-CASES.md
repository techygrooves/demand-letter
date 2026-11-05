# Opening a case in the CRM

`npm run crm` builds a file that opens a demand letter case in Hoffman Legal
Case Management, with the fee and the client's Drive folder on it.

```bash
npm run crm -- --matter matters/2026-014.json
npm run crm -- --matter matters/2026-014.json --fee 500 --sent 2026-11-05
```

Then in the CRM header: **Merge (add only)** → choose the file.

## Why a file and not an API

The CRM is a single-page app that keeps its data in `localStorage` in the
browser, with optional Firebase sync that you configure yourself by pasting a
`firebaseConfig` into Firm Settings. There is no server and no API to call, so
the only way in from outside the browser is its own backup format.

That turns out to be a good door rather than a poor one. **Merge (add only)**
is add-only by construction: records whose id already exists are skipped,
existing records are never edited or deleted, and it takes a snapshot before it
writes. Importing the same file twice changes nothing the second time.

**Use Merge (add only), never Import (replace all).** Replace does what it
says — it discards everything currently in the app.

## What it writes

A demand letter is a matter with `caseType: "Demand Letter"`. The file carries
one matter and every other collection empty:

| CRM field | From the matter file |
| --- | --- |
| `firstName`, `lastName` | `clientName`, split at the last word |
| `phone`, `email`, `address` | `clientPhone`, `clientEmail`, `clientAddress` |
| `recipient` | `opposingParty` |
| `dateSent` | `letterSentDate` (or `--sent`) |
| `amountPaid` | `feePaid` (or `--fee`) |
| `status` | `crmStatus`, default `Active` |
| `driveUrl` | `driveUrl` (or `--drive`) |
| `dateOpened`, `dateClosed` | same names, `dateOpened` defaults to today |
| `leadSource` | `leadSource`, e.g. `floridademandletter.com` |

`caseNumber`, `court`, `county`, `charges`, `arrestDate`, `referredBy`,
`prosecutor`, `emergency` and `billing` are written blank, exactly as the CRM's
own "New demand letter" form writes them.

## Where the money goes, and why it matters

**The fee goes in `amountPaid` on the matter. No `payments` record is
written.** This is not a shortcut.

The CRM has a `payments` collection and `billing.flatFee`/`retainer`/plan
fields, and they look like the obvious place for a fee. They are not: that
machinery drives the payment-plan logic for criminal and PI matters. The Demand
Letters screen reads revenue from `amountPaid`, counted in the month of
`dateSent`, falling back to `dateOpened`. A payment row written against a
demand matter would leave "Paid this month", "Paid this year", "Paid all time"
and "Average per letter" all showing nothing.

Two consequences:

- A fee with neither `letterSentDate` nor `dateOpened` would fall outside every
  month, so the tool refuses it.
- Record the fee when the money has actually arrived, not when it is requested.
  `amountPaid` means taken in.

## Options

| Option | Meaning |
| --- | --- |
| `-m, --matter <file>` | Matter JSON (required) |
| `-f, --fee <amount>` | Fee taken in: `500`, `$500`, `1,250.50` |
| `--sent <date>` | Date the letter went out, `YYYY-MM-DD` |
| `--drive <url>` | The client's Demand Letters folder |
| `--status <s>` | `Active` (default) or `Closed` |
| `-o, --out <dir>` | Where to write it (default `drafts/`) |
| `-p, --print` | Also print the JSON |

Command-line values override the matter file, so one matter file serves a case
as it moves along instead of being rewritten at each step:

```bash
# Case comes in — opened, no fee yet
npm run crm -- -m matters/2026-014.json

# Fee paid and letter issued
npm run crm -- -m matters/2026-014.json --fee 500 --sent 2026-11-05 \
  --drive https://drive.google.com/drive/folders/…
```

Because Merge skips ids it already has, a second import of the *same generated
file* is a no-op — but each run generates a **new** id, so re-running after the
fee arrives creates a second case rather than updating the first. Update an
existing case in the CRM itself; use this tool to open one.

## What it refuses

Rather than write a record that imports cleanly and then displays wrongly:

- a client name with no surname, which the CRM files by;
- a date that is not `YYYY-MM-DD`;
- a status other than `Active` or `Closed`, or `Closed` with no `dateClosed`;
- a `driveUrl` that is not `https://`;
- a fee it would have to guess at (`five hundred`, `500 USD`);
- a fee with no date to count it in.

## Verified against the live app

The generated file was imported into the deployed CRM in a throwaway browser
profile: it merges as one matter, appears on the Demand Letters screen with the
client, the recipient and the Drive link, and the $500 shows in "Paid this
month", "Paid this year", "Paid all time" and "Average per letter".

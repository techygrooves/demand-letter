# Client email drafts

A generator for the routine client emails in a demand-letter matter. It writes
a draft to a file. **It does not send anything, and it is not connected to a
mailbox.** You read the draft, edit it, and send it from your own mail client,
which keeps the sent copy where the firm already keeps its correspondence.

## Why drafts rather than automatic replies

Every email here is substantive legal correspondence with a client or a
prospective client. Automating the *writing* of the first draft saves the
repetitive part. Automating the *sending* would mean correspondence leaving the
firm in your name without an attorney having read it, and that is a different
thing entirely. So the tool stops one step short on purpose, and each draft
opens with a checklist of what to confirm before it goes.

## Running it

Needs Node 22.18 or newer. (The website itself still builds on Node 18; only
this tool needs the newer runtime, which it checks for.)

```bash
npm run draft -- --list                                      # the stages
npm run draft -- --matter matters/2026-014.json --stage letter-sent
npm run draft -- --matter matters/2026-014.json --stage accepted --print
```

Drafts are written to `drafts/`, named `<reference>--<stage>--<date>.txt`.
Both `matters/` and `drafts/` are git-ignored.

| Option | Meaning |
| --- | --- |
| `-m, --matter <file>` | The matter JSON |
| `-s, --stage <id>` | Which email to draft |
| `-o, --out <dir>` | Where to write it (default `drafts/`) |
| `-p, --print` | Also print it to the terminal |
| `-l, --list` | List the stages and what each needs |

## Client data never goes in this repository

This repository is public. A matter file holds a client's name, email and the
facts of their dispute, so:

- Keep matter files outside the checkout, or in `matters/`, which is ignored.
- Keep generated drafts out too; `drafts/` is ignored.
- Nothing in `src/lib/comms/` contains client information, and nothing should
  be added to it that does.

`matters/EXAMPLE.matter.json` is the one committed matter file. It is invented
data for testing and shows every field.

## The matter file

One JSON object. Five fields are always required:

```json
{
  "reference": "2026-014",
  "clientName": "Jane Client",
  "clientEmail": "jane@example.com",
  "disputeType": "contractor-construction",
  "opposingParty": "Acme Roofing LLC"
}
```

`disputeType` is normally one of the intake values in `src/config/intake.ts`
(`unpaid-debt`, `breach-of-contract`, `landlord-tenant`, `property-real-estate`,
`consumer`, `business`, `contractor-construction`, `employment`,
`insurance-reimbursement`, `other`); any other text is used as written.

Everything else is optional, and some stages require particular fields:

| Field | Used by | Notes |
| --- | --- | --- |
| `salutation` | all | Defaults to the first name in `clientName` |
| `disputeState` | all | Two-letter code; adds "in Florida" to the description |
| `amount`, `resolution`, `clientPhone` | all | Context |
| `attorney` | all | Overrides the signing attorney |
| `note` | `matter-closed` | A free paragraph above the signature |
| `questions` | `information-requested` | **Required.** The follow-up questions |
| `declineReason` | `declined` | **Required.** See below |
| `declineNote` | `declined` | A sentence or two of specifics |
| `paymentLink` | `accepted` | **Required.** Must be `https://` |
| `deliveryMethod` | `letter-sent` | **Required.** e.g. "certified mail and email" |
| `responseDeadline` | `letter-sent`, `deadline-passed` | The date stated in the letter |
| `responseSummary` | `response-received` | **Required.** Neutral summary of their reply |
| `nextSteps` | `deadline-passed`, `response-received` | Options to discuss |
| `reviewPoints` | `draft-for-review` | Specific things for the client to check |

`declineReason` is one of `outside-scope`, `conflict`, `needs-litigation`,
`outside-florida`, `insufficient-information`, `other`. Each produces different
wording — a conflict declination in particular says nothing beyond the fact of
the conflict.

A mistyped field name, a bad email address, a non-HTTPS payment link or a
missing required field stops the run and names the problem. The tool will not
produce a draft with a hole in it.

## The ten stages

| Stage | When |
| --- | --- |
| `inquiry-received` | Straight after the intake form is submitted |
| `information-requested` | During review, when you need more before deciding |
| `declined` | The matter is not accepted, for any reason |
| `accepted` | Engagement agreement and the $500 payment request |
| `payment-received` | Signed agreement and fee both in; letter in preparation |
| `draft-for-review` | The draft letter goes to the client to check the facts |
| `letter-sent` | The letter has been issued |
| `deadline-passed` | The response date passed with no reply |
| `response-received` | The other side, or their attorney, replied |
| `matter-closed` | The engagement is concluded and the file is closed |

## What the templates will not say

The wording is constrained to match what the website promises, because an
email that contradicts the site is worse than no email. These are enforced by
tests in `tests/unit/comms.test.ts`, not left to review:

- No turnaround time, delivery date or "within 48 hours".
- No prediction or guarantee of an outcome, and no suggestion that the other
  side will pay or respond.
- No claim that a demand letter stops, pauses or extends a legal deadline —
  and most stages say the opposite, which is the truth and the thing clients
  most often assume wrongly.
- Before acceptance: no payment request and no implication of an
  attorney-client relationship. The site promises that no payment is required
  to submit a request and that suitability is reviewed first.
- After the letter: further work is described as a separate agreement with a
  fee quoted in advance, matching `offer.additionalWork` on the site.
- The fixed fee appears only as the figure in `src/config/site.ts`.

## Changing the wording

Templates are in `src/lib/comms/stages.ts`, one function per stage. Firm
details, the price and the scope language come from `src/config/site.ts`, so
the emails and the website cannot drift apart — change the config, not the
template, for anything the site also states.

Run `npm test` after editing. If a change makes the firm promise something
new, the content tests will say so.

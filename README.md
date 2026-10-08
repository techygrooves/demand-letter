# Hoffman Legal: Demand Letters

Marketing website for Hoffman Legal's attorney-prepared demand letter service ($500 flat fee).

Built with [Astro](https://astro.build) as a fully static site: no server runtime, minimal JavaScript, and simple to host on Hostinger.

## Commands

| Command           | Action                                          |
| ----------------- | ----------------------------------------------- |
| `npm install`     | Install dependencies                            |
| `npm run dev`     | Start the dev server at `localhost:4321`        |
| `npm run build`   | Type-check and build the static site to `dist/` |
| `npm run preview` | Preview the production build locally            |
| `npm test`        | Unit tests (Vitest): intake validation and submission |
| `npm run test:e2e`| Browser tests (Playwright): full intake flow, desktop and mobile, plus an axe accessibility scan |

## Project structure

```
public/                 Static files copied as-is (favicon, robots.txt, .htaccess, og-image.png)
src/
  config/site.ts        Firm details, pricing, navigation, dispute types, process steps, disclaimers
  data/faq.ts           FAQ content
  styles/tokens.css     Design tokens: colors, fonts, type scale, spacing
  styles/global.css     Reset, base typography and shared utilities (.container, .section, .btn, .prose)
  layouts/              BaseLayout (head, header, footer) and LegalLayout (policy pages)
  components/           Reusable UI: Header, Footer, Logo, Icon, SEO, PageHero, SectionHeading,
                        PricingCard, FaqList, CtaBand, ContactOptions
  components/sections/  Page sections: HomeHero, DisputeTypes, ProcessSteps, AttorneyIntro
  pages/                One file per route
```

Most content changes, such as the phone number, the price or the list of what's included, only require editing `src/config/site.ts`.

## Attorney and legal content

- `attorneyProfile` in `src/config/site.ts`: attorney details shown on `/about/`. Add only facts confirmed against
  hoffman.legal or the attorney's Florida Bar profile; items awaiting confirmation are listed in `toVerify` and are
  not displayed.
- `firmPolicyLinks`: set the URLs of the firm's existing privacy policy and terms on hoffman.legal to link them from
  the footer and legal pages.
- `disclaimers` and `serviceNotices`: attorney-advertising, jurisdiction and service safeguard wording, used in the
  footer, the "Important information" notice and the legal pages.
- `src/data/faq.ts`: FAQ answers. Each has an anchor (e.g. `/faq/#faq-cost`).

## Intake form

The multi-step request form lives at `/get-started/`.

| File | Purpose |
| --- | --- |
| `src/config/intake.ts` | Dispute options, states, character limits, step titles |
| `src/lib/intake/validation.ts` | Field rules (pure functions, unit tested) |
| `src/lib/intake/summary.ts` | Review screen and plain-text summaries |
| `src/lib/intake/submit.ts` | Submission providers and spam screening |
| `src/components/intake/` | Form markup and styles |
| `src/scripts/intake-form.ts` | Step navigation, errors, focus, draft saving |

**Submissions are delivered through Formspree** (`submission` in `src/config/intake.ts`), sent as labelled fields
with the client's email as reply-to. If delivery fails, the visitor sees an error with the firm's phone and email; the
answers are kept. To use a different backend, set at build time (overrides the default):

```
PUBLIC_INTAKE_PROVIDER=endpoint
PUBLIC_INTAKE_ENDPOINT=https://…   # a form service (e.g. Formspree, Basin) or the firm's own handler
```

The endpoint receives JSON (`data`, `summary`, `submittedAt`, `source`, `spam`). Only a 2xx response is shown to
the visitor as "received". The client-side spam checks (hidden honeypot field, minimum fill time) should be
repeated by the backend. See `.env.example`.

## Deploying to GitHub Pages

The site must be **built** before it can be served; GitHub Pages cannot run Astro on its own. The workflow in
`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

One-time setup: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site is then available at `https://<owner>.github.io/<repo>/` (for this repository,
https://techygrooves.github.io/demand-letter/). Internal links use `url()` from `src/lib/url.ts` so they work under
that sub-path. For a custom domain, set the repository variables `SITE_URL` and `BASE_PATH` (`/`) under
Settings → Secrets and variables → Actions → Variables.

## Deploying to Hostinger (production)

The site is static: `npm run build` produces plain files in `dist/` that run on any Hostinger plan without a
server runtime. See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step build, upload, subdomain, SSL and form
delivery instructions.

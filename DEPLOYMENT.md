# Deploying to Hostinger

## What kind of site this is

This is a **static website**. `npm run build` produces plain HTML, CSS, JavaScript, fonts and images in `dist/`.
It needs **no Node.js, PHP or database runtime** on the server, so it runs on any Hostinger plan, including basic
shared/Web hosting.

The only server-side behaviour is optional: delivering intake form submissions. That is handled by an external HTTPS
endpoint you configure (see step 2). Without one, the form still works but tells visitors their request was **not**
sent and offers email/phone instead.

## Current integration status

| Integration | Status |
| --- | --- |
| Intake form delivery | **Configured: Formspree** (`https://formspree.io/f/xbgdoylb`, set in `src/config/intake.ts`). |
| Notification emails | Sent **by Formspree** to the email address on the Formspree account. The site itself sends no email. |
| Payment | **None.** Payment is arranged after case acceptance, outside the website. |
| Analytics / cookies | **None.** |

## 1. Build the site (on your computer)

Requirements: [Node.js](https://nodejs.org) 20 or 22 (LTS).

```bash
git clone https://github.com/techygrooves/demand-letter.git
cd demand-letter
npm ci
cp .env.example .env          # Windows: copy .env.example .env
```

Edit `.env`:

```ini
SITE_URL=https://demandletter.hoffman.legal   # the exact address the site will live at
BASE_PATH=/                                    # keep "/" for a domain or subdomain
# Form delivery defaults to the firm's Formspree form (src/config/intake.ts); see step 2 to override.
```

Then build and check:

```bash
npm test          # unit tests
npm run build     # type-check + build into dist/
npm run preview   # optional: view the built site at http://localhost:4321
```

`.env` holds configuration only and is ignored by git. Every `PUBLIC_*` value is embedded in the public JavaScript,
so never put passwords or API secrets there.

## 2. Form delivery (Formspree, already connected)

The request form posts to the firm's Formspree form by default; no `.env` setting is needed. In the Formspree
dashboard, before launch:

- Confirm the form (Formspree emails a verification link after the first submission).
- Check the notification email address, and set **Settings → Restrict to domain** to the live domain
  (e.g. `demandletter.hoffman.legal`) so other sites cannot post to the form.
- Review Formspree's confidentiality and data-retention terms, as prospective clients may describe legal matters.

To use a different service instead, pick one HTTPS endpoint that accepts a JSON `POST` and forwards it to the firm, then set:

```ini
PUBLIC_INTAKE_PROVIDER=endpoint
PUBLIC_INTAKE_ENDPOINT=https://<your endpoint>
```

Options:

- A form service such as Formspree or Basin (create a form, use its HTTPS endpoint, enable email notifications to
  `david@hoffman.legal`). **Review the provider's confidentiality and data-retention terms before use**, because
  prospective clients may describe legal matters.
- A handler the firm hosts itself (for example a small PHP script on the same Hostinger account) that validates the
  data, repeats the spam checks (`spam.honeypot` must be empty, `spam.elapsedMs` at least 4000) and emails the
  `summary` field. This is not included in the project.

The endpoint must return a 2xx status only when the submission was actually accepted. Rebuild (`npm run build`) after
changing these values, then submit a test request on the live site and confirm it arrives.

## 3. Create the subdomain (recommended) or choose the domain

Recommended: serve the site from a subdomain such as **demandletter.hoffman.legal**, so it does not interfere with the
main hoffman.legal website.

In **hPanel → Websites → (hoffman.legal) → Domains → Subdomains**, create `demandletter`. Hostinger creates a folder
for it (usually `public_html/demandletter`). Note the folder path shown.

- If hoffman.legal's DNS is managed by Hostinger, the subdomain works automatically.
- If DNS is managed elsewhere, add a DNS record at that provider: `A demandletter → <your Hostinger server IP>`
  (shown in hPanel under hosting details), or the `CNAME` Hostinger specifies.

To use a whole domain instead, point it at the hosting account and upload to that domain's `public_html`.

> Serving from a sub-folder such as `hoffman.legal/demand-letters/` also works: set `BASE_PATH=/demand-letters` and
> `SITE_URL=https://hoffman.legal`, rebuild, and in the uploaded `.htaccess` change `ErrorDocument 404 /404.html` to
> `/demand-letters/404.html`. A subdomain is simpler.

## 4. Enable SSL

hPanel → **Security → SSL**: install the free SSL certificate for the domain/subdomain and wait until it shows
*Active*. The included `.htaccess` redirects all traffic to HTTPS and sends an HSTS header, so SSL must be active
before going live.

## 5. Upload

1. Open the `dist/` folder. Select **everything inside it**, including the hidden **`.htaccess`** file (enable
   "show hidden files"; on macOS press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>.</kbd>), and compress it to a `.zip`.
2. hPanel → **Files → File Manager** → open the subdomain's folder (e.g. `public_html/demandletter`).
   Delete any default `index.php`/`default.php` placeholder.
3. Upload the `.zip`, right-click it → **Extract** into the current folder, then delete the `.zip`.
4. The folder should now contain `index.html`, `.htaccess`, `_astro/`, `pricing/`, `faq/`, `robots.txt`,
   `sitemap-index.xml` and so on. **Not** a nested `dist/` folder.

FTP (hPanel → Files → FTP Accounts) works too: upload the contents of `dist/` to the same folder.

## 6. Verify the live site

- Open `https://demandletter.hoffman.legal/`: styles, fonts and navigation load; `http://` redirects to `https://`.
- Click through Pricing, How It Works, Disputes, FAQ, About, Contact and the legal pages.
- Open a missing page (e.g. `/test-404/`): the custom "We couldn't find that page" screen appears.
- Complete the request form with test details: you should see "Thank you. Your request has been received." and the
  notification should arrive from Formspree (the first one may ask you to confirm the form).
- `https://demandletter.hoffman.legal/robots.txt` and `/sitemap-index.xml` show the correct domain.
- Optionally submit the sitemap in Google Search Console.

## Updating the site later

Edit, then `npm run build` and upload the new contents of `dist/` the same way (replace the old files). Files in
`_astro/` have content hashes, so old ones can be deleted safely.

## GitHub Pages (preview only)

`.github/workflows/deploy.yml` publishes a preview to https://techygrooves.github.io/demand-letter/ on every push to
`main` (Settings → Pages → Source: GitHub Actions). Hostinger remains the production host; the `.htaccess` rules do
not apply on GitHub Pages.

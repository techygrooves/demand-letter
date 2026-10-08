// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Read .env / .env.production as well as real environment variables, so the
// site URL can be set in the same file as the intake settings.
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

// Production URL used for canonical links, Open Graph tags and the sitemap.
// Override at build time with SITE_URL if the site is deployed elsewhere.
const SITE_URL = env.SITE_URL || 'https://demandletter.hoffman.legal';

// Sub-path the site is served from. "/" for a custom domain; "/demand-letter"
// for the GitHub Pages project site (set by .github/workflows/deploy.yml).
const BASE_PATH = env.BASE_PATH || '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // Static HTML output: upload the contents of /dist to Hostinger's public_html.
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production URL used for canonical links, Open Graph tags and the sitemap.
// Override at build time with SITE_URL if the site is deployed elsewhere.
const SITE_URL = process.env.SITE_URL ?? 'https://demandletter.hoffman.legal';

export default defineConfig({
  site: SITE_URL,
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

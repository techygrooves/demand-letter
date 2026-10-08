import type { APIRoute } from 'astro';
import { url } from '@/lib/url';

/** robots.txt generated at build time so the sitemap URL always matches SITE_URL and BASE_PATH. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(url('/sitemap-index.xml'), site).toString();
  // Preview deployments on GitHub Pages are kept out of search engines.
  const isPreview = site?.hostname.endsWith('github.io') ?? false;
  const body = isPreview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

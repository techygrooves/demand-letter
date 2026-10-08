/**
 * Prefixes a root-relative path with the site's base path.
 *
 * The site is served from the domain root in production (base "/"), but from a
 * sub-path such as "/demand-letter/" on GitHub Pages project sites. Use this for
 * every internal link and public asset: url('/pricing/') → '/demand-letter/pricing/'.
 * External URLs, mailto:, tel: and in-page "#" links are returned unchanged.
 */
const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

export function url(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${base}${path}`;
}

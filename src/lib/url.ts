/**
 * Prefixes a root-relative path with the site's base path.
 *
 * The site is served from the domain root in production (base "/"), but from a
 * sub-path such as "/demand-letter/" on GitHub Pages project sites. Use this for
 * every internal link and public asset: url('/pricing/') → '/demand-letter/pricing/'.
 * External URLs, mailto:, tel: and in-page "#" links are returned unchanged.
 */
/*
 * `import.meta.env` is supplied by Astro and by Vitest. It is absent under plain
 * `node`, which the client-email generator in `tools/` runs under, so fall back
 * to the domain root there rather than throwing on import.
 */
const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/+$/, '');

export function url(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${base}${path}`;
}

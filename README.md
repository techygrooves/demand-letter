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

## Deploying to Hostinger

1. Set the production URL if it differs from the default in `astro.config.mjs`:
   `SITE_URL=https://your-domain.com npm run build` (also update the `Sitemap:` line in `public/robots.txt`).
2. Upload the **contents** of `dist/` (including the hidden `.htaccess`) to `public_html/`.

The included `.htaccess` forces HTTPS, enforces trailing slashes, serves the custom 404 page and sets caching and security headers.

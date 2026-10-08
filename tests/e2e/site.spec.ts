import { expect, test } from '@playwright/test';

const BASE = 'http://localhost:4321';

test('every internal link and in-page anchor resolves', async ({ page, request }) => {
  const queue = ['/'];
  const visited = new Set<string>();
  const broken: string[] = [];

  while (queue.length) {
    const path = queue.shift()!;
    if (visited.has(path)) continue;
    visited.add(path);

    const response = await page.goto(BASE + path);
    if (!response || response.status() !== 200) {
      broken.push(`${path} → ${response?.status()}`);
      continue;
    }

    const hrefs = await page.$$eval('a[href]', (links) => links.map((a) => a.getAttribute('href') ?? ''));
    for (const href of new Set(hrefs)) {
      if (href.startsWith('#')) {
        if (href.length > 1 && (await page.locator(href).count()) === 0) broken.push(`${path} → missing anchor ${href}`);
      } else if (href.startsWith('/')) {
        const [route, hash] = href.split('#');
        if (hash) {
          const html = await (await request.get(BASE + route)).text();
          if (!html.includes(`id="${hash}"`)) broken.push(`${path} → ${href} (anchor not found)`);
        }
        if (!visited.has(route)) queue.push(route);
      }
    }
  }

  expect(visited.size).toBeGreaterThanOrEqual(11);
  expect(broken).toEqual([]);
});

test('every page has one h1, a unique title, a description and a canonical URL', async ({ page }) => {
  const titles = new Set<string>();
  for (const path of ['/', '/how-it-works/', '/disputes/', '/pricing/', '/about/', '/faq/', '/contact/', '/get-started/', '/disclaimer/', '/privacy/', '/terms/']) {
    await page.goto(BASE + path);
    await expect(page.locator('h1')).toHaveCount(1);
    const title = await page.title();
    expect(titles.has(title), `duplicate title ${title}`).toBe(false);
    titles.add(title);
    expect(title.length).toBeLessThanOrEqual(65);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0).toBeGreaterThan(70);
    expect(description?.length ?? 0).toBeLessThanOrEqual(170);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
  }
});

test.describe('keyboard', () => {
  test('skip link is the first tab stop and moves focus to the main content', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('mobile menu opens, closes with Escape and returns focus', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile navigation only');
    await page.goto(BASE + '/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Pricing' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('interactive elements show a visible focus indicator', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    });
    expect(outline).toBe(true);
  });
});

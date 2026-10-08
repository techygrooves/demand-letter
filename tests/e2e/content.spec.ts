import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'http://localhost:4321';

const QUESTIONS = [
  'What is a demand letter?',
  'How much does a demand letter cost?',
  'What is included in the $500 fee?',
  'Can a demand letter help avoid a lawsuit?',
  'What types of disputes qualify?',
  'What if the other party ignores the letter?',
  'Does the $500 fee cover court proceedings?',
  'Can I request a demand letter against a business?',
  'What information should I provide?',
  'How long does the process take?',
  'Does submitting the form create an attorney-client relationship?',
  'What if my matter is not suitable for this service?',
];

test.describe('FAQ page', () => {
  test('lists all twelve questions in order, collapsed by default', async ({ page }) => {
    await page.goto(`${BASE}/faq/`);
    const summaries = page.locator('[data-faq] summary');
    await expect(summaries).toHaveCount(QUESTIONS.length);
    for (const [index, question] of QUESTIONS.entries()) {
      await expect(summaries.nth(index)).toContainText(question);
    }
    await expect(page.locator('[data-faq] details[open]')).toHaveCount(0);
  });

  test('opens and closes with the keyboard', async ({ page }) => {
    await page.goto(`${BASE}/faq/`);
    const first = page.locator('#faq-what-is-a-demand-letter');
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('open', '');
    await expect(first).toContainText('formal written request');
    await page.keyboard.press('Space');
    await expect(first).not.toHaveAttribute('open', '');
  });

  test('expand all / collapse all', async ({ page }) => {
    await page.goto(`${BASE}/faq/`);
    const toggle = page.getByRole('button', { name: 'Expand all' });
    await toggle.click();
    await expect(page.locator('[data-faq] details[open]')).toHaveCount(QUESTIONS.length);
    await expect(page.getByRole('button', { name: 'Collapse all' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Collapse all' }).click();
    await expect(page.locator('[data-faq] details[open]')).toHaveCount(0);
  });

  test('a direct link opens the matching answer', async ({ page }) => {
    await page.goto(`${BASE}/faq/#faq-court-proceedings`);
    const item = page.locator('#faq-court-proceedings');
    await expect(item).toHaveAttribute('open', '');
    await expect(item).toContainText('The $500 fee covers one demand letter');
  });

  test('answers avoid promises about results and deadlines', async ({ page }) => {
    await page.goto(`${BASE}/faq/`);
    await page.getByRole('button', { name: 'Expand all' }).click();
    const text = (await page.locator('[data-faq]').innerText()).toLowerCase();
    for (const banned of ['guaranteed results', 'we guarantee', 'within 24 hours', 'within 48 hours', 'business days', 'tolls the statute']) {
      expect(text).not.toContain(banned);
    }
    expect(text).toContain('does not stop, pause or extend a statute of limitations');
  });

  test('includes structured data for every question', async ({ page }) => {
    await page.goto(`${BASE}/faq/`);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = schemas.map((s) => JSON.parse(s)).find((s) => s['@type'] === 'FAQPage');
    expect(faq.mainEntity).toHaveLength(QUESTIONS.length);
  });
});

test.describe('legal safeguards', () => {
  test('important information notice lists every safeguard', async ({ page }) => {
    await page.goto(`${BASE}/faq/`);
    const notice = page.locator('#important-information');
    for (const heading of [
      'Results are not guaranteed',
      'Litigation is not automatically included',
      'The engagement agreement governs the scope',
      'An inquiry does not create an attorney-client relationship',
      'Legal deadlines still apply',
      'Florida law firm',
    ]) {
      await expect(notice.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('footer carries advertising and jurisdiction disclosures', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const footer = page.locator('footer');
    await expect(footer).toContainText('This website is an advertisement for legal services.');
    await expect(footer).toContainText('should not be based solely upon advertisements');
    await expect(footer).toContainText('Hoffman Legal is a Florida law firm.');
    await expect(footer).toContainText('Results are not guaranteed.');
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy/');
  });

  test('about page uses only confirmed attorney details', async ({ page }) => {
    await page.goto(`${BASE}/about/`);
    const profile = page.locator('#attorney');
    await expect(profile).toContainText('provided through Hoffman Legal');
    await expect(profile).toContainText('Hoffman Legal, PLLC');
    await expect(profile).toContainText('(954) 459-4236');
    const text = (await profile.innerText()).toLowerCase();
    for (const unverified of ['years of experience', 'award', 'super lawyer', 'testimonial', 'graduated', 'admitted in']) {
      expect(text).not.toContain(unverified);
    }
  });
});

test.describe('accessibility', () => {
  for (const path of ['/faq/', '/about/', '/disclaimer/', '/privacy/', '/terms/']) {
    test(`${path} has no detectable WCAG A/AA violations`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      if (path === '/faq/') await page.getByRole('button', { name: 'Expand all' }).click();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
    });
  }
});

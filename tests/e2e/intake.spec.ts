import { expect, test, type Page } from '@playwright/test';

const NOT_CONFIGURED = 'http://localhost:4321/get-started/';
const WITH_ENDPOINT = 'http://localhost:4322/get-started/';
const ENDPOINT = 'https://intake.example.test/submit';
const MIN_FILL_MS = 4000;

const next = (page: Page) => page.getByRole('button', { name: 'Next' });
const previous = (page: Page) => page.getByRole('button', { name: 'Previous' });
const submit = (page: Page) => page.getByRole('button', { name: /Submit Request|Submitting/ });

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Contact Details' })).toBeVisible();
}

async function fillContact(page: Page) {
  await page.getByRole('textbox', { name: 'Full name', exact: true }).fill('Jane Client');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('jane@example.com');
  await page.getByRole('textbox', { name: 'Phone number', exact: true }).fill('(954) 555-0123');
  await page.getByRole('combobox', { name: 'State where the dispute arose', exact: true }).selectOption('FL');
}

async function fillDetails(page: Page) {
  await page.getByRole('textbox', { name: 'Name of the opposing individual or business', exact: true }).fill('Acme Roofing LLC');
  await page.getByLabel(/city and state/).fill('Miami, FL');
  await page.getByLabel(/Approximate amount/).fill('2,500');
  await page
    .getByRole('textbox', { name: 'What happened?', exact: true })
    .fill('I paid a deposit in March for roof repairs. The work was never started and calls go unanswered.');
  await page.getByRole('textbox', { name: 'What resolution are you seeking?', exact: true }).fill('Return of my $2,500 deposit.');
  await page.getByRole('radio', { name: 'No', exact: true }).check();
}

/** Complete steps 1–3 and arrive at the review step. */
async function reachReview(page: Page) {
  await fillContact(page);
  await next(page).click();
  await page.getByRole('combobox', { name: 'Type of dispute', exact: true }).selectOption('contractor-construction');
  await next(page).click();
  await fillDetails(page);
  await next(page).click();
  await expect(page.getByRole('heading', { name: 'Review and Submit' })).toBeVisible();
}

/** The form ignores submissions made implausibly soon after page load. */
async function waitForMinFillTime(page: Page) {
  await page.waitForTimeout(MIN_FILL_MS + 200);
}

test.describe('intake form', () => {
  test('shows the progress indicator and blocks Next until required fields are valid', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    await expect(page.getByText('Step 1 of 4').first()).toBeVisible();

    await next(page).click();
    const summary = page.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveCount(4);
    await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Please enter your full name.').first()).toBeVisible();

    // Clicking a summary link moves focus to the field.
    await summary.getByRole('link', { name: /email/i }).click();
    await expect(page.getByRole('textbox', { name: 'Email address', exact: true })).toBeFocused();

    // Invalid formats get specific messages; fixing a field clears its error.
    await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('jane@');
    await page.getByRole('textbox', { name: 'Phone number', exact: true }).fill('555');
    await next(page).click();
    await expect(page.getByText(/valid email address/).first()).toBeVisible();
    await expect(page.getByText(/10-digit U.S. phone number/).first()).toBeVisible();
    await fillContact(page);
    await expect(page.getByRole('textbox', { name: 'Email address', exact: true })).not.toHaveAttribute('aria-invalid', 'true');

    await next(page).click();
    await expect(page.getByRole('heading', { name: 'Type of Dispute' })).toBeFocused();
    await expect(page.getByText('Step 2 of 4').first()).toBeVisible();
  });

  test('keeps answers when moving between steps and after a reload', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    await reachReview(page);

    await previous(page).click();
    await expect(page.getByRole('textbox', { name: 'Name of the opposing individual or business', exact: true })).toHaveValue('Acme Roofing LLC');
    await previous(page).click();
    await expect(page.getByRole('combobox', { name: 'Type of dispute', exact: true })).toHaveValue('contractor-construction');
    await previous(page).click();
    await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('Jane Client');

    await page.waitForTimeout(500); // draft save is debounced
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toHaveValue('Jane Client');
    await expect(page.getByRole('combobox', { name: 'State where the dispute arose', exact: true })).toHaveValue('FL');
  });

  test('review shows a summary with edit links and requires the acknowledgment', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    await reachReview(page);

    const review = page.locator('[data-review]');
    await expect(review).toContainText('Jane Client');
    await expect(review).toContainText('Florida');
    await expect(review).toContainText('Contractor or construction issue');
    await expect(review).toContainText('$2,500');
    await expect(review).toContainText('Return of my $2,500 deposit.');

    for (const statement of [
      'This form is an inquiry, not an engagement agreement.',
      'Submitting information does not automatically create an attorney-client relationship.',
      'The $500 service is subject to attorney review and acceptance.',
      'I should not submit highly sensitive information through this unsecured form.',
    ]) {
      await expect(page.getByText(statement)).toBeVisible();
    }

    await submit(page).click();
    await expect(page.getByText('Please confirm that you have read and understand these statements.').first()).toBeVisible();

    await page.getByRole('button', { name: 'Edit contact details' }).click();
    await expect(page.getByRole('heading', { name: 'Contact Details' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Full name', exact: true }).fill('Jane Q. Client');
    await next(page).click();
    await next(page).click();
    await next(page).click();
    await expect(review).toContainText('Jane Q. Client');
  });

  test('blocks Social Security and account numbers in free text', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    await fillContact(page);
    await next(page).click();
    await page.getByRole('combobox', { name: 'Type of dispute', exact: true }).selectOption('unpaid-debt');
    await next(page).click();
    await fillDetails(page);
    await page.getByRole('textbox', { name: 'What happened?', exact: true }).fill('He owes me money. My SSN is 123-45-6789 if you need it for the file.');
    await next(page).click();
    await expect(page.getByText(/remove Social Security, bank account or card numbers/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dispute Information' })).toBeVisible();
  });

  test('asks for deadline details only when there is a deadline', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    await fillContact(page);
    await next(page).click();
    await page.getByRole('combobox', { name: 'Type of dispute', exact: true }).selectOption('other');
    await next(page).click();
    await fillDetails(page);
    const details = page.getByRole('textbox', { name: 'Please describe the deadline or court date', exact: true });
    await expect(details).toBeHidden();
    await page.getByRole('radio', { name: 'Yes', exact: true }).check();
    await expect(details).toBeVisible();
    await next(page).click();
    await expect(page.getByText('Please briefly describe the deadline or court date.').first()).toBeVisible();
    await details.fill('Small claims hearing on November 3.');
    await next(page).click();
    await expect(page.locator('[data-review]')).toContainText('Yes: Small claims hearing on November 3.');
  });

  test('without a configured backend, says plainly that nothing was sent', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    await reachReview(page);
    await page.getByRole('checkbox', { name: 'I have read and understand these statements.', exact: true }).check();
    await waitForMinFillTime(page);
    await submit(page).click();

    const outcome = page.locator('[data-outcome="not_configured"]');
    await expect(outcome).toBeVisible();
    await expect(outcome).toContainText('has not been sent');
    await expect(page.locator('[data-outcome="delivered"]')).toBeHidden();
    const mailto = await outcome.getByRole('link', { name: 'Email My Request' }).getAttribute('href');
    expect(mailto).toMatch(/^mailto:david@hoffman\.legal\?subject=/);
    expect(decodeURIComponent(mailto ?? '')).toContain('Opposing party: Acme Roofing LLC');

    await page.getByRole('button', { name: 'Back to my answers' }).click();
    await expect(page.getByRole('heading', { name: 'Review and Submit' })).toBeVisible();
  });

  test('shows a loading state, then the confirmation screen when the endpoint accepts', async ({ page }) => {
    let received: Record<string, unknown> | undefined;
    await page.route(ENDPOINT, async (route) => {
      received = route.request().postDataJSON();
      await new Promise((r) => setTimeout(r, 800));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await open(page, WITH_ENDPOINT);
    await reachReview(page);
    await page.getByRole('checkbox', { name: 'I have read and understand these statements.', exact: true }).check();
    await waitForMinFillTime(page);
    await submit(page).click();

    await expect(submit(page)).toHaveAttribute('aria-busy', 'true');
    await expect(submit(page)).toBeDisabled();
    await expect(submit(page)).toContainText('Submitting');

    const outcome = page.locator('[data-outcome="delivered"]');
    await expect(outcome).toBeVisible();
    await expect(outcome).toBeFocused();
    await expect(outcome).toContainText('Hoffman Legal will review your inquiry');
    await expect(outcome.locator('[data-demo-note]')).toBeHidden();

    const data = (received?.data ?? {}) as Record<string, unknown>;
    expect(data.fullName).toBe('Jane Client');
    expect(data.disputeType).toBe('contractor-construction');
    expect(String(received?.summary)).toContain('Resolution sought: Return of my $2,500 deposit.');

    // The draft is cleared after a successful submission.
    expect(await page.evaluate(() => sessionStorage.getItem('hl-intake-draft'))).toBeNull();
  });

  test('shows a recoverable error when the endpoint fails, keeping the answers', async ({ page }) => {
    let attempts = 0;
    await page.route(ENDPOINT, (route) => {
      attempts += 1;
      return attempts === 1 ? route.fulfill({ status: 500, body: 'error' }) : route.fulfill({ status: 200, body: '{}' });
    });

    await open(page, WITH_ENDPOINT);
    await reachReview(page);
    await page.getByRole('checkbox', { name: 'I have read and understand these statements.', exact: true }).check();
    await waitForMinFillTime(page);
    await submit(page).click();

    const error = page.locator('[data-submit-error]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('We couldn’t send your request.');
    await expect(error).toContainText('(954) 459-4236');
    await expect(page.locator('[data-review]')).toContainText('Jane Client');
    await expect(submit(page)).toBeEnabled();

    await submit(page).click();
    await expect(page.locator('[data-outcome="delivered"]')).toBeVisible();
    expect(attempts).toBe(2);
  });

  test('drops submissions that fill the spam trap without contacting the endpoint', async ({ page }) => {
    let called = false;
    await page.route(ENDPOINT, (route) => {
      called = true;
      return route.fulfill({ status: 200, body: '{}' });
    });

    await open(page, WITH_ENDPOINT);
    await reachReview(page);
    await page.getByRole('checkbox', { name: 'I have read and understand these statements.', exact: true }).check();
    await page.locator('[name="hl_ref"]').evaluate((el: HTMLInputElement) => (el.value = 'https://spam.example'));
    await waitForMinFillTime(page);
    await submit(page).click();

    await expect(page.locator('[data-submit-error]')).toBeVisible();
    await expect(page.locator('[data-outcome="delivered"]')).toBeHidden();
    expect(called).toBe(false);
  });

  test('fits the viewport without horizontal scrolling', async ({ page }) => {
    await open(page, NOT_CONFIGURED);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await reachReview(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });
});

test.describe('accessibility', () => {
  test('each step and the result screen have no detectable WCAG A/AA violations', async ({ page }) => {
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const scan = async (label: string) => {
      const results = await new AxeBuilder({ page })
        .include('[data-intake]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${label}: ${v.id} – ${v.help}`)).toEqual([]);
    };

    await open(page, NOT_CONFIGURED);
    await scan('step 1');
    await next(page).click();
    await scan('step 1 with errors');
    await fillContact(page);
    await next(page).click();
    await scan('step 2');
    await page.getByRole('combobox', { name: 'Type of dispute', exact: true }).selectOption('business');
    await next(page).click();
    await fillDetails(page);
    await scan('step 3');
    await next(page).click();
    await scan('step 4');
    await page.getByRole('checkbox', { name: 'I have read and understand these statements.', exact: true }).check();
    await waitForMinFillTime(page);
    await submit(page).click();
    await expect(page.locator('[data-outcome="not_configured"]')).toBeVisible();
    await scan('result');
  });
});

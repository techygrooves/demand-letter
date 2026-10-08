import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the intake form.
 *
 * Two servers are started:
 *  - :4321 production build with no submission provider (the default state).
 *  - :4322 dev server using the "endpoint" provider with a placeholder URL;
 *    tests intercept that URL to simulate success and failure responses.
 *  - :4323 dev server with the default configuration (Formspree). Tests intercept
 *    formspree.io, so no real submissions are sent.
 *
 * Set PW_CHROMIUM_PATH to use a preinstalled Chromium instead of a Playwright download.
 */
const ENDPOINT = 'https://intake.example.test/submit';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'npx astro build && npx astro preview --port 4321',
      url: 'http://localhost:4321/get-started/',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { PUBLIC_INTAKE_PROVIDER: 'none' },
    },
    {
      command: 'npx astro dev --port 4322',
      url: 'http://localhost:4322/get-started/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PUBLIC_INTAKE_PROVIDER: 'endpoint', PUBLIC_INTAKE_ENDPOINT: ENDPOINT },
    },
    {
      // Default configuration: submissions go to the firm's Formspree form (intercepted in tests).
      command: 'npx astro dev --port 4323',
      url: 'http://localhost:4323/get-started/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PUBLIC_INTAKE_PROVIDER: '', PUBLIC_INTAKE_ENDPOINT: '' },
    },
  ],
});

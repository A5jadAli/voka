import { defineConfig, devices } from '@playwright/test';

const localChrome = process.env.CI ? {} : { channel: 'chrome' as const };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'compact-android',
      use: { ...devices['Galaxy S9+'], ...localChrome },
    },
    {
      name: 'modern-android',
      use: { ...devices['Pixel 7'], ...localChrome },
    },
  ],
  webServer: {
    command: 'npm run qa:web:serve',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

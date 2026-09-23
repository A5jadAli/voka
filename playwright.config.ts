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
    // Deterministic test-only configuration. The browser specs intercept these
    // requests; CI must not need local credentials or reach a real backend.
    env: {
      EXPO_NO_DOTENV: '1',
      EXPO_PUBLIC_SUPABASE_URL: 'https://voka-e2e.example.test',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic_voka_browser_tests',
      EXPO_PUBLIC_VOKA_API_URL: 'https://voka-e2e.example.test/functions/v1/realtime-session',
    },
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

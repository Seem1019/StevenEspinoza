import { defineConfig } from '@playwright/test';

// Runs against the production build (`npm run build` first). Uses the system Chrome: no browser download.
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321/steven-espinoza/',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npx astro preview --port 4321',
    url: 'http://localhost:4321/steven-espinoza/es/',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

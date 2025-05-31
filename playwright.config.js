import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run start',
    port: 8080,
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',
    testIdAttribute: 'data-testid'
  }
});
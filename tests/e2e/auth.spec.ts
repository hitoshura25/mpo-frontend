import { test, expect } from '@playwright/test';
import { setupMockOAuthServer } from './mocks/oauth-server';
import { AddressInfo } from 'net';

test.describe('Authentication Flow', () => {
  let mockOAuthServer: any;
  let mockOAuthServerPort: number;

  test.beforeAll(async () => {
    mockOAuthServer = await setupMockOAuthServer({
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:8080/login_callback.html'
    });
    mockOAuthServerPort = (mockOAuthServer.address() as AddressInfo).port;
  });

  test.afterAll(async () => {
    mockOAuthServer.close();
  });

  test('should successfully sign in and see main page', async ({ page }) => {
    // Modify environment variables for the test
    await page.addInitScript((port) => {
      window._env_ = {
        OAUTH_AUTHORITY: `http://localhost:${port}`,
        OAUTH_CLIENT_ID: 'test-client-id',
        OAUTH_REDIRECT_URI: 'http://localhost:8080/login_callback.html',
        OAUTH_POST_LOGOUT_REDIRECT_URI: 'http://localhost:8080/login.html',
      };
    }, mockOAuthServerPort);

    // Navigate to login page
    await page.goto('http://localhost:8080/login.html');
    await expect(page).toHaveTitle('Login - Podcast Player');

    // Click sign in button
    await page.click('#login-button');

    // Handle OAuth consent screen
    await page.waitForURL(/.*oauth\/authorize/);
    await page.click('#mock-oauth-allow-button');

    // Should redirect back to app
    await page.waitForURL('http://localhost:8080/index.html');
    
    // Verify main page elements
    await expect(page.locator('h1')).toHaveText('Podcast Player');
    await expect(page.locator('#episodes-container')).toBeVisible();
  });
});
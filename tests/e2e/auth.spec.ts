import { test, expect } from '@playwright/test';
import { setupMockOAuthServer } from './mocks/oauth-server';
import { AddressInfo } from 'net';

test.describe('Authentication Flow', () => {
  let mockOAuthServer: any;
  let mockOAuthServerPort: number;

  test.beforeAll(async () => {
    mockOAuthServer = await setupMockOAuthServer({
      clientId: 'Media-Player-Omega',
      redirectUri: 'http://localhost:8080/login_callback.html'
    });
    mockOAuthServerPort = (mockOAuthServer.address() as AddressInfo).port;
  });

  test.afterAll(async () => {
    mockOAuthServer.close();
  });

  test('should successfully sign in and see main page', async ({ page }) => {
    // Set window._env_ before any page scripts run
    await page.addInitScript((port) => {
      window._env_ = {
        OAUTH_AUTHORITY: `http://localhost:${port}`,
        OAUTH_CLIENT_ID: 'Media-Player-Omega',
        OAUTH_REDIRECT_URI: 'http://localhost:8080/login_callback.html',
        OAUTH_POST_LOGOUT_REDIRECT_URI: 'http://localhost:8080/login.html',
      };
    }, mockOAuthServerPort);

    // When served by nginx (Docker build), env-config.js is loaded as a page
    // script and would overwrite window._env_ with static container values.
    // Intercept it so the mock OAuth port set above always takes effect.
    await page.route('**/env-config.js', async (route) => {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `window._env_ = {
  OAUTH_AUTHORITY: "http://localhost:${mockOAuthServerPort}",
  OAUTH_CLIENT_ID: "Media-Player-Omega",
  OAUTH_REDIRECT_URI: "http://localhost:8080/login_callback.html",
  OAUTH_POST_LOGOUT_REDIRECT_URI: "http://localhost:8080/login.html",
};`,
      });
    });

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
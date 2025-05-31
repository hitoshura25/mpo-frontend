import express from 'express';
import jwt from 'jsonwebtoken';
import { AddressInfo } from 'net';

export async function setupMockOAuthServer(config: { clientId: string; clientSecret: string; redirectUri: string }): Promise<express.Server> {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get('/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri, response_type, scope, state } = req.query;
    const html = `
      <html>
        <body>
          <h1>Mock OAuth Consent</h1>
          <p>Client ID: ${client_id}</p>
          <p>Redirect URI: ${redirect_uri}</p>
          <form action="/oauth/allow" method="post">
            <input type="hidden" name="client_id" value="${client_id}" />
            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
            <input type="hidden" name="response_type" value="${response_type}" />
            <input type="hidden" name="scope" value="${scope}" />
            <input type="hidden" name="state" value="${state}" />
            <button id="mock-oauth-allow-button" type="submit">Allow</button>
          </form>
        </body>
      </html>
    `;
    res.send(html);
  });

  app.post('/oauth/allow', (req, res) => {
    const { client_id, redirect_uri, response_type, scope, state } = req.body;
    const authorizationCode = 'mock_auth_code';
    res.redirect(`${redirect_uri}?code=${authorizationCode}&state=${state}`);
  });

  app.post('/oauth/token', (req, res) => {
    const { code, client_id, client_secret, redirect_uri, grant_type } = req.body;

    if (client_id !== config.clientId || client_secret !== config.clientSecret) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }

    const payload = {
      sub: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    };

    const accessToken = jwt.sign(payload, 'secret', { expiresIn: '1h' });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
    });
  });

  const server = app.listen(0, () => {
    const { port } = server.address() as AddressInfo;
    console.log(`Mock OAuth server listening on port ${port}`);
  });

  return server;
}
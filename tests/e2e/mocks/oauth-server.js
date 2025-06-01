import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
const JWT_SECRET = 'test-secret';

export async function setupMockOAuthServer(config) {
  const app = express();
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get('/.well-known/openid-configuration', (req, res) => {
    const issuer = `http://localhost:${server.address().port}`;
    res.json({
      issuer: issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      userinfo_endpoint: `${issuer}/oauth/userinfo`,
      jwks_uri: `${issuer}/oauth/jwks`,
      scopes_supported: ['openid', 'profile', 'email'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
      claims_supported: ['sub', 'name', 'email'],
    });
  });

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
    const { code, client_id, redirect_uri, grant_type } = req.body;

    if (client_id !== config.clientId) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }

    const payload = {
      iss: `http://localhost:${server.address().port}`,
      aud: client_id,
      sub: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: jwt.sign({ ...payload, nonce: 'test-nonce' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' }),
      refresh_token: 'mock_refresh_token',
    });
  });

  app.get('/oauth/userinfo', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({
        sub: decoded.sub,
        name: decoded.name,
        email: decoded.email,
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  const server = app.listen(config.port || 0, () => {
    console.log(`Mock OAuth server listening on port ${server.address().port}`);
  });

  return server;
}
import { setupMockOAuthServer } from './oauth-server.js';

async function startServer() {
  const server = await setupMockOAuthServer({
    clientId: process.env.OAUTH_CLIENT_ID,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
    port: 3306
  });
  
  console.log('Mock OAuth server started successfully');
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down mock OAuth server');
    server.close();
    process.exit(0);
  });
}

startServer().catch(error => {
  console.error('Failed to start mock OAuth server:', error);
  process.exit(1);
});
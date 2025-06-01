import { setupMockOAuthServer } from './oauth-server.js';
import dotenv from 'dotenv';

dotenv.config();
async function startServer() {
  const config ={
    clientId: process.env.OAUTH_CLIENT_ID,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
    port: 3306
  }

  console.log('Starting mock OAuth server with config:', config);
  const server = await setupMockOAuthServer(config);
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
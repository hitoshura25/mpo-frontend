import { setupMockOAuthServer } from './oauth-server.js';

async function startServer() {
  const server = await setupMockOAuthServer({
    clientId: 'Media-Player-Omega',
    redirectUri: 'http://localhost:8080/frontend/login_callback.html',
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
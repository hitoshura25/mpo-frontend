import { Auth } from './auth';

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      try {
        const auth = Auth.getInstance();
        await auth.login();
      } catch (error) {
        console.error('Login failed:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
          errorMessage.style.display = 'block';
        }
      }
    });
  }
});
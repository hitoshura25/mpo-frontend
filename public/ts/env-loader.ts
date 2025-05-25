// Define the window._env_ interface
declare global {
    interface Window {
        _env_: {
            OAUTH_AUTHORITY: string;
            OAUTH_CLIENT_ID: string;
            OAUTH_REDIRECT_URI: string;
            OAUTH_POST_LOGOUT_REDIRECT_URI: string;
        };
    }
}

// Initialize window._env_ if it doesn't exist
if (!window._env_) {
    // Default environment values for development
    console.warn('window._env_ not found, using default values for development');
    window._env_ = {
        OAUTH_AUTHORITY: process.env.OAUTH_AUTHORITY || '',
        OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID || '',
        OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || '',
        OAUTH_POST_LOGOUT_REDIRECT_URI: process.env.OAUTH_POST_LOGOUT_REDIRECT_URI || '',
    };;
} 

export const getEnv = () => window._env_;
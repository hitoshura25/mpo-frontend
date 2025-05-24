import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const settings: UserManagerSettings = {
    authority: process.env.OAUTH_AUTHORITY || '',
    client_id: process.env.OAUTH_CLIENT_ID || '',
    redirect_uri: process.env.OAUTH_REDIRECT_URI || '',
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: process.env.OAUTH_POST_LOGOUT_REDIRECT_URI,
    client_secret: process.env.OAUTH_CLIENT_SECRET 
};

export class Auth {
    private static instance: Auth;
    private userManager: UserManager;
    private isAuthenticated: boolean = false;

    private constructor() {
        this.userManager = new UserManager(settings);
    }

    static getInstance(): Auth {
        if (!Auth.instance) {
            Auth.instance = new Auth();
        }
        return Auth.instance;
    }

    async login(): Promise<void> {
        try {
            await this.userManager.signinRedirect();
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async logout(): Promise<void> {
        try {
            await this.userManager.signoutRedirect();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async handleLoginCallback(): Promise<boolean> {
        try {
            await this.userManager.signinRedirectCallback()
        } catch (error) {
            console.error('Login callback failed:', error);
        }
        return this.checkAuth()
    }

    async checkAuth(): Promise<boolean> {
        try {
            const user = await this.userManager.getUser();
            if (user) {
                this.isAuthenticated = true;
                return true;
            } else {
                this.isAuthenticated = false;
                return false;
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.isAuthenticated = false;
            return false;
        }
    }
}
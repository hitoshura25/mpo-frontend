import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const settings: UserManagerSettings = {
    authority: 'http://localhost:8080/auth/realms/master', // e.g., 'https://accounts.google.com'
    client_id: 'Media-Player-Omega',
    redirect_uri: 'http://localhost:9080/login_callback.html', // Ensure this matches your setup
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: 'http://localhost:8080/',
    client_secret: 'CzmVBHbVlzMAvn1kpfuzZ1PbQ7vEnn2A'
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
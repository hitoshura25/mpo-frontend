import { Auth } from "./auth";

async function handleLoginCallback() {
    const auth = Auth.getInstance();
    const isLoggedIn = await auth.handleLoginCallback();
    if (isLoggedIn) {
        window.location.href = './index.html';
        return;
    }
}

handleLoginCallback()
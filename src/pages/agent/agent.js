import { AuthService } from '../../services/AuthService.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    if (!AuthService.isLoggedIn()) {
        window.location.href = '/src/pages/login/login.html';
        return;
    }

    const currentUser = AuthService.getCurrentUser();
    if (currentUser.role !== 'agent') {
        window.location.href = '/src/pages/login/login.html';
        return;
    }

    // Set username
    const usernameElement = document.getElementById('agentUsername');
    if (usernameElement) {
        usernameElement.textContent = currentUser.username;
    }

    // Setup logout handler
    const logoutBtn = document.getElementById('agentLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthService.logout();
            window.location.href = '/src/pages/login/login.html';
        });
    }
});

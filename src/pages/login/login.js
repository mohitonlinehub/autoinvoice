import { AuthService } from '../../services/AuthService.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const authData = await AuthService.login(username, password);
        const { role } = authData.record;
        
        // Redirect based on role
        window.location.href = role === 'admin' 
            ? '/src/pages/admin/admin.html' 
            : '/src/pages/agent/agent.html';
    } catch (error) {
        errorDiv.textContent = 'Invalid username or password';
        errorDiv.classList.remove('hidden');
    }
});

// Check if already logged in
window.addEventListener('load', () => {
    if (AuthService.isLoggedIn()) {
        const { role } = AuthService.getCurrentUser();
        window.location.href = role === 'admin' 
            ? '/src/pages/admin/admin.html' 
            : '/src/pages/agent/agent.html';
    }
});
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://autoinvoicesample.pockethost.io/');

function showView(viewId, username = '') {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show requested view
    document.getElementById(viewId).classList.remove('hidden');
    
    // Update username if provided
    if (username) {
        if (viewId === 'adminView') {
            document.getElementById('adminUsername').textContent = username;
        } else if (viewId === 'agentView') {
            document.getElementById('agentUsername').textContent = username;
        }
    }
}

// Check if user is already logged in
if (pb.authStore.isValid) {
    const { role, username } = pb.authStore.model;
    showView(role === 'admin' ? 'adminView' : 'agentView', username);
} else {
    showView('loginView');
}

// Login form handler
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const authData = await pb.collection('users').authWithPassword(
            username,
            password
        );
        
        console.log('Login successful!', {
            username: authData.record.username,
            role: authData.record.role
        });
        
        // Show appropriate view with username
        showView(
            authData.record.role === 'admin' ? 'adminView' : 'agentView',
            authData.record.username
        );
        
    } catch (error) {
        console.error('Login failed:', error);
        alert('Invalid username or password. Please try again.');
    }
});

// Logout handlers
['admin', 'agent'].forEach(role => {
    document.getElementById(`${role}LogoutBtn`).addEventListener('click', () => {
        pb.authStore.clear();
        showView('loginView');
    });
});
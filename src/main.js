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
            refreshAgentList();
            refreshProductList();
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

// Create Agent Form Handler
if (document.getElementById('createAgentForm')) {
    document.getElementById('createAgentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('newAgentUsername').value;
        const password = document.getElementById('newAgentPassword').value;
        
        try {
            const record = await pb.collection('users').create({
                username,
                password,
                passwordConfirm: password,
                role: "agent"
            });
            
            console.log('Agent created successfully:', record);
            alert('Agent created successfully!');
            
            e.target.reset();
            refreshAgentList();
            
        } catch (error) {
            console.error('Failed to create agent:', error);
            alert('Failed to create agent. Please try again.');
        }
    });
}

// Function to fetch and display agents
async function refreshAgentList() {
    try {
        const records = await pb.collection('users').getList(1, 50, {
            filter: 'role = "agent"',
            sort: '-created'
        });
        
        const agentList = document.getElementById('agentList');
        agentList.innerHTML = ''; // Clear current list
        
        records.items.forEach(agent => {
            const li = document.createElement('li');
            li.textContent = agent.username;
            agentList.appendChild(li);
        });
        
    } catch (error) {
        console.error('Failed to fetch agents:', error);
    }
}

// Create Product Form Handler
if (document.getElementById('createProductForm')) {
    document.getElementById('createProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        
        try {
            const record = await pb.collection('products').create({
                name,
                price
            });
            
            console.log('Product created successfully:', record);
            alert('Product created successfully!');
            
            e.target.reset();
            refreshProductList();
            
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product. Please try again.');
        }
    });
}

// Function to fetch and display products
async function refreshProductList() {
    try {
        const records = await pb.collection('products').getList(1, 50, {
            sort: '-created'
        });
        
        const productList = document.getElementById('productList');
        productList.innerHTML = ''; // Clear current list
        
        records.items.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ₹${product.price.toFixed(2)}`;
            productList.appendChild(li);
        });
        
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
}
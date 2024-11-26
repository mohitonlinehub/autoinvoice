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
            refreshCompanyList();
            refreshBankList();
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

// Create Company Form Handler
if (document.getElementById('createCompanyForm')) {
    // Populate dropdowns when company form loads
    async function populateCompanyDropdowns() {
        try {
            // Fetch banks
            const banks = await pb.collection('banks').getList(1, 50);
            const bankSelect = document.getElementById('companyBanks');
            bankSelect.innerHTML = '';
            banks.items.forEach(bank => {
                const option = new Option(`${bank.name} - ${bank.account}`, bank.id);
                bankSelect.appendChild(option);
            });
            
            // Fetch products
            const products = await pb.collection('products').getList(1, 50);
            const productSelect = document.getElementById('companyProducts');
            productSelect.innerHTML = '';
            products.items.forEach(product => {
                const option = new Option(`${product.name} - ₹${product.price}`, product.id);
                productSelect.appendChild(option);
            });
            
            // Fetch agents
            const agents = await pb.collection('users').getList(1, 50, {
                filter: 'role = "agent"'
            });
            const agentSelect = document.getElementById('companyAgents');
            agentSelect.innerHTML = '';
            agents.items.forEach(agent => {
                const option = new Option(agent.username, agent.id);
                agentSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Failed to populate dropdowns:', error);
        }
    }
    
    populateCompanyDropdowns();
    
    // Update company form handler
    document.getElementById('createCompanyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('companyName').value;
        const address = document.getElementById('companyAddress').value;
        const mobile = document.getElementById('companyMobile').value;
        const email = document.getElementById('companyEmail').value;
        const website = document.getElementById('companyWebsite').value;
        
        // Get selected values from dropdowns
        const banks = Array.from(document.getElementById('companyBanks').selectedOptions).map(opt => opt.value);
        const products = Array.from(document.getElementById('companyProducts').selectedOptions).map(opt => opt.value);
        const agents = Array.from(document.getElementById('companyAgents').selectedOptions).map(opt => opt.value);
        
        try {
            const record = await pb.collection('companies').create({
                name,
                address,
                mobile,
                email,
                website,
                banks,
                products,
                agents
            });
            
            console.log('Company created successfully:', record);
            alert('Company created successfully!');
            
            e.target.reset();
            refreshCompanyList();
            
        } catch (error) {
            console.error('Failed to create company:', error.data);
            alert('Failed to create company. Please try again.');
        }
    });
}

// Function to fetch and display companies
async function refreshCompanyList() {
    try {
        const records = await pb.collection('companies').getList(1, 50, {
            sort: '-created'
        });
        
        const companyList = document.getElementById('companyList');
        companyList.innerHTML = ''; // Clear current list
        
        records.items.forEach(company => {
            const li = document.createElement('li');
            li.textContent = `${company.name} - ${company.address} - ${company.mobile}`;
            companyList.appendChild(li);
        });
        
    } catch (error) {
        console.error('Failed to fetch companies:', error);
    }
}

// Create Bank Form Handler
if (document.getElementById('createBankForm')) {
    document.getElementById('createBankForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('bankName').value;
        const account = document.getElementById('bankAccount').value;
        const ifsc = document.getElementById('bankIFSC').value;
        
        try {
            const record = await pb.collection('banks').create({
                name,
                account,
                ifsc
            });
            
            console.log('Bank account added successfully:', record);
            alert('Bank account added successfully!');
            
            e.target.reset();
            refreshBankList();
            
        } catch (error) {
            console.error('Failed to add bank account:', error);
            alert('Failed to add bank account. Please try again.');
        }
    });
}

// Function to fetch and display banks
async function refreshBankList() {
    try {
        const records = await pb.collection('banks').getList(1, 50, {
            sort: '-created'
        });
        
        const bankList = document.getElementById('bankList');
        bankList.innerHTML = ''; // Clear current list
        
        records.items.forEach(bank => {
            const li = document.createElement('li');
            li.textContent = `${bank.name} - A/C: ${bank.account} - IFSC: ${bank.ifsc}`;
            bankList.appendChild(li);
        });
        
    } catch (error) {
        console.error('Failed to fetch banks:', error);
    }
}
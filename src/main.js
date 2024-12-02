import { AuthService } from './services/AuthService';
import { AgentService } from './services/AgentService';
import { ProductService } from './services/ProductService';
import { BankService } from './services/BankService';
import { showView } from './handlers/ViewHandler';
import { ModalHandler } from './handlers/ModalHandler';
import { CompanyFormHandler } from './handlers/CompanyFormHandler';
import { CompanyService } from './services/CompanyService';

// Initial setup and auth check
if (AuthService.isLoggedIn()) {
    const { role, username } = AuthService.getCurrentUser();
    showView(role === 'admin' ? 'adminView' : 'agentView', username);
} else {
    showView('loginView');
}

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const authData = await AuthService.login(
            document.getElementById('username').value,
            document.getElementById('password').value
        );
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
    document.getElementById(`${role}LogoutBtn`)?.addEventListener('click', () => {
        AuthService.logout();
        showView('loginView');
    });
});

// Refresh functions
async function refreshAgentList() {
    try {
        const records = await AgentService.getAgents();
        const agentList = document.getElementById('agentList');
        agentList.innerHTML = '';
        
        records.items.forEach(agent => {
            const li = document.createElement('li');
            li.className = 'agent-item';
            
            const agentInfo = document.createElement('span');
            agentInfo.textContent = agent.username;
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => ModalHandler.showEditAgentModal(agent);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete agent ${agent.username}?`)) {
                    await AgentService.deleteAgent(agent.id);
                    refreshAgentList();
                }
            };
            
            li.append(agentInfo, editBtn, deleteBtn);
            agentList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch agents:', error);
    }
}

async function refreshProductList() {
    try {
        const records = await ProductService.getProducts();
        const productList = document.getElementById('productList');
        productList.innerHTML = '';
        
        records.items.forEach(product => {
            const li = document.createElement('li');
            
            const productInfo = document.createElement('span');
            productInfo.textContent = `${product.name} - ₹${product.price.toFixed(2)}`;
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => ModalHandler.showEditProductModal(product);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete product ${product.name}?`)) {
                    await ProductService.deleteProduct(product.id);
                    refreshProductList();
                }
            };
            
            li.append(productInfo, editBtn, deleteBtn);
            productList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
}

async function refreshBankList() {
    try {
        const records = await BankService.getBanks();
        const bankList = document.getElementById('bankList');
        bankList.innerHTML = '';
        
        records.items.forEach(bank => {
            const li = document.createElement('li');
            
            const bankInfo = document.createElement('span');
            bankInfo.textContent = `${bank.name} - A/C: ${bank.account} - IFSC: ${bank.ifsc}`;
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => ModalHandler.showEditBankModal(bank);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete bank ${bank.name}?`)) {
                    await BankService.deleteBank(bank.id);
                    refreshBankList();
                }
            };
            
            li.append(bankInfo, editBtn, deleteBtn);
            bankList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch banks:', error);
    }
}

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Create Agent Form
    document.getElementById('createAgentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await AgentService.createAgent(
                document.getElementById('newAgentUsername').value,
                document.getElementById('newAgentPassword').value
            );
            e.target.reset();
            refreshAgentList();
        } catch (error) {
            console.error('Failed to create agent:', error);
            alert('Failed to create agent. Please try again.');
        }
    });

    // Create Product Form
    document.getElementById('createProductForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await ProductService.createProduct(
                document.getElementById('productName').value,
                parseFloat(document.getElementById('productPrice').value)
            );
            e.target.reset();
            refreshProductList();
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product. Please try again.');
        }
    });

    // Create Bank Form
    document.getElementById('createBankForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await BankService.createBank(
                document.getElementById('bankName').value,
                document.getElementById('bankAccount').value,
                document.getElementById('bankIFSC').value
            );
            e.target.reset();
            refreshBankList();
        } catch (error) {
            console.error('Failed to create bank:', error);
            alert('Failed to create bank. Please try again.');
        }
    });

    // Edit form handlers
    ['Agent', 'Product', 'Bank'].forEach(type => {
        document.getElementById(`edit${type}Form`)?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const modal = document.getElementById(`edit${type}Modal`);
            const id = modal.dataset[`${type.toLowerCase()}Id`];
            
            try {
                const service = { AgentService, ProductService, BankService }[`${type}Service`];
                const data = type === 'Agent' 
                    ? {
                        username: document.getElementById('editAgentUsername').value,
                        password: document.getElementById('editAgentPassword').value || undefined
                    }
                    : type === 'Product'
                    ? {
                        name: document.getElementById('editProductName').value,
                        price: parseFloat(document.getElementById('editProductPrice').value)
                    }
                    : {
                        name: document.getElementById('editBankName').value,
                        account: document.getElementById('editBankAccount').value,
                        ifsc: document.getElementById('editBankIFSC').value
                    };
                
                await service.update(id, data);
                modal.classList.add('hidden');
                window[`refresh${type}List`]();
            } catch (error) {
                console.error(`Failed to update ${type.toLowerCase()}:`, error);
                alert(`Failed to update ${type.toLowerCase()}. Please try again.`);
            }
        });
        
        // Cancel button handlers
        document.getElementById(`cancelEdit${type}`)?.addEventListener('click', () => {
            document.getElementById(`edit${type}Modal`).classList.add('hidden');
        });
    });

    // Create Company Form
    const createCompanyForm = document.getElementById('createCompanyForm');
    if (createCompanyForm) {
        // Populate select lists when form is loaded
        CompanyFormHandler.populateSelectLists();
        
        createCompanyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = {
                    name: document.getElementById('companyName').value,
                    address: document.getElementById('companyAddress').value,
                    mobile: document.getElementById('companyMobile').value,
                    email: document.getElementById('companyEmail').value,
                    website: document.getElementById('companyWebsite').value,
                    banks: Array.from(document.getElementById('companyBanks').selectedOptions).map(opt => opt.value),
                    products: Array.from(document.getElementById('companyProducts').selectedOptions).map(opt => opt.value),
                    agents: Array.from(document.getElementById('companyAgents').selectedOptions).map(opt => opt.value)
                };
                
                await CompanyService.createCompany(formData);
                e.target.reset();
                CompanyFormHandler.refreshCompanyList();
                alert('Company created successfully!');
            } catch (error) {
                console.error('Failed to create company:', error);
                alert('Failed to create company. Please try again.');
            }
        });
    }

    // Refresh lists when admin view is shown
    document.addEventListener('refreshLists', () => {
        refreshAgentList();
        refreshProductList();
        refreshBankList();
        CompanyFormHandler.refreshCompanyList();
    });

    // Set default date to today
    const invoiceDatePicker = document.getElementById('invoiceDate');
    if (invoiceDatePicker) {
        // Set max date to today to prevent future date selection
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        invoiceDatePicker.setAttribute('max', maxDate);
        
        // Set default value to today
        invoiceDatePicker.value = maxDate;
        
        // Format the displayed date as YYYY/MM/DD
        invoiceDatePicker.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const formattedDate = selectedDate.toLocaleDateString('en-CA'); // Uses YYYY/MM/DD format
            console.log('Selected date:', formattedDate);
            // Store the formatted date for later use
            invoiceDatePicker.dataset.formattedDate = formattedDate;
        });
    }

    // Populate company dropdown when agent view is shown
    document.addEventListener('viewChanged', async (e) => {
        if (e.detail.view === 'agentView') {
            await populateCompanyDropdown();
        }
    });
});

async function populateCompanyDropdown() {
    const companySelect = document.getElementById('companySelect');
    if (!companySelect) return;

    try {
        const result = await CompanyService.getAssignedCompanies();
        
        // Clear existing options except the first default option
        while (companySelect.options.length > 1) {
            companySelect.remove(1);
        }

        // Add companies to dropdown
        result.items.forEach(company => {
            const option = new Option(company.name, company.id);
            companySelect.add(option);
        });
    } catch (error) {
        console.error('Failed to load companies:', error);
        alert('Failed to load assigned companies. Please try again.');
    }
}
import { AuthService } from '../../services/AuthService.js';
import { AgentService } from '../../services/AgentService.js';
import { ProductService } from '../../services/ProductService.js';
import { BankService } from '../../services/BankService.js';
import { CompanyService } from '../../services/CompanyService.js';
import { AgentListHandler } from '../../handlers/AgentListHandler.js';
import { ProductListHandler } from '../../handlers/ProductListHandler.js';
import { BankListHandler } from '../../handlers/BankListHandler.js';
import { CompanyListHandler } from '../../handlers/CompanyListHandler.js';
import { FormHandler } from '../../handlers/FormHandler.js';

class AdminDashboard {
    constructor() {
        this.initializeAuth();
        this.initializeEventListeners();
        this.refreshAllLists();
    }

    initializeAuth() {
        if (!AuthService.isLoggedIn() || AuthService.getCurrentUser().role !== 'admin') {
            window.location.href = '/src/pages/login/login.html';
            return;
        }

        document.getElementById('adminUsername').textContent = AuthService.getCurrentUser().username;
    }

    initializeEventListeners() {
        document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
            AuthService.logout();
            window.location.href = '/src/pages/login/login.html';
        });

        this.initializeForms();
    }

    initializeForms() {
        // Initialize Agent form
        FormHandler.initializeCreateForm('createAgentForm', async (form) => {
            const data = FormHandler.getFormData(form, [
                { id: 'newAgentUsername', name: 'username' },
                { id: 'newAgentPassword', name: 'password' }
            ]);
            await AgentService.createAgent(data);
            AgentListHandler.refresh();
        });

        // Initialize Product form
        FormHandler.initializeCreateForm('createProductForm', async (form) => {
            const data = FormHandler.getFormData(form, [
                { id: 'productName', name: 'name' },
                { id: 'productPrice', name: 'price', type: 'number' }
            ]);
            await ProductService.createProduct(data);
            ProductListHandler.refresh();
        });

        // Initialize Bank form
        FormHandler.initializeCreateForm('createBankForm', async (form) => {
            const data = FormHandler.getFormData(form, [
                { id: 'bankName', name: 'name' },
                { id: 'bankAccount', name: 'account' },
                { id: 'bankIFSC', name: 'ifsc' }
            ]);
            await BankService.createBank(data);
            BankListHandler.refresh();
        });

        // Initialize Company form
        FormHandler.initializeCreateForm('createCompanyForm', async (form) => {
            console.log('Creating new company...');
            const data = FormHandler.getFormData(form, [
                { id: 'companyName', name: 'name' },
                { id: 'companyAddress', name: 'address' },
                { id: 'companyMobile', name: 'mobile' },
                { id: 'companyEmail', name: 'email' },
                { id: 'companyWebsite', name: 'website' },
                { id: 'companyBanks', name: 'banks', type: 'multiselect' },
                { id: 'companyAgents', name: 'agents', type: 'multiselect' }
            ]);
            console.log('Company data:', data);
            await CompanyService.createCompany(data);
            console.log('Company created successfully');
            CompanyListHandler.refresh();
        });
    }

    refreshAllLists() {
        AgentListHandler.refresh();
        ProductListHandler.refresh();
        BankListHandler.refresh();
        CompanyListHandler.refresh();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

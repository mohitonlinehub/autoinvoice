import { AuthService } from '../../services/AuthService.js';
import { CompanyService } from '../../services/CompanyService.js';
import { ExcelParserService } from '../../services/ExcelParserService.js';

class AgentDashboard {
    constructor() {
        this.selectedCompanyId = null;
        this.initializeUI();
        this.loadAssignedCompanies();
        this.initializeFileUpload();
    }

    async initializeUI() {
        const currentUser = AuthService.getCurrentUser();
        const usernameElement = document.getElementById('agentUsername');
        if (usernameElement) {
            usernameElement.textContent = currentUser.username;
        }

        const logoutBtn = document.getElementById('agentLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthService.logout();
                window.location.href = '/src/pages/login/login.html';
            });
        }
    }

    async loadAssignedCompanies() {
        try {
            const companiesSelect = document.getElementById('assignedCompanies');
            if (!companiesSelect) return;

            companiesSelect.innerHTML = '<option value="">Select a company...</option>';

            const response = await CompanyService.getAssignedCompanies();
            
            response.items.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companiesSelect.appendChild(option);
            });

            companiesSelect.addEventListener('change', (e) => {
                this.selectedCompanyId = e.target.value;
                if (!this.selectedCompanyId) {
                    document.getElementById('fileUpload').value = '';
                }
            });

        } catch (error) {
            console.error('Failed to load assigned companies:', error);
            alert('Failed to load companies. Please try again.');
        }
    }

    initializeFileUpload() {
        const fileUpload = document.getElementById('fileUpload');

        fileUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!this.selectedCompanyId) {
                alert('Please select a company first');
                fileUpload.value = '';
                return;
            }

            try {
                console.log('Processing file:', file.name);
                const entries = await ExcelParserService.parseExcelFile(file);
                console.log('Parsed entries:', entries);
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file: ' + error.message);
                fileUpload.value = '';
            }
        });
    }
}

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

    new AgentDashboard();
});

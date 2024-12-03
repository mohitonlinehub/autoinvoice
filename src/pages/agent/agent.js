import { AuthService } from '../../services/AuthService.js';
import { CompanyService } from '../../services/CompanyService.js';
import { ExcelParserService } from '../../services/ExcelParserService.js';
import { InvoiceService } from '../../services/InvoiceService.js';

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
                console.log(`Parsed ${entries.length} entries`);

                const currentUser = AuthService.getCurrentUser();
                const invoiceEntries = entries.map(entry => ({
                    tran_type: entry.tranType,
                    tran_id: entry.tranId,
                    date: entry["Tran Date"],
                    balance: entry["Balance Amount"],
                    withdrawal: entry["Withdrawal"],
                    deposit: entry["Deposit"],
                    agent: currentUser.username,
                    company: this.selectedCompanyId
                }));

                // Show processing status to user
                const statusDiv = this.createStatusElement();
                
                try {
                    const results = await InvoiceService.createInvoiceBatch(invoiceEntries, 10);
                    console.log('Processing complete:', results);
                    
                    const message = `Processing complete!\nSuccessful: ${results.success}\nSkipped: ${results.skipped}\nFailed: ${results.failed}`;
                    alert(message);
                } catch (error) {
                    console.error('Failed to process entries:', error);
                    alert('Failed to process entries. Please try again.');
                } finally {
                    fileUpload.value = '';
                    statusDiv.remove();
                }
                
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file: ' + error.message);
                fileUpload.value = '';
            }
        });
    }

    createStatusElement() {
        const statusDiv = document.createElement('div');
        statusDiv.style.position = 'fixed';
        statusDiv.style.top = '20px';
        statusDiv.style.right = '20px';
        statusDiv.style.padding = '10px';
        statusDiv.style.background = '#f0f0f0';
        statusDiv.style.border = '1px solid #ccc';
        statusDiv.style.borderRadius = '4px';
        statusDiv.style.zIndex = '1000';
        statusDiv.textContent = 'Processing entries...';
        document.body.appendChild(statusDiv);
        return statusDiv;
    }

    updateStatusElement(statusDiv, progress) {
        statusDiv.textContent = `Processing entries... ${progress}%`;
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

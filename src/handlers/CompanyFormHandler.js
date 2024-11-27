import { AgentService } from '../services/AgentService';
import { ProductService } from '../services/ProductService';
import { BankService } from '../services/BankService';
import { CompanyService } from '../services/CompanyService';

export class CompanyFormHandler {
    static async populateSelectLists() {
        try {
            // Populate banks select
            const banks = await BankService.getBanks();
            const bankSelect = document.getElementById('companyBanks');
            bankSelect.innerHTML = '';
            banks.items.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank.id;
                option.textContent = `${bank.name} (${bank.account})`;
                bankSelect.appendChild(option);
            });

            // Populate products select
            const products = await ProductService.getProducts();
            const productSelect = document.getElementById('companyProducts');
            productSelect.innerHTML = '';
            products.items.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (₹${product.price})`;
                productSelect.appendChild(option);
            });

            // Populate agents select
            const agents = await AgentService.getAgents();
            const agentSelect = document.getElementById('companyAgents');
            agentSelect.innerHTML = '';
            agents.items.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent.id;
                option.textContent = agent.username;
                agentSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to populate select lists:', error);
        }
    }

    static async refreshCompanyList() {
        try {
            const records = await CompanyService.getCompanies();
            const companyList = document.getElementById('companyList');
            companyList.innerHTML = '';
            
            records.items.forEach(company => {
                const li = document.createElement('li');
                li.className = 'company-item';
                
                // Main company info
                const mainInfo = document.createElement('div');
                mainInfo.className = 'company-main-info';
                mainInfo.textContent = `${company.name} - ${company.address} - ${company.mobile}`;
                
                // Related info container
                const relatedInfo = document.createElement('div');
                relatedInfo.className = 'company-related-info';
                
                // Banks
                const banksDiv = document.createElement('div');
                banksDiv.className = 'related-banks';
                banksDiv.innerHTML = '<strong>Banks:</strong> ';
                if (company.expand?.banks?.length) {
                    banksDiv.innerHTML += company.expand.banks
                        .map(bank => `${bank.name} (${bank.account})`)
                        .join(', ');
                } else {
                    banksDiv.innerHTML += 'No banks assigned';
                }
                
                // Products
                const productsDiv = document.createElement('div');
                productsDiv.className = 'related-products';
                productsDiv.innerHTML = '<strong>Products:</strong> ';
                if (company.expand?.products?.length) {
                    productsDiv.innerHTML += company.expand.products
                        .map(product => `${product.name} (₹${product.price})`)
                        .join(', ');
                } else {
                    productsDiv.innerHTML += 'No products assigned';
                }
                
                // Agents
                const agentsDiv = document.createElement('div');
                agentsDiv.className = 'related-agents';
                agentsDiv.innerHTML = '<strong>Agents:</strong> ';
                if (company.expand?.agents?.length) {
                    agentsDiv.innerHTML += company.expand.agents
                        .map(agent => agent.username)
                        .join(', ');
                } else {
                    agentsDiv.innerHTML += 'No agents assigned';
                }
                
                // Append all elements
                relatedInfo.appendChild(banksDiv);
                relatedInfo.appendChild(productsDiv);
                relatedInfo.appendChild(agentsDiv);
                li.appendChild(mainInfo);
                li.appendChild(relatedInfo);
                companyList.appendChild(li);
            });
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        }
    }
} 
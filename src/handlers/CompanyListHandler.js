import { BaseListHandler } from './BaseListHandler.js';
import { CompanyService } from '../services/CompanyService.js';

export class CompanyListHandler extends BaseListHandler {
    static async refresh() {
        await this.refreshList(CompanyService, 'companyList', (li, company) => {
            li.className = 'list-item company-item';
            li.innerHTML = `
                <div class="company-info">
                    <div class="company-main">
                        <span class="company-name">${company.name}</span>
                        <span class="company-email">${company.email}</span>
                        <span class="company-mobile">${company.mobile}</span>
                    </div>
                    <div class="company-details">
                        <span class="company-address">${company.address}</span>
                        ${company.website ? `<span class="company-website">${company.website}</span>` : ''}
                    </div>
                    <div class="company-relations">
                        ${this.renderRelations(company)}
                    </div>
                </div>
            `;
        }, 'getCompanies');
    }

    static renderRelations(company) {
        const sections = [];
        
        if (company.expand?.banks) {
            sections.push(`
                <div class="company-banks">
                    <strong>Banks:</strong> ${company.expand.banks.map(bank => bank.name).join(', ')}
                </div>
            `);
        }
        
        if (company.expand?.products) {
            sections.push(`
                <div class="company-products">
                    <strong>Products:</strong> ${company.expand.products.map(product => product.name).join(', ')}
                </div>
            `);
        }
        
        if (company.expand?.agents) {
            sections.push(`
                <div class="company-agents">
                    <strong>Agents:</strong> ${company.expand.agents.map(agent => agent.username).join(', ')}
                </div>
            `);
        }
        
        return sections.join('');
    }
} 
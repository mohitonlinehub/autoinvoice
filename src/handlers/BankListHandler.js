import { BaseListHandler } from './BaseListHandler.js';
import { BankService } from '../services/BankService.js';

export class BankListHandler extends BaseListHandler {
    static async refresh() {
        await this.refreshList(BankService, 'bankList', (li, bank) => {
            li.className = 'list-item bank-item';
            li.innerHTML = `
                <div class="bank-info">
                    <span class="bank-name">${bank.name}</span>
                    <span class="bank-account">Account: ${bank.account}</span>
                    <span class="bank-ifsc">IFSC: ${bank.ifsc}</span>
                </div>
            `;
        }, 'getBanks');
        
        // Update dropdown
        const banks = await BankService.getBanks();
        this.updateDropdown('companyBanks', banks.items);
    }
} 
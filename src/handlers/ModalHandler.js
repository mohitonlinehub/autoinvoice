export class ModalHandler {
    static showEditAgentModal(agent) {
        const modal = document.getElementById('editAgentModal');
        const usernameInput = document.getElementById('editAgentUsername');
        const passwordInput = document.getElementById('editAgentPassword');
        
        usernameInput.value = agent.username;
        passwordInput.value = '';
        modal.dataset.agentId = agent.id;
        modal.classList.remove('hidden');
    }
    
    static showEditProductModal(product) {
        const modal = document.getElementById('editProductModal');
        const nameInput = document.getElementById('editProductName');
        const priceInput = document.getElementById('editProductPrice');
        
        nameInput.value = product.name;
        priceInput.value = product.price;
        modal.dataset.productId = product.id;
        modal.classList.remove('hidden');
    }
    
    static showEditBankModal(bank) {
        const modal = document.getElementById('editBankModal');
        const nameInput = document.getElementById('editBankName');
        const accountInput = document.getElementById('editBankAccount');
        const ifscInput = document.getElementById('editBankIFSC');
        
        nameInput.value = bank.name;
        accountInput.value = bank.account;
        ifscInput.value = bank.ifsc;
        modal.dataset.bankId = bank.id;
        modal.classList.remove('hidden');
    }
} 
import { pb } from '../pocketbase';

export class BankService {
    static async createBank(name, account, ifsc) {
        return await pb.collection('banks').create({ name, account, ifsc });
    }
    
    static async updateBank(id, data) {
        return await pb.collection('banks').update(id, data);
    }
    
    static async deleteBank(id) {
        return await pb.collection('banks').delete(id);
    }
    
    static async getBanks() {
        return await pb.collection('banks').getList(1, 50, {
            sort: '-created'
        });
    }
} 
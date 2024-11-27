import { pb } from '../pocketbase';

export class CompanyService {
    static async createCompany(data) {
        return await pb.collection('companies').create({
            name: data.name,
            address: data.address,
            mobile: data.mobile,
            email: data.email,
            website: data.website,
            banks: data.banks,
            products: data.products,
            agents: data.agents
        });
    }
    
    static async updateCompany(id, data) {
        return await pb.collection('companies').update(id, data);
    }
    
    static async deleteCompany(id) {
        return await pb.collection('companies').delete(id);
    }
    
    static async getCompanies() {
        return await pb.collection('companies').getList(1, 50, {
            sort: '-created',
            expand: 'banks,products,agents'
        });
    }
} 
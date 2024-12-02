import { pb } from '../pocketbase';

export class AgentService {
    static async createAgent(data) {
        return await pb.collection('users').create({
            username: data.username,
            password: data.password,
            passwordConfirm: data.password,
            role: "agent"
        });
    }
    
    static async updateAgent(id, data) {
        return await pb.collection('users').update(id, data);
    }
    
    static async deleteAgent(id) {
        return await pb.collection('users').delete(id);
    }
    
    static async getAgents() {
        return await pb.collection('users').getList(1, 50, {
            filter: 'role = "agent"',
            sort: '-created'
        });
    }
} 
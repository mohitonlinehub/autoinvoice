import { pb } from '../pocketbase';

export class AuthService {
    static async login(username, password) {
        return await pb.collection('users').authWithPassword(username, password);
    }
    
    static logout() {
        pb.authStore.clear();
    }
    
    static isLoggedIn() {
        return pb.authStore.isValid;
    }
    
    static getCurrentUser() {
        return pb.authStore.model;
    }
} 
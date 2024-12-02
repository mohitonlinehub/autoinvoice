import { pb } from '../pocketbase';

export class ProductService {
    static async createProduct(data) {
        return await pb.collection('products').create({
            name: data.name,
            price: data.price
        });
    }
    
    static async updateProduct(id, data) {
        return await pb.collection('products').update(id, data);
    }
    
    static async deleteProduct(id) {
        return await pb.collection('products').delete(id);
    }
    
    static async getProducts() {
        return await pb.collection('products').getList(1, 50, {
            sort: '-created'
        });
    }
} 
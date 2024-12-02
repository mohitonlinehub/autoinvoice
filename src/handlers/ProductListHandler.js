import { BaseListHandler } from './BaseListHandler.js';
import { ProductService } from '../services/ProductService.js';

export class ProductListHandler extends BaseListHandler {
    static async refresh() {
        await this.refreshList(ProductService, 'productList', (li, product) => {
            li.className = 'list-item product-item';
            li.innerHTML = `
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <span class="product-price">₹${product.price.toFixed(2)}</span>
                </div>
            `;
        }, 'getProducts');
    }
} 
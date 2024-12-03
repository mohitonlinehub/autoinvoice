export class ProductRangeService {
    static PRICE_RANGES = [
        { min: 1, max: 100, name: 'Paper Clips' },
        { min: 100, max: 500, name: 'Pen Set' },
        { min: 500, max: 1000, name: 'Office Chair' },
        { min: 1000, max: 1500, name: 'Coffee Maker' },
        { min: 1500, max: 2000, name: 'Study Lamp' },
        { min: 2000, max: 3000, name: 'Office Table' },
        { min: 3000, max: 4000, name: 'Printer' },
        { min: 4000, max: 5000, name: 'Filing Cabinet' },
        { min: 5000, max: 7000, name: 'Air Conditioner' },
        { min: 7000, max: 10000, name: 'Refrigerator' },
        { min: 10000, max: 15000, name: 'Laptop' },
        { min: 15000, max: 20000, name: 'Desktop Computer' },
        { min: 20000, max: 25000, name: 'Smart TV' },
        { min: 25000, max: 30000, name: 'Conference Table' },
        { min: 30000, max: 40000, name: 'Server Unit' },
        { min: 40000, max: 50000, name: 'Workstation Setup' },
        { min: 50000, max: 75000, name: 'Industrial Printer' },
        { min: 75000, max: 100000, name: 'Network Equipment' },
        { min: 100000, max: 150000, name: 'Industrial Generator' },
        { min: 150000, max: 200000, name: 'CNC Machine' },
        { min: 200000, max: 250000, name: 'Solar Power System' },
        { min: 250000, max: 300000, name: 'Industrial Air Compressor' },
        { min: 300000, max: 400000, name: 'Manufacturing Equipment' },
        { min: 400000, max: 500000, name: 'Heavy Machinery' },
        { min: 500000, max: 600000, name: 'Commercial Vehicle' },
        { min: 600000, max: 700000, name: 'Industrial Robot' },
        { min: 700000, max: 800000, name: 'Production Line Equipment' },
        { min: 800000, max: 900000, name: 'Automated Assembly System' },
        { min: 900000, max: 1000000, name: 'Factory Automation Setup' }
    ];

    static findProductForAmount(amount) {
        const range = this.PRICE_RANGES.find(range => 
            amount >= range.min && amount <= range.max
        );
        
        if (range) {
            console.log(`Found product match: Amount ₹${amount} maps to "${range.name}"`);
        } else {
            console.log(`No product range found for amount: ₹${amount}`);
        }
        
        return range || null;
    }

    static async getOrCreateProduct(amount) {
        const range = this.findProductForAmount(amount);
        if (!range) {
            console.warn(`No product range found for amount: ${amount}`);
            return null;
        }

        // Try to find existing product in this range
        const existingProducts = await pb.collection('products').getList(1, 1, {
            filter: `name = "${range.name}" && price >= ${range.min} && price <= ${range.max}`
        });

        if (existingProducts.items.length > 0) {
            return existingProducts.items[0];
        }

        // Create new product if none exists
        return await pb.collection('products').create({
            name: range.name,
            price: amount,
            type: range.type
        });
    }
} 
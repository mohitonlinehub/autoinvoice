import { pb } from '../pocketbase';
import { ProductRangeService } from './ProductRangeService.js';

export class InvoiceService {
    static async getExistingTransactionIds() {
        const records = await pb.collection('invoices').getFullList({
            fields: 'tran_id'
        });
        return new Set(records.map(record => record.tran_id));
    }

    static async createInvoiceBatch(entries) {
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            total: entries.length,
            productMappings: []
        };

        try {
            // Comment out existing transaction check for testing
            /*
            const existingTranIds = await this.getExistingTransactionIds();
            console.log(`Found ${existingTranIds.size} existing transactions`);

            const newEntries = entries.filter(entry => {
                if (!entry.tran_id || existingTranIds.has(entry.tran_id)) {
                    results.skipped++;
                    return false;
                }
                return true;
            });
            */

            // Use all entries for testing
            const newEntries = entries;

            console.log(`Processing ${newEntries.length} entries`);
            console.log('=== Starting Product Mapping Analysis ===');

            for (const entry of newEntries) {
                try {
                    const amount = parseFloat(entry.withdrawal) || parseFloat(entry.deposit);
                    const transactionType = entry.withdrawal > 0 ? 'Withdrawal' : 'Deposit';

                    console.log(`\nAnalyzing transaction: ${entry.tran_id}`);
                    console.log(`Transaction Type: ${transactionType}`);
                    console.log(`Amount: ₹${amount}`);

                    const product = ProductRangeService.findProductForAmount(amount);

                    results.productMappings.push({
                        transactionId: entry.tran_id,
                        amount,
                        transactionType,
                        mappedProduct: product ? product.name : 'No Match',
                        date: entry.date
                    });

                    // Comment out database operations
                    /*
                    await pb.collection('invoices').create({
                        tran_type: entry.tran_type || '',
                        tran_id: entry.tran_id,
                        date: entry.date,
                        balance: parseFloat(entry.balance) || 0,
                        withdrawal: parseFloat(entry.withdrawal) || 0,
                        deposit: parseFloat(entry.deposit) || 0,
                        agent: entry.agent,
                        company: entry.company,
                        product: product?.id
                    });
                    */

                    results.success++;
                } catch (error) {
                    console.error('Failed to process entry:', error);
                    results.failed++;
                }

                const progress = ((results.success + results.failed + results.skipped) / entries.length * 100).toFixed(1);
                console.log(`Progress: ${progress}%`);
            }

            // Log summary after processing
            console.log('\n=== Product Mapping Summary ===');
            console.log('Sample of mapped transactions:');
            results.productMappings.slice(0, 5).forEach(mapping => {
                console.log(`
                Transaction ID: ${mapping.transactionId}
                Date: ${mapping.date}
                Type: ${mapping.transactionType}
                Amount: ₹${mapping.amount}
                Mapped Product: ${mapping.mappedProduct}
                -------------------`);
            });

            // Statistics with unmapped entries details
            const unmappedEntries = results.productMappings.filter(m => m.mappedProduct === 'No Match');
            console.log(`\nTotal Transactions Processed: ${results.productMappings.length}`);
            console.log(`Mapped Successfully: ${results.productMappings.length - unmappedEntries.length}`);
            console.log(`No Range Match: ${unmappedEntries.length}`);

            if (unmappedEntries.length > 0) {
                console.log('\n=== Unmapped Entries ===');
                unmappedEntries.forEach(entry => {
                    console.log(`
                    Transaction ID: ${entry.transactionId}
                    Date: ${entry.date}
                    Type: ${entry.transactionType}
                    Amount: ₹${entry.amount}
                    -------------------`);
                });
            }

            return results;

        } catch (error) {
            console.error('Batch processing failed:', error);
            throw error;
        }
    }
} 
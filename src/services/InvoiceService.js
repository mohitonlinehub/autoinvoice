import { pb } from '../pocketbase';

export class InvoiceService {
    static async getExistingTransactionIds() {
        try {
            const result = await pb.collection('invoices').getFullList({
                fields: 'tran_id',
                filter: 'tran_id != ""'
            });
            return new Set(result.map(item => item.tran_id));
        } catch (error) {
            console.error('Error fetching existing transaction IDs:', error);
            return new Set();
        }
    }

    static async createInvoiceBatch(entries) {
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            total: entries.length
        };

        try {
            const existingTranIds = await this.getExistingTransactionIds();
            console.log(`Found ${existingTranIds.size} existing transactions`);

            const newEntries = entries.filter(entry => {
                if (!entry.tran_id) {
                    results.skipped++;
                    return false;
                }
                if (existingTranIds.has(entry.tran_id)) {
                    results.skipped++;
                    return false;
                }
                return true;
            });

            console.log(`Processing ${newEntries.length} new entries`);

            for (const entry of newEntries) {
                try {
                    await pb.collection('invoices').create({
                        tran_type: entry.tran_type || '',
                        tran_id: entry.tran_id,
                        date: entry.date,
                        balance: parseFloat(entry.balance) || 0,
                        withdrawal: parseFloat(entry.withdrawal) || 0,
                        deposit: parseFloat(entry.deposit) || 0,
                        agent: entry.agent,
                        company: entry.company
                    });
                    results.success++;
                } catch (error) {
                    console.error('Failed to create invoice:', error);
                    results.failed++;
                }

                const progress = ((results.success + results.failed + results.skipped) / entries.length * 100).toFixed(1);
                console.log(`Progress: ${progress}%`);
            }

        } catch (error) {
            console.error('Error in batch processing:', error);
            throw error;
        }

        return results;
    }
} 
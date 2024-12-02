import { pb } from '../pocketbase';

export class InvoiceService {
    static async createInvoice(data) {
        try {
            return await pb.collection('invoices').create({
                tran_type: data.tran_type || '',
                tran_id: data.tran_id || '',
                date: data.date,
                balance: parseFloat(data.balance) || 0,
                withdrawal: parseFloat(data.withdrawal) || 0,
                deposit: parseFloat(data.deposit) || 0,
                agent: data.agent,
                company: data.company
            });
        } catch (error) {
            console.error('Failed to create invoice:', error);
            throw error;
        }
    }
} 
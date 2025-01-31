import { BaseListHandler } from './BaseListHandler.js';
import { PdfService } from '../services/PdfService.js';

export class InvoiceListHandler extends BaseListHandler {
    static async displayInvoices(invoices) {
        const listElement = document.getElementById('invoiceList');
        if (!listElement) return;

        listElement.innerHTML = '';
        
        // Handle PocketBase response format
        const invoiceItems = invoices.items || invoices;
        
        if (!invoiceItems || invoiceItems.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-item invoice-item';
            li.textContent = 'No invoices found for selected date';
            listElement.appendChild(li);
            return;
        }

        invoiceItems.forEach(invoice => {
            const li = document.createElement('li');
            li.className = 'list-item invoice-item';
            li.innerHTML = `
                <div class="invoice-info">
                    <div class="invoice-main">
                        <span class="invoice-id">ID: ${invoice.tran_id}</span>
                        <span class="invoice-type">Type: ${invoice.tran_type}</span>
                        <span class="invoice-date">Date: ${invoice.date}</span>
                    </div>
                    <div class="invoice-amounts">
                        <span class="invoice-withdrawal">Withdrawal: ₹${invoice.withdrawal?.toFixed(2) || '0.00'}</span>
                        <span class="invoice-deposit">Deposit: ₹${invoice.deposit?.toFixed(2) || '0.00'}</span>
                        <span class="invoice-balance">Balance: ₹${invoice.balance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="invoice-agent">
                        <span>Agent: ${invoice.agent}</span>
                    </div>
                </div>
            `;
            listElement.appendChild(li);
        });

        // Add Generate PDF button if there are invoices
        if (invoiceItems.length) {
            const generatePdfBtn = document.createElement('button');
            generatePdfBtn.id = 'generatePdfBtn';
            generatePdfBtn.textContent = 'Download Invoices';
            generatePdfBtn.className = 'generate-pdf-btn';
            generatePdfBtn.onclick = async () => {
                try {
                    generatePdfBtn.disabled = true;
                    generatePdfBtn.textContent = 'Generating...';
                    
                    await PdfService.generateInvoiceZip(invoiceItems);
                    
                    generatePdfBtn.textContent = 'Download Invoices';
                } catch (error) {
                    console.error('Failed to generate PDFs:', error);
                    alert('Failed to generate PDFs. Please try again.');
                } finally {
                    generatePdfBtn.disabled = false;
                }
            };
            listElement.after(generatePdfBtn);
        }
    }
}
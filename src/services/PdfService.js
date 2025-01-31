import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';

export class PdfService {
    static async generateInvoiceZip(invoices) {
        const zip = new JSZip();
        
        // Create a folder for invoices
        const invoicesFolder = zip.folder("invoices");
        
        // Generate PDF for each invoice and add to zip
        invoices.forEach(invoice => {
            const pdfDoc = this.createInvoicePdf(invoice);
            const pdfData = pdfDoc.output('arraybuffer');
            invoicesFolder.file(`Invoice_${invoice.tran_id}_${invoice.date}.pdf`, pdfData);
        });
        
        // Generate and download zip
        const zipContent = await zip.generateAsync({ type: "blob" });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(zipContent);
        downloadLink.download = `Invoices_${new Date().toISOString().split('T')[0]}.zip`;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    }

    // Renamed from generateInvoicePdf to createInvoicePdf
    static createInvoicePdf(invoice) {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(8);
        doc.text(`Printed on ${new Date().toLocaleString()}`, 150, 10, { align: 'right' });

        // Company Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('EXETALENT INFO SERVICES PRIVATE LIMITED', 15, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('UW1 NO. 707 BLOCK NO A 4TH FLOOR 33 SIRSI', 15, 25);
        doc.text('ROAD JAIPUR', 15, 30);
        doc.text('State Name    : Rajasthan, Code : 08', 15, 35);

        // Invoice Details Box
        doc.rect(15, 40, 180, 25); // x, y, width, height
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 90, 50);
        
        // Invoice Info
        doc.setFontSize(10);
        doc.text('Invoice No.', 120, 45);
        doc.text(invoice.tran_id || '96', 170, 45);
        doc.text('Dated', 120, 50);
        doc.text(invoice.date || '29-Nove-2024', 170, 50);
        doc.text('Mode/Terms of Payment', 120, 55);
        doc.text('Cash', 170, 55);

        // Buyer Details
        doc.setFont('helvetica', 'normal');
        doc.text('Buyer (Bill to)', 15, 75);
        doc.text('Cash', 15, 80);
        doc.text('State Name    : Rajasthan, Code : 08', 15, 85);

        // Description Table
        const tableColumn = [
            "Description of Goods", 
            "Amount"
        ];
        
        // Sample data - you'll need to adjust this based on your actual invoice data
        const tableRows = [
            ["Social Media Content", "15,000.00"],
            ["Instagram Ads", "9,055.08"]
        ];

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 100,
            theme: 'plain',
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            columnStyles: {
                0: { cellWidth: 140 },
                1: { cellWidth: 40, halign: 'right' }
            },
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            }
        });

        // Calculate total
        const finalY = doc.lastAutoTable.finalY + 10;
        
        // Add CGST and SGST
        doc.text('CGST', 140, finalY);
        doc.text('2,164.96', 180, finalY, { align: 'right' });
        doc.text('SGST', 140, finalY + 5);
        doc.text('2,164.96', 180, finalY + 5, { align: 'right' });
        
        // Total
        doc.setFont('helvetica', 'bold');
        doc.text('Total', 140, finalY + 15);
        doc.text('₹ 28,385.00', 180, finalY + 15, { align: 'right' });

        // Amount in words
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Amount Chargeable (in words)', 15, finalY + 25);
        doc.setFont('helvetica', 'bold');
        doc.text('INR Twenty Eight Thousand Three Hundred Eighty Five Only', 15, finalY + 30);

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('for EXETALENT INFO SERVICES PRIVATE LIMITED', 140, finalY + 45);
        doc.text('Goods Once sold will not taken or exchange', 15, finalY + 45);
        
        doc.setFontSize(8);
        doc.text('This is a Computer Generated Invoice', 90, finalY + 55, { align: 'center' });

        // Instead of saving, return the doc
        return doc;
    }
}
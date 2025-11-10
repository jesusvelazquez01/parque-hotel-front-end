
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { parseReceiptData, generateReceiptHtml } from '@/utils/receiptGenerator';
import { Printer, Download, Mail, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';

interface ReceiptProps {
  receiptData: string;
  receiptNumber: string;
  onClose?: () => void;
  showEmailButton?: boolean;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  onEmailReceipt?: () => void;
  isPrinting?: boolean;
  setIsPrinting?: (printing: boolean) => void;
}

const Receipt: React.FC<ReceiptProps> = ({ 
  receiptData, 
  receiptNumber, 
  onClose,
  showEmailButton = false,
  showPrintButton = true,
  showDownloadButton = true,
  onEmailReceipt,
  isPrinting = false,
  setIsPrinting = () => {}
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Safely parse receipt data and generate HTML with error handling
  const renderReceipt = () => {
    try {
      const parsedData = parseReceiptData(receiptData);
      // Always show the PAID stamp and use custom terms
      return generateReceiptHtml({...parsedData, paidStamp: true, customTerms: true});
    } catch (error) {
      console.error('Error rendering receipt:', error);
      return `<div class="p-8 text-center">
        <div class="flex justify-center mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-red-500 mb-2">Error Rendering Receipt</h3>
        <p class="text-gray-600">There was a problem processing this receipt. The receipt data may be corrupted or in an invalid format.</p>
      </div>`;
    }
  };

  const printReceipt = () => {
    setIsPrinting(true);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      try {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt #${receiptNumber}</title>
              <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet">
              <style>
                @media print {
                  body { margin: 0; padding: 0; }
                  .receipt { width: 100%; }
                }
              </style>
            </head>
            <body>
              ${renderReceipt()}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => setIsPrinting(false), 1000);
      } catch (error) {
        console.error('Error printing receipt:', error);
        toast.error("Failed to print receipt due to an error");
        setIsPrinting(false);
        if (printWindow) printWindow.close();
      }
    } else {
      setIsPrinting(false);
      toast.error("Popup blocked. Please allow popups for this site to print receipts.");
    }
  };

  const downloadAsPdf = async () => {
    if (!receiptRef.current) return;
    
    try {
      setIsPrinting(true);
      toast("Preparing PDF for download...");
      
      // Enhanced settings for better quality and to capture full receipt
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable cross-origin images
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with appropriate dimensions based on content
      const pdfWidth = 210; // A4 width in mm
      const contentRatio = canvas.height / canvas.width;
      const pdfHeight = pdfWidth * contentRatio;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // Add image to PDF, fitting to page dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save with descriptive filename including receipt number and date
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`Royal_Pavilion_Receipt_${receiptNumber}_${date}.pdf`);
      
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Please try again later.");
    } finally {
      setIsPrinting(false);
    }
  };

  // Render the component
  return (
    <div className="receipt-container relative">
      <div className="p-4 flex flex-wrap gap-2 justify-end bg-white border-b">
        {isPrinting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-hotel-gold" />
              <p className="text-sm text-gray-700">Processing document...</p>
            </div>
          </div>
        )}
        
        {showPrintButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
            onClick={printReceipt}
            disabled={isPrinting}
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        )}
        
        {showDownloadButton && (
          <Button 
            variant="outline"
            size="sm" 
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
            onClick={downloadAsPdf}
            disabled={isPrinting}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        )}
        
        {showEmailButton && onEmailReceipt && (
          <Button 
            variant="outline"
            size="sm" 
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
            onClick={onEmailReceipt}
            disabled={isPrinting}
          >
            <Mail className="h-4 w-4" /> Email Receipt
          </Button>
        )}
        
        {onClose && (
          <Button 
            variant="outline"
            size="sm"
            className="text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={isPrinting}
          >
            Close
          </Button>
        )}
      </div>
      
      <div 
        ref={receiptRef}
        className="bg-white p-4 md:p-8"
        dangerouslySetInnerHTML={{ __html: renderReceipt() }}
      />
    </div>
  );
};

export default Receipt;

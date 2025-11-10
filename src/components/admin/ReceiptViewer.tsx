
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReceipts } from "@/hooks/useReceipts";
import Receipt from "@/components/Receipt";
import { Loader2, FileText, X, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReceiptViewerProps {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ bookingId, open, onClose }) => {
  const { useReceiptByBookingId } = useReceipts();
  const { data: receipt, isLoading, isError } = useReceiptByBookingId(bookingId);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!open || !bookingId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-hotel-slate text-white border-hotel-gold/20 p-0 h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-4 pb-2 border-b border-hotel-gold/20 sticky top-0 bg-hotel-slate z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-hotel-gold text-xl">
              {receipt ? `Receipt #${receipt.receipt_number}` : 'Loading Receipt...'}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-hotel-gold hover:bg-hotel-gold/10 rounded-full" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-white/60 text-sm">
            {isError ? 'Error loading receipt details' : 'View and manage booking receipt'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center p-10 gap-4 min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-hotel-gold" />
              <span className="text-white/70">Loading receipt...</span>
            </div>
          ) : isError ? (
            <div className="text-center p-10 min-h-[400px] flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-red-400/30 mb-4" />
              <p className="text-red-400 mb-4">Failed to load receipt</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : receipt ? (
            <div className="bg-white rounded-lg overflow-hidden shadow-xl">
              <Receipt 
                receiptData={receipt.receipt_data} 
                receiptNumber={receipt.receipt_number} 
                showPrintButton={true}
                showDownloadButton={true}
                isPrinting={isPrinting}
                setIsPrinting={setIsPrinting}
              />
            </div>
          ) : (
            <div className="text-center p-10 min-h-[400px] flex flex-col items-center justify-center">
              <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500/50 mb-4" />
              <p className="text-white/70 mb-4">No receipt found for this booking</p>
              <Button variant="outline" onClick={onClose} className="border-hotel-gold/40 text-hotel-gold">
                Close
              </Button>
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t border-hotel-gold/20 bg-hotel-slate flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-hotel-gold/40 text-hotel-gold hover:bg-hotel-gold/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;

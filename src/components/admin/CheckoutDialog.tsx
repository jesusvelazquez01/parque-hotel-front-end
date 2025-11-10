
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Booking } from '@/types/booking';
import { CalendarIcon, User, Mail, Phone, Clock, CreditCard } from 'lucide-react';

interface CheckoutDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ 
  booking, 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20">
        <DialogHeader>
          <DialogTitle className="text-hotel-gold">Confirm Room Checkout</DialogTitle>
          <DialogDescription className="text-white/70">
            Are you sure you want to check out this room? This will mark the booking as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-3 pb-2 border-b border-hotel-gold/20">
            <User className="h-4 w-4 text-hotel-gold" />
            <div>
              <p className="font-medium text-white">{booking.customer_name}</p>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Mail className="h-3 w-3" /> {booking.customer_email}
                {booking.customer_phone && (
                  <>
                    <span className="mx-1">•</span>
                    <Phone className="h-3 w-3" /> {booking.customer_phone}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-white/70">Room</p>
              <p className="font-medium">{booking.room?.name || `Room ${booking.room_id?.substring(0, 8)}`}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-white/70">Room Count</p>
              <p className="font-medium">{booking.room_count || 1} {(booking.room_count || 1) > 1 ? 'rooms' : 'room'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-white/70">Check-in Date</p>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-hotel-gold" />
                <span>{format(new Date(booking.check_in_date), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-white/70">Check-out Date</p>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-hotel-gold" />
                <span>{format(new Date(booking.check_out_date), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-white/70">Guests</p>
              <p className="font-medium">{booking.guests} {booking.guests === 1 ? 'person' : 'people'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-white/70">Payment Status</p>
              <p className={`px-2 py-1 text-xs rounded-full inline-flex items-center gap-1 ${booking.payment_status === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}>
                <CreditCard className="h-3 w-3" />
                {booking.payment_status}
              </p>
            </div>
          </div>
          
          {booking.with_breakfast && (
            <div className="bg-hotel-midnight/30 p-3 rounded-md border border-hotel-gold/10">
              <p className="text-sm font-medium">Breakfast Included</p>
            </div>
          )}
          
          {booking.special_requests && (
            <div className="space-y-1">
              <p className="text-sm text-white/70">Special Requests</p>
              <p className="text-sm bg-hotel-midnight/30 p-3 rounded-md border border-hotel-gold/10">
                {booking.special_requests}
              </p>
            </div>
          )}
          
          <div className="border-t border-hotel-gold/20 pt-3 mt-2">
            <div className="flex justify-between items-center">
              <p className="text-white/70">Total Price</p>
              <p className="text-hotel-gold font-semibold">₹{booking.total_price?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
          >
            Complete Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;

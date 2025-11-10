
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currencyUtils';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, CreditCard, User, Mail, Phone, FileCheck } from 'lucide-react';
import { useRoomImage } from '@/hooks/useRoomImage';
import LazyImage from '@/components/LazyImage';

interface BookingViewProps {
  booking: any;
  open: boolean;
  onClose: () => void;
}

const BookingView: React.FC<BookingViewProps> = ({ booking, open, onClose }) => {
  if (!booking) return null;
  
  const { primaryImage, isLoading: isLoadingImage } = useRoomImage(booking.room_id);

  const getPaymentInfo = () => {
    if (booking.booking_type === 'offline') {
      return (
        <div className="space-y-1">
          <p className="text-white/90">Method: {booking.payment_method || 'Cash'}</p>
          {booking.payment_method === 'UPI' && booking.utr_number && (
            <p className="text-white/90">UTR Number: {booking.utr_number}</p>
          )}
        </div>
      );
    } else {
      // Online booking
      return (
        <div className="space-y-1">
          <p className="text-white/90">Method: Online Payment</p>
          {booking.payment_reference && (
            <p className="text-white/90">RRN: {booking.payment_reference}</p>
          )}
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-hotel-midnight border-hotel-gold/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-hotel-gold font-['Cormorant_Garamond']">
            Booking Details
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Booking ID: {booking.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-hotel-gold font-semibold mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h3>
                <p className="text-white/90">Name: {booking.customer_name}</p>
                <p className="text-white/90">Email: {booking.customer_email}</p>
                <p className="text-white/90">Phone: {booking.customer_phone || 'N/A'}</p>
                <p className="text-white/90">Guests: {booking.guests}</p>
              </div>
              
              <div>
                <h3 className="text-hotel-gold font-semibold mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Booking Information
                </h3>
                <div className="flex items-center mb-1">
                  <Badge className={booking.booking_type === 'online' 
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30 mr-2" 
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30 mr-2"}>
                    {booking.booking_type === 'online' ? 'Online Booking' : 'Offline Booking'}
                  </Badge>
                  <Badge className={
                    booking.status === 'confirmed' ? "bg-green-500/20 text-green-300 border-green-500/30" :
                    booking.status === 'pending' ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    booking.status === 'checked_in' ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    booking.status === 'cancelled' ? "bg-red-500/20 text-red-300 border-red-500/30" :
                    "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-white/90">
                  Check-in: {format(new Date(booking.check_in_date), 'PPP')}
                </p>
                <p className="text-white/90">
                  Check-out: {format(new Date(booking.check_out_date), 'PPP')}
                </p>
                <p className="text-white/90">
                  Created: {format(new Date(booking.created_at), 'PPP p')}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-hotel-gold font-semibold mb-2 flex items-center">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Room Details
                </h3>
                <div className="mb-2 rounded overflow-hidden border border-hotel-gold/10">
                  <LazyImage 
                    src={primaryImage || (booking.room?.image_url || '/lovable-uploads/3f77730e-a577-4204-8b6f-cc01babc2487.png')} 
                    alt={booking.room?.name || 'Room Image'} 
                    className="w-full h-28 object-cover"
                  />
                </div>
                <p className="text-white/90">Room: {booking.room?.name || 'N/A'}</p>
                <p className="text-white/90">Price: {formatCurrency(booking.total_price)}</p>
              </div>
              
              <div>
                <h3 className="text-hotel-gold font-semibold mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Information
                </h3>
                <p className="text-white/90">
                  Status: {' '}
                  <Badge className={
                    booking.payment_status === 'paid' ? "bg-green-500/20 text-green-300 border-green-500/30" :
                    booking.payment_status === 'pending' ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    booking.payment_status === 'refunded' ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    booking.payment_status === 'failed' ? "bg-red-500/20 text-red-300 border-red-500/30" :
                    "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }>
                    {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                  </Badge>
                </p>
                {getPaymentInfo()}
              </div>
              
              {booking.special_requests && (
                <div>
                  <h3 className="text-hotel-gold font-semibold mb-2">Special Requests</h3>
                  <p className="text-white/90">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingView;

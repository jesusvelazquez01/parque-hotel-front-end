
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking, TableBooking } from '@/types/booking';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currencyUtils';

interface ViewBookingDialogProps {
  booking: Booking | TableBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewBookingDialog({ booking, open, onOpenChange }: ViewBookingDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);

  // Initialize form data when booking changes
  React.useEffect(() => {
    if (booking) {
      const initialData = { ...booking };
      
      if ('check_in_date' in booking && booking.check_in_date) {
        setCheckInDate(new Date(booking.check_in_date));
      }
      
      if ('check_out_date' in booking && booking.check_out_date) {
        setCheckOutDate(new Date(booking.check_out_date));
      }
      
      if ('date' in booking && booking.date) {
        setBookingDate(new Date(booking.date));
      }
      
      setFormData(initialData);
    }
  }, [booking]);

  const updateHotelBooking = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('bookings')
        .update(data)
        .eq('id', booking?.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Error updating booking');
      console.error('Error updating booking:', error);
    }
  });

  const updateTableBooking = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('table_bookings')
        .update(data)
        .eq('id', booking?.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-bookings'] });
      toast.success('Table booking updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Error updating table booking');
      console.error('Error updating table booking:', error);
    }
  });

  const handleSave = () => {
    if (!booking) return;
    
    const updatedData = { ...formData };
    
    if ('check_in_date' in booking && checkInDate) {
      updatedData.check_in_date = format(checkInDate, 'yyyy-MM-dd');
    }
    
    if ('check_out_date' in booking && checkOutDate) {
      updatedData.check_out_date = format(checkOutDate, 'yyyy-MM-dd');
    }
    
    if ('date' in booking && bookingDate) {
      updatedData.date = format(bookingDate, 'yyyy-MM-dd');
    }
    
    // Determine booking type and update
    if ('check_in_date' in booking) {
      updateHotelBooking.mutate(updatedData);
    } else if ('date' in booking) {
      updateTableBooking.mutate(updatedData);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!booking) return null;
  
  // Determine if it's a hotel booking or table booking
  const isHotelBooking = 'check_in_date' in booking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto bg-hotel-slate border-hotel-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-hotel-gold text-xl">
            {isHotelBooking ? 'Hotel Booking Details' : 'Table Booking Details'}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            View and manage booking information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
          <div className="space-y-4">
            <div className="bg-hotel-midnight/30 p-4 rounded-md">
              <h3 className="font-medium text-hotel-gold mb-3 text-lg">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-white/70 block mb-1">Name</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.customer_name || ''} 
                      onChange={(e) => handleInputChange('customer_name', e.target.value)}
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                    />
                  ) : (
                    <div className="bg-hotel-midnight/60 rounded-md p-2">{booking.customer_name}</div>
                  )}
                </div>
                
                <div>
                  <Label className="text-white/70 block mb-1">Email</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.customer_email || ''} 
                      onChange={(e) => handleInputChange('customer_email', e.target.value)}
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                    />
                  ) : (
                    <div className="bg-hotel-midnight/60 rounded-md p-2">{booking.customer_email}</div>
                  )}
                </div>

                {/* Phone (for any booking type) */}
                <div>
                  <Label className="text-white/70 block mb-1">Phone</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.customer_phone || ''} 
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                    />
                  ) : (
                    <div className="bg-hotel-midnight/60 rounded-md p-2">{booking.customer_phone || 'Not provided'}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-hotel-midnight/30 p-4 rounded-md">
              <h3 className="font-medium text-hotel-gold mb-3 text-lg">Additional Details</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-white/70 block mb-1">Number of Guests</Label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      min={1} 
                      value={formData.guests || 1} 
                      onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                    />
                  ) : (
                    <div className="bg-hotel-midnight/60 rounded-md p-2">{booking.guests}</div>
                  )}
                </div>
                
                <div>
                  <Label className="text-white/70 block mb-1">Special Requests</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.special_requests || ''}
                      onChange={(e) => handleInputChange('special_requests', e.target.value)}
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                    />
                  ) : (
                    <div className="bg-hotel-midnight/60 rounded-md p-2 min-h-[40px]">
                      {booking.special_requests || 'No special requests'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {isHotelBooking ? (
              // Hotel booking specific fields
              <div className="bg-hotel-midnight/30 p-4 rounded-md">
                <h3 className="font-medium text-hotel-gold mb-3 text-lg">Booking Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white/70 block mb-1">Check-in Date</Label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                              !checkInDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkInDate}
                            onSelect={setCheckInDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="bg-hotel-midnight/60 rounded-md p-2">
                        {booking.check_in_date ? format(new Date(booking.check_in_date), 'PPP') : 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-white/70 block mb-1">Check-out Date</Label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                              !checkOutDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOutDate ? format(checkOutDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkOutDate}
                            onSelect={setCheckOutDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="bg-hotel-midnight/60 rounded-md p-2">
                        {booking.check_out_date ? format(new Date(booking.check_out_date), 'PPP') : 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-white/70 block mb-1">Total Price</Label>
                    {isEditing ? (
                      <Input 
                        type="number"
                        min={0}
                        value={formData.total_price || 0} 
                        onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value))}
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      />
                    ) : (
                      <div className="bg-hotel-midnight/60 rounded-md p-2">
                        {formatCurrency(booking.total_price)}
                      </div>
                    )}
                  </div>
                  
                  {/* Add with_breakfast field for hotel bookings with improved display */}
                  {'with_breakfast' in booking && (
                    <div>
                      <Label className="text-white/70 block mb-1">Breakfast</Label>
                      {isEditing ? (
                        <Select 
                          value={formData.with_breakfast ? "true" : "false"} 
                          onValueChange={(value) => handleInputChange('with_breakfast', value === "true")}
                        >
                          <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold">
                            <SelectValue placeholder="Breakfast option" />
                          </SelectTrigger>
                          <SelectContent className="bg-hotel-slate text-white border-hotel-gold/20">
                            <SelectItem value="true" className="cursor-pointer hover:bg-hotel-midnight">With Breakfast</SelectItem>
                            <SelectItem value="false" className="cursor-pointer hover:bg-hotel-midnight">No Breakfast</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="bg-hotel-midnight/60 rounded-md p-2">
                          {booking.with_breakfast ? (
                            <span className="flex items-center text-green-400">
                              <Check className="h-4 w-4 mr-1" /> With Breakfast
                            </span>
                          ) : (
                            <span className="flex items-center text-red-400">
                              <X className="h-4 w-4 mr-1" /> No Breakfast
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Table booking specific fields
              <div className="bg-hotel-midnight/30 p-4 rounded-md">
                <h3 className="font-medium text-hotel-gold mb-3 text-lg">Reservation Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-white/70 block mb-1">Date</Label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                              !bookingDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={bookingDate}
                            onSelect={setBookingDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="bg-hotel-midnight/60 rounded-md p-2">
                        {booking.date ? format(new Date(booking.date), 'PPP') : 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-white/70 block mb-1">Time</Label>
                    {isEditing ? (
                      <Input 
                        type="time"
                        value={formData.time || ''} 
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      />
                    ) : (
                      <div className="bg-hotel-midnight/60 rounded-md p-2">{booking.time}</div>
                    )}
                  </div>
                  
                  {'table_number' in booking && (
                    <div>
                      <Label className="text-white/70 block mb-1">Table Number</Label>
                      {isEditing ? (
                        <Input 
                          value={formData.table_number || ''} 
                          onChange={(e) => handleInputChange('table_number', e.target.value)}
                          className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                        />
                      ) : (
                        <div className="bg-hotel-midnight/60 rounded-md p-2">
                          {booking.table_number || 'Not assigned'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-hotel-midnight/30 p-4 rounded-md">
              <h3 className="font-medium text-hotel-gold mb-3 text-lg">Status</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-white/70 block mb-1">Booking Status</Label>
                  {isEditing ? (
                    <Select 
                      value={formData.status || 'pending'} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-hotel-slate text-white border-hotel-gold/20">
                        <SelectItem value="pending" className="cursor-pointer hover:bg-hotel-midnight">Pending</SelectItem>
                        <SelectItem value="confirmed" className="cursor-pointer hover:bg-hotel-midnight">Confirmed</SelectItem>
                        <SelectItem value="checked_in" className="cursor-pointer hover:bg-hotel-midnight">Checked In</SelectItem>
                        <SelectItem value="checked_out" className="cursor-pointer hover:bg-hotel-midnight">Checked Out</SelectItem>
                        <SelectItem value="cancelled" className="cursor-pointer hover:bg-hotel-midnight">Cancelled</SelectItem>
                        <SelectItem value="completed" className="cursor-pointer hover:bg-hotel-midnight">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`bg-hotel-midnight/60 rounded-md p-2 flex items-center gap-2`}>
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        booking.status === 'pending' ? 'bg-amber-500' : 
                        booking.status === 'confirmed' ? 'bg-blue-500' :
                        booking.status === 'checked_in' ? 'bg-green-500' :
                        booking.status === 'checked_out' ? 'bg-purple-500' :
                        booking.status === 'cancelled' ? 'bg-red-500' :
                        booking.status === 'completed' ? 'bg-green-700' : 'bg-gray-500'
                      }`}></span>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-white/70 block mb-1">Payment Status</Label>
                  {isEditing ? (
                    <Select 
                      value={formData.payment_status || 'pending'} 
                      onValueChange={(value) => handleInputChange('payment_status', value)}
                    >
                      <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent className="bg-hotel-slate text-white border-hotel-gold/20">
                        <SelectItem value="pending" className="cursor-pointer hover:bg-hotel-midnight">Pending</SelectItem>
                        <SelectItem value="paid" className="cursor-pointer hover:bg-hotel-midnight">Paid</SelectItem>
                        <SelectItem value="failed" className="cursor-pointer hover:bg-hotel-midnight">Failed</SelectItem>
                        <SelectItem value="refunded" className="cursor-pointer hover:bg-hotel-midnight">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`bg-hotel-midnight/60 rounded-md p-2 flex items-center gap-2`}>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        booking.payment_status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 
                        booking.payment_status === 'paid' ? 'bg-green-500/20 text-green-300' :
                        booking.payment_status === 'failed' ? 'bg-red-500/20 text-red-300' :
                        booking.payment_status === 'refunded' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {booking.payment_status || 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
              
        <div className="mt-2 bg-hotel-midnight/40 p-3 rounded-md text-sm">
          <p className="text-white/70">
            <span className="text-hotel-gold">Booking Type:</span> {booking.booking_type || 'N/A'} | 
            <span className="text-hotel-gold ml-2">Created:</span> {format(new Date(booking.created_at), 'PPP p')}
          </p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight"
              >
                Close
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
              >
                Edit Booking
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

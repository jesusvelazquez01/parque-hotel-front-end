
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRooms } from '@/hooks/useRooms';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  bookingType: 'hotel' | 'table';
  formMode: 'online' | 'offline';
  setFormMode: (mode: 'online' | 'offline') => void;
  onClose: () => void;
}

export const BookingForm = ({
  initialValues,
  onSubmit,
  bookingType,
  formMode,
  setFormMode,
  onClose
}: BookingFormProps) => {
  // Form State
  const [formData, setFormData] = useState<any>({
    customer_name: '',
    customer_email: '',
    check_in_date: '',
    check_out_date: '',
    date: '',
    time: '',
    guests: '1',
    adults: '1',
    children: '0',
    special_requests: '',
    status: 'pending',
    payment_status: 'pending',
    total_price: '0',
    room_id: '',
    with_breakfast: false,
    extra_guests: 0
  });

  // Get available rooms for hotel bookings
  const { rooms } = useRooms();

  // Initialize form with initial values if editing
  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        // Convert values to string for input fields
        guests: initialValues.guests?.toString() || '1',
        adults: initialValues.adults?.toString() || '1',
        children: initialValues.children?.toString() || '0',
        total_price: initialValues.total_price?.toString() || '0'
      });
    }
  }, [initialValues]);

  // Handle regular input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle select changes with extra capacity rules for Royal rooms
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Apply special rules if changing room, adults or children
      if ((name === 'room_id' || name === 'adults' || name === 'children') && bookingType === 'hotel') {
        const selectedRoom = rooms?.find(room => room.id === (name === 'room_id' ? value : prev.room_id));
        
        if (selectedRoom) {
          // Calculate extra guests based on room category
          let maxRegularAdults = 2; // Default for most room types
          let extraGuestPrice = 600; // Default extra guest price
          
          if (selectedRoom.category_type === 'Royal Deluxe') {
            maxRegularAdults = 1;
            // No extra guests allowed for Royal Deluxe
            newData.adults = '1';
            newData.children = '0';
          } else if (selectedRoom.category_type === 'Royal Executive') {
            maxRegularAdults = 2; // Max 3 guests, 2 included in base price
            // Calculate extra guests (adults beyond 2 and children above 7 count as adults)
            const adults = parseInt(name === 'adults' ? value : prev.adults) || 0;
            const children = parseInt(name === 'children' ? value : prev.children) || 0;
            
            // Ensure maximum 3 adults total
            if (adults > 3) {
              newData.adults = '3';
            }
            
            newData.extra_guests = Math.max(0, parseInt(newData.adults) - maxRegularAdults);
          } else if (selectedRoom.category_type === 'Royal Suite') {
            maxRegularAdults = 2; // Max 4 guests, 2 included in base price
            // Calculate extra guests (adults beyond 2 and children above 7 count as adults)
            const adults = parseInt(name === 'adults' ? value : prev.adults) || 0;
            const children = parseInt(name === 'children' ? value : prev.children) || 0;
            
            // Ensure maximum 4 adults total
            if (adults > 4) {
              newData.adults = '4';
            }
            
            newData.extra_guests = Math.max(0, parseInt(newData.adults) - maxRegularAdults);
          }
          
          // Update total price based on room, dates and extra guests
          if (newData.check_in_date && newData.check_out_date) {
            const checkInDate = new Date(newData.check_in_date);
            const checkOutDate = new Date(newData.check_out_date);
            const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (days > 0) {
              // Base room price
              let totalPrice = selectedRoom.price * days;
              
              // Add charges for extra guests if applicable
              if (newData.extra_guests > 0) {
                totalPrice += newData.extra_guests * extraGuestPrice * days;
              }
              
              newData.total_price = totalPrice.toString();
            }
          }
        }
      }
      
      return newData;
    });
  };

  // Handle date selection for bookings
  const handleDateSelect = (date: Date | undefined, field: string) => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
    
    // Recalculate price if room is selected and both dates are set
    if (bookingType === 'hotel' && formData.room_id) {
      const selectedRoom = rooms?.find(room => room.id === formData.room_id);
      
      if (selectedRoom) {
        let checkInDate = field === 'check_in_date' ? date : formData.check_in_date ? new Date(formData.check_in_date) : null;
        let checkOutDate = field === 'check_out_date' ? date : formData.check_out_date ? new Date(formData.check_out_date) : null;
        
        if (checkInDate && checkOutDate) {
          const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            // Base room price
            let totalPrice = selectedRoom.price * days;
            
            // Add charges for extra guests if applicable
            if (formData.extra_guests > 0) {
              const extraGuestPrice = 600; // Default extra guest price
              totalPrice += formData.extra_guests * extraGuestPrice * days;
            }
            
            setFormData(prev => ({ ...prev, total_price: totalPrice.toString() }));
          }
        }
      }
    }
  };

  // Calculate price for hotel bookings
  const calculateTotalPrice = () => {
    if (bookingType === 'hotel' && formData.room_id && formData.check_in_date && formData.check_out_date) {
      const selectedRoom = rooms?.find(room => room.id === formData.room_id);
      if (selectedRoom) {
        const checkInDate = new Date(formData.check_in_date);
        const checkOutDate = new Date(formData.check_out_date);
        const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          // Base room price
          let totalPrice = selectedRoom.price * days;
          
          // Add charges for extra guests if applicable
          if (formData.extra_guests > 0) {
            const extraGuestPrice = 600; // 600 per extra adult
            totalPrice += formData.extra_guests * extraGuestPrice * days;
          }
          
          setFormData(prev => ({ ...prev, total_price: totalPrice.toString() }));
        }
      }
    }
  };

  // Recalculate price when relevant fields change
  useEffect(() => {
    if (bookingType === 'hotel') {
      calculateTotalPrice();
    }
  }, [formData.room_id, formData.check_in_date, formData.check_out_date, formData.extra_guests]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.customer_name || !formData.customer_email) {
      toast.error('Customer name and email are required');
      return;
    }

    if (bookingType === 'hotel') {
      if (!formData.check_in_date || !formData.check_out_date) {
        toast.error('Check-in and check-out dates are required');
        return;
      }
      
      if (!formData.room_id && !initialValues) {
        toast.error('Please select a room');
        return;
      }

      if (!formData.total_price || parseFloat(formData.total_price) <= 0) {
        toast.error('Total price must be greater than zero');
        return;
      }
    } else {
      if (!formData.date || !formData.time) {
        toast.error('Date and time are required for table bookings');
        return;
      }
    }

    // Submit form data
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Booking Type Selection */}
          <div className="flex items-center space-x-4">
            <Label>Booking Mode:</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={formMode === 'online' ? 'default' : 'outline'}
                onClick={() => setFormMode('online')}
                className={formMode === 'online' ? 'bg-hotel-gold text-hotel-midnight' : 'text-white'}
                size="sm"
              >
                Online
              </Button>
              <Button
                type="button"
                variant={formMode === 'offline' ? 'default' : 'outline'}
                onClick={() => setFormMode('offline')}
                className={formMode === 'offline' ? 'bg-hotel-gold text-hotel-midnight' : 'text-white'}
                size="sm"
              >
                Offline
              </Button>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">Customer Email</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={handleInputChange}
              placeholder="Enter customer email"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
              required
            />
          </div>

          {bookingType === 'hotel' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="adults">Number of Adults</Label>
                <Input
                  id="adults"
                  name="adults"
                  type="number"
                  min="1"
                  max={formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Deluxe' ? '1' : 
                       formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Executive' ? '3' : 
                       formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Suite' ? '4' : '10'}
                  value={formData.adults}
                  onChange={(e) => handleSelectChange('adults', e.target.value)}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  disabled={formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Deluxe'}
                  required
                />
                {formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Executive' && (
                  <p className="text-xs text-white/70">Base price includes 2 adults. Additional adult: ₹600/night.</p>
                )}
                {formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Suite' && (
                  <p className="text-xs text-white/70">Base price includes 2 adults. Additional adults: ₹600/night each.</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="children">Number of Children</Label>
                <Input
                  id="children"
                  name="children"
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => handleSelectChange('children', e.target.value)}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  disabled={formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type === 'Royal Deluxe'}
                />
                {(formData.room_id && rooms?.find(r => r.id === formData.room_id)?.category_type !== 'Royal Deluxe') && (
                  <p className="text-xs text-white/70">Children above 7 years count as adults for capacity.</p>
                )}
              </div>
            </>
          )}

          {bookingType !== 'hotel' && (
            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                name="guests"
                type="number"
                min="1"
                value={formData.guests}
                onChange={handleInputChange}
                className="bg-hotel-midnight border-hotel-gold/30 text-white"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Input
              id="special_requests"
              name="special_requests"
              value={formData.special_requests || ''}
              onChange={handleInputChange}
              placeholder="Any special requests?"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          {bookingType === 'hotel' ? (
            <>
              {/* Hotel Booking Specific Fields */}
              <div className="space-y-2">
                <Label htmlFor="room_id">Select Room</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(value) => handleSelectChange('room_id', value)}
                >
                  <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                    {rooms?.filter(room => room.is_available).map((room) => (
                      <SelectItem key={room.id} value={room.id} className="text-white hover:bg-hotel-midnight/50">
                        {room.name} ({room.category_type}) - {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(room.price)} / night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                        !formData.check_in_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.check_in_date ? format(new Date(formData.check_in_date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-hotel-slate text-white border-hotel-gold/30">
                    <Calendar
                      mode="single"
                      selected={formData.check_in_date ? new Date(formData.check_in_date) : undefined}
                      onSelect={(date) => handleDateSelect(date, 'check_in_date')}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("bg-hotel-slate text-white p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                        !formData.check_out_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.check_out_date ? format(new Date(formData.check_out_date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-hotel-slate text-white border-hotel-gold/30">
                    <Calendar
                      mode="single"
                      selected={formData.check_out_date ? new Date(formData.check_out_date) : undefined}
                      onSelect={(date) => handleDateSelect(date, 'check_out_date')}
                      disabled={(date) => formData.check_in_date ? date <= new Date(formData.check_in_date) : date <= new Date()}
                      initialFocus
                      className={cn("bg-hotel-slate text-white p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {formData.extra_guests > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="extra_guests">Extra Guests</Label>
                  <div className="flex items-center justify-between p-3 bg-hotel-midnight/50 border border-hotel-gold/20 rounded-md">
                    <span className="text-white">{formData.extra_guests} extra {formData.extra_guests === 1 ? 'guest' : 'guests'}</span>
                    <span className="text-hotel-gold font-medium">
                      + ₹{(formData.extra_guests * 600).toLocaleString()}/night
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="total_price">Total Price (₹)</Label>
                <Input
                  id="total_price"
                  name="total_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_price}
                  onChange={handleInputChange}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Table Booking Specific Fields */}
              <div className="space-y-2">
                <Label>Reservation Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(new Date(formData.date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-hotel-slate text-white border-hotel-gold/30">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => handleDateSelect(date, 'date')}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("bg-hotel-slate text-white p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Reservation Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="table_number">Table Number (Optional)</Label>
                <Input
                  id="table_number"
                  name="table_number"
                  value={formData.table_number || ''}
                  onChange={handleInputChange}
                  placeholder="Table number if assigned"
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                <SelectItem value="pending" className="text-white hover:bg-hotel-midnight/50">Pending</SelectItem>
                <SelectItem value="confirmed" className="text-white hover:bg-hotel-midnight/50">Confirmed</SelectItem>
                {bookingType === 'hotel' && (
                  <>
                    <SelectItem value="checked_in" className="text-white hover:bg-hotel-midnight/50">Checked In</SelectItem>
                    <SelectItem value="checked_out" className="text-white hover:bg-hotel-midnight/50">Checked Out</SelectItem>
                  </>
                )}
                {bookingType === 'table' && (
                  <SelectItem value="completed" className="text-white hover:bg-hotel-midnight/50">Completed</SelectItem>
                )}
                <SelectItem value="cancelled" className="text-white hover:bg-hotel-midnight/50">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value) => handleSelectChange('payment_status', value)}
            >
              <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                <SelectItem value="pending" className="text-white hover:bg-hotel-midnight/50">Pending</SelectItem>
                <SelectItem value="paid" className="text-white hover:bg-hotel-midnight/50">Paid</SelectItem>
                <SelectItem value="failed" className="text-white hover:bg-hotel-midnight/50">Failed</SelectItem>
                <SelectItem value="refunded" className="text-white hover:bg-hotel-midnight/50">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="border-hotel-gold/40 text-white hover:bg-hotel-midnight/50"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
        >
          {initialValues ? 'Update' : 'Create'} {bookingType === 'hotel' ? 'Hotel' : 'Table'} Booking
        </Button>
      </div>
    </form>
  );
};

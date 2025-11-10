import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Minus, BedDouble, Users, UserPlus, FileText } from "lucide-react";
import { formatCurrency } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RazorpayPayment from '@/components/RazorpayPayment';
import PromoCodeInput from './PromoCodeInput';
import { generateQRCodeDataUrl } from '@/utils/qrCodeUtils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

// Helper function to get breakfast description based on room category
const getRoomBreakfastDescription = (category: string) => {
  switch (category) {
    case 'Royal Executive':
      return 'continental breakfast';
    case 'Royal Suite':
      return 'gourmet breakfast buffet';
    case 'Royal Deluxe':
    default:
      return 'standard breakfast';
  }
};

// Define terms and conditions
const termsAndConditions = [
  "Check in Time: 12 PM, Check Out Time: 10 AM",
  "Early Check In and late Check Out can be extended Subject to Room availably.",
  "All Guest(s) Address ID proof is mandatory, except child below 7 Years Old",
  "For Extra Persons in the will provide only floor mattress only.",
  "The Management does not take the responsibility for loss of valuables/Cash left by Guest (s) in the rooms.",
  "Visitors are Not Permitted in the Guest Room.",
  "Pets are not allowed in the Hotel Premises.",
  "Outside Food and Beverages not allowed",
  "Rooms Preference will be, Subject to availability after Amenities."
];

interface RoomBookingFormProps {
  roomId: string;
  onRoomUnavailable?: () => void;
}

const RoomBookingForm: React.FC<RoomBookingFormProps> = ({ roomId, onRoomUnavailable }) => {
  const navigate = useNavigate();
  
  // State for the form
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [withBreakfast, setWithBreakfast] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [numRooms, setNumRooms] = useState(1);
  const [maxAvailableRooms, setMaxAvailableRooms] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isChildrenLimited, setIsChildrenLimited] = useState(false);
  const [effectiveAdults, setEffectiveAdults] = useState(1); // Adults + children over 7
  
  // Guest details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Promo code state
  const [originalTotal, setOriginalTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  
  // Fetch room data
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setRoom(data);
          // Set maximum available rooms based on the available_rooms field
          setMaxAvailableRooms(data.available_rooms || 0);
          // Limit numRooms to available rooms
          if (data.available_rooms < numRooms) {
            setNumRooms(Math.max(1, Math.min(numRooms, data.available_rooms || 0)));
          }
          
          // If room is not available or no rooms available, call the callback
          if (!data.is_available || (data.available_rooms || 0) <= 0) {
            if (onRoomUnavailable) {
              onRoomUnavailable();
            }
            toast.error("Room Unavailable", {
              description: "This room is currently not available for booking."
            });
          }
          
          // Apply specific rules based on room category
          if (data.category_type === 'Royal Deluxe') {
            // Royal Deluxe: strictly 1 adult only, no children
            setAdults(1);
            setChildren(0);
            setIsChildrenLimited(true);
            setEffectiveAdults(1);
          } else if (data.category_type === 'Royal Executive') {
            // Royal Executive: max 3 adults (including children over 7)
            setIsChildrenLimited(false);
            // Default to 2 adults as base capacity
            setAdults(2);
            setEffectiveAdults(2);
          } else if (data.category_type === 'Royal Suite') {
            // Royal Suite: max 4 adults (including children over 7)
            setIsChildrenLimited(false);
            // Default to 2 adults as base capacity
            setAdults(2);
            setEffectiveAdults(2);
          }
        }
      } catch (error) {
        console.error('Error fetching room details:', error);
        toast.error("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [roomId, onRoomUnavailable]);

  // Update effective adults when children ages change
  useEffect(() => {
    if (!room) return;

    // For Royal Deluxe: always 1 adult, no changes
    if (room.category_type === 'Royal Deluxe') {
      setEffectiveAdults(1);
      return;
    }

    // Count children over 7 as adults
    const childrenOver7 = childrenAges.filter(age => age > 7).length;
    const newEffectiveAdults = adults + childrenOver7;

    // Apply max capacity limits
    if (room.category_type === 'Royal Executive' && newEffectiveAdults > 3) {
      // If too many effective adults, reduce actual adults to fit within limit
      const newAdults = Math.max(1, 3 - childrenOver7);
      setAdults(newAdults);
      setEffectiveAdults(Math.min(3, newAdults + childrenOver7));
      toast.info(`Royal Executive rooms allow a maximum of 3 adults (including children over 7 years).`);
    } else if (room.category_type === 'Royal Suite' && newEffectiveAdults > 4) {
      // If too many effective adults, reduce actual adults to fit within limit
      const newAdults = Math.max(1, 4 - childrenOver7);
      setAdults(newAdults);
      setEffectiveAdults(Math.min(4, newAdults + childrenOver7));
      toast.info(`Royal Suite rooms allow a maximum of 4 adults (including children over 7 years).`);
    } else {
      setEffectiveAdults(newEffectiveAdults);
    }
  }, [adults, childrenAges, room]);

  // Check form validity
  useEffect(() => {
    const formIsValid = 
      firstName !== '' && 
      lastName !== '' && 
      email !== '' && 
      phone !== '' && 
      checkInDate !== undefined && 
      checkOutDate !== undefined && 
      numRooms > 0 && 
      maxAvailableRooms > 0 &&
      termsAccepted; // Make sure terms are accepted
    
    setIsFormValid(formIsValid);
  }, [firstName, lastName, email, phone, checkInDate, checkOutDate, numRooms, maxAvailableRooms, termsAccepted]);

  // Generate array of numbers for selections
  const generateOptions = (max: number): number[] => {
    return Array.from({ length: max }, (_, i) => i + 1);
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1);
  };

  // Calculate the breakfast price based on number of guests
  const calculateBreakfastPrice = () => {
    if (!room || !withBreakfast) return 0;
    const breakfastPrice = room.breakfast_price || 500; // Default breakfast price if not set
    const totalGuests = adults + children;
    return breakfastPrice * calculateNights() * totalGuests; // Based on guest count
  };

  // Calculate tax amounts (SGST 6% and CGST 6%)
  const calculateTaxes = (basePrice: number) => {
    const cgst = basePrice * 0.06; // 6% CGST
    const sgst = basePrice * 0.06; // 6% SGST
    return { cgst, sgst };
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!room) return { basePrice: 0, discountedBasePrice: 0, cgst: 0, sgst: 0, total: 0, extraGuestCharges: 0 };
    
    const nights = calculateNights();
    const roomPrice = room.price * nights * numRooms;
    const breakfastPrice = calculateBreakfastPrice();
    const extraGuestCharges = calculateExtraGuestCharges();
    
    // Base price includes room price, breakfast if selected, and extra guest charges
    const basePrice = roomPrice + breakfastPrice + extraGuestCharges;
    
    // Apply promo code discount to the base price
    let discountedBasePrice = basePrice;
    if (promoApplied) {
      discountedBasePrice = discountedTotal;
    }
    
    const { cgst, sgst } = calculateTaxes(discountedBasePrice);
    const total = discountedBasePrice + cgst + sgst;
    
    return {
      basePrice,
      discountedBasePrice: promoApplied ? discountedBasePrice : basePrice,
      cgst,
      sgst,
      extraGuestCharges,
      total
    };
  };

  // Calculate total price with extra guests for Royal Executive and Suite
  const calculateExtraGuestCharges = () => {
    if (!room) return 0;
    
    // No extra charges for Royal Deluxe (always 1 adult)
    if (room.category_type === 'Royal Deluxe') return 0;
    
    // Base capacity is 2 adults for Executive and Suite
    const baseCapacity = 2;
    
    // Count extra adults beyond base capacity
    const extraAdults = Math.max(0, effectiveAdults - baseCapacity);
    
    // 600 per extra adult per night
    return extraAdults * 600 * calculateNights();
  };

  // Update totals when dependencies change
  useEffect(() => {
    if (room) {
      const calculatedPrice = calculateTotal();
      setOriginalTotal(calculatedPrice.total);
      
      // Only update discounted total if no promo has been applied yet
      if (!promoApplied) {
        setDiscountedTotal(calculatedPrice.total);
      }
    }
  }, [room, checkInDate, checkOutDate, numRooms, adults, children, childrenAges, withBreakfast, effectiveAdults]);

  // Handle promo code application
  const handlePromoApplied = (discountedAmount: number) => {
    setDiscountedTotal(discountedAmount);
    setPromoApplied(discountedAmount < originalTotal);
    
    // Recalculate total price with taxes after promo is applied
    const calculatedPrice = calculateTotal();
    setOriginalTotal(calculatedPrice.total);
  };

  // Handle payment cancellation
  const handlePaymentCancellation = () => {
    console.log('Payment was cancelled');
    setPaymentCancelled(true);
    // Optionally save the cancelled booking to the database with a 'cancelled' status
    saveCancelledBooking();
  };

  // Save cancelled booking for analytics purposes
  const saveCancelledBooking = async () => {
    if (!room || !checkInDate || !checkOutDate) return;
    
    try {
      const fullName = `${firstName} ${lastName}`;
      const priceDetails = calculateTotal();
      
      // Save the cancelled booking to your database
      const { error } = await supabase
        .from('bookings')
        .insert({
          room_id: room.id,
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          check_in_date: format(checkInDate, 'yyyy-MM-dd'),
          check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
          guests: adults + children,
          adults: adults,
          children: children,
          with_breakfast: withBreakfast,
          special_requests: specialRequests,
          room_count: numRooms,
          total_price: priceDetails.total,
          payment_status: 'cancelled',
          status: 'cancelled',
          booking_type: 'online'
        });
      
      if (error) console.error('Error saving cancelled booking:', error);
      
    } catch (error: any) {
      console.error('Error in saveCancelledBooking:', error);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentData: {
    payment_id: string;
    payment_method: string;
    payment_status: string;
  }) => {
    if (!room || !checkInDate || !checkOutDate) {
      toast.error("Missing booking information");
      return;
    }
    
    try {
      // Calculate pricing details
      const nights = calculateNights();
      const priceDetails = calculateTotal();
      const breakfastPrice = calculateBreakfastPrice();
      const extraGuestCharges = priceDetails.extraGuestCharges;

      // Prepare receipt data
      const receiptData: any = {
        bookingId: '', // Will be filled after booking is created
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        roomName: room.name,
        roomType: room.category_type || 'Standard',
        pricePerNight: room.price,
        nights: nights,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: adults + children,
        adults: adults,
        effectiveAdults: effectiveAdults,
        children: children,
        childrenAges: childrenAges,
        price: priceDetails.discountedBasePrice,
        extraGuestCharges: extraGuestCharges,
        sgst: priceDetails.sgst,
        cgst: priceDetails.cgst,
        tax: priceDetails.sgst + priceDetails.cgst,
        total: priceDetails.total,
        paymentMethod: paymentData.payment_method || 'Razorpay',
        paymentId: paymentData.payment_id,
        transactionDate: new Date(),
        receiptNumber: `RP-${Date.now().toString().substring(5)}`,
        withBreakfast: withBreakfast,
        breakfastPrice: room.breakfast_price || 0,
        roomCount: numRooms
      };

      // Create the booking in the database - Fix the room_id issue
      const bookingData = {
        room_id: room.id,
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_phone: phone,
        check_in_date: format(checkInDate, 'yyyy-MM-dd'),
        check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
        guests: adults + children,
        adults: adults,
        effective_adults: String(effectiveAdults), // Convert to string to match database schema
        children: children,
        children_ages: JSON.stringify(childrenAges), // Ensure proper format for database
        with_breakfast: withBreakfast,
        special_requests: specialRequests,
        room_count: numRooms,
        extra_guest_charges: extraGuestCharges > 0 ? String(extraGuestCharges) : undefined, // Convert to string
        total_price: priceDetails.total,
        payment_status: 'paid',
        status: 'confirmed',
        booking_type: 'online'
      };

      const { data: createdBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (bookingError) throw bookingError;
      
      // Update receipt data with booking ID
      receiptData.bookingId = createdBooking.id;
      
      // Create receipt record - Fix the booking_id property issue
      const receiptInsertData = {
        booking_id: createdBooking.id,
        payment_id: paymentData.payment_id,
        price_per_night: room.price,
        nights: nights,
        room_total: room.price * nights * numRooms,
        breakfast_price: room.breakfast_price || 0,
        breakfast_total: breakfastPrice,
        extra_guest_charges: extraGuestCharges > 0 ? String(extraGuestCharges) : null, // Convert to string
        extra_guests: extraGuestCharges > 0 ? Math.max(0, effectiveAdults - 2) : null,
        base_price: priceDetails.discountedBasePrice,
        cgst: priceDetails.cgst,
        sgst: priceDetails.sgst,
        with_breakfast: withBreakfast,
        receipt_number: receiptData.receiptNumber,
        receipt_data: JSON.stringify(receiptData)
      };

      const { error: receiptError } = await supabase
        .from('receipts')
        .insert(receiptInsertData);
      
      if (receiptError) throw receiptError;

      // Generate QR code for receipt if needed
      try {
        const qrCodeData = await generateQRCodeDataUrl(createdBooking.id);
        if (qrCodeData) {
          receiptData.qrCodeData = qrCodeData;
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Continue without QR code if there's an error
      }

      // Navigate to booking confirmation page with all the necessary details
      navigate('/booking-confirmation', { 
        state: { 
          booking: createdBooking,
          roomName: room.name,
          roomImage: room.image_url,
          receiptData: JSON.stringify(receiptData)
        }
      });
      
    } catch (error: any) {
      console.error('Error saving booking:', error);
      toast.error("Failed to save booking: " + error.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate guest information
    if (!firstName || !lastName || !email || !phone) {
      toast.error("Please fill in all guest details");
      return;
    }
    
    if (!checkInDate || !checkOutDate || !room) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    // Validate number of rooms
    if (numRooms > (room.available_rooms || 0)) {
      toast.error(`Only ${room.available_rooms || 0} rooms are available`);
      return;
    }

    // Make sure terms are accepted
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }
    
    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }
    
    // Form is valid, payment will be handled by RazorpayPayment component
    // The action is now moved to the payment success handler
  };

  // Handle children count changes
  const handleChildrenCountChange = (newCount: number) => {
    // Validate within bounds
    newCount = Math.max(0, Math.min(6, newCount));
    
    // If reducing children count, trim the ages array
    let newAges = [...childrenAges];
    if (newCount < children) {
      newAges = newAges.slice(0, newCount);
    } else if (newCount > children) {
      // Add default ages (0) for new children
      for (let i = children; i < newCount; i++) {
        newAges.push(0);
      }
    }
    
    setChildren(newCount);
    setChildrenAges(newAges);
  };
  
  // Handle child age change
  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...childrenAges];
    newAges[index] = age;
    setChildrenAges(newAges);
  };

  // Pre-calculate price details for rendering
  const priceDetails = room ? calculateTotal() : { basePrice: 0, discountedBasePrice: 0, cgst: 0, sgst: 0, total: 0, extraGuestCharges: 0 };
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-10 bg-hotel-midnight/20 rounded-md"></div>
        <div className="h-40 bg-hotel-midnight/20 rounded-md"></div>
        <div className="h-20 bg-hotel-midnight/20 rounded-md"></div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Room not found or unavailable.</p>
      </div>
    );
  }
  
  // If payment was cancelled, show cancellation message
  if (paymentCancelled) {
    return (
      <div className="space-y-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle className="text-red-800 font-semibold">Booking Cancelled</AlertTitle>
          <AlertDescription className="text-red-700">
            Your booking has been cancelled because the payment was not completed.
          </AlertDescription>
        </Alert>
        
        <div className="bg-hotel-midnight/20 p-4 rounded-lg space-y-4">
          <h2 className="font-semibold text-white">Booking Details</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-white/70">Name:</p>
              <p className="text-white">{firstName} {lastName}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Email:</p>
              <p className="text-white">{email}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Phone:</p>
              <p className="text-white">{phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Room:</p>
              <p className="text-white">{room?.name}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Check-in:</p>
              <p className="text-white">{checkInDate ? format(checkInDate, 'PPP') : 'Not selected'}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Check-out:</p>
              <p className="text-white">{checkOutDate ? format(checkOutDate, 'PPP') : 'Not selected'}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Number of Rooms:</p>
              <p className="text-white">{numRooms}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Guests:</p>
              <p className="text-white">{adults} Adults, {children} Children</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Total Price:</p>
              <p className="text-white">₹{Math.round(priceDetails.total).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Payment Status:</p>
              <p className="text-red-400">Cancelled</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <Button 
              onClick={() => setPaymentCancelled(false)}
              className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-medium"
            >
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full mt-2 border-hotel-gold/30 text-white hover:bg-hotel-gold/10"
              onClick={() => navigate('/rooms')}
            >
              Browse Other Rooms
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guest details section */}
      <div>
        <h2 className="text-xl font-semibold text-hotel-gold mb-4">Guest Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-white">First Name *</Label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-white">Last Name *</Label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="bg-hotel-midnight border-hotel-gold/30 text-white"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="check-in" className="text-white">Check-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? format(checkInDate, 'PPP') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-hotel-slate text-white border-hotel-gold/20">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
                disabled={(date) => date < new Date()}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="check-out" className="text-white">Check-out Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white",
                  !checkOutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? format(checkOutDate, 'PPP') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-hotel-slate text-white border-hotel-gold/20">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                initialFocus
                disabled={(date) => !checkInDate || date <= checkInDate}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Room quantity and guests - ENHANCED SECTION */}
      <Card className="bg-hotel-slate/80 backdrop-blur-sm rounded-xl border border-hotel-gold/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-hotel-gold" />
              <Label htmlFor="num-rooms" className="text-white font-medium">Number of Rooms</Label>
            </div>
            <div className="relative">
              <Select
                value={numRooms.toString()}
                onValueChange={(value) => setNumRooms(parseInt(value))}
                disabled={maxAvailableRooms <= 0}
              >
                <SelectTrigger className="bg-hotel-midnight/80 backdrop-blur-sm border-hotel-gold/30 text-white hover:border-hotel-gold transition-all">
                  <SelectValue placeholder="Select rooms" />
                </SelectTrigger>
                <SelectContent className="bg-hotel-slate border-hotel-gold/20 text-white">
                  {maxAvailableRooms <= 0 ? (
                    <SelectItem value="0" disabled>No rooms available</SelectItem>
                  ) : (
                    generateOptions(maxAvailableRooms).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Room' : 'Rooms'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {maxAvailableRooms > 0 && (
                <p className="text-xs text-hotel-gold mt-1 pl-2">
                  {maxAvailableRooms} {maxAvailableRooms === 1 ? 'room' : 'rooms'} available
                </p>
              )}
            </div>
          </div>
          
          {room?.category_type === 'Royal Deluxe' ? (
            <div className="md:col-span-2">
              <div className="p-4 rounded-md bg-hotel-midnight/50 border border-hotel-gold/20 flex items-center gap-3">
                <Users className="h-5 w-5 text-hotel-gold shrink-0" />
                <p className="text-white/80">For Royal Deluxe rooms, only 1 adult is allowed with no children.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-hotel-gold" />
                  <Label htmlFor="adults" className="text-white font-medium">Adults</Label>
                </div>
                <div className="relative">
                  <Select
                    value={adults.toString()}
                    onValueChange={(value) => {
                      // Get maximum allowed adults based on room type
                      const maxAdults = room?.category_type === 'Royal Executive' ? 3 : 
                                        room?.category_type === 'Royal Suite' ? 4 : 10;
                      
                      // Count children over 7 as adults
                      const childrenOver7 = childrenAges.filter(age => age > 7).length;
                      
                      // New effective adults
                      const newEffectiveAdults = parseInt(value) + childrenOver7;
                      
                      // Check if new effective adults exceeds max
                      if (newEffectiveAdults > maxAdults) {
                        toast.info(`Maximum ${maxAdults} adults allowed (including children over 7 years).`);
                        // Set adults to max allowed minus children over 7
                        const maxAllowedActualAdults = Math.max(1, maxAdults - childrenOver7);
                        setAdults(maxAllowedActualAdults);
                      } else {
                        setAdults(parseInt(value));
                      }
                    }}
                  >
                    <SelectTrigger className="bg-hotel-midnight/80 backdrop-blur-sm border-hotel-gold/30 text-white hover:border-hotel-gold transition-all">
                      <SelectValue placeholder="Select adults" />
                    </SelectTrigger>
                    <SelectContent className="bg-hotel-slate border-hotel-gold/20 text-white">
                      {/* Limit options based on room type and children over 7 */}
                      {(() => {
                        // Calculate allowed adults based on room type and children over 7
                        const maxAllowed = room?.category_type === 'Royal Executive' ? 3 : 
                                          room?.category_type === 'Royal Suite' ? 4 : 10;
                        const childrenOver7 = childrenAges.filter(age => age > 7).length;
                        const maxActualAdults = Math.max(1, maxAllowed - childrenOver7);
                        
                        return generateOptions(maxActualAdults).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Adult' : 'Adults'}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  {room?.category_type === 'Royal Executive' && (
                    <p className="text-xs text-hotel-gold mt-1 pl-2">
                      Base price includes 2 adults. Additional adult: ₹600/night.
                    </p>
                  )}
                  {room?.category_type === 'Royal Suite' && (
                    <p className="text-xs text-hotel-gold mt-1 pl-2">
                      Base price includes 2 adults. Additional adults: ₹600/night each.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-hotel-gold" />
                  <Label htmlFor="children" className="text-white font-medium">Children</Label>
                </div>
                <div className="bg-hotel-midnight/80 backdrop-blur-sm border border-hotel-gold/30 rounded-md p-2 flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="bg-hotel-midnight border-hotel-gold/30 text-white hover:bg-hotel-gold/20"
                    onClick={() => handleChildrenCountChange(children - 1)}
                    disabled={children === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="flex-grow text-center text-white font-medium">
                    {children} {children === 1 ? 'Child' : 'Children'}
                  </span>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="bg-hotel-midnight border-hotel-gold/30 text-white hover:bg-hotel-gold/20"
                    onClick={() => handleChildrenCountChange(children + 1)}
                    disabled={children >= 6}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {children > 0 && (
                  <div className="mt-3 space-y-2 p-3 bg-hotel-midnight/50 rounded-md border border-hotel-gold/10">
                    <Label className="text-white text-sm">Enter age of each child:</Label>
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                      {childrenAges.map((age, index) => (
                        <div key={index} className="flex flex-col space-y-1">
                          <Label className="text-white/80 text-xs">Child {index + 1}</Label>
                          <Select
                            value={age.toString()}
                            onValueChange={(value) => {
                              handleChildAgeChange(index, parseInt(value));
                            }}
                          >
                            <SelectTrigger className="bg-hotel-midnight border-hotel-gold/20 text-white text-xs h-8">
                              <SelectValue placeholder="Age" />
                            </SelectTrigger>
                            <SelectContent className="bg-hotel-slate border-hotel-gold/20 text-white">
                              {[...Array(18)].map((_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i} years
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {parseInt(age.toString()) > 7 && (
                            <span className="text-yellow-400 text-xs text-center mt-1">Counted as adult</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-400 mt-3">
                      Note: Children over 7 years are counted as adults for capacity and pricing.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Show effective adult count for Executive and Suite rooms */}
      {(room?.category_type === 'Royal Executive' || room?.category_type === 'Royal Suite') && effectiveAdults > adults && (
        <div className="bg-hotel-midnight/40 p-4 rounded-lg border border-hotel-gold/10">
          <p className="text-white">
            <span className="text-hotel-gold font-medium">Total effective adults:</span> {effectiveAdults} 
            <span className="text-white/70 text-sm ml-2">
              ({adults} adults + {effectiveAdults - adults} {effectiveAdults - adults === 1 ? 'child' : 'children'} over 7 years)
            </span>
          </p>
          {effectiveAdults > 2 && (
            <p className="text-white/70 text-sm mt-1">
              Extra guest charge will apply for {effectiveAdults - 2} {effectiveAdults - 2 === 1 ? 'person' : 'people'}.
            </p>
          )}
        </div>
      )}
      
      {/* Breakfast option */}
      {room?.breakfast_price > 0 && (
        <div className="flex items-center space-x-4 bg-hotel-midnight p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="breakfast"
              checked={withBreakfast}
              onCheckedChange={setWithBreakfast}
            />
          </div>
          <div>
            <h3 className="text-white font-medium">Add Breakfast</h3>
            <p className="text-sm text-white/70">
              Enjoy daily {room.category_type ? getRoomBreakfastDescription(room.category_type) : 'breakfast'} for all guests
              {room.breakfast_price && (
                <span> (₹{room.breakfast_price} per person per day)</span>
              )}
            </p>
          </div>
        </div>
      )}
      
      {/* Special requests */}
      <div className="space-y-2">
        <Label htmlFor="special-requests" className="text-white">Special Requests</Label>
        <Input
          id="special-requests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requirements or preferences..."
          className="bg-hotel-midnight border-hotel-gold/30 text-white"
        />
      </div>
      
      {/* Terms and Conditions - ENHANCED SECTION */}
      <Card className="bg-hotel-slate/80 backdrop-blur-sm rounded-xl border border-hotel-gold/30 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-hotel-gold/20 bg-gradient-to-r from-hotel-gold/20 to-transparent">
          <FileText className="h-5 w-5 text-hotel-gold" />
          <h3 className="text-lg font-cormorant font-semibold text-white">Terms and Conditions</h3>
        </div>
        
        <div className="p-4">
          <ScrollArea className="h-48 pr-4">
            <ul className="list-disc pl-5 text-white/90 space-y-3">
              {termsAndConditions.map((term, index) => (
                <li key={index} className="pb-2 border-b border-white/10 last:border-0">
                  <span className="text-hotel-gold/90">{term.split(':')[0]}</span>
                  {term.includes(':') ? ': ' + term.split(':').slice(1).join(':') : term}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        
        <div className="flex items-center bg-hotel-slate/90 p-4 border-t border-hotel-gold/20">
          <div className="flex items-center gap-3">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="data-[state=checked]:bg-hotel-gold data-[state=checked]:border-hotel-gold"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none text-white cursor-pointer select-none"
            >
              I accept the terms and conditions
            </label>
          </div>
        </div>
      </Card>
      
      {/* Promo Code Input */}
      <PromoCodeInput 
        initialAmount={originalTotal} 
        onPromoApplied={handlePromoApplied} 
      />
      
      {/* Price summary */}
      <div className="bg-hotel-midnight rounded-lg p-4 space-y-4">
        <h3 className="text-white text-lg font-medium">Price Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-white/80">
            <span>Room Price:</span>
            <span className="text-white">{formatCurrency(room?.price || 0)} × {calculateNights()} nights × {numRooms} {numRooms > 1 ? 'rooms' : 'room'}</span>
          </div>
          
          {effectiveAdults > 2 && (room?.category_type === 'Royal Executive' || room?.category_type === 'Royal Suite') && (
            <div className="flex justify-between text-white/80">
              <span>Extra Guest Charge ({effectiveAdults - 2} {effectiveAdults - 2 === 1 ? 'person' : 'people'}):</span>
              <span className="text-white">₹{priceDetails.extraGuestCharges.toLocaleString()}</span>
            </div>
          )}
          
          {withBreakfast && (
            <div className="flex justify-between text-white/80">
              <span>Breakfast ({adults + children} guests):</span>
              <span className="text-white">₹{calculateBreakfastPrice().toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-white/80">
            <span>Base Price:</span>
            <span className="text-white">₹{priceDetails.basePrice.toLocaleString()}</span>
          </div>
          
          {promoApplied && (
            <div className="flex justify-between text-white/80 bg-green-900/20 p-2 rounded">
              <span className="text-green-400">Promo Discount:</span>
              <span className="text-green-400">-₹{Math.round(priceDetails.basePrice - priceDetails.discountedBasePrice).toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-white/80">
            <span>CGST (6%):</span>
            <span className="text-white">₹{Math.round(priceDetails.cgst).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-white/80">
            <span>SGST (6%):</span>
            <span className="text-white">₹{Math.round(priceDetails.sgst).toLocaleString()}</span>
          </div>
          
          <div className="border-t border-hotel-gold/20 my-2 pt-2 flex justify-between font-medium">
            <span className="text-hotel-gold">Total Price:</span>
            <span className="text-hotel-gold">
              {promoApplied && (
                <span className="line-through text-white/60 mr-2 text-sm">
                  ₹{Math.round(originalTotal).toLocaleString()}
                </span>
              )}
              ₹{Math.round(priceDetails.total).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Replace the Submit button with Razorpay Payment Button */}
      <RazorpayPayment
        amount={priceDetails.total}
        name={`${firstName} ${lastName}`}
        email={email}
        contact={phone}
        roomName={room?.name || "Room"}
        disabled={!isFormValid || maxAvailableRooms <= 0}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancellation}
        priceDetails={{
          basePrice: priceDetails.discountedBasePrice,
          roomPrice: room?.price || 0,
          nights: calculateNights(),
          cgst: priceDetails.cgst,
          sgst: priceDetails.sgst,
          roomCount: numRooms,
          withBreakfast: withBreakfast,
          breakfastPrice: room?.breakfast_price || 0,
          extraGuestCharges: priceDetails.extraGuestCharges,
          guests: {
            adults: adults,
            children: children
          }
        }}
      />
      
      <p className="text-center text-sm text-white/60">
        Payment is securely processed via Razorpay. Your booking will be confirmed upon successful payment.
      </p>
    </form>
  );
};

export default RoomBookingForm;

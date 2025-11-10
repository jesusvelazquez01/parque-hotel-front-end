
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Room } from "@/types/booking";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculateTotalPrice = (roomPrice: number, checkInDate: Date, checkOutDate: Date, extraGuestCount: number = 0) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((checkOutDate.getTime() - checkInDate.getTime()) / oneDay));
    const nights = Math.max(1, diffDays);
    
    // Base room price
    let totalPrice = roomPrice * nights;
    
    // Add extra guest charges if any (₹600 per extra adult per night)
    if (extraGuestCount > 0) {
      totalPrice += extraGuestCount * 600 * nights;
    }
    
    return totalPrice;
  };

  const createHotelBooking = async (
    room: Room,
    formData: {
      checkInDate: Date;
      checkOutDate: Date;
      guests: number;
      adults: number;
      children: number;
      childrenAges?: number[];
      customerName: string;
      customerEmail: string;
      specialRequests?: string;
      extraGuests?: number;
      withBreakfast?: boolean;
      effectiveAdults?: number;
    },
    paymentInfo?: {
      payment_id: string;
      payment_method: string;
      payment_status: string;
    }
  ) => {
    setLoading(true);
    try {
      // Calculate extra guests based on adults exceeding the base capacity (2 for most rooms, 1 for Deluxe)
      const baseCapacity = room.category_type === 'Royal Deluxe' ? 1 : 2;
      const extraGuests = Math.max(0, (formData.effectiveAdults || formData.adults || formData.guests) - baseCapacity);
      
      // Calculate total price including extra guest charges
      const totalPrice = calculateTotalPrice(
        room.price,
        formData.checkInDate,
        formData.checkOutDate,
        extraGuests
      );

      // Format dates for database
      const checkInFormatted = formData.checkInDate.toISOString().split('T')[0];
      const checkOutFormatted = formData.checkOutDate.toISOString().split('T')[0];

      // Format children ages to string if provided
      const childrenAgesStr = formData.childrenAges?.length > 0 
        ? JSON.stringify(formData.childrenAges) 
        : undefined;

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          room_id: room.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          check_in_date: checkInFormatted,
          check_out_date: checkOutFormatted,
          guests: formData.guests,
          adults: formData.adults || formData.guests,
          children: formData.children || 0,
          children_ages: childrenAgesStr,
          special_requests: formData.specialRequests || "",
          total_price: totalPrice,
          status: "pending",
          payment_status: paymentInfo?.payment_status || "pending",
          booking_type: "online",
          with_breakfast: formData.withBreakfast || false,
          effective_adults: formData.effectiveAdults ? String(formData.effectiveAdults) : String(formData.adults || formData.guests),
          extra_guests: extraGuests,
          extra_guest_charges: extraGuests > 0 ? String(extraGuests * 600) : undefined
        });

      if (error) throw error;

      toast.success("Booking created successfully!");
      navigate("/booking-confirmation", {
        state: {
          bookingDetails: {
            roomName: room.name,
            roomCategory: room.category_type,
            checkIn: checkInFormatted,
            checkOut: checkOutFormatted,
            guests: formData.guests,
            adults: formData.adults,
            children: formData.children,
            childrenAges: formData.childrenAges, 
            effectiveAdults: formData.effectiveAdults,
            extraGuests: extraGuests,
            totalPrice: totalPrice,
            paymentId: paymentInfo?.payment_id,
            paymentMethod: paymentInfo?.payment_method,
            withBreakfast: formData.withBreakfast
          },
        },
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(`Error creating booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTableBooking = async (
    formData: {
      date: Date;
      time: string;
      guests: number;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      specialRequests?: string;
    }
  ) => {
    setLoading(true);
    try {
      // Format date for database
      const dateFormatted = formData.date.toISOString().split('T')[0];

      const { data, error } = await supabase.from("table_bookings").insert([
        {
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone || "",
          date: dateFormatted,
          time: formData.time,
          guests: formData.guests,
          special_requests: formData.specialRequests || "",
          status: "pending",
          payment_status: "pending",
          booking_type: "online",
        },
      ]);

      if (error) throw error;

      toast.success("Table booking created successfully!");
      navigate("/booking-confirmation", {
        state: {
          bookingDetails: {
            type: "table",
            date: dateFormatted,
            time: formData.time,
            guests: formData.guests,
          },
        },
      });
    } catch (error: any) {
      console.error("Error creating table booking:", error);
      toast.error(`Error creating booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createHotelBooking,
    createTableBooking,
    calculateTotalPrice,
  };
};

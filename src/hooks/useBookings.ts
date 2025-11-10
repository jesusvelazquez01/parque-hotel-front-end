
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Booking } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBookings = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select('*');
      
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query.order('check_in_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Transform to make sure all data is properly formatted
      return data.map((booking: any) => ({
        ...booking,
        // Ensure room_id is always present and valid
        room_id: booking.room_id || 'unknown',
        // Ensure with_breakfast is always a boolean
        with_breakfast: booking.with_breakfast === true,
        // Make sure effective_adults is handled as a string (as per db schema)
        effective_adults: booking.effective_adults ? String(booking.effective_adults) : undefined
      })) as Booking[];
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to fetch bookings');
      return [];
    }
  };

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings', filterStatus],
    queryFn: fetchBookings,
  });

  const createBooking = useMutation({
    mutationFn: async (newBooking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
      // Ensure we're using string for effective_adults to match DB schema
      const bookingData = {
        ...newBooking,
        effective_adults: newBooking.effective_adults ? String(newBooking.effective_adults) : undefined
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();
        
      if (error) throw error;
      return data[0] as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating booking: ${error.message}`);
    }
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, ...booking }: Partial<Booking> & { id: string }) => {
      // Convert effective_adults to string if it's a number
      const bookingData = {
        ...booking,
        effective_adults: booking.effective_adults ? String(booking.effective_adults) : undefined
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0] as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating booking: ${error.message}`);
    }
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      // First, check for any refund requests associated with this booking
      const { data: refundRequests, error: refundCheckError } = await supabase
        .from('refund_requests')
        .select('id')
        .eq('booking_id', id);
      
      if (refundCheckError) {
        console.error('Error checking refund requests:', refundCheckError);
        throw refundCheckError;
      }
      
      // If there are refund requests, delete them first
      if (refundRequests && refundRequests.length > 0) {
        const { error: refundDeleteError } = await supabase
          .from('refund_requests')
          .delete()
          .eq('booking_id', id);
        
        if (refundDeleteError) {
          console.error('Error deleting refund requests:', refundDeleteError);
          throw refundDeleteError;
        }
      }
      
      // Also check for any receipts associated with this booking
      const { data: receiptData, error: receiptCheckError } = await supabase
        .from('receipts')
        .select('id')
        .eq('booking_id', id);
      
      if (receiptCheckError) {
        console.error('Error checking receipts:', receiptCheckError);
        throw receiptCheckError;
      }
      
      // If receipt exists, delete it first
      if (receiptData && receiptData.length > 0) {
        const { error: receiptDeleteError } = await supabase
          .from('receipts')
          .delete()
          .eq('booking_id', id);
          
        if (receiptDeleteError) {
          console.error('Error deleting receipts:', receiptDeleteError);
          throw receiptDeleteError;
        }
      }
      
      // Now we can safely delete the booking
      const { error: bookingDeleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
        
      if (bookingDeleteError) {
        console.error('Error deleting booking:', bookingDeleteError);
        throw bookingDeleteError;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting booking: ${error.message}`);
    }
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    filterStatus,
    setFilterStatus
  };
};


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { toast } from 'sonner';

export const useBookings = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch bookings with optional room data
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
        throw error;
      }

      // Get the list of room IDs to fetch
      const roomIds = data.map(booking => booking.room_id);
      
      if (roomIds.length > 0) {
        try {
          // Fetch room details for the bookings
          const { data: roomsData } = await supabase
            .from('rooms')
            .select('*')
            .in('id', roomIds);
            
          // Map the room data to the bookings
          return data.map((booking: Booking) => {
            const room = roomsData?.find(r => r.id === booking.room_id);
            return { ...booking, room };
          });
        } catch (roomError) {
          console.error('Error fetching room details:', roomError);
          // Return bookings without room details if there was an error
          return data;
        }
      }
      
      return data;
    },
  });

  // Create a new booking
  const createBooking = useMutation({
    mutationFn: async (newBooking: Omit<Booking, 'id'>) => {
      // Remove any properties that don't exist in the table schema
      const { payment_id, ...validBookingData } = newBooking as any;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([validBookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        toast.error('Failed to create booking');
        throw error;
      }

      toast.success('Booking created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Update an existing booking
  const updateBooking = useMutation({
    mutationFn: async (updatedBooking: Booking) => {
      const { id, ...bookingData } = updatedBooking;
      
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        toast.error('Error updating booking: ' + error.message);
        throw error;
      }

      toast.success('Booking updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Delete a booking
  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking');
        throw error;
      }

      toast.success('Booking deleted successfully');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    filterStatus,
    setFilterStatus,
  };
};


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TableBooking } from '@/types/booking'; // Import the TableBooking interface from our types file

export const useTableBookings = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const { data: tableBookings, isLoading, error } = useQuery({
    queryKey: ['table-bookings', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('table_bookings')
        .select('*')
        .order('date', { ascending: true });

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TableBooking[];
    },
  });

  const createTableBooking = useMutation({
    mutationFn: async (booking: Omit<TableBooking, 'id' | 'created_at' | 'updated_at'>) => {
      // Remove any properties that don't exist in the table schema
      const { payment_id, payment_amount, ...validBookingData } = booking as any;
      
      const { data, error } = await supabase
        .from('table_bookings')
        .insert([validBookingData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-bookings'] });
      toast.success('Table booking created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating table booking: ${error.message}`);
    },
  });

  const updateTableBooking = useMutation({
    mutationFn: async (booking: Partial<TableBooking> & { id: string }) => {
      const { data, error } = await supabase
        .from('table_bookings')
        .update(booking)
        .eq('id', booking.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-bookings'] });
      toast.success('Booking updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating booking: ${error.message}`);
    },
  });

  const deleteTableBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('table_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-bookings'] });
      toast.success('Booking deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting booking: ${error.message}`);
    },
  });

  return {
    tableBookings,
    isLoading,
    error,
    updateTableBooking,
    deleteTableBooking,
    createTableBooking,
    filterStatus,
    setFilterStatus,
  };
};

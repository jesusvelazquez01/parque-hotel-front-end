
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Room } from '@/types/booking';

export const useRooms = () => {
  const queryClient = useQueryClient();

  // Fetch all rooms
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to fetch rooms');
        throw error;
      }
      
      // Map the data to include price_per_night required by the Room type
      return (data || []).map(room => ({
        ...room,
        price_per_night: room.price // Map price to price_per_night for compatibility
      })) as Room[];
    },
  });

  // Create room
  const createRoom = useMutation({
    mutationFn: async (roomData: Partial<Room>) => {
      // Ensure required fields are present or handle appropriately
      if (!roomData.name || !roomData.description || !roomData.image_url || 
          (!roomData.price && !roomData.price_per_night)) {
        throw new Error('Missing required room properties');
      }
      
      // Map price_per_night to price if provided
      // Create a database-compatible object (without price_per_night)
      const dataToInsert = {
        name: roomData.name,
        description: roomData.description,
        price: roomData.price_per_night || roomData.price,
        image_url: roomData.image_url,
        is_available: roomData.is_available ?? true,
        capacity: roomData.capacity || 2,
        beds: roomData.beds || 1,
        bathrooms: roomData.bathrooms || 1,
        amenities: roomData.amenities || [],
        status: roomData.status || 'available',
        category: roomData.category || 'Standard'
      };

      const { data, error } = await supabase
        .from('rooms')
        .insert(dataToInsert)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating room:', error);
        toast.error('Failed to create room');
        throw error;
      }
      
      return {
        ...data,
        price_per_night: data.price
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully');
    },
  });

  // Update room
  const updateRoom = useMutation({
    mutationFn: async ({ id, ...roomData }: Partial<Room> & { id: string }) => {
      if (!id) {
        throw new Error('Room ID is required for updates');
      }
      
      // Map price_per_night to price if it exists
      const dataToUpdate: Record<string, any> = { ...roomData };
      
      // Handle price mapping from price_per_night
      if ('price_per_night' in roomData) {
        dataToUpdate.price = roomData.price_per_night;
        delete dataToUpdate.price_per_night;
      }

      const { data, error } = await supabase
        .from('rooms')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating room:', error);
        toast.error('Failed to update room');
        throw error;
      }
      
      return {
        ...data,
        price_per_night: data.price
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated successfully');
    },
  });

  // Delete room
  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting room:', error);
        toast.error('Failed to delete room');
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted successfully');
    },
  });

  // Update room status
  const updateRoomStatus = useMutation({
    mutationFn: async ({ roomId, status, isAvailable }: { roomId: string; status: string; isAvailable: boolean }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({ 
          status, 
          is_available: isAvailable 
        })
        .eq('id', roomId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating room status:', error);
        toast.error('Failed to update room status');
        throw error;
      }
      
      return {
        ...data,
        price_per_night: data.price
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Complete room checkout
  const completeRoomCheckout = useMutation({
    mutationFn: async ({ roomId, bookingId }: { roomId: string; bookingId: string }) => {
      // First update the booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'checked_out' })
        .eq('id', bookingId);
        
      if (bookingError) {
        console.error('Error updating booking status:', bookingError);
        throw bookingError;
      }
      
      // Then free up the room availability
      const { data, error } = await supabase.rpc('checkout_room', {
        _booking_id: bookingId
      });
      
      if (error) {
        console.error('Error checking out room:', error);
        toast.error('Failed to complete checkout process');
        throw error;
      }
      
      return { success: true, roomId, bookingId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room-availability'] });
      toast.success('Room checked out successfully');
    },
    onError: (error: any) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });

  return {
    rooms,
    isLoading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    completeRoomCheckout
  };
};


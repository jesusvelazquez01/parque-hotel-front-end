
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Room } from "@/types/booking";
import { toast } from 'sonner';

export const useRooms = () => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    checkIn?: string | Date,
    checkOut?: string | Date
  }>({});
  
  const queryClient = useQueryClient();

  const {
    data: rooms,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["rooms", filterStatus, dateFilter],
    queryFn: async () => {
      let query = supabase.from("rooms").select("*");
      
      if (filterStatus) {
        if (filterStatus === "available") {
          query = query.eq("is_available", true);
        } else if (filterStatus === "occupied") {
          query = query.eq("status", "occupied");
        } else if (filterStatus === "maintenance") {
          query = query.eq("status", "maintenance");
        }
      }
      
      const { data: roomsData, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching rooms:", error);
        throw error;
      }
      
      // If date filters are provided, check actual availability for those dates
      if (dateFilter.checkIn && dateFilter.checkOut) {
        const checkInDate = typeof dateFilter.checkIn === 'string' ? 
          dateFilter.checkIn : dateFilter.checkIn.toISOString().split('T')[0];
        
        const checkOutDate = typeof dateFilter.checkOut === 'string' ? 
          dateFilter.checkOut : dateFilter.checkOut.toISOString().split('T')[0];
        
        // For each room, check if it's available for the date range
        const roomsWithAvailability = await Promise.all(roomsData.map(async (room) => {
          try {
            const { data: isAvailable } = await supabase.rpc('is_room_available', {
              room_id: room.id,
              check_in: checkInDate,
              check_out: checkOutDate
            });

            const status = isAvailable ? 'available' : 'booked';
            
            return {
              ...room,
              is_available: isAvailable,
              status: status,
              price_per_night: room.price // Add price_per_night mapping here
            };
          } catch (err) {
            console.error(`Error checking availability for room ${room.id}:`, err);
            return {
              ...room,
              price_per_night: room.price, // Add price_per_night mapping here
              status: room.status || (room.is_available ? 'available' : 'maintenance')
            };
          }
        }));
        
        return roomsWithAvailability as Room[];
      }
      
      // If no date filters, process rooms normally
      return (roomsData || []).map(room => ({
        ...room,
        price: room.price,
        price_per_night: room.price, // Add price_per_night mapping here
        status: room.status || (room.is_available ? 'available' : 'maintenance')
      })) as Room[];
    }
  });

  const updateRoom = useMutation({
    mutationFn: async (roomData: Partial<Room> & { id: string }) => {
      const { id, ...rest } = roomData;
      const { data, error } = await supabase
        .from("rooms")
        .update(rest)
        .eq("id", id)
        .select();
      
      if (error) throw error;
      
      const updatedRoom = data[0];
      const calculatedStatus = updatedRoom.is_available ? 'available' : 'maintenance';
      
      return {
        ...updatedRoom,
        status: updatedRoom.status || calculatedStatus
      } as Room;
    },
    onSuccess: (updatedRoom) => {
      queryClient.setQueryData(["rooms"], (oldRooms: Room[] | undefined) => {
        if (!oldRooms) return [updatedRoom];
        return oldRooms.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        );
      });
      
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
      
      toast.success('Room updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update room: ${error.message}`);
    }
  });
  
  // Function to update room status
  const updateRoomStatus = useMutation({
    mutationFn: async ({ roomId, status, isAvailable }: { roomId: string, status: string, isAvailable?: boolean }) => {
      const updateData: { status?: string, is_available?: boolean } = { status };
      
      if (isAvailable !== undefined) {
        updateData.is_available = isAvailable;
      }
      
      const { error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', roomId);
      
      if (error) throw error;
      return { roomId, status, isAvailable };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success('Room status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating room status: ${error.message}`);
    }
  });

  // Function to manually set rooms as occupied or available for specific dates
  const updateRoomAvailabilityForDates = useMutation({
    mutationFn: async ({ 
      roomId, 
      status, 
      startDate, 
      endDate, 
      bookingId = null 
    }: { 
      roomId: string, 
      status: 'booked' | 'available', 
      startDate: Date | string, 
      endDate: Date | string,
      bookingId?: string | null
    }) => {
      // Convert dates to string format if they're Date objects
      const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
      const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase.rpc('update_room_availability_for_dates', {
        p_room_id: roomId,
        p_start_date: start,
        p_end_date: end,
        p_status: status,
        p_booking_id: bookingId
      });
      
      if (error) throw error;
      
      return { roomId, success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success('Room availability updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update room availability: ${error.message}`);
    }
  });

  return {
    rooms,
    isLoading,
    error,
    updateRoom,
    updateRoomStatus,
    filterStatus,
    setFilterStatus,
    dateFilter,
    setDateFilter,
    refetch,
    updateRoomAvailabilityForDates
  };
};

export default useRooms;

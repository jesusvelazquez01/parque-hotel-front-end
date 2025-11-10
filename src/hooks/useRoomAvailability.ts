
import { useState, useEffect, useCallback } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Room } from '@/types/booking';

export interface RoomAvailabilityDay {
  id?: string;
  date: Date;
  status: string;
  source?: string;
  booking_id?: string | null;
  notes?: string;
}

export const useRoomAvailability = (roomId?: string) => {
  const [availabilityData, setAvailabilityData] = useState<RoomAvailabilityDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Function to fetch room availability data
  const fetchRoomAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!roomId) {
        // If no roomId provided, fetch all rooms' availability
        const { data, error } = await supabase
          .from('room_availability')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;

        // Transform the data to include Date objects
        const formattedData = data.map((item) => ({
          ...item,
          date: new Date(item.date)
        }));

        setAvailabilityData(formattedData);
      } else {
        // Fetch availability for a specific room
        const { data, error } = await supabase
          .from('room_availability')
          .select('*')
          .eq('room_id', roomId)
          .order('date', { ascending: true });

        if (error) throw error;

        // Transform the data to include Date objects
        const formattedData = data.map((item) => ({
          ...item,
          date: new Date(item.date)
        }));

        setAvailabilityData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching room availability:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Initialize room availability for future dates
  const initializeRoomAvailability = async (daysAhead: number = 365) => {
    try {
      setLoading(true);
      
      // Call the Supabase function to initialize availability
      const { data, error } = await supabase
        .rpc('initialize_room_availability', { _days_ahead: daysAhead });
        
      if (error) throw error;
      
      // After initializing, fetch the data again
      await fetchRoomAvailability();
      
      return true;
    } catch (error) {
      console.error('Error initializing room availability:', error);
      setError(error as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get availability for a specific date
  const getAvailabilityByDate = (date: Date): RoomAvailabilityDay | null => {
    const dayData = availabilityData.find((day) => isSameDay(new Date(day.date), date));
    
    if (!dayData) {
      return {
        date,
        status: 'unknown'
      };
    }
    
    return dayData;
  };

  // Toggle date selection for individual dates
  const toggleDateSelection = (date: Date) => {
    setSelectedDates((currentDates) => {
      if (currentDates.some((d) => isSameDay(d, date))) {
        return currentDates.filter((d) => !isSameDay(d, date));
      } else {
        return [...currentDates, date];
      }
    });
  };

  // Update selected dates with a new status
  const updateSelectedDates = async (
    status: string,
    source: string = 'admin',
    notes?: string
  ) => {
    try {
      if (selectedDates.length === 0 || !roomId) return false;
      
      const selectedDateStrings = selectedDates.map((date) => format(date, 'yyyy-MM-dd'));
      
      // Get the room ids for bulk update
      const roomIds = [roomId];
      
      // Format the data for the bulk update
      const updateData = {
        p_room_ids: roomIds,
        p_status: status,
        p_source: source,
        p_notes: notes || null
      };
      
      // We need to handle dates differently since they need to be processed individually
      for (const dateStr of selectedDateStrings) {
        // Update each date individually
        const { error } = await supabase
          .from('room_availability')
          .upsert({ 
            room_id: roomId,
            date: dateStr,
            status: status,
            source: source
          });
          
        if (error) throw error;
      }
      
      // Fetch updated data
      await fetchRoomAvailability();
      
      // Clear selected dates after update
      setSelectedDates([]);
      
      toast.success('Room availability updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating room availability:', error);
      toast.error('Failed to update room availability');
      return false;
    }
  };

  // Update date range with a new status
  const updateDateRange = async (
    status: string,
    source: string = 'admin',
    notes?: string,
    customStartDate?: Date,
    customEndDate?: Date
  ) => {
    try {
      if ((!dateRange.from && !customStartDate) || !roomId) return false;
      
      const startDate = customStartDate || dateRange.from;
      const endDate = customEndDate || dateRange.to || startDate;
      
      if (!startDate) return false;
      
      // If end date is the same as start date, set it to next day for the range
      const adjustedEndDate = isSameDay(startDate, endDate) 
        ? addDays(endDate, 1) 
        : addDays(endDate, 1); // Add 1 day to end date to make it inclusive
      
      // Call the bulk update RPC function
      const { data, error } = await supabase
        .rpc('bulk_update_room_availability', {
          p_room_ids: [roomId],
          p_start_date: format(startDate, 'yyyy-MM-dd'),
          p_end_date: format(adjustedEndDate, 'yyyy-MM-dd'),
          p_status: status,
          p_source: source,
          p_notes: notes || null
        });
        
      if (error) throw error;
      
      // Fetch updated data
      await fetchRoomAvailability();
      
      // Clear date range after update
      setDateRange({ from: undefined, to: undefined });
      
      toast.success('Room availability updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating room availability:', error);
      toast.error('Failed to update room availability');
      return false;
    }
  };
  
  // Check if a specific room is available for given dates
  const checkRoomAvailability = async (roomId: string, checkIn: Date | string | undefined, checkOut: Date | string | undefined) => {
    try {
      // Return false if either date is missing
      if (!checkIn || !checkOut) return false;
      
      // Convert dates to string format if they're Date objects
      const checkInDate = checkIn instanceof Date ? checkIn.toISOString().split('T')[0] : checkIn;
      const checkOutDate = checkOut instanceof Date ? checkOut.toISOString().split('T')[0] : checkOut;
      
      // Call the Supabase function to check room availability
      const { data, error } = await supabase.rpc('check_room_availability', {
        _room_id: roomId,
        _check_in_date: checkInDate,
        _check_out_date: checkOutDate
      });
      
      if (error) {
        console.error('Error checking room availability:', error);
        return false;
      }
      
      return data;
    } catch (err) {
      console.error(`Error checking availability for room ${roomId}:`, err);
      return false;
    }
  };

  // Function to get all available rooms for the specified dates
  const getAvailableRooms = async (checkIn: Date | undefined, checkOut: Date | undefined) => {
    try {
      // Return empty array if either date is missing
      if (!checkIn || !checkOut) return [];
      
      // Get all rooms first
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');
      
      if (roomsError) {
        throw roomsError;
      }
      
      if (!rooms || rooms.length === 0) {
        return [];
      }

      // Check availability for each room for the specified dates
      const availableRooms = await Promise.all(rooms.map(async (room) => {
        try {
          // Use the function we created to check room availability
          const isAvailable = await checkRoomAvailability(
            room.id,
            checkIn,
            checkOut
          );

          // Add the availability status and calculated price to the room
          return {
            ...room,
            is_available: isAvailable,
            status: isAvailable ? 'available' : 'booked',
            price_per_night: room.price
          };
        } catch (err) {
          console.error(`Error checking availability for room ${room.id}:`, err);
          return {
            ...room,
            price_per_night: room.price,
            status: 'maintenance'
          };
        }
      }));

      // Filter only available rooms
      return availableRooms.filter(room => room.is_available) as Room[];
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      return [];
    }
  };

  // Function to update room availability after checkout
  const updateRoomAfterCheckout = async (roomId: string, bookingId: string) => {
    try {
      // Call the database function to check out a room
      const { data, error } = await supabase.rpc('checkout_room', {
        _booking_id: bookingId
      });
      
      if (error) {
        console.error('Error checking out room:', error);
        return false;
      }
      
      return data;
    } catch (err) {
      console.error(`Error updating room ${roomId} after checkout:`, err);
      return false;
    }
  };

  // Fetch initial data when component mounts or roomId changes
  useEffect(() => {
    fetchRoomAvailability();
  }, [fetchRoomAvailability, roomId]);

  return {
    availabilityData,
    loading,
    error,
    fetchRoomAvailability,
    initializeRoomAvailability,
    getAvailabilityByDate,
    checkRoomAvailability,
    getAvailableRooms,
    updateRoomAfterCheckout,
    selectedDates,
    setSelectedDates,
    toggleDateSelection,
    updateSelectedDates,
    dateRange,
    setDateRange,
    updateDateRange
  };
};

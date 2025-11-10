
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { addDays, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Room } from '@/types/booking';
import { useRooms } from '@/hooks/useRooms';

export type RoomAvailabilityDay = {
  date: Date;
  status: 'available' | 'online-booking' | 'offline-booking' | 'maintenance' | 'unavailable';
  source: string;
  booking_id?: string;
};

export type RoomAvailabilityFilter = {
  status?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
};

export const useRoomAvailability = (roomId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { updateRoomStatus } = useRooms();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const [filters, setFilters] = useState<RoomAvailabilityFilter>({
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
  });

  // Fetch room availability for specific room or all rooms
  const { data: availabilityData, isLoading, error } = useQuery({
    queryKey: ['room-availability', roomId, filters],
    queryFn: async () => {
      let query = supabase
        .from('room_availability')
        .select('*');
      
      if (roomId) {
        query = query.eq('room_id', roomId);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      
      if (filters.startDate) {
        query = query.gte('date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      
      if (filters.endDate) {
        query = query.lte('date', format(filters.endDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        console.error('Error fetching room availability:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Get availability for specific room by date
  const getAvailabilityByDate = useCallback((date: Date): RoomAvailabilityDay | undefined => {
    if (!availabilityData || !roomId) return undefined;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayData = availabilityData.find((day) => 
      day.room_id === roomId && day.date === formattedDate
    );
    
    if (dayData) {
      return {
        date: new Date(dayData.date),
        status: dayData.status as 'available' | 'online-booking' | 'offline-booking' | 'maintenance' | 'unavailable',
        source: dayData.source,
        booking_id: dayData.booking_id,
      };
    }
    
    return {
      date,
      status: 'available',
      source: 'system',
    };
  }, [availabilityData, roomId]);

  // Check if a date is booked
  const isDateBooked = useCallback((date: Date): boolean => {
    const dayData = getAvailabilityByDate(date);
    return dayData ? dayData.status !== 'available' : false;
  }, [getAvailabilityByDate]);

  // Check for conflicts when trying to update availability
  const checkAvailabilityConflicts = useMutation({
    mutationFn: async ({ roomId, startDate, endDate }: { roomId: string; startDate: Date; endDate: Date }) => {
      const { data, error } = await supabase.rpc('check_availability_conflicts', {
        p_room_id: roomId,
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd'),
      });
      
      if (error) {
        console.error('Error checking conflicts:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Update room availability for a specific date range
  const updateAvailability = useMutation({
    mutationFn: async ({ 
      roomIds,
      startDate,
      endDate,
      status,
      source,
      notes
    }: { 
      roomIds: string[];
      startDate: Date;
      endDate: Date;
      status: string;
      source: string;
      notes?: string;
    }) => {
      try {
        const { data, error } = await supabase.rpc('bulk_update_room_availability', {
          p_room_ids: roomIds,
          p_start_date: format(startDate, 'yyyy-MM-dd'),
          p_end_date: format(endDate, 'yyyy-MM-dd'),
          p_status: status,
          p_source: source,
          p_admin_id: user?.id || null,
          p_notes: notes || null,
        });
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        // Update room status in rooms table based on status
        for (const roomId of roomIds) {
          let isRoomAvailable: boolean;
          let roomStatus: string;
          
          // Determine room status and availability based on availability status
          switch (status) {
            case 'maintenance':
              isRoomAvailable = false;
              roomStatus = 'maintenance';
              break;
            case 'unavailable':
              isRoomAvailable = false;
              roomStatus = 'unavailable';
              break;
            case 'online-booking':
            case 'offline-booking':
              // For booking statuses on specific dates, don't change overall room availability
              // Just update the room status for tracking
              isRoomAvailable = true;
              roomStatus = 'booked';
              break;
            case 'available':
              // Check if all dates for this room are now available or have non-maintenance/unavailable statuses
              const { data: unavailableDays } = await supabase
                .from('room_availability')
                .select('*')
                .eq('room_id', roomId)
                .in('status', ['maintenance', 'unavailable']);
                
              // If no unavailable/maintenance days are left, mark the room as available
              if (!unavailableDays?.length) {
                isRoomAvailable = true;
                roomStatus = 'available';
              } else {
                // Don't update the room status if there are still some unavailable days
                continue;
              }
              break;
            default:
              continue;
          }
          
          // Update the room status in the rooms table
          await updateRoomStatus.mutateAsync({
            roomId,
            status: roomStatus,
            isAvailable: isRoomAvailable,
          });
        }
        
        return data;
      } catch (error) {
        console.error('Failed to update availability:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-availability'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room availability updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update availability: ${error.message}`);
    },
  });

  // Update availability for selected dates
  const updateSelectedDates = useCallback((status: string, source: string, notes?: string) => {
    if (!roomId || !selectedDates.length) {
      toast.error("No dates or room selected");
      return;
    }
    
    // Group consecutive dates into ranges for more efficient updating
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    
    // For simplicity, we'll just update all selected dates at once
    updateAvailability.mutate({
      roomIds: [roomId],
      startDate: sortedDates[0],
      endDate: addDays(sortedDates[sortedDates.length - 1], 1), // Add one day to include the last date
      status,
      source,
      notes,
    });
    
    // Clear selection after update
    setSelectedDates([]);
  }, [roomId, selectedDates, updateAvailability]);

  // Update availability for date range
  const updateDateRange = useCallback((status: string, source: string, notes?: string, customFrom?: Date, customTo?: Date) => {
    // Use either the custom dates or the dateRange state
    const from = customFrom || dateRange.from;
    const to = customTo || dateRange.to || from;
    
    if (!roomId || !from) {
      toast.error("No date range or room selected");
      return false;
    }
    
    const end = to || from;
    
    updateAvailability.mutate({
      roomIds: [roomId],
      startDate: from,
      endDate: addDays(end, 1), // Add one day to include the end date
      status,
      source,
      notes,
    });
    
    // Reset date range after update if we're not using custom dates
    if (!customFrom && !customTo) {
      setDateRange({ from: undefined, to: undefined });
    }
    
    return true;
  }, [roomId, dateRange, updateAvailability]);

  // Toggle date selection
  const toggleDateSelection = useCallback((date: Date) => {
    setSelectedDates((prev) => {
      const isSelected = prev.some((d) => isSameDay(d, date));
      
      if (isSelected) {
        return prev.filter((d) => !isSameDay(d, date));
      } else {
        return [...prev, date];
      }
    });
  }, []);

  // Group availability data by room
  const availabilityByRoom = useMemo(() => {
    if (!availabilityData) return {};
    
    return availabilityData.reduce((acc: Record<string, RoomAvailabilityDay[]>, item) => {
      if (!acc[item.room_id]) {
        acc[item.room_id] = [];
      }
      
      acc[item.room_id].push({
        date: new Date(item.date),
        status: item.status as 'available' | 'online-booking' | 'offline-booking' | 'maintenance' | 'unavailable',
        source: item.source,
        booking_id: item.booking_id,
      });
      
      return acc;
    }, {});
  }, [availabilityData]);

  // Calculate date statistics
  const dateStats = useMemo(() => {
    if (!availabilityData) {
      return {
        total: 0,
        available: 0,
        booked: 0,
        maintenance: 0,
        offlineBooking: 0,
        unavailable: 0,
      };
    }
    
    return availabilityData.reduce((stats: any, item) => {
      stats.total += 1;
      
      switch (item.status) {
        case 'available':
          stats.available += 1;
          break;
        case 'online-booking':
          stats.booked += 1;
          break;
        case 'offline-booking':
          stats.offlineBooking += 1;
          break;
        case 'maintenance':
          stats.maintenance += 1;
          break;
        case 'unavailable':
          stats.unavailable += 1;
          break;
      }
      
      return stats;
    }, {
      total: 0,
      available: 0,
      booked: 0,
      maintenance: 0,
      offlineBooking: 0,
      unavailable: 0,
    });
  }, [availabilityData]);

  // Add functions from useRoomAvailabilitySimple.ts
  const checkRoomAvailability = useCallback(async (roomId: string, checkIn: Date | string | undefined, checkOut: Date | string | undefined) => {
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
  }, []);

  // Function to get all available rooms for the specified dates
  const getAvailableRooms = useCallback(async (checkIn: Date | undefined, checkOut: Date | undefined) => {
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
  }, [checkRoomAvailability]);

  // Function to update room availability after checkout
  const updateRoomAfterCheckout = useCallback(async (roomId: string, bookingId: string) => {
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
  }, []);

  // Initialize room availability data for next 365 days
  const initializeRoomAvailability = useCallback(async (daysAhead = 365) => {
    try {
      const { data, error } = await supabase.rpc('initialize_room_availability', {
        _days_ahead: daysAhead
      });
      
      if (error) {
        console.error('Error initializing room availability:', error);
        toast.error(`Failed to initialize room availability: ${error.message}`);
        return false;
      }
      
      queryClient.invalidateQueries({ queryKey: ['room-availability'] });
      toast.success('Room availability initialized successfully');
      return true;
    } catch (err) {
      console.error('Error initializing room availability:', err);
      toast.error('Failed to initialize room availability');
      return false;
    }
  }, [queryClient]);

  return {
    availabilityData,
    availabilityByRoom,
    isLoading,
    error,
    getAvailabilityByDate,
    isDateBooked,
    updateAvailability,
    updateSelectedDates,
    updateDateRange,
    checkAvailabilityConflicts,
    selectedDates,
    setSelectedDates,
    toggleDateSelection,
    dateRange,
    setDateRange,
    filters,
    setFilters,
    dateStats,
    // Add the functions from useRoomAvailabilitySimple.ts
    checkRoomAvailability,
    getAvailableRooms,
    updateRoomAfterCheckout,
    initializeRoomAvailability
  };
};

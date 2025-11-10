
import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { useTableBookings } from '@/hooks/useTableBookings';
import { useRooms } from '@/hooks/useRooms';
import { Booking, TableBooking } from '@/types/booking';
import { toast } from 'sonner';

export const useBookingManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'hotel' | 'table'>('hotel');
  const [formMode, setFormMode] = useState<'online' | 'offline'>('online');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | TableBooking | null>(null);

  const { rooms } = useRooms();
  
  // For hotel bookings - explicitly import from useBookings.tsx
  const {
    bookings,
    isLoading: isLoadingHotelBookings,
    createBooking,
    updateBooking,
    deleteBooking
  } = useBookings();

  // For table bookings - explicitly import from useTableBookings.tsx  
  const {
    tableBookings,
    isLoading: isLoadingTableBookings,
    createTableBooking,
    updateTableBooking,
    deleteTableBooking
  } = useTableBookings();

  // Handle hotel booking creation
  const handleCreateHotelBooking = async (bookingData: any) => {
    try {
      const booking = await createBooking.mutateAsync(bookingData);
      setIsAddDialogOpen(false);
      toast.success('Hotel booking created successfully');
      return booking;
    } catch (error: any) {
      toast.error(`Failed to create booking: ${error.message}`);
      throw error;
    }
  };

  // Handle hotel booking update
  const handleUpdateHotelBooking = async (bookingId: string, bookingData: any) => {
    try {
      const booking = await updateBooking.mutateAsync({ id: bookingId, ...bookingData });
      toast.success('Booking updated successfully');
      return booking;
    } catch (error: any) {
      toast.error(`Failed to update booking: ${error.message}`);
      throw error;
    }
  };

  // Handle hotel booking deletion
  const handleDeleteHotelBooking = async (bookingId: string) => {
    try {
      await deleteBooking.mutateAsync(bookingId);
      toast.success('Booking deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete booking: ${error.message}`);
      throw error;
    }
  };

  // Handle table booking creation
  const handleCreateTableBooking = async (bookingData: any) => {
    try {
      const booking = await createTableBooking.mutateAsync(bookingData);
      setIsAddDialogOpen(false);
      toast.success('Table reservation created successfully');
      return booking;
    } catch (error: any) {
      toast.error(`Failed to create table reservation: ${error.message}`);
      throw error;
    }
  };

  // Handle table booking update
  const handleUpdateTableBooking = async (bookingId: string, bookingData: any) => {
    try {
      const booking = await updateTableBooking.mutateAsync({ id: bookingId, ...bookingData });
      toast.success('Table reservation updated successfully');
      return booking;
    } catch (error: any) {
      toast.error(`Failed to update table reservation: ${error.message}`);
      throw error;
    }
  };

  // Handle table booking deletion
  const handleDeleteTableBooking = async (bookingId: string) => {
    try {
      await deleteTableBooking.mutateAsync(bookingId);
      toast.success('Table reservation deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete table reservation: ${error.message}`);
      throw error;
    }
  };

  // Generic handlers that use the appropriate function based on bookingType
  const handleCreateBooking = async (bookingData: any) => {
    if (bookingType === 'hotel') {
      return handleCreateHotelBooking(bookingData);
    } else {
      return handleCreateTableBooking(bookingData);
    }
  };

  const handleUpdateBooking = async (bookingData: any) => {
    if (bookingType === 'hotel') {
      return handleUpdateHotelBooking(bookingData.id, bookingData);
    } else {
      return handleUpdateTableBooking(bookingData.id, bookingData);
    }
  };

  const handleDeleteBooking = async (booking: Booking | TableBooking) => {
    if (bookingType === 'hotel') {
      return handleDeleteHotelBooking(booking.id);
    } else {
      return handleDeleteTableBooking(booking.id);
    }
  };

  // View a booking's details
  const handleViewBooking = (booking: Booking | TableBooking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const isLoading = isLoadingHotelBookings || isLoadingTableBookings;

  return {
    bookings,
    tableBookings,
    isLoading,
    handleCreateHotelBooking,
    handleUpdateHotelBooking,
    handleDeleteHotelBooking,
    handleCreateTableBooking,
    handleUpdateTableBooking,
    handleDeleteTableBooking,
    handleCreateBooking,
    handleUpdateBooking,
    handleDeleteBooking,
    handleViewBooking,
    isAddDialogOpen,
    setIsAddDialogOpen,
    bookingType,
    setBookingType,
    formMode,
    setFormMode,
    selectedBooking,
    isViewDialogOpen,
    setIsViewDialogOpen
  };
};

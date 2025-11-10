
import { useState } from 'react';
import { useBookings } from './useBookings';
import { useTableBookings } from './useTableBookings';
import { useRooms } from './useRooms';
import { toast } from 'sonner';
import { Booking, TableBooking } from '@/types/booking';

export const useBookingManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'hotel' | 'table'>('hotel');
  const [formMode, setFormMode] = useState<'online' | 'offline'>('online');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { bookings, createBooking, deleteBooking, updateBooking } = useBookings();
  const { tableBookings, createTableBooking, deleteTableBooking, updateTableBooking } = useTableBookings();
  const { rooms } = useRooms();

  const handleCreateHotelBooking = async (bookingData: any) => {
    try {
      const checkInDate = new Date(bookingData.check_in_date);
      const checkOutDate = new Date(bookingData.check_out_date);
      
      if (checkOutDate <= checkInDate) {
        toast.error('Check-out date must be after check-in date');
        return;
      }

      let roomId = bookingData.room_id;
      
      if (!roomId && rooms && rooms.length > 0) {
        const availableRoom = rooms.find(room => room.is_available);
        roomId = availableRoom ? availableRoom.id : rooms[0].id;
      }
      
      if (!roomId) {
        toast.error('No rooms available for booking');
        return;
      }

      // Ensure total_price is provided and is a number
      if (!bookingData.total_price || isNaN(parseFloat(bookingData.total_price))) {
        toast.error('Total price is required and must be a number');
        return;
      }

      const hotelBookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'> = {
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        guests: Number(bookingData.guests),
        special_requests: bookingData.special_requests || null,
        total_price: parseFloat(bookingData.total_price),
        booking_type: formMode,
        status: bookingData.status || "pending",
        room_id: roomId,
        payment_status: bookingData.payment_status || 'pending'
      };
      
      await createBooking.mutateAsync(hotelBookingData);
      toast.success('Hotel booking created successfully');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error creating booking: ${error.message}`);
      console.error(error);
    }
  };

  const handleCreateTableBooking = async (bookingData: any) => {
    try {
      const tableBookingData: Omit<TableBooking, 'id' | 'created_at' | 'updated_at'> = {
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        date: bookingData.date,
        time: bookingData.time,
        guests: Number(bookingData.guests),
        special_requests: bookingData.special_requests || null,
        booking_type: formMode,
        status: bookingData.status || "pending",
        payment_status: bookingData.payment_status || 'pending'
      };
      
      await createTableBooking.mutateAsync(tableBookingData);
      toast.success('Table booking created successfully');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error creating booking: ${error.message}`);
      console.error(error);
    }
  };

  const handleDeleteBooking = async (booking: any) => {
    try {
      if (window.confirm('Are you sure you want to delete this booking?')) {
        if (bookingType === 'hotel') {
          await deleteBooking.mutateAsync(booking.id);
        } else {
          await deleteTableBooking.mutateAsync(booking.id);
        }
        toast.success('Booking deleted successfully');
      }
    } catch (error: any) {
      toast.error(`Error deleting booking: ${error.message}`);
      console.error(error);
    }
  };

  const handleUpdateBooking = async (bookingData: any) => {
    try {
      if (bookingType === 'hotel') {
        await updateBooking.mutateAsync(bookingData);
      } else {
        await updateTableBooking.mutateAsync(bookingData);
      }
      toast.success('Booking updated successfully');
    } catch (error: any) {
      toast.error(`Error updating booking: ${error.message}`);
      console.error(error);
    }
  };

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    bookingType,
    setBookingType,
    formMode,
    setFormMode,
    handleCreateHotelBooking,
    handleCreateTableBooking,
    handleDeleteBooking,
    handleUpdateBooking,
    handleViewBooking,
    bookings,
    tableBookings,
    selectedBooking,
    isViewDialogOpen,
    setIsViewDialogOpen,
  };
};

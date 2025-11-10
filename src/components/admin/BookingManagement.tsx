
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon, Eye, PenLine, Trash2, Filter, Plus } from "lucide-react";
import { toast } from 'sonner'; // Add this import

import { useBookingManagement } from '@/hooks/useBookingManagement';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BookingForm } from './BookingForm';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Booking, TableBooking } from '@/types/booking';
import { useRooms } from '@/hooks/useRooms';

const getStatusLabel = (status: string) => {
  const statuses = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'checked_in': 'Checked In',
    'checked_out': 'Checked Out',
    'cancelled': 'Cancelled'
  };
  return statuses[status as keyof typeof statuses] || status;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'confirmed': 
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'checked_in':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'checked_out':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Checked Out', value: 'checked_out' },
  { label: 'Cancelled', value: 'cancelled' }
];

// Type guards for distinguishing between Booking and TableBooking
const isHotelBooking = (booking: Booking | TableBooking): booking is Booking => {
  return 'check_in_date' in booking;
};

const isTableBooking = (booking: Booking | TableBooking): booking is TableBooking => {
  return 'date' in booking;
};

const BookingManagement = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const {
    bookings,
    tableBookings,
    handleCreateHotelBooking,
    handleCreateTableBooking,
    handleDeleteBooking,
    handleUpdateBooking,
    handleViewBooking,
    isAddDialogOpen,
    setIsAddDialogOpen,
    bookingType,
    setBookingType,
    formMode,
    setFormMode,
    selectedBooking,
    isViewDialogOpen,
    setIsViewDialogOpen,
  } = useBookingManagement();

  const { completeRoomCheckout } = useRooms();
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState<any>(null);

  const [editBooking, setEditBooking] = useState<any>(null);

  const handleEdit = (booking: any) => {
    setEditBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (booking: any) => {
    setBookingToDelete(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      await handleDeleteBooking(bookingToDelete);
      setIsDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleCheckoutClick = (booking: any) => {
    if (booking.room_id) {
      setCheckoutBooking(booking);
      setIsCheckoutDialogOpen(true);
    } else {
      toast.error('This booking has no assigned room.');
    }
  };

  const confirmCheckout = async () => {
    if (checkoutBooking) {
      try {
        await completeRoomCheckout.mutateAsync({
          bookingId: checkoutBooking.id,
          roomId: checkoutBooking.room_id
        });
        
        setIsCheckoutDialogOpen(false);
        setCheckoutBooking(null);
      } catch (error) {
        console.error('Error during checkout:', error);
      }
    }
  };

  const filteredBookings = (bookingType === 'hotel' ? bookings : tableBookings)?.filter(booking => {
    let matches = true;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matches = matches && (
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.customer_email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      matches = matches && booking.status === statusFilter;
    }
    
    return matches;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-hotel-gold">Booking Management</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Booking
        </Button>
      </div>

      {/* Booking Type Selection */}
      <div className="flex space-x-4">
        <Button
          variant={bookingType === 'hotel' ? 'default' : 'outline'}
          onClick={() => setBookingType('hotel')}
          className={bookingType === 'hotel' ? 'bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent' : 'text-white border-hotel-gold/30 hover:bg-hotel-midnight/50'}
        >
          Hotel Bookings
        </Button>
        <Button
          variant={bookingType === 'table' ? 'default' : 'outline'}
          onClick={() => setBookingType('table')}
          className={bookingType === 'table' ? 'bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent' : 'text-white border-hotel-gold/30 hover:bg-hotel-midnight/50'}
        >
          Table Bookings
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search by customer name or email..."
            className="bg-hotel-midnight border-hotel-gold/30 text-white pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-3 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value === '' ? null : value)}>
          <SelectTrigger className="w-[180px] border-hotel-gold/30 bg-hotel-midnight text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>

      {/* Booking Form Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Add New {bookingType === 'hotel' ? 'Hotel' : 'Table'} Booking</DialogTitle>
            <DialogDescription className="text-white/70">
              Create a new booking for {bookingType === 'hotel' ? 'hotel rooms' : 'table reservations'}.
            </DialogDescription>
          </DialogHeader>
          <BookingForm
            onSubmit={bookingType === 'hotel' ? handleCreateHotelBooking : handleCreateTableBooking}
            bookingType={bookingType}
            formMode={formMode}
            setFormMode={setFormMode}
            onClose={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={() => setIsViewDialogOpen(false)}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold text-xl">Booking Details</DialogTitle>
            <DialogDescription className="text-white/70">
              View details of the selected booking.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-6 py-4">
              <Card className="bg-hotel-midnight/30 border-hotel-gold/20 p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-hotel-gold">{selectedBooking.customer_name}</h3>
                    <p className="text-white/70">{selectedBooking.customer_email}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={cn("px-3 py-1 text-xs font-medium rounded-full border", getStatusClass(selectedBooking.status))}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {isHotelBooking(selectedBooking) ? (
                      <div>
                        <p><strong>Check-in:</strong> {format(new Date(selectedBooking.check_in_date), 'PPP')}</p>
                        <p><strong>Check-out:</strong> {format(new Date(selectedBooking.check_out_date), 'PPP')}</p>
                      </div>
                    ) : isTableBooking(selectedBooking) ? (
                      <div>
                        <p><strong>Date:</strong> {format(new Date(selectedBooking.date), 'PPP')}</p>
                        <p><strong>Time:</strong> {selectedBooking.time}</p>
                      </div>
                    ) : null}

                    <div>
                      <p className="text-sm text-white/60">Number of Guests</p>
                      <p className="text-white">{selectedBooking.guests}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {bookingType === 'hotel' && isHotelBooking(selectedBooking) && (
                      <div>
                        <p className="text-sm text-white/60">Room</p>
                        <p className="text-white">{selectedBooking.room_id || 'Not assigned'}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-white/60">Payment Status</p>
                      <p className={cn("text-white", selectedBooking.payment_status === 'paid' ? 'text-green-400' : 'text-amber-400')}>
                        {selectedBooking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Special Requests</p>
                      <p className="text-white">{selectedBooking.special_requests || 'None'}</p>
                    </div>
                    
                    {bookingType === 'hotel' && isHotelBooking(selectedBooking) && (
                      <div>
                        <p className="text-sm text-white/60">Total Price</p>
                        <p className="text-white font-semibold text-hotel-gold">₹{selectedBooking.total_price}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-hotel-gold/20 flex justify-end space-x-4">
                  <Button 
                    onClick={() => setIsViewDialogOpen(false)} 
                    variant="outline"
                    className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEdit(selectedBooking);
                    }}
                    className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  >
                    Edit Booking
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Data Table */}
      <div className="bg-hotel-slate rounded-lg border border-hotel-gold/20 overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-hotel-midnight/50">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              {bookingType === 'hotel' && (
                <>
                  <TableHead className="text-white">Check-In Date</TableHead>
                  <TableHead className="text-white">Check-Out Date</TableHead>
                </>
              )}
              {bookingType === 'table' && (
                <>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Time</TableHead>
                </>
              )}
              <TableHead className="text-white">Guests</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Payment</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-hotel-midnight/50">
                  <TableCell className="text-white">{booking.customer_name}</TableCell>
                  <TableCell className="text-white">{booking.customer_email}</TableCell>
                  {bookingType === 'hotel' && isHotelBooking(booking) && (
                    <>
                      <TableCell className="text-white">{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-white">{format(new Date(booking.check_out_date), 'MMM dd, yyyy')}</TableCell>
                    </>
                  )}
                  {bookingType === 'table' && isTableBooking(booking) && (
                    <>
                      <TableCell className="text-white">{format(new Date(booking.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-white">{booking.time}</TableCell>
                    </>
                  )}
                  <TableCell className="text-white">{booking.guests}</TableCell>
                  <TableCell>
                    <span className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full border", getStatusClass(booking.status))}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full border", 
                      booking.payment_status === 'paid' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30')}>
                      {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-hotel-gold/30 bg-transparent text-hotel-gold hover:bg-hotel-midnight/50"
                        onClick={() => handleViewBooking(booking)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-hotel-gold/30 bg-transparent text-hotel-gold hover:bg-hotel-midnight/50"
                        onClick={() => handleEdit(booking)}
                        title="Edit booking"
                      >
                        <PenLine className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {/* Add Checkout button for hotel bookings that are checked in */}
                      {bookingType === 'hotel' && isHotelBooking(booking) && booking.status === 'checked_in' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-green-500/30 bg-transparent text-green-500 hover:bg-green-900/20"
                          onClick={() => handleCheckoutClick(booking)}
                          title="Checkout"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          <span className="sr-only">Checkout</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-red-500/30 bg-transparent text-red-500 hover:bg-red-900/20"
                        onClick={() => handleDeleteClick(booking)}
                        title="Delete booking"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={bookingType === 'hotel' ? 8 : 7} className="h-32 text-center text-white/60">
                  {searchTerm || statusFilter ? 'No bookings match your search criteria' : `No ${bookingType} bookings found`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={() => setIsEditDialogOpen(false)}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Edit Booking</DialogTitle>
            <DialogDescription className="text-white/70">
              Edit details of the selected booking.
            </DialogDescription>
          </DialogHeader>
          {editBooking && (
            <BookingForm
              initialValues={editBooking}
              onSubmit={handleUpdateBooking}
              bookingType={bookingType}
              formMode={formMode}
              setFormMode={setFormMode}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Checkout Confirmation Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Confirm Checkout</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to complete the checkout process for this booking? This will mark the room as available for new bookings.
            </DialogDescription>
          </DialogHeader>
          {checkoutBooking && (
            <div className="py-4">
              <p><strong>Guest:</strong> {checkoutBooking.customer_name}</p>
              <p><strong>Room ID:</strong> {checkoutBooking.room_id}</p>
              {isHotelBooking(checkoutBooking) && (
                <p><strong>Dates:</strong> {format(new Date(checkoutBooking.check_in_date), 'MMM dd, yyyy')} to {format(new Date(checkoutBooking.check_out_date), 'MMM dd, yyyy')}</p>
              )}
            </div>
          )}
          <DialogFooter className="flex space-x-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCheckoutDialogOpen(false)}
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCheckout}
              className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
            >
              Complete Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;

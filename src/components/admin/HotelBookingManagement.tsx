import React, { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, X, Eye, Trash2, Calendar, CheckCircle, AlertCircle, FileText, Phone, CreditCard, Receipt } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currencyUtils';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { useReceipts } from '@/hooks/useReceipts';
import ReceiptViewer from './ReceiptViewer';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  customer_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  customer_email: z.string().email({ message: 'Please enter a valid email address.' }),
  customer_phone: z.string().optional(),
  room_id: z.string().min(1, { message: 'Please select a room.' }),
  check_in_date: z.string().min(1, { message: 'Check-in date is required.' }),
  check_out_date: z.string().min(1, { message: 'Check-out date is required.' }),
  guests: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, { 
    message: 'Number of guests must be a positive number.' 
  }),
  booking_type: z.enum(['online', 'offline']),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
  special_requests: z.string().optional(),
  total_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, { 
    message: 'Total price must be a non-negative number.' 
  }),
  with_breakfast: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const HotelBookingManagement = () => {
  const { bookings, isLoading, error, createBooking, updateBooking, deleteBooking } = useBookings();
  const { rooms } = useRooms();
  const { useReceiptByBookingId } = useReceipts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingType, setBookingType] = useState<'online' | 'offline'>('offline');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      room_id: '',
      check_in_date: '',
      check_out_date: '',
      guests: '1',
      booking_type: 'offline',
      status: 'pending',
      payment_status: 'pending',
      special_requests: '',
      total_price: '0',
      with_breakfast: false,
    }
  });

  const viewForm = useForm<FormValues>();

  React.useEffect(() => {
    if (selectedBooking && isEditDialogOpen) {
      form.reset({
        customer_name: selectedBooking.customer_name,
        customer_email: selectedBooking.customer_email,
        customer_phone: selectedBooking.customer_phone || '',
        room_id: selectedBooking.room_id || '',
        check_in_date: selectedBooking.check_in_date,
        check_out_date: selectedBooking.check_out_date,
        guests: String(selectedBooking.guests),
        booking_type: selectedBooking.booking_type as 'online' | 'offline',
        status: selectedBooking.status as BookingStatus,
        payment_status: selectedBooking.payment_status as PaymentStatus,
        special_requests: selectedBooking.special_requests || '',
        total_price: String(selectedBooking.total_price),
        with_breakfast: selectedBooking.with_breakfast || false,
      });
    }

    if (selectedBooking && isViewDialogOpen) {
      viewForm.reset({
        customer_name: selectedBooking.customer_name,
        customer_email: selectedBooking.customer_email,
        customer_phone: selectedBooking.customer_phone || '',
        room_id: selectedBooking.room_id || '',
        check_in_date: selectedBooking.check_in_date,
        check_out_date: selectedBooking.check_out_date,
        guests: String(selectedBooking.guests),
        booking_type: selectedBooking.booking_type as 'online' | 'offline',
        status: selectedBooking.status as BookingStatus,
        payment_status: selectedBooking.payment_status as PaymentStatus,
        special_requests: selectedBooking.special_requests || '',
        total_price: String(selectedBooking.total_price),
        with_breakfast: selectedBooking.with_breakfast || false,
      });
    }
  }, [selectedBooking, isEditDialogOpen, isViewDialogOpen, form, viewForm]);

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const handleViewReceipt = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsReceiptViewerOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBooking) {
      deleteBooking.mutate(selectedBooking.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast.success('Booking deleted successfully');
        },
        onError: (error: any) => {
          toast.error(`Failed to delete booking: ${error.message}`);
        }
      });
    }
  };

  const onSubmit = (values: FormValues) => {
    const bookingData = {
      customer_name: values.customer_name,
      customer_email: values.customer_email,
      customer_phone: values.customer_phone,
      room_id: values.room_id,
      check_in_date: values.check_in_date,
      check_out_date: values.check_out_date,
      guests: parseInt(values.guests),
      booking_type: values.booking_type,
      status: values.status,
      payment_status: values.payment_status,
      special_requests: values.special_requests || '',
      total_price: parseFloat(values.total_price),
      with_breakfast: values.with_breakfast,
    };

    if (selectedBooking) {
      // Update existing booking
      updateBooking.mutate(
        { 
          id: selectedBooking.id, 
          ...bookingData 
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedBooking(null);
            form.reset();
            toast.success('Booking updated successfully');
          },
          onError: (error: any) => {
            toast.error(`Failed to update booking: ${error.message}`);
          }
        }
      );
    } else {
      // Create new booking
      createBooking.mutate(
        bookingData,
        {
          onSuccess: () => {
            setIsAddDialogOpen(false);
            form.reset();
            toast.success('Booking created successfully');
          },
          onError: (error: any) => {
            toast.error(`Failed to create booking: ${error.message}`);
          }
        }
      );
    }
  };

  const handleViewStatusChange = (newStatus: string) => {
    if (selectedBooking) {
      updateBooking.mutate(
        { 
          id: selectedBooking.id, 
          status: newStatus as BookingStatus
        },
        {
          onSuccess: () => {
            // Update the selected booking locally
            setSelectedBooking({
              ...selectedBooking,
              status: newStatus as BookingStatus
            });
            toast.success('Booking status updated successfully');
          },
          onError: (error: any) => {
            toast.error(`Failed to update booking status: ${error.message}`);
          }
        }
      );
    }
  };

  const handleViewPaymentStatusChange = (newStatus: string) => {
    if (selectedBooking) {
      updateBooking.mutate(
        { 
          id: selectedBooking.id, 
          payment_status: newStatus as PaymentStatus
        },
        {
          onSuccess: () => {
            // Update the selected booking locally
            setSelectedBooking({
              ...selectedBooking,
              payment_status: newStatus as PaymentStatus
            });
            toast.success('Payment status updated successfully');
          },
          onError: (error: any) => {
            toast.error(`Failed to update payment status: ${error.message}`);
          }
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Confirmed
        </span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Pending
        </span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs flex items-center gap-1">
          <X className="w-3 h-3" /> Cancelled
        </span>;
      case 'checked_in':
        return <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Checked In
        </span>;
      case 'checked_out':
        return <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Checked Out
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Paid
        </span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Pending
        </span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs flex items-center gap-1">
          <X className="w-3 h-3" /> Failed
        </span>;
      case 'refunded':
        return <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Refunded
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getRoomById = (roomId: string) => {
    return rooms?.find(room => room.id === roomId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-hotel-gold">Hotel Bookings</h2>
        <Button 
          onClick={() => {
            setSelectedBooking(null);
            form.reset({
              customer_name: '',
              customer_email: '',
              customer_phone: '',
              room_id: '',
              check_in_date: '',
              check_out_date: '',
              guests: '1',
              booking_type: 'offline',
              status: 'pending',
              payment_status: 'pending',
              special_requests: '',
              total_price: '0',
              with_breakfast: false,
            });
            setBookingType('offline');
            setIsAddDialogOpen(true);
          }}
          className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
        >
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </div>

      {/* Search and filters section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
          <Input 
            placeholder="Search bookings..." 
            className="pl-8 bg-hotel-slate border-hotel-gold/30 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-[180px] border-hotel-gold/30 bg-hotel-midnight text-white">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="checked_out">Checked Out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || filterStatus !== 'all') && (
            <Button 
              variant="outline" 
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <X className="mr-1 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table section */}
      <div className="bg-hotel-slate border border-hotel-gold/20 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-hotel-gold/20 bg-hotel-midnight/50">
                <TableHead className="text-hotel-gold">Guest</TableHead>
                <TableHead className="text-hotel-gold">Contact</TableHead>
                <TableHead className="text-hotel-gold">Room</TableHead>
                <TableHead className="text-hotel-gold">Dates</TableHead>
                <TableHead className="text-hotel-gold">Status</TableHead>
                <TableHead className="text-hotel-gold">Payment</TableHead>
                <TableHead className="text-hotel-gold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-gold"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error || !filteredBookings ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-white/70">
                    Error loading bookings. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-white/70">
                    {searchTerm || filterStatus !== 'all' ? 'No bookings match your search criteria' : 'No bookings found. Create your first booking to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="border-b border-hotel-gold/10 hover:bg-hotel-midnight/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{booking.customer_name}</p>
                        <p className="text-xs text-white/70">{booking.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.customer_phone ? (
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-2 text-hotel-gold" />
                          <span className="text-white">{booking.customer_phone}</span>
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {getRoomById(booking.room_id)?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-white">
                      <div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-hotel-gold" />
                          <span>Check-in: {new Date(booking.check_in_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3.5 w-3.5 mr-2 text-hotel-gold" />
                          <span>Check-out: {new Date(booking.check_out_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <div>
                        {getPaymentStatusBadge(booking.payment_status)}
                        {booking.booking_type === 'online' && booking.payment_status === 'paid' && (
                          <div className="flex items-center text-xs text-white/70 mt-1">
                            <CreditCard className="h-3 w-3 mr-1 text-hotel-gold" />
                            <span>Payment ID: {booking.payment_id ? booking.payment_id.substring(0, 8) + '...' : 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        {booking.booking_type === 'online' && booking.payment_status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                            onClick={() => handleViewReceipt(booking.id)}
                          >
                            <Receipt className="h-3.5 w-3.5 mr-1" />
                            Receipt
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                          onClick={() => handleEditBooking(booking)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Booking Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedBooking(null);
        }
      }}>
        <DialogContent className="bg-hotel-slate border-hotel-gold/20 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">{selectedBooking ? 'Edit Booking' : 'Add New Booking'}</DialogTitle>
          </DialogHeader>

          {/* Booking type selection */}
          {!selectedBooking && (
            <div className="flex space-x-4 mb-4">
              <Button
                variant={bookingType === 'online' ? 'default' : 'outline'}
                className={bookingType === 'online' ? 'bg-hotel-gold text-hotel-midnight' : 'border-hotel-gold/30 text-white'}
                onClick={() => {
                  setBookingType('online');
                  form.setValue('booking_type', 'online');
                }}
              >
                Online Booking
              </Button>
              <Button
                variant={bookingType === 'offline' ? 'default' : 'outline'}
                className={bookingType === 'offline' ? 'bg-hotel-gold text-hotel-midnight' : 'border-hotel-gold/30 text-white'}
                onClick={() => {
                  setBookingType('offline');
                  form.setValue('booking_type', 'offline');
                }}
              >
                Offline Booking
              </Button>
            </div>
          )}
          
          {/* Form content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Guest Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Guest Name" 
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customer_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Email" 
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Phone Number" 
                        className="bg-hotel-midnight border-hotel-gold/30 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="check_in_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Check-In Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="check_out_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Check-Out Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Room</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                          {rooms?.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name} - {formatCurrency(room.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Number of Guests</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="checked_in">Checked In</SelectItem>
                          <SelectItem value="checked_out">Checked Out</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Total Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="booking_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Booking Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                            <SelectValue placeholder="Select booking type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="special_requests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Special Requests</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Any special requests or notes" 
                        className="bg-hotel-midnight border-hotel-gold/30 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="with_breakfast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-hotel-gold data-[state=checked]:border-hotel-gold"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        Include Breakfast
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  disabled={form.formState.isSubmitting}
                >
                  {selectedBooking ? 'Update Booking' : 'Create Booking'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) setIsDeleteDialogOpen(false);
      }}>
        <DialogContent className="bg-hotel-slate border-hotel-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsViewDialogOpen(false);
          setSelectedBooking(null);
        }
      }}>
        <DialogContent className="bg-hotel-slate border-hotel-gold/20 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Guest Information */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-1">Guest Information</h3>
                  <div className="bg-hotel-midnight/50 p-3 rounded-md">
                    <p className="font-medium text-white">{selectedBooking.customer_name}</p>
                    <p className="text-sm text-white/70">{selectedBooking.customer_email}</p>
                    
                    {selectedBooking.customer_phone ? (
                      <div className="flex items-center mt-2">
                        <Phone className="h-4 w-4 mr-2 text-hotel-gold" />
                        <span className="text-white">{selectedBooking.customer_phone}</span>
                      </div>
                    ) : null}
                    
                    <p className="text-sm text-white/70 mt-1">
                      {selectedBooking.guests} {selectedBooking.guests === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                </div>
                
                {/* Room Details */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-1">Room Details</h3>
                  <div className="bg-hotel-midnight/50 p-3 rounded-md">
                    <p className="font-medium text-white">
                      {getRoomById(selectedBooking.room_id)?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-white/70">
                      {formatCurrency(selectedBooking.total_price)}
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      {selectedBooking.booking_type === 'online' ? 'Online Booking' : 'Offline Booking'}
                    </p>
                    
                    {/* Payment details for online bookings */}
                    {selectedBooking.booking_type === 'online' && selectedBooking.payment_status === 'paid' && (
                      <div className="mt-2 pt-2 border-t border-hotel-gold/10">
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 mr-2 text-hotel-gold" />
                          <div>
                            <p className="text-xs text-white/70">Payment Details</p>
                            <p className="text-sm text-white">
                              {selectedBooking.payment_id ? (
                                <>Payment ID: {selectedBooking.payment_id}</>
                              ) : (
                                <span className="text-white/40">No payment ID recorded</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2 border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                          onClick={() => handleViewReceipt(selectedBooking.id)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          View Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Check-in / Check-out */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-1">Check-in / Check-out</h3>
                  <div className="bg-hotel-midnight/50 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-hotel-gold" />
                      <div>
                        <p className="text-xs text-white/70">Check-in</p>
                        <p className="font-medium text-white">
                          {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-hotel-gold" />
                      <div>
                        <p className="text-xs text-white/70">Check-out</p>
                        <p className="font-medium text-white">
                          {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-1">Status</h3>
                  <div className="bg-hotel-midnight/50 p-3 rounded-md">
                    <div className="mb-2">
                      <p className="text-xs text-white/70 mb-1">Booking Status</p>
                      <Select 
                        value={selectedBooking.status}
                        onValueChange={handleViewStatusChange}
                      >
                        <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="checked_in">Checked In</SelectItem>
                          <SelectItem value="checked_out">Checked Out</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/70 mb-1">Payment Status</p>
                      <Select 
                        value={selectedBooking.payment_status}
                        onValueChange={handleViewPaymentStatusChange}
                      >
                        <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Breakfast Information */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-1">Breakfast</h3>
                <div className="bg-hotel-midnight/50 p-3 rounded-md">
                  <div className="flex items-center">
                    <span className="h-5 w-5 mr-2 text-hotel-gold">🍳</span>
                    <p className="text-white">
                      {selectedBooking.with_breakfast ? 'Included' : 'Not included'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Special Requests */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-1">Special Requests</h3>
                <div className="bg-hotel-midnight/50 p-3 rounded-md">
                  <p className="text-white">{selectedBooking.special_requests || 'None'}</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  onClick={() => {
                    toast.success("Booking updated successfully");
                    setIsViewDialogOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Receipt Viewer */}
      <ReceiptViewer 
        bookingId={selectedBookingId} 
        open={isReceiptViewerOpen}
        onClose={() => {
          setIsReceiptViewerOpen(false);
          setSelectedBookingId(null);
        }}
      />
    </div>
  );
};

export default HotelBookingManagement;

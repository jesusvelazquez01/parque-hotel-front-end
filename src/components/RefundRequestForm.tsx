
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  booking_id: z.string().uuid({ message: 'Please enter a valid booking ID' }),
  customer_name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  customer_email: z.string().email({ message: 'Please enter a valid email' }),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Please enter a valid refund amount' }
  ),
  reason: z.string().min(10, { message: 'Please provide a detailed reason for the refund request' }),
});

type FormValues = z.infer<typeof formSchema>;

const RefundRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      booking_id: '',
      customer_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      customer_email: user?.email || '',
      amount: '',
      reason: '',
    },
  });

  const bookingId = form.watch('booking_id');

  const verifyBookingId = async () => {
    if (!bookingId || bookingId.trim() === '') {
      toast.error('Please enter a valid booking ID');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Check if the booking exists and get its details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, room:room_id(name)')
        .eq('id', bookingId)
        .single();
      
      if (bookingError || !bookingData) {
        toast.error('Booking not found. Please check the ID and try again.');
        setBookingDetails(null);
        return;
      }
      
      // Get receipt if available to display payment details
      const { data: receiptData } = await supabase
        .from('receipts')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
      
      const combinedData = {
        ...bookingData,
        receipt: receiptData
      };
      
      setBookingDetails(combinedData);
      
      // Update form with booking details
      form.setValue('customer_name', bookingData.customer_name);
      form.setValue('customer_email', bookingData.customer_email);
      form.setValue('amount', bookingData.total_price.toString());
      
      toast.success('Booking verified successfully!');
    } catch (error) {
      console.error('Error verifying booking:', error);
      toast.error('Failed to verify booking. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a ticket ID (prefix + timestamp + random string)
      const ticketId = `RR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      const { error } = await supabase.from('refund_requests').insert({
        booking_id: data.booking_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_id: user?.id,
        amount: parseFloat(data.amount),
        reason: data.reason,
        status: 'pending',
        ticket_id: ticketId,
      });
      
      if (error) throw error;
      
      toast.success('Refund request submitted successfully!');
      toast.info(`Your request ticket ID is ${ticketId}`, {
        duration: 6000,
      });
      
      form.reset();
      
      // Redirect to a confirmation page or back home
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error: any) {
      console.error('Error submitting refund request:', error);
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hotel-midnight to-hotel-slate py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="bg-hotel-midnight border-hotel-gold/30 shadow-lg">
          <CardHeader className="pb-4 border-b border-hotel-gold/20">
            <CardTitle className="text-2xl font-bold text-hotel-gold">Refund Request Form</CardTitle>
            <CardDescription className="text-white/70">
              Please fill out this form to request a refund for your booking
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <FormField
                    control={form.control}
                    name="booking_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Booking ID</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="Enter your booking ID"
                              className="bg-hotel-slate/50 border-hotel-gold/30 text-white"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={verifyBookingId}
                            disabled={isVerifying || !bookingId || bookingId.trim() === ''}
                            className="bg-hotel-gold hover:bg-hotel-gold/80 text-hotel-midnight"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Verifying
                              </>
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                
                {bookingDetails && (
                  <div className="p-4 rounded-md bg-hotel-slate/50 border border-hotel-gold/20 mb-4">
                    <h3 className="text-hotel-gold font-medium mb-2">Booking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm">
                      <p><span className="text-white/60">Room:</span> {bookingDetails.room?.name || 'Standard Room'}</p>
                      <p><span className="text-white/60">Check-in:</span> {new Date(bookingDetails.check_in_date).toLocaleDateString()}</p>
                      <p><span className="text-white/60">Check-out:</span> {new Date(bookingDetails.check_out_date).toLocaleDateString()}</p>
                      <p><span className="text-white/60">Total Paid:</span> ₹{bookingDetails.total_price}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            className="bg-hotel-slate/50 border-hotel-gold/30 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Your email address"
                            className="bg-hotel-slate/50 border-hotel-gold/30 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Refund Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="bg-hotel-slate/50 border-hotel-gold/30 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Reason for Refund</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe why you're requesting a refund..."
                          className="bg-hotel-slate/50 border-hotel-gold/30 text-white min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="border-hotel-gold/30 text-white hover:bg-hotel-gold/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundRequestForm;

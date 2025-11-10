
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateReceiptHtml, generateReceiptNumber, createReceiptData, generateQRCodeDataUrl } from '@/utils/receiptGenerator';
import { toast } from '@/hooks/use-toast';
import { Room } from '@/types/booking';
import { format } from 'date-fns';

interface GenerateReceiptParams {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  roomId: string;
  roomName: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  guests: number;
  price: number;
  paymentId: string;
  paymentMethod: string;
  includeQRCode?: boolean;
  roomType?: string;
  pricePerNight?: number;
  nights?: number;
  withBreakfast?: boolean;
  breakfastPrice?: number;
  roomCount?: number;
  adults?: number;
  children?: number;
  promoCode?: string;
  discountAmount?: number;
  originalPrice?: number;
  extraGuests?: number; // Added this property to fix TypeScript errors
}

interface EmailReceiptParams {
  bookingId: string;
  email: string;
}

export const useReceipts = () => {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get receipt by booking ID
  const getReceiptByBookingId = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error) {
        console.log('Receipt not found for booking ID:', bookingId);
        return null; // Return null instead of throwing an error
      }

      return data;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return null; // Return null for any errors
    }
  };

  // Query hook for fetching a receipt by booking ID
  const useReceiptByBookingId = (bookingId: string | undefined) => {
    return useQuery({
      queryKey: ['receipt', bookingId],
      queryFn: () => bookingId ? getReceiptByBookingId(bookingId) : null,
      enabled: !!bookingId,
      retry: 1, // Only retry once to avoid excessive retries for non-existent receipts
    });
  };

  // Generate a new receipt
  const generateReceipt = async (params: GenerateReceiptParams) => {
    setIsGenerating(true);
    try {
      // Check if receipt already exists
      const existingReceipt = await getReceiptByBookingId(params.bookingId);
      if (existingReceipt) {
        console.log('Receipt already exists for booking ID:', params.bookingId);
        return existingReceipt;
      }

      // Calculate dates to determine number of nights
      const checkInDate = new Date(params.checkInDate);
      const checkOutDate = new Date(params.checkOutDate);
      const nights = params.nights || Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use the actual price from the booking params
      const roomTotal = params.price;
      
      // If pricePerNight is provided, use it, otherwise calculate from total price and nights
      const pricePerNight = params.pricePerNight || (nights > 0 ? roomTotal / nights : roomTotal);
      
      // We're keeping tax calculations for database records,
      // but they won't be displayed on the receipt
      const cgst = roomTotal * 0.061;
      const sgst = roomTotal * 0.061;
      const tax = cgst + sgst;
      const total = roomTotal; // Now just showing the room total as the final price
      
      // Generate receipt number
      const receiptNumber = generateReceiptNumber(params.bookingId);
      
      // Generate QR code if requested
      let qrCodeData = undefined;
      if (params.includeQRCode) {
        try {
          qrCodeData = await generateQRCodeDataUrl(params.bookingId);
        } catch (error) {
          console.error('Error generating QR code, continuing without it:', error);
        }
      }
      
      // Determine extra guest charges if available
      const extraGuestCharges = params.extraGuests && params.extraGuests > 0 
        ? String(params.extraGuests * 600) 
        : undefined;
      
      // Create receipt data with room count and promo code information
      const receiptData = {
        bookingId: params.bookingId,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        roomName: params.roomName,
        roomType: params.roomType || "Standard",
        pricePerNight: pricePerNight,
        nights: nights,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        guests: params.guests,
        price: roomTotal,
        cgst,
        sgst,
        tax,
        total,
        paymentMethod: params.paymentMethod,
        paymentId: params.paymentId,
        transactionDate: new Date(),
        receiptNumber,
        qrCodeData,
        withBreakfast: params.withBreakfast || false,
        breakfastPrice: params.breakfastPrice || 0,
        paidStamp: true, // Always show paid stamp for completed payments
        roomCount: params.roomCount || 1, // Added room count with default value of 1
        adults: params.adults || params.guests, // Default to guests if not specified
        children: params.children || 0, // Default to 0 if not specified
        promoCode: params.promoCode, // Add promo code if available
        discountAmount: params.discountAmount, // Add discount amount if available
        originalPrice: params.originalPrice, // Add original price before discount
        extraGuests: params.extraGuests,
        extraGuestCharges: extraGuestCharges
      };
      
      // Generate receipt HTML
      const receiptHtml = generateReceiptHtml(receiptData);
      
      // Store in database
      const { data, error } = await supabase
        .from('receipts')
        .insert({
          booking_id: params.bookingId,
          receipt_number: receiptNumber,
          payment_id: params.paymentId,
          receipt_data: createReceiptData(receiptData),
          extra_guest_charges: extraGuestCharges,
          extra_guests: params.extraGuests
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving receipt to database:', error);
        throw error;
      }
      
      return { ...data, receiptHtml };
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Mutation hook for generating a receipt
  const generateReceiptMutation = useMutation({
    mutationFn: generateReceipt,
    onSuccess: () => {
      toast.success('Receipt generated successfully');
      queryClient.invalidateQueries({ queryKey: ['receipt'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to generate receipt: ${error.message}`);
    }
  });

  // Email receipt to customer
  const emailReceiptMutation = useMutation({
    mutationFn: async ({ bookingId, email }: EmailReceiptParams) => {
      const receipt = await getReceiptByBookingId(bookingId);
      if (!receipt) throw new Error("Receipt not found");
      
      // Here you would integrate with your email service
      // For now we'll just mock this
      console.log(`Emailing receipt to ${email}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, email };
    },
    onSuccess: () => {
      toast.success('Receipt emailed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to email receipt: ${error.message}`);
    }
  });

  return {
    isGenerating,
    generateReceipt: generateReceiptMutation.mutate,
    useReceiptByBookingId,
    getReceiptByBookingId,
    emailReceipt: emailReceiptMutation.mutate
  };
};

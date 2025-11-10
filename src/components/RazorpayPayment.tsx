
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const RAZORPAY_KEY = "rzp_test_vTNA6I5tKnusw1"; // Updated to test key

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  name: string;
  email: string;
  contact: string;
  roomName: string;
  disabled?: boolean; // Added disabled prop as optional
  onSuccess: (paymentData: {
    payment_id: string;
    payment_method: string;
    payment_status: string;
  }) => void;
  onCancel?: () => void; // Added onCancel callback
  // Additional price breakdown details for receipt generation
  priceDetails?: {
    basePrice: number;
    roomPrice: number;
    nights: number;
    cgst: number;
    sgst: number;
    roomCount: number;
    withBreakfast?: boolean;
    breakfastPrice?: number;
    extraGuestCharges?: number;
    guests?: {
      adults: number;
      children: number;
    }
  };
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  name,
  email,
  contact,
  roomName,
  disabled,
  onSuccess,
  onCancel,
  priceDetails
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        setScriptLoaded(true);
        console.log("Razorpay script loaded successfully");
      };
      
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        toast("Payment system failed to load. Please try again later.");
      };
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay) {
      toast('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    // Ensure the amount is an integer representing paise (multiply by 100 and round)
    const amountInPaise = Math.round(amount * 100);
    console.log("Payment amount in paise:", amountInPaise);
    console.log("Original amount:", amount); // Debug the input amount
    
    // Create a detailed description with price breakdown
    let description = `Booking for ${roomName}`;
    if (priceDetails) {
      description += ` - ${priceDetails.nights} night(s)`;
      if (priceDetails.roomCount > 1) {
        description += `, ${priceDetails.roomCount} room(s)`;
      }
      if (priceDetails.withBreakfast) {
        description += ", with breakfast";
      }
    }
    
    const options = {
      key: RAZORPAY_KEY,
      amount: amountInPaise, // Ensure consistent amount format
      currency: "INR",
      name: "The Royal Pavilion", 
      description: description,
      image: "/lovable-uploads/1688b334-d596-4b6d-a3e4-b9d479607cd1.png", 
      prefill: {
        name: name,
        email: email,
        contact: contact
      },
      theme: {
        color: "#D4AF37"
      },
      handler: function(response: any) {
        console.log("Razorpay payment response:", response);
        if (response.razorpay_payment_id) {
          toast.success('Payment successful! Your booking is confirmed.');
          onSuccess({
            payment_id: response.razorpay_payment_id,
            payment_method: 'Razorpay',
            payment_status: 'completed'
          });
        } else {
          toast.error('Payment failed. Please try again.');
        }
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal dismissed");
          toast('Payment cancelled. Your booking is not confirmed.');
          if (onCancel) {
            onCancel();
          }
        }
      },
      // Enable UPI app redirect properly
      config: {
        display: {
          blocks: {
            utib: {
              name: "Pay using UPI",
              instruments: [
                {
                  method: "upi"
                }
              ]
            }
          },
          sequence: ["block.utib"],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      notes: {
        total_amount: `₹${amount}`,
        ...(priceDetails && {
          base_price: `₹${priceDetails.basePrice}`,
          cgst: `₹${priceDetails.cgst}`,
          sgst: `₹${priceDetails.sgst}`,
          nights: priceDetails.nights,
          room_count: priceDetails.roomCount
        })
      }
    };

    try {
      console.log("Initializing Razorpay with options:", { 
        amount: options.amount,
        currency: options.currency,
        description: options.description 
      });
      
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error('There was an error initializing the payment. Please try again.');
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-medium"
      disabled={disabled || !scriptLoaded}
      variant="hotel"
    >
      {scriptLoaded ? 'Pay Now with Razorpay' : 'Loading Payment...'}
    </Button>
  );
};

export default RazorpayPayment;

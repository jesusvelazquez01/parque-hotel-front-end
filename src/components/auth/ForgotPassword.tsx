import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the current window origin to use as the redirect URL
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      // Send password reset request to Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }
      
      // Send custom email via Resend
      try {
        // Call our edge function to send a custom email
        const response = await fetch(`${window.location.origin}/functions/v1/send-password-reset-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            resetLink: `${redirectUrl}?email=${encodeURIComponent(values.email)}`,
          }),
        });

        if (!response.ok) {
          console.warn('Custom email sending failed but password reset was initiated');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't interrupt the flow if email fails, Supabase will still send their default email
      }
      
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
      console.error('Reset password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-hotel-slate rounded-xl shadow-xl border border-hotel-gold/20 p-6">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/bb2fd4e8-7d14-4bd8-a28e-3c45f300a472.png" 
            alt="The Royal Pavilion" 
            className="h-10 mx-auto mb-4"
          />
          <h3 className="text-xl font-medium text-white">Check Your Email</h3>
          <p className="mt-2 text-white/70">
            We've sent password reset instructions to your email address. Please check your inbox and follow the instructions.
          </p>
        </div>
        <Button 
          asChild
          className="w-full mt-4 bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-medium"
        >
          <Link to="/login">Return to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-hotel-slate rounded-xl shadow-xl border border-hotel-gold/20 p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center bg-hotel-midnight/30 p-3 rounded-full border border-hotel-gold/10 mb-3">
          <img 
            src="/lovable-uploads/bb2fd4e8-7d14-4bd8-a28e-3c45f300a472.png" 
            alt="The Royal Pavilion" 
            className="h-10"
          />
        </div>
        <h3 className="text-xl font-medium text-white">Reset Your Password</h3>
        <p className="mt-2 text-white/70">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your.email@example.com"
                    className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold placeholder:text-white/40"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-medium transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </Button>
          
          <div className="text-center mt-4">
            <Link 
              to="/login" 
              className="inline-flex items-center text-hotel-gold hover:underline"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;

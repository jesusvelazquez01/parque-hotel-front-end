
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Register the user with Supabase Authentication
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.fullName.split(' ')[0],
            last_name: values.fullName.split(' ').slice(1).join(' '),
          },
        },
      });

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now login.",
        variant: "default"
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hotel-midnight to-hotel-slate flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Register | The Royal Pavilion</title>
      </Helmet>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img 
              src="/lovable-uploads/bb2fd4e8-7d14-4bd8-a28e-3c45f300a472.png" 
              alt="The Royal Pavilion" 
              className="h-24 mx-auto"
            />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-hotel-gold font-['Cormorant_Garamond']">
            Create Your Account
          </h1>
          <p className="mt-2 text-white/70">Join The Royal Pavilion experience</p>
        </div>

        <div className="bg-hotel-slate rounded-xl shadow-xl border border-hotel-gold/20 overflow-hidden">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-white/60">
                            <User className="text-hotel-gold" />
                          </div>
                          <Input 
                            placeholder="Enter your full name" 
                            className="bg-hotel-midnight border-hotel-gold/30 text-white pl-10 focus:ring-hotel-gold focus:border-hotel-gold" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-white/60">
                            <Mail className="text-hotel-gold" />
                          </div>
                          <Input 
                            placeholder="Enter your email address" 
                            className="bg-hotel-midnight border-hotel-gold/30 text-white pl-10 focus:ring-hotel-gold focus:border-hotel-gold" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-white/60">
                            <Lock className="text-hotel-gold" />
                          </div>
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Create a password" 
                            className="bg-hotel-midnight border-hotel-gold/30 text-white pl-10 pr-10 focus:ring-hotel-gold focus:border-hotel-gold" 
                            {...field} 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-3 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-white/60">
                            <Lock className="text-hotel-gold" />
                          </div>
                          <Input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            placeholder="Confirm your password" 
                            className="bg-hotel-midnight border-hotel-gold/30 text-white pl-10 pr-10 focus:ring-hotel-gold focus:border-hotel-gold" 
                            {...field} 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            className="absolute right-3 top-3 text-white/60 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-hotel-gold/50 data-[state=checked]:bg-hotel-gold data-[state=checked]:text-hotel-midnight"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-white/80 text-sm font-normal">
                          I agree to the{' '}
                          <Link to="/terms-of-service" className="text-hotel-gold hover:underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy-policy" className="text-hotel-gold hover:underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage className="text-red-400" />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-medium transition-all mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Register'
                  )}
                </Button>
              </form>
            </Form>
            
            <p className="text-center text-white/70 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-hotel-gold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-hotel-gold hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

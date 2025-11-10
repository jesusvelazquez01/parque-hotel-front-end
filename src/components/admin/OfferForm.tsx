
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOffers, OfferFormData, OfferUpdateData } from '@/hooks/useOffers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const offerSchema = z.object({
  title: z.string().min(3, {
    message: 'Title must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  short_description: z.string().optional(),
  discount_type: z.enum(['percentage', 'amount']),
  discount_value: z.number().positive({
    message: 'Discount value must be a positive number.',
  }),
  coupon_code: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  image_url: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

interface OfferFormProps {
  mode: 'create' | 'edit';
  onComplete: () => void;
  initialValues?: OfferFormData;
  offerId?: string;
}

const OfferForm: React.FC<OfferFormProps> = ({
  mode,
  onComplete,
  initialValues,
  offerId,
}) => {
  const { createOffer, updateOffer } = useOffers();
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialValues?.start_date ? new Date(initialValues.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialValues?.end_date ? new Date(initialValues.end_date) : undefined
  );

  // Initialize the form with the provided values or defaults
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: initialValues || {
      title: '',
      description: '',
      short_description: '',
      discount_type: 'percentage',
      discount_value: 10,
      coupon_code: '',
      start_date: '',
      end_date: '',
      image_url: '',
      status: 'inactive',
    },
  });

  // Set default dates when form is initialized
  useEffect(() => {
    // Set today as default start date if no initial value
    if (!startDate) {
      const today = new Date();
      setStartDate(today);
      form.setValue('start_date', today.toISOString());
    }

    // Set next week as default end date if no initial value
    if (!endDate) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setEndDate(nextWeek);
      form.setValue('end_date', nextWeek.toISOString());
    }
  }, [form]);

  const onSubmit = async (data: OfferFormData) => {
    try {
      // Make sure dates are properly set
      if (!data.start_date || !data.end_date) {
        toast.error('Please select both start and end dates');
        return;
      }

      console.log('Submitting offer data:', data);
      
      if (mode === 'create') {
        await createOffer.mutateAsync(data);
      } else if (mode === 'edit' && offerId) {
        // Use OfferUpdateData type for the update operation
        const updateData: OfferUpdateData = { 
          id: offerId, 
          ...data 
        };
        await updateOffer.mutateAsync(updateData);
      }
      onComplete();
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('Selected start date:', date);
      setStartDate(date);
      form.setValue('start_date', date.toISOString());
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('Selected end date:', date);
      setEndDate(date);
      form.setValue('end_date', date.toISOString());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Summer Sale" 
                    {...field} 
                    className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-hotel-slate border-hotel-gold/30">
                    <SelectItem value="active" className="text-white hover:bg-hotel-midnight">Active</SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-hotel-midnight">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-white">Discount Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" className="text-hotel-gold" />
                      <Label htmlFor="percentage" className="text-white">Percentage (%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="amount" id="amount" className="text-hotel-gold" />
                      <Label htmlFor="amount" className="text-white">Amount (INR)</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Discount Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="coupon_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Coupon Code (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="SUMMER25"
                  {...field}
                  value={field.value || ''}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Leave blank if no coupon code is required
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-hotel-slate border-hotel-gold/30" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                      className="bg-hotel-slate text-white pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal bg-hotel-midnight border-hotel-gold/30 text-white ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-hotel-slate border-hotel-gold/30" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      initialFocus
                      className="bg-hotel-slate text-white pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Short Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief summary for display on cards"
                  {...field}
                  value={field.value || ''}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                A brief summary to show on offer cards (max 100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Full Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the offer"
                  {...field}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Image URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  value={field.value || ''}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Enter a URL for an image to display with this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onComplete}
            className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
            disabled={createOffer.isPending || updateOffer.isPending}
          >
            {(createOffer.isPending || updateOffer.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Offer' : 'Update Offer'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OfferForm;

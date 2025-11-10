
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Offer = {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  coupon_code: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type OfferFormData = Omit<Offer, 'id' | 'created_at' | 'updated_at'>;
export type OfferUpdateData = Omit<Offer, 'created_at' | 'updated_at'>;

export const useOffers = () => {
  const queryClient = useQueryClient();

  // Fetch all offers for admin
  const { data: offers, isLoading, error } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error('Failed to load offers');
        throw new Error(error.message);
      }
      
      return data as Offer[];
    },
  });

  // Fetch only active offers for public display
  const { data: activeOffers, isLoading: isLoadingActive } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to load active offers:', error);
        return [];
      }
      
      return data as Offer[];
    },
  });

  // Create new offer
  const createOffer = useMutation({
    mutationFn: async (offerData: OfferFormData) => {
      const { data, error } = await supabase
        .from('offers')
        .insert([offerData])
        .select()
        .single();
      
      if (error) {
        toast.error('Failed to create offer');
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Offer created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
    },
  });

  // Update existing offer
  const updateOffer = useMutation({
    mutationFn: async ({ id, ...offerData }: OfferUpdateData) => {
      const { data, error } = await supabase
        .from('offers')
        .update(offerData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error('Failed to update offer');
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Offer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
    },
  });

  // Delete an offer
  const deleteOffer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('Failed to delete offer');
        throw new Error(error.message);
      }
      
      return id;
    },
    onSuccess: () => {
      toast.success('Offer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
    },
  });

  return {
    offers,
    activeOffers,
    isLoading,
    isLoadingActive,
    error,
    createOffer,
    updateOffer,
    deleteOffer,
  };
};

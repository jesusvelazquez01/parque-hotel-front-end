
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromoCode, PromoCodeFormValues } from '@/types/promo';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define the expected response structure from the edge function
export interface PromoCodeValidationResult {
  valid: boolean;
  message?: string;
  original_amount?: number;
  discount_amount?: number; // This is the actual discount value, not the new total
  final_amount?: number; // This is the new total after discount
}

export const usePromoCodes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const { user } = useAuth();

  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data as PromoCode[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch promo codes: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPromoCode = async (values: PromoCodeFormValues) => {
    try {
      setIsLoading(true);
      let code = values.code;

      // If user opted to generate a random code
      if (values.generate_random_code) {
        const { data, error } = await supabase.rpc('generate_promo_code');
        if (error) throw error;
        code = data;
      }

      // Create the promo code
      const { data, error } = await supabase
        .from('promo_codes')
        .insert([{
          code,
          discount_amount: values.discount_amount,
          expiry_date: values.expiry_date,
          max_uses: values.max_uses,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Promo code ${code} created successfully`,
        variant: "default"
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create promo code: ${error.message}`,
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const validatePromoCode = async (
    code: string, 
    amount: number,
    customerId: string,
    deviceId: string 
  ): Promise<PromoCodeValidationResult> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('apply-promo-code', {
        body: {
          promo_code: code,
          customer_id: customerId,
          device_id: deviceId,
          total_amount: amount,
        },
      });

      if (error) {
        // Log and rethrow for specific handling or use a generic error message
        console.error("Error invoking apply-promo-code function:", error);
        return {
          valid: false,
          message: error.message || "Failed to validate promo code via function."
        };
      }
      
      // The data from the function is expected to match PromoCodeValidationResult
      // which includes { valid: boolean, message?: string, final_amount?: number, ... }
      const result = data as PromoCodeValidationResult;

      // If the function itself indicates failure (e.g. DB function error handled inside edge fn)
      if (!result.valid) {
         return {
          valid: false,
          message: result.message || "Promo code is not valid or could not be applied."
        };
      }

      return result; // Contains all details: valid, message, original_amount, discount_amount, final_amount

    } catch (error: any) {
      console.error("Catch block error in validatePromoCode hook:", error);
      return {
        valid: false,
        message: error.message || "An unexpected error occurred while validating the promo code."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      setIsLoading(true);
      
      // First, delete all related usage records to avoid foreign key constraint violation
      const { error: usageDeleteError } = await supabase
        .from('promo_code_usage')
        .delete()
        .eq('promo_code_id', id);
      
      if (usageDeleteError) throw usageDeleteError;
      
      // Once usage records are deleted, we can safely delete the promo code
      const { error: promoDeleteError } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (promoDeleteError) throw promoDeleteError;
      
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
        variant: "default"
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete promo code: ${error.message}`,
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    promoCodes,
    fetchPromoCodes,
    createPromoCode,
    validatePromoCode,
    deletePromoCode,
  };
};

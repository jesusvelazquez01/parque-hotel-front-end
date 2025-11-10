
export interface PromoCode {
  id: string;
  code: string;
  discount_amount: number;
  expiry_date?: string;
  max_uses?: number;
  current_uses: number;
  status: 'active' | 'expired' | 'used';
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface PromoCodeFormValues {
  code: string;
  discount_amount: number;
  expiry_date?: string;
  max_uses?: number;
  generate_random_code: boolean;
}

export interface PromoCodeValidationResult {
  isValid: boolean;
  discountedAmount?: number;
  message?: string;
}

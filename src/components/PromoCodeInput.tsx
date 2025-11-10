
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePromoCodes, PromoCodeValidationResult } from '@/hooks/usePromoCodes'; // Import PromoCodeValidationResult
import { Check, X, Ticket } from 'lucide-react';
import { toast } from '@/hooks/use-toast'; // Ensure this is the sonner toast
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

interface PromoCodeInputProps {
  initialAmount: number;
  onPromoApplied: (discountedAmount: number, originalAmount: number) => void; // Updated to pass original amount too for clarity
}

// Helper to generate a simple device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ initialAmount, onPromoApplied }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState<'none' | 'valid' | 'invalid'>('none');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const { validatePromoCode } = usePromoCodes();
  const { user } = useAuth(); // Get user from auth context
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    if (!deviceId) {
      toast.error("Device ID not available. Please try again."); // Should ideally not happen
      return;
    }

    const customerId = user?.id || 'guest_' + deviceId; // Use user ID or a guest identifier

    try {
      setIsValidating(true);
      const result: PromoCodeValidationResult = await validatePromoCode(
        promoCode.trim(), 
        initialAmount,
        customerId,
        deviceId
      );
      
      if (result.valid && result.final_amount !== undefined) {
        setValidationState('valid');
        setAppliedCode(promoCode);
        onPromoApplied(result.final_amount, initialAmount);
        toast.success(result.message || "Promo code applied successfully!");
      } else {
        setValidationState('invalid');
        toast.error(result.message || "This promo code cannot be applied");
      }
    } catch (error: any) {
      setValidationState('invalid');
      toast.error(error.message || "An error occurred while applying the promo code.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setValidationState('none');
    setAppliedCode(null);
    onPromoApplied(initialAmount, initialAmount); // Reset to initial amount
    toast.info("Promo code removed");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Ticket className="h-4 w-4 text-hotel-gold" />
        <p className="text-white font-medium">Promo Code</p>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className={`
              bg-hotel-midnight border ${
                validationState === 'valid'
                  ? 'border-green-500 focus:border-green-500' 
                  : validationState === 'invalid'
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-hotel-gold/30'
              } text-white
            `}
            disabled={validationState === 'valid' || isValidating}
          />
          {validationState === 'valid' && (
            <Check className="absolute right-3 top-2.5 text-green-500 h-5 w-5" />
          )}
          {validationState === 'invalid' && (
            <X className="absolute right-3 top-2.5 text-red-500 h-5 w-5" />
          )}
        </div>
        
        {validationState !== 'valid' ? (
          <Button
            type="button"
            onClick={handleApplyPromoCode}
            disabled={isValidating || !promoCode.trim() || !deviceId}
            className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
          >
            {isValidating ? 'Applying...' : 'Apply'}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleRemovePromoCode}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            Remove
          </Button>
        )}
      </div>
      
      {validationState === 'valid' && appliedCode && (
        <p className="text-sm text-green-500">
          Promo code "{appliedCode}" applied successfully!
        </p>
      )}
      {validationState === 'invalid' && (
         <p className="text-sm text-red-500">
          Failed to apply promo code. Please check the code and try again.
        </p>
      )}
    </div>
  );
};

export default PromoCodeInput;

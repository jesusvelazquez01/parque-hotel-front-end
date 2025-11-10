
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RoomQuantitySelectorProps {
  roomId: string;
  roomName: string;
  maxAvailable: number;
  onQuantityChange: (roomId: string, quantity: number) => void;
  initialQuantity?: number;
}

const RoomQuantitySelector = ({
  roomId,
  roomName,
  maxAvailable,
  onQuantityChange,
  initialQuantity = 0
}: RoomQuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, quantity + delta);
    
    if (delta > 0 && quantity >= maxAvailable) {
      toast.error(`No more ${roomName} rooms available`);
      return;
    }
    
    setQuantity(newQuantity);
    onQuantityChange(roomId, newQuantity);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        type="button" 
        variant="addRoom"
        className="flex items-center space-x-2 py-1 px-3"
      >
        <span>Add Room</span>
        <div className="flex items-center border-l border-hotel-gold/30 pl-2">
          <Button 
            type="button" 
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-hotel-gold/20 text-hotel-gold"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-6 text-center text-hotel-gold">
            {quantity}
          </span>
          
          <Button 
            type="button" 
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-hotel-gold/20 text-hotel-gold"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= maxAvailable}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Button>
    </div>
  );
};

export default RoomQuantitySelector;

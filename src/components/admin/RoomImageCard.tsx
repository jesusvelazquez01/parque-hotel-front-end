
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Trash2 } from 'lucide-react';
import { RoomImage } from '@/types/roomImages';

interface RoomImageCardProps {
  image: RoomImage;
  onSetPrimary: (image: RoomImage) => void;
  onDeleteClick: (image: RoomImage) => void;
}

const RoomImageCard = ({ image, onSetPrimary, onDeleteClick }: RoomImageCardProps) => {
  return (
    <Card key={image.id} className="bg-hotel-slate border-hotel-gold/20 overflow-hidden">
      <div className="relative h-48">
        <img 
          src={image.image_url} 
          alt="Room" 
          className="w-full h-full object-cover"
        />
        {image.is_primary && (
          <div className="absolute top-2 left-2 bg-hotel-gold text-hotel-midnight text-xs py-1 px-2 rounded-md">
            Primary
          </div>
        )}
      </div>
      <div className="p-3 flex justify-between">
        {!image.is_primary ? (
          <Button 
            variant="outline" 
            size="sm"
            className="border-hotel-gold/30 text-hotel-gold hover:bg-hotel-midnight"
            onClick={() => onSetPrimary(image)}
          >
            <Check className="mr-1 h-4 w-4" />
            Set as Primary
          </Button>
        ) : (
          <span className="text-white/50 text-sm flex items-center">
            <Check className="mr-1 h-4 w-4 text-green-500" />
            Primary Image
          </span>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
          onClick={() => onDeleteClick(image)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default RoomImageCard;

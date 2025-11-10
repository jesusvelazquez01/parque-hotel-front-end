
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, Bath, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyUtils';
import { supabase } from '@/integrations/supabase/client';

export function RoomDetailsView({ room, open, onOpenChange }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch room images when room changes
    if (room?.id) {
      const fetchRoomImages = async () => {
        const { data, error } = await supabase
          .from('room_images')
          .select('image_url')
          .eq('room_id', room.id)
          .order('order_index');
          
        if (!error && data && data.length > 0) {
          setRoomImages(data.map(img => img.image_url));
        } else {
          // Fallback to the single image from room
          setRoomImages([room.image_url]);
        }
      };
      
      fetchRoomImages();
    }
  }, [room]);
  
  if (!room) return null;
  
  const images = roomImages.length > 0 ? roomImages : [room.image_url];
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-hotel-slate text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-hotel-gold font-['Cormorant_Garamond']">
            Room Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePreviousImage}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-hotel-gold' : 'bg-white/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            
            <div className="absolute top-4 right-4 bg-hotel-gold text-hotel-midnight px-4 py-2 rounded-md font-semibold">
              {formatCurrency(room.price)}/night
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-hotel-gold">{room.name}</h3>
            <p className="text-white/80">{room.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-hotel-midnight border-hotel-gold/20">
                <CardContent className="p-4 flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-hotel-gold" />
                  <span>{room.beds} Beds</span>
                </CardContent>
              </Card>
              
              <Card className="bg-hotel-midnight border-hotel-gold/20">
                <CardContent className="p-4 flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-hotel-gold" />
                  <span>{room.bathrooms} Baths</span>
                </CardContent>
              </Card>
              
              <Card className="bg-hotel-midnight border-hotel-gold/20">
                <CardContent className="p-4 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-hotel-gold" />
                  <span>Max {room.capacity}</span>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-hotel-gold">Amenities</h4>
              <div className="grid grid-cols-2 gap-2">
                {room.amenities?.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-white/80">
                    <Check className="h-4 w-4 text-hotel-gold" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

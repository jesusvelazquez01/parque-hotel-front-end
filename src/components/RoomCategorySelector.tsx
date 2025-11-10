
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Room {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  category_type: string;
  capacity: number;
  is_available: boolean;
  breakfast_price?: number;
}

interface RoomCategorySelectorProps {
  rooms: Room[];
  selectedRooms: Map<string, number>;
  onRoomChange: (roomId: string, quantity: number) => void;
  adults: number;
  children: number;
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  onCategorySelect?: (category: string) => void;
}

const RoomCategorySelector = ({
  rooms,
  selectedRooms,
  onRoomChange,
  adults,
  children,
  onAdultsChange,
  onChildrenChange,
  onCategorySelect,
}: RoomCategorySelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Royal Deluxe');

  // Group rooms by category
  const roomsByCategory = rooms.reduce((acc, room) => {
    const category = room.category_type;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Get unique categories
  const categories = Object.keys(roomsByCategory);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleQuantityChange = (roomId: string, delta: number) => {
    const currentQuantity = selectedRooms.get(roomId) || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    
    // Find the room
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    // Validate that we're not exceeding available rooms
    if (delta > 0) {
      // Count how many rooms of this category are already selected
      const categoryRooms = rooms.filter(r => r.category_type === room.category_type);
      const selectedCategoryCount = categoryRooms.reduce((count, r) => {
        return count + (selectedRooms.get(r.id) || 0);
      }, 0);
      
      const availableInCategory = categoryRooms.filter(r => r.is_available).length;
      
      if (selectedCategoryCount >= availableInCategory) {
        toast.error(`No more ${room.category_type} rooms available`);
        return;
      }
    }
    
    onRoomChange(roomId, newQuantity);
  };

  const handleGuestChange = (type: 'adults' | 'children', delta: number) => {
    if (type === 'adults') {
      const newAdults = Math.max(1, adults + delta); // Minimum 1 adult
      onAdultsChange(newAdults);
    } else {
      const newChildren = Math.max(0, children + delta); // Minimum 0 children
      onChildrenChange(newChildren);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Room Categories</h3>
        
        <Tabs 
          value={selectedCategory} 
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4">
                {roomsByCategory[category]?.map(room => (
                  <div 
                    key={room.id} 
                    className="bg-hotel-midnight p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-full sm:w-1/3">
                      <img 
                        src={room.image_url || "/placeholder-room.jpg"} 
                        alt={room.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-lg font-medium text-white">{room.name}</h4>
                      <p className="text-white/70 text-sm">{room.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-white/60">
                        <span>Capacity: {room.capacity} guests</span>
                        <span>•</span>
                        <span>Price: {formatCurrency(room.price)}/night</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-3">
                          <Button 
                            type="button" 
                            variant="outline"
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-transparent border-hotel-gold/50 text-white hover:bg-hotel-gold/20"
                            onClick={() => handleQuantityChange(room.id, -1)}
                            disabled={(selectedRooms.get(room.id) || 0) <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="text-white text-lg min-w-[1.5rem] text-center">
                            {selectedRooms.get(room.id) || 0}
                          </span>
                          
                          <Button 
                            type="button" 
                            variant="outline"
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-transparent border-hotel-gold/50 text-white hover:bg-hotel-gold/20"
                            onClick={() => handleQuantityChange(room.id, 1)}
                            disabled={!room.is_available}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="default"
                          className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                          onClick={() => {
                            if (room.is_available) {
                              handleQuantityChange(room.id, 1);
                            }
                          }}
                          disabled={!room.is_available}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Guests</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-white/70">Adults (18+)</p>
            <div className="flex items-center space-x-3 bg-hotel-midnight p-2 rounded-md">
              <Button 
                type="button" 
                variant="outline"
                size="icon" 
                className="h-8 w-8 rounded-full bg-transparent border-hotel-gold/50 text-white hover:bg-hotel-gold/20"
                onClick={() => handleGuestChange('adults', -1)}
                disabled={adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="text-white text-lg min-w-[1.5rem] text-center">
                {adults}
              </span>
              
              <Button 
                type="button" 
                variant="outline"
                size="icon" 
                className="h-8 w-8 rounded-full bg-transparent border-hotel-gold/50 text-white hover:bg-hotel-gold/20"
                onClick={() => handleGuestChange('adults', 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-white/70">Children (0-17)</p>
            <div className="flex items-center space-x-3 bg-hotel-midnight p-2 rounded-md">
              <Button 
                type="button" 
                variant="outline"
                size="icon" 
                className="h-8 w-8 rounded-full bg-transparent border-hotel-gold/50 text-white hover:bg-hotel-gold/20"
                onClick={() => handleGuestChange('children', -1)}
                disabled={children <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="text-white text-lg min-w-[1.5rem] text-center">
                {children}
              </span>
              
              <Button 
                type="button" 
                variant="outline"
                size="icon" 
                className="h-8 w-8 rounded-full bg-transparent border-hotel-gold/50 text-white hover:bg-hotel-gold/20"
                onClick={() => handleGuestChange('children', 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCategorySelector;

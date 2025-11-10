
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Room } from '@/types/booking';
import { formatCurrency } from '@/utils/currencyUtils';
import { useRoomAvailability } from '@/hooks/useRoomAvailability';
import { ANIMATION_DURATIONS } from '@/components/ui/animation-classes';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, Users, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setRouteAccess, PROTECTED_ROUTES } from '@/utils/routeProtection';
import LazyImage from '@/components/LazyImage';
import { useRoomImage } from '@/hooks/useRoomImage';

interface RoomCardProps {
  room: Room;
  checkInDate?: string | Date;
  checkOutDate?: string | Date;
}

const RoomCard = ({ room, checkInDate, checkOutDate }: RoomCardProps) => {
  const navigate = useNavigate();
  const { checkRoomAvailability } = useRoomAvailability();
  const [isAvailable, setIsAvailable] = useState<boolean>(room.is_available);
  const [roomStatus, setRoomStatus] = useState<string>(room.status || 'available');
  const { imageUrls, primaryImage, isLoading: imagesLoading } = useRoomImage(room.id);
  
  useEffect(() => {
    // If dates are provided, check actual availability for those dates
    const checkAvailability = async () => {
      if (checkInDate && checkOutDate) {
        const available = await checkRoomAvailability(room.id, checkInDate, checkOutDate);
        setIsAvailable(available);
        
        if (!available) {
          // For more accurate status display, we could potentially query the reason
          // why it's unavailable (maintenance, booked, etc.) here
          try {
            const { data: availabilityData } = await supabase
              .from('room_availability')
              .select('status')
              .eq('room_id', room.id)
              .gte('date', new Date(checkInDate).toISOString().split('T')[0])
              .lt('date', new Date(checkOutDate).toISOString().split('T')[0])
              .order('date', { ascending: true });
            
            if (availabilityData && availabilityData.length > 0) {
              // If there are multiple statuses for different days, prioritize showing certain statuses
              const statusPriority = {
                'maintenance': 1,
                'unavailable': 2,
                'offline-booking': 3,
                'online-booking': 4,
                'available': 5
              };
              
              // Find the status with highest priority (lowest number)
              let highestPriorityStatus = 'available';
              let highestPriority = 5;
              
              for (const item of availabilityData) {
                const currentPriority = statusPriority[item.status as keyof typeof statusPriority] || 5;
                if (currentPriority < highestPriority) {
                  highestPriorityStatus = item.status;
                  highestPriority = currentPriority;
                }
              }
              
              let mappedStatus = highestPriorityStatus;
              if (highestPriorityStatus === 'offline-booking' || highestPriorityStatus === 'online-booking') {
                mappedStatus = 'booked';
              }
              setRoomStatus(mappedStatus);
            } else {
              // Default to the room's general status if no specific date data
              setRoomStatus(room.status || 'available');
            }
          } catch (error) {
            console.error('Error fetching room availability details:', error);
            setRoomStatus(room.status || 'available');
          }
        } else {
          setRoomStatus('available');
        }
      } else {
        // Fall back to general availability from the room object
        setIsAvailable(room.is_available);
        setRoomStatus(room.status || 'available');
      }
    };
    
    checkAvailability();
  }, [room.id, checkInDate, checkOutDate, checkRoomAvailability, room.is_available, room.status]);

  const handleBookNow = () => {
    navigate(`/room-booking/${room.id}`, {
      state: {
        checkInDate,
        checkOutDate
      }
    });
  };

  const handleViewDetails = () => {
    // Set route access permission before navigating
    setRouteAccess(PROTECTED_ROUTES.ROOM_DETAIL, room.id);
    navigate(`/rooms/${room.id}`);
  };

  const getStatusDisplay = () => {
    if (isAvailable) {
      return {
        text: 'Available',
        className: 'bg-green-500 text-white'
      };
    } else {
      switch (roomStatus) {
        case 'maintenance':
          return {
            text: 'Maintenance',
            className: 'bg-red-500 text-white'
          };
        case 'unavailable':
          return {
            text: 'Unavailable',
            className: 'bg-gray-500 text-white'
          };
        case 'booked':
          return {
            text: 'Booked',
            className: 'bg-blue-500 text-white'
          };
        default:
          return {
            text: 'Not Available',
            className: 'bg-red-500 text-white'
          };
      }
    }
  };

  const statusDisplay = getStatusDisplay();
  
  // Format the category name for display
  const formatCategory = (category?: string) => {
    if (!category) return "Standard";
    
    // Capitalize first letter and rest lowercase
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  return (
    <div className="bg-gradient-to-b from-hotel-slate to-hotel-midnight rounded-xl overflow-hidden shadow-lg border border-hotel-gold/20 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
      <div className="relative">
        <LazyImage
          src={room.image_url || '/placeholder.svg'}
          alt={room.name}
          className="w-full h-64 object-cover"
          fallbackSrc="/placeholder.svg"
          imageSrcArray={imageUrls}
          primaryImageOnly={true}
        />
        
        {/* Category Label */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-hotel-gold/90 hover:bg-hotel-gold text-hotel-midnight font-semibold px-3 py-1 text-xs uppercase tracking-wider shadow-md">
            {formatCategory(room.category)}
          </Badge>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.className}`}>
            {statusDisplay.text}
          </div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight/70 to-transparent opacity-60"></div>
      </div>
      
      <div className="p-6 space-y-4 relative">
        {/* Note: We're using onClick instead of Link here to ensure the protection is set */}
        <div onClick={handleViewDetails} className="group block cursor-pointer">
          <h3 className="text-xl md:text-2xl font-bold text-hotel-gold group-hover:text-hotel-accent transition-colors duration-300 font-['Cormorant_Garamond']">
            {room.name}
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-white/80 text-sm">
          <div className="flex flex-col items-center bg-hotel-midnight/50 rounded-lg p-2 border border-hotel-gold/10">
            <BedDouble className="h-5 w-5 text-hotel-gold mb-1" />
            <span>{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex flex-col items-center bg-hotel-midnight/50 rounded-lg p-2 border border-hotel-gold/10">
            <Bath className="h-5 w-5 text-hotel-gold mb-1" />
            <span>{room.bathrooms} Bath</span>
          </div>
          <div className="flex flex-col items-center bg-hotel-midnight/50 rounded-lg p-2 border border-hotel-gold/10">
            <Users className="h-5 w-5 text-hotel-gold mb-1" />
            <span>{room.capacity} Guests</span>
          </div>
        </div>
        
        <p className="text-white/70 line-clamp-2 text-sm">{room.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-hotel-gold/20">
          <div>
            <span className="text-white/60 text-xs">Starting from</span>
            <p className="text-hotel-gold text-xl font-semibold">{formatCurrency(room.price)}<span className="text-white/60 text-sm">/night</span></p>
          </div>
          
          <Button 
            onClick={handleBookNow}
            disabled={!isAvailable}
            className={`${
              isAvailable 
                ? 'bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight' 
                : 'bg-gray-500 cursor-not-allowed text-white/70'
            } transition-all`}
            style={{ transitionDuration: ANIMATION_DURATIONS.default }}
          >
            {isAvailable ? 'Book Now' : statusDisplay.text}
          </Button>
        </div>
        
        {/* Fixed View Details button - updated to use onClick */}
        <div className="mt-4 text-center">
          <Button 
            onClick={handleViewDetails}
            variant="outline" 
            className="w-full border-hotel-gold/30 text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight transition-all flex items-center justify-center gap-2 group"
          >
            <ExternalLink className="h-4 w-4 transition-transform group-hover:rotate-12" />
            View Details
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;

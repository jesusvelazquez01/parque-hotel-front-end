
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface StatusDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  statusType: string;
  data: any[];
  isLoading?: boolean;
}

const StatusDetailsDialog = ({
  isOpen,
  onClose,
  statusType,
  data = [],
  isLoading = false,
}: StatusDetailsDialogProps) => {
  // Safe accessor function to prevent undefined errors
  const getNestedValue = (obj: any, path: string, defaultValue: any = undefined) => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : defaultValue), obj);
  };

  // Title and description based on status type
  const getStatusTitle = () => {
    switch (statusType) {
      case 'available':
        return 'Available Rooms';
      case 'online-booking':
        return 'Online Bookings';
      case 'offline-booking':
        return 'Offline Bookings';
      case 'maintenance':
        return 'Rooms Under Maintenance';
      case 'unavailable':
        return 'Unavailable Rooms';
      default:
        return 'Room Status Details';
    }
  };

  const getStatusDescription = () => {
    switch (statusType) {
      case 'available':
        return 'Rooms currently available for booking';
      case 'online-booking':
        return 'Rooms booked through online channels';
      case 'offline-booking':
        return 'Rooms booked through offline channels';
      case 'maintenance':
        return 'Rooms currently under maintenance';
      case 'unavailable':
        return 'Rooms marked as unavailable';
      default:
        return 'Details about room status';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-hotel-gold" />
          <span className="ml-2 text-white/70">Loading data...</span>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="h-32 flex items-center justify-center">
          <p className="text-white/70">No {statusType} data available</p>
        </div>
      );
    }

    // Different layouts based on status type
    switch (statusType) {
      case 'available':
        return (
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {data.map((room) => (
              <div key={room.id} className="bg-hotel-midnight/40 p-4 rounded-md border border-hotel-gold/20">
                <h3 className="font-medium text-white">{room.name}</h3>
                <p className="text-white/70 text-sm">
                  {room.category} • {room.capacity} guests • ${room.price}/night
                </p>
              </div>
            ))}
          </div>
        );
      
      case 'online-booking':
      case 'offline-booking':
        return (
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {data.map((booking) => (
              <div key={booking.id} className="bg-hotel-midnight/40 p-4 rounded-md border border-hotel-gold/20">
                <div className="flex justify-between">
                  <h3 className="font-medium text-white">
                    {getNestedValue(booking, 'room.name', 'Room')}
                  </h3>
                  <Badge variant="outline" className="bg-hotel-gold/20 text-hotel-gold">
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-white/70 text-sm mt-1">
                  {booking.guest_name || 'Guest'} • 
                  {booking.check_in && booking.check_out ? 
                    ` ${format(new Date(booking.check_in), 'MMM d')} - ${format(new Date(booking.check_out), 'MMM d, yyyy')}` : 
                    ' Date information unavailable'}
                </p>
                {booking.amount && (
                  <p className="text-white font-medium mt-2">
                    ${booking.amount}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'maintenance':
      case 'unavailable':
        return (
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {data.map((item, index) => (
              <div key={index} className="bg-hotel-midnight/40 p-4 rounded-md border border-hotel-gold/20">
                <div className="flex justify-between">
                  <h3 className="font-medium text-white">
                    {getNestedValue(item, 'room.name', 'Room')}
                  </h3>
                  <Badge variant="outline" className={`
                    ${statusType === 'maintenance' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}
                  `}>
                    {statusType}
                  </Badge>
                </div>
                <p className="text-white/70 text-sm mt-1">
                  {item.date && `Date: ${format(new Date(item.date), 'MMM d, yyyy')}`}
                </p>
                {item.notes && (
                  <div className="mt-2 bg-hotel-midnight/30 p-2 rounded border border-hotel-gold/10">
                    <p className="text-white/80 text-sm">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="h-32 flex items-center justify-center">
            <p className="text-white/70">No data to display</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-hotel-gold">{getStatusTitle()}</DialogTitle>
          <DialogDescription className="text-white/70">
            {getStatusDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
        
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusDetailsDialog;


import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import RoomQuantitySelector from './RoomQuantitySelector';

interface BookingFormProps {
  onSubmit: (formData: any) => void;
  loading?: boolean;
  availableRooms?: Array<{
    id: string;
    name: string;
    maxAvailable: number;
    category_type?: string;
  }>;
  selectedCategory?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  onSubmit, 
  loading, 
  availableRooms = [],
  selectedCategory 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    guests: '1',
    specialRequests: ''
  });
  
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});

  // Filter rooms by category if a category is selected
  const filteredRooms = selectedCategory 
    ? availableRooms.filter(room => room.category_type === selectedCategory)
    : availableRooms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Include selected rooms in the submission
    onSubmit({
      ...formData,
      selectedRooms,
      category: selectedCategory
    });
  };
  
  const handleRoomQuantityChange = (roomId: string, quantity: number) => {
    setSelectedRooms(prev => ({
      ...prev,
      [roomId]: quantity
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-white">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="bg-hotel-midnight border-hotel-gold/30 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-white">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="bg-hotel-midnight border-hotel-gold/30 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-hotel-midnight border-hotel-gold/30 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className="bg-hotel-midnight border-hotel-gold/30 text-white"
        />
      </div>
      
      {filteredRooms && filteredRooms.length > 0 && (
        <div className="space-y-2">
          <Label className="text-white">Rooms {selectedCategory ? `(${selectedCategory})` : ''}</Label>
          <div className="space-y-2">
            {filteredRooms.map((room) => (
              <RoomQuantitySelector
                key={room.id}
                roomId={room.id}
                roomName={room.name}
                maxAvailable={room.maxAvailable}
                onQuantityChange={handleRoomQuantityChange}
                initialQuantity={selectedRooms[room.id] || 0}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="guests" className="text-white">Number of Guests *</Label>
        <Input
          id="guests"
          type="number"
          min="1"
          value={formData.guests}
          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
          required
          className="bg-hotel-midnight border-hotel-gold/30 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests" className="text-white">Special Requests</Label>
        <Input
          id="specialRequests"
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          className="bg-hotel-midnight border-hotel-gold/30 text-white"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-medium"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  );
};

export default BookingForm;

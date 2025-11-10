
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  room_number: string;
  category_type: string;
}

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoom: string | null;
  onRoomSelect: (roomId: string) => void;
  loading: boolean;
}

const RoomSelector = ({ rooms, selectedRoom, onRoomSelect, loading }: RoomSelectorProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-hotel-gold" />
      </div>
    );
  }
  
  // If no rooms or no selected room but rooms exist, default select the first one
  React.useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoom) {
      onRoomSelect(rooms[0].id);
    }
  }, [rooms, selectedRoom, onRoomSelect]);
  
  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center p-4 bg-hotel-slate rounded-md text-white/70">
        No rooms available. Please add rooms first.
      </div>
    );
  }
  
  return (
    <Tabs 
      defaultValue={selectedRoom || (rooms.length > 0 ? rooms[0].id : '')} 
      value={selectedRoom || ''} 
      onValueChange={onRoomSelect}
    >
      <div className="mb-6 overflow-x-auto">
        <TabsList className="bg-hotel-slate h-auto p-1 flex-nowrap min-w-max">
          {rooms.map((room) => (
            <TabsTrigger 
              key={room.id} 
              value={room.id}
              className="data-[state=active]:bg-hotel-gold data-[state=active]:text-hotel-midnight py-2 whitespace-nowrap"
            >
              {room.room_number} - {room.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
};

export default RoomSelector;

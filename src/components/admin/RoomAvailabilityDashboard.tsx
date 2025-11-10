import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Minus, Hotel, Users } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Define the maximum room limits for each category correctly
const CATEGORY_MAX_ROOMS = {
  'Royal Deluxe': 8,
  'Royal Executive': 16,
  'Royal Suite': 4
};

// Ensure we have all three room categories defined
const ROOM_CATEGORIES = ['Royal Deluxe', 'Royal Executive', 'Royal Suite'];

export const RoomAvailabilityDashboard = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryInventory, setCategoryInventory] = useState<Record<string, { total: number, available: number, max: number }>>({});
  const [imageLoadStatus, setImageLoadStatus] = useState<{[key: string]: boolean}>({});

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('category_type');
        
        if (error) throw error;
        
        setRooms(data || []);
        
        // Initialize inventory for all categories, even if no rooms exist for them
        const inventory: Record<string, { total: number, available: number, max: number }> = {};
        
        // First initialize all categories with zero values
        ROOM_CATEGORIES.forEach(category => {
          inventory[category] = { 
            total: 0, 
            available: 0,
            max: CATEGORY_MAX_ROOMS[category] || 0 
          };
        });
        
        // Then add data from actual rooms
        data?.forEach(room => {
          const category = room.category_type;
          if (category in inventory) {
            inventory[category].total += room.total_rooms || 1;
            inventory[category].available += room.available_rooms || 0;
          }
        });
        
        setCategoryInventory(inventory);
        
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load rooms data');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Filter rooms by category
  const filteredRooms = selectedCategory === 'all' 
    ? rooms 
    : rooms.filter(room => room.category_type === selectedCategory);

  // Group rooms by category
  const groupedRooms: { [key: string]: any[] } = {};
  
  // Initialize all categories with empty arrays
  ROOM_CATEGORIES.forEach(category => {
    groupedRooms[category] = [];
  });
  
  // Then fill with filtered rooms
  filteredRooms.forEach(room => {
    const category = room.category_type;
    if (category in groupedRooms) {
      groupedRooms[category].push(room);
    }
  });

  // Open dialog to edit room availability
  const openAvailabilityDialog = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setEditingRoomId(roomId);
      setAvailableRooms(room.available_rooms || 0);
      setIsDialogOpen(true);
    }
  };

  // Update room availability
  const updateRoomAvailability = async () => {
    if (!editingRoomId) return;

    const room = rooms.find(r => r.id === editingRoomId);
    if (!room) return;

    try {
      // Get max rooms for this category
      const maxRooms = CATEGORY_MAX_ROOMS[room.category_type] || 1;
      
      // Ensure available rooms doesn't exceed max rooms for the category
      const validAvailableRooms = Math.min(Math.max(0, availableRooms), maxRooms);

      const { error } = await supabase
        .from('rooms')
        .update({ available_rooms: validAvailableRooms, total_rooms: maxRooms })
        .eq('id', editingRoomId);

      if (error) throw error;

      // Update local state
      setRooms(prevRooms => 
        prevRooms.map(r => 
          r.id === editingRoomId 
            ? { ...r, available_rooms: validAvailableRooms, total_rooms: maxRooms } 
            : r
        )
      );

      // Update category inventory
      setCategoryInventory(prev => {
        const category = room.category_type;
        const oldAvailable = room.available_rooms || 0;
        const diff = validAvailableRooms - oldAvailable;
        
        return {
          ...prev,
          [category]: {
            ...prev[category],
            available: prev[category].available + diff,
            total: prev[category].total,
            max: CATEGORY_MAX_ROOMS[category] || 0
          }
        };
      });

      toast.success('Room availability updated successfully');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating room availability:', error);
      toast.error('Failed to update room availability');
    }
  };

  // Handle increase/decrease available rooms for category
  const updateCategoryAvailability = async (category: string, change: number) => {
    try {
      // Find all rooms of this category
      const categoryRooms = rooms.filter(room => room.category_type === category);
      if (categoryRooms.length === 0) return;

      // Calculate current available and maximum allowed
      const totalAvailable = categoryInventory[category]?.available || 0;
      const maxRooms = CATEGORY_MAX_ROOMS[category] || 0;
      
      // Check if operation is valid
      if (totalAvailable + change < 0 || totalAvailable + change > maxRooms) {
        toast.error(change > 0 
          ? `Cannot add more rooms than maximum capacity (${maxRooms})` 
          : 'Cannot reduce available rooms below zero');
        return;
      }
      
      // Distribute the change evenly or to the first room
      const firstRoom = categoryRooms[0];
      const newAvailable = (firstRoom.available_rooms || 0) + change;
      
      const { error } = await supabase
        .from('rooms')
        .update({ 
          available_rooms: newAvailable,
          total_rooms: maxRooms 
        })
        .eq('id', firstRoom.id);

      if (error) throw error;

      // Update local state
      setRooms(prevRooms => 
        prevRooms.map(r => 
          r.id === firstRoom.id 
            ? { ...r, available_rooms: newAvailable, total_rooms: maxRooms } 
            : r
        )
      );

      // Update category inventory
      setCategoryInventory(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          available: prev[category].available + change,
          max: CATEGORY_MAX_ROOMS[category] || 0
        }
      }));

      toast.success(`${category} availability updated successfully`);
    } catch (error) {
      console.error('Error updating category availability:', error);
      toast.error('Failed to update room availability');
    }
  };

  // Function to render rooms for a specific category
  const renderRoomsForCategory = (category: string) => {
    const categoryRooms = rooms.filter(room => room.category_type === category);
    
    if (categoryRooms.length === 0) {
      return (
        <div className="col-span-full text-center py-8 text-white/60">
          No rooms found for {category} category.
        </div>
      );
    }
    
    return categoryRooms.map(room => (
      <Card key={room.id} className="overflow-hidden shadow-md border-hotel-gold/20 hover:shadow-lg transition-all bg-hotel-slate">
        <AspectRatio ratio={16/9} className="relative">
          {!imageLoadStatus[room.id] && (
            <div className="absolute inset-0 flex items-center justify-center bg-hotel-slate/80">
              <Loader2 className="h-8 w-8 animate-spin text-hotel-gold" />
            </div>
          )}
          <div 
            className={`h-full w-full bg-cover bg-center transition-opacity duration-300 ${imageLoadStatus[room.id] ? 'opacity-100' : 'opacity-0'}`} 
            style={{ backgroundImage: `url(${room.image_url})` }}
          >
            <img 
              src={room.image_url} 
              alt={room.name} 
              className="hidden" 
              onLoad={() => handleImageLoad(room.id)}
            />
          </div>
        </AspectRatio>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-white">{room.name}</h4>
            <Badge variant={room.is_available ? "default" : "destructive"} className={room.is_available ? "bg-green-600" : ""}>
              {room.is_available ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <p className="text-sm text-gray-300 mb-2">Capacity: {room.capacity} guests</p>
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-300">Available:</span>
            <span className="font-medium text-white">{room.available_rooms || 0} / {CATEGORY_MAX_ROOMS[room.category_type] || 1}</span>
          </div>
          <Button 
            size="sm" 
            className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight transition-colors"
            onClick={() => openAvailabilityDialog(room.id)}
          >
            Manage Availability
          </Button>
        </div>
      </Card>
    ));
  };

  // Function to handle image loading
  const handleImageLoad = (roomId: string) => {
    setImageLoadStatus(prev => ({
      ...prev,
      [roomId]: true
    }));
  };

  return (
    <div className="container mx-auto p-4 space-y-6 bg-hotel-midnight text-white">
      {/* Filter and date selection */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-80 shadow-md border-hotel-gold/20 bg-hotel-slate">
          <CardHeader className="bg-hotel-midnight text-white">
            <CardTitle className="text-hotel-gold">Date Selection</CardTitle>
            <CardDescription className="text-gray-300">Choose a date to view availability</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-hotel-gold/20"
            />
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card className="h-full shadow-md border-hotel-gold/20 bg-hotel-slate">
            <CardHeader className="bg-hotel-midnight text-white">
              <CardTitle className="text-hotel-gold">Room Categories</CardTitle>
              <CardDescription className="text-gray-300">Manage room availability by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs 
                defaultValue="all" 
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 bg-hotel-slate/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-hotel-gold data-[state=active]:text-hotel-midnight">All Categories</TabsTrigger>
                  {ROOM_CATEGORIES.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="data-[state=active]:bg-hotel-gold data-[state=active]:text-hotel-midnight"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {ROOM_CATEGORIES.map(category => (
                        <Card key={category} className="overflow-hidden shadow-md border-hotel-gold/20 transition-all hover:shadow-lg bg-hotel-midnight">
                          <CardHeader className="bg-hotel-slate text-white p-4">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg text-hotel-gold flex items-center gap-2">
                                <Hotel className="h-5 w-5" />
                                {category}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="h-8 w-8 rounded-full border-hotel-gold/50 hover:bg-hotel-gold/20"
                                  onClick={() => updateCategoryAvailability(category, -1)}
                                >
                                  <Minus className="h-4 w-4 text-hotel-gold" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="h-8 w-8 rounded-full border-hotel-gold/50 hover:bg-hotel-gold/20"
                                  onClick={() => updateCategoryAvailability(category, 1)}
                                >
                                  <Plus className="h-4 w-4 text-hotel-gold" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300 font-medium">Available Rooms:</span>
                                <span className="font-semibold text-white">
                                  {categoryInventory[category]?.available || 0} / {CATEGORY_MAX_ROOMS[category]}
                                </span>
                              </div>
                              <div className="w-full bg-hotel-slate rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className="bg-hotel-gold h-2.5 rounded-full transition-all duration-500" 
                                  style={{ 
                                    width: `${categoryInventory[category] && CATEGORY_MAX_ROOMS[category] ? 
                                      (categoryInventory[category].available / CATEGORY_MAX_ROOMS[category]) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-300 mt-2">
                                <span>
                                  <Users className="h-3.5 w-3.5 inline mr-1" />
                                  Maximum Capacity:
                                </span>
                                <span className="font-medium">{CATEGORY_MAX_ROOMS[category]} rooms</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium mb-4 text-hotel-gold border-b border-hotel-gold/30 pb-2">All Available Rooms</h3>
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => (
                          <Card key={i} className="overflow-hidden shadow-md bg-hotel-slate">
                            <Skeleton className="h-40 w-full bg-hotel-midnight/50" />
                            <div className="p-4">
                              <Skeleton className="h-6 w-3/4 mb-2 bg-hotel-midnight/50" />
                              <Skeleton className="h-4 w-1/2 mb-2 bg-hotel-midnight/50" />
                              <Skeleton className="h-4 w-2/3 mb-2 bg-hotel-midnight/50" />
                              <Skeleton className="h-8 w-full mt-4 bg-hotel-midnight/50" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ROOM_CATEGORIES.map(category => (
                          <div key={category} className="space-y-4">
                            <h3 className="text-lg font-semibold text-hotel-gold flex items-center gap-2">
                              <Hotel className="h-5 w-5 text-hotel-gold" />
                              {category} 
                              <span className="text-sm font-normal text-gray-300">
                                (Max: {CATEGORY_MAX_ROOMS[category]})
                              </span>
                            </h3>
                            {groupedRooms[category] && groupedRooms[category].length > 0 ? (
                              groupedRooms[category].map(room => (
                                <Card key={room.id} className="overflow-hidden shadow-md border-hotel-gold/20 hover:shadow-lg transition-all bg-hotel-slate">
                                  <AspectRatio ratio={16/9}>
                                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${room.image_url})` }}></div>
                                  </AspectRatio>
                                  <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium text-white">{room.name}</h4>
                                      <Badge variant={room.is_available ? "default" : "destructive"} className={room.is_available ? "bg-green-600" : ""}>
                                        {room.is_available ? "Available" : "Unavailable"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">Capacity: {room.capacity} guests</p>
                                    <div className="flex justify-between items-center mb-3 text-sm">
                                      <span className="text-gray-300">Available:</span>
                                      <span className="font-medium text-white">{room.available_rooms || 0} / {CATEGORY_MAX_ROOMS[room.category_type] || 1}</span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight transition-colors"
                                      onClick={() => openAvailabilityDialog(room.id)}
                                    >
                                      Manage Availability
                                    </Button>
                                  </div>
                                </Card>
                              ))
                            ) : (
                              <div className="text-center py-4 text-white/60">
                                No rooms found for {category} category.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Category-specific TabsContent */}
                {ROOM_CATEGORIES.map(category => (
                  <TabsContent key={category} value={category}>
                    <div className="space-y-6">
                      <Card className="overflow-hidden shadow-md border-hotel-gold/20 bg-hotel-slate">
                        <CardHeader className="bg-hotel-midnight text-white">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-hotel-gold flex items-center gap-2">
                              <Hotel className="h-5 w-5" />
                              {category} Availability
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8 rounded-full border-hotel-gold/50 hover:bg-hotel-gold/20"
                                onClick={() => updateCategoryAvailability(category, -1)}
                              >
                                <Minus className="h-4 w-4 text-hotel-gold" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8 rounded-full border-hotel-gold/50 hover:bg-hotel-gold/20"
                                onClick={() => updateCategoryAvailability(category, 1)}
                              >
                                <Plus className="h-4 w-4 text-hotel-gold" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="text-gray-300">
                            Manage availability for {CATEGORY_MAX_ROOMS[category]} maximum rooms
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">Available Rooms:</span>
                              <span className="font-semibold text-lg text-white">
                                {categoryInventory[category]?.available || 0} / {CATEGORY_MAX_ROOMS[category]}
                              </span>
                            </div>
                            <div className="w-full bg-hotel-midnight rounded-full h-3">
                              <div 
                                className="bg-hotel-gold h-3 rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${categoryInventory[category] && CATEGORY_MAX_ROOMS[category] ? 
                                    (categoryInventory[category].available / CATEGORY_MAX_ROOMS[category]) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-300 mt-1">
                              <span>0</span>
                              <span>{CATEGORY_MAX_ROOMS[category]}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <h3 className="text-lg font-medium mb-4 text-hotel-gold border-b border-hotel-gold/30 pb-2 flex items-center gap-2">
                        <Hotel className="h-5 w-5 text-hotel-gold" />
                        {category} Rooms
                      </h3>
                      {loading ? (
                        <div className="flex justify-center p-8">
                          <Loader2 className="w-8 h-8 animate-spin text-hotel-gold" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {renderRoomsForCategory(category)}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Room availability editing dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold text-xl">Update Room Availability</DialogTitle>
            <DialogDescription className="text-white/70">
              Set how many rooms are available for booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label htmlFor="available-rooms" className="text-white">Available Rooms</Label>
              <div className="flex items-center space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 border-hotel-gold/30 hover:bg-hotel-gold/20"
                  onClick={() => setAvailableRooms(prev => Math.max(0, prev - 1))}
                >
                  <Minus className="h-4 w-4 text-hotel-gold" />
                </Button>
                <Input
                  id="available-rooms"
                  type="number"
                  min="0"
                  value={availableRooms}
                  onChange={(e) => setAvailableRooms(parseInt(e.target.value) || 0)}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white text-center text-lg"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9 border-hotel-gold/30 hover:bg-hotel-gold/20"
                  onClick={() => {
                    const room = rooms.find(r => r.id === editingRoomId);
                    const maxRooms = room ? CATEGORY_MAX_ROOMS[room.category_type] || 1 : 1;
                    setAvailableRooms(prev => Math.min(maxRooms, prev + 1));
                  }}
                >
                  <Plus className="h-4 w-4 text-hotel-gold" />
                </Button>
              </div>
              {editingRoomId && (
                <p className="text-sm text-white/70 mt-2 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Maximum: {rooms.find(r => r.id === editingRoomId)?.category_type 
                    ? CATEGORY_MAX_ROOMS[rooms.find(r => r.id === editingRoomId)?.category_type] || 1 
                    : 1} rooms
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={updateRoomAvailability}
              className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

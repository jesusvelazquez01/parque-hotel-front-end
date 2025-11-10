import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Plus, 
  Eye, 
  PenLine, 
  Trash2, 
  BedDouble, 
  Bath, 
  Users,
  Check,
  X,
  AlertCircle,
  Coffee
} from "lucide-react";
import { formatCurrency } from "@/utils/currencyUtils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddRoomDialog } from "./AddRoomDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@/types/booking";
import RoomForm from "@/components/employee/RoomForm";

const RoomManagement = () => {
  const { rooms, isLoading, error, updateRoom, deleteRoom, updateRoomStatus } = useRooms();
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const queryClient = useQueryClient();

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsViewDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      deleteRoom.mutate(roomToDelete.id, {
        onSuccess: () => {
          toast.success("Room deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          setIsDeleteConfirmationOpen(false);
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to delete room");
        }
      });
    }
  };

  const handleStatusChange = (room: Room, newStatus: string) => {
    updateRoomStatus.mutate(
      { 
        roomId: room.id, 
        status: newStatus,
        isAvailable: newStatus === "available"
      },
      {
        onSuccess: () => {
          toast.success(`Room status updated to ${newStatus}`);
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to update room status");
        }
      }
    );
  };

  const getRoomStatusBadge = (status: string, isAvailable: boolean) => {
    if (!isAvailable || status === "maintenance") {
      return <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">Maintenance</Badge>;
    }
    
    if (status === "occupied") {
      return <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">Occupied</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">Available</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-hotel-slate/50 w-48 rounded mb-8"></div>
          <div className="h-64 bg-hotel-slate/50 w-full rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">
        <p>Error loading rooms data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-hotel-gold">Room Management</h2>
        <Button
          onClick={() => setIsAddRoomDialogOpen(true)}
          className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <div className="bg-hotel-slate border-hotel-gold/20 border rounded-lg overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-hotel-midnight/50 hover:bg-hotel-midnight/30 border-hotel-gold/20">
              <TableHead className="text-hotel-gold">Room</TableHead>
              <TableHead className="text-hotel-gold">Price</TableHead>
              <TableHead className="text-hotel-gold">Capacity</TableHead>
              <TableHead className="text-hotel-gold">Status</TableHead>
              <TableHead className="text-hotel-gold">Amenities</TableHead>
              <TableHead className="text-hotel-gold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <TableRow key={room.id} className="hover:bg-hotel-midnight/30 border-hotel-gold/20">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {room.image_url && (
                        <img
                          src={room.image_url}
                          alt={room.name}
                          className="h-12 w-12 rounded-md object-cover border border-hotel-gold/20"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">{room.name}</p>
                        <p className="text-xs text-white/60 flex items-center gap-1">
                          <BedDouble className="h-3 w-3 inline" />
                          {room.beds} {room.beds === 1 ? "bed" : "beds"}
                          <span className="mx-1">•</span>
                          <Bath className="h-3 w-3 inline" />
                          {room.bathrooms} {room.bathrooms === 1 ? "bath" : "baths"}
                          {room.breakfast_price > 0 && (
                            <>
                              <span className="mx-1">•</span>
                              <Coffee className="h-3 w-3 inline" />
                              {formatCurrency(room.breakfast_price)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">{formatCurrency(room.price)}</TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-hotel-gold" />
                      {room.capacity} guests
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={!room.is_available ? "maintenance" : room.status || "available"}
                      onValueChange={(value) => handleStatusChange(room, value)}
                    >
                      <SelectTrigger className="w-[130px] h-8 border-hotel-gold/30 bg-hotel-midnight/50">
                        <SelectValue>
                          {getRoomStatusBadge(!room.is_available ? "maintenance" : room.status || "available", room.is_available)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-hotel-slate border-hotel-gold/20">
                        <SelectItem value="available" className="flex items-center">
                          <div className="flex items-center">
                            <Check className="h-3.5 w-3.5 text-green-400 mr-2" />
                            <span>Available</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="occupied" className="flex items-center">
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 text-amber-400 mr-2" />
                            <span>Occupied</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="maintenance" className="flex items-center">
                          <div className="flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 text-red-400 mr-2" />
                            <span>Maintenance</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities && room.amenities.length > 0 ? (
                        room.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="text-xs bg-hotel-midnight/50 text-white/80 px-2 py-0.5 rounded-full border border-hotel-gold/10"
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/50">No amenities</span>
                      )}
                      {room.amenities && room.amenities.length > 3 && (
                        <span className="text-xs bg-hotel-gold/20 text-hotel-gold px-2 py-0.5 rounded-full">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-hotel-gold/30 bg-transparent text-hotel-gold hover:bg-hotel-midnight/50"
                        onClick={() => handleViewRoom(room)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-hotel-gold/30 bg-transparent text-hotel-gold hover:bg-hotel-midnight/50"
                        onClick={() => handleEditRoom(room)}
                      >
                        <PenLine className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-red-500/30 bg-transparent text-red-500 hover:bg-red-900/20"
                        onClick={() => handleDeleteClick(room)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-white/60">
                  No rooms found. Add your first room to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddRoomDialog
        open={isAddRoomDialogOpen}
        onOpenChange={setIsAddRoomDialogOpen}
      />

      {/* View Room Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold text-xl">Room Details</DialogTitle>
            <DialogDescription>
              View detailed information about this room.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="grid gap-6 py-4">
              <Card className="bg-hotel-midnight/30 border-hotel-gold/20 overflow-hidden">
                {selectedRoom.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={selectedRoom.image_url} 
                      alt={selectedRoom.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-hotel-gold text-2xl">{selectedRoom.name}</CardTitle>
                    {getRoomStatusBadge(selectedRoom.status || "", selectedRoom.is_available)}
                  </div>
                  <CardDescription className="text-white/70">{selectedRoom.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-hotel-slate rounded-lg p-3">
                      <BedDouble className="h-5 w-5 mx-auto mb-1 text-hotel-gold" />
                      <p className="text-sm text-white/60">Beds</p>
                      <p className="text-white font-medium">{selectedRoom.beds}</p>
                    </div>
                    <div className="bg-hotel-slate rounded-lg p-3">
                      <Bath className="h-5 w-5 mx-auto mb-1 text-hotel-gold" />
                      <p className="text-sm text-white/60">Bathrooms</p>
                      <p className="text-white font-medium">{selectedRoom.bathrooms}</p>
                    </div>
                    <div className="bg-hotel-slate rounded-lg p-3">
                      <Users className="h-5 w-5 mx-auto mb-1 text-hotel-gold" />
                      <p className="text-sm text-white/60">Capacity</p>
                      <p className="text-white font-medium">{selectedRoom.capacity} guests</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-hotel-gold mb-2">Price</h4>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedRoom.price)}<span className="text-white/60 text-sm font-normal ml-1">/ night</span></p>
                    
                    {selectedRoom.breakfast_price > 0 && (
                      <div className="mt-2 flex items-center gap-2 bg-green-900/20 border border-green-500/20 p-2 rounded-md">
                        <Coffee className="h-4 w-4 text-hotel-gold" />
                        <p className="text-white">
                          Breakfast available: <span className="font-medium">{formatCurrency(selectedRoom.breakfast_price)}</span><span className="text-white/60 text-sm ml-1">/ night</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-hotel-gold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? (
                        selectedRoom.amenities.map((amenity: string, index: number) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="bg-hotel-slate border-hotel-gold/30 text-white"
                          >
                            {amenity}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-white/50">No amenities listed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t border-hotel-gold/20 pt-6 flex justify-end space-x-4">
                  <Button 
                    onClick={() => setIsViewDialogOpen(false)}
                    variant="outline"
                    className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditRoom(selectedRoom);
                    }}
                    className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  >
                    Edit Room
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog - Replaced with proper implementation using RoomForm */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Edit Room</DialogTitle>
            <DialogDescription className="text-white/70">
              Update room details and information.
            </DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <RoomForm 
              room={selectedRoom}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <DialogContent className="bg-hotel-slate text-white border border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete {roomToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmationOpen(false)}
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;

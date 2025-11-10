import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";
import { useRooms } from "@/hooks/useRooms";

export function AddBookingDialog({
  bookingType,
  formMode,
  onCreateBooking,
  open,
  onOpenChange,
}: {
  bookingType: 'hotel' | 'table';
  formMode: 'online' | 'offline';
  onCreateBooking: (data: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const { rooms } = useRooms();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    guests: 1,
    check_in_date: today,
    check_out_date: tomorrow,
    date: today,
    time: '12:00',
    special_requests: '',
    total_price: 0,
    room_id: '',
  });

  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms?.find(room => room.id === roomId);
    setFormData({ 
      ...formData, 
      room_id: roomId,
      total_price: selectedRoom ? selectedRoom.price : 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateBooking(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New {bookingType === 'hotel' ? 'Hotel' : 'Table'} Booking ({formMode})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer_email">Customer Email</Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              required
            />
          </div>

          {bookingType === 'hotel' ? (
            <>
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.check_in_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.check_in_date ? format(formData.check_in_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.check_in_date}
                      onSelect={(date) => {
                        if (date) {
                          const newCheckOutDate = 
                            date >= formData.check_out_date ? addDays(date, 1) : formData.check_out_date;
                          
                          setFormData({ 
                            ...formData, 
                            check_in_date: date,
                            check_out_date: newCheckOutDate
                          });
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.check_out_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.check_out_date ? format(formData.check_out_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.check_out_date}
                      onSelect={(date) => {
                        if (date && date > formData.check_in_date) {
                          setFormData({ ...formData, check_out_date: date });
                        }
                      }}
                      fromDate={addDays(formData.check_in_date, 1)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Select Room</Label>
                <Select 
                  value={formData.room_id} 
                  onValueChange={handleRoomChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms && rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} - ₹{room.price}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No rooms available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_price">Total Price (₹)</Label>
                <Input
                  id="total_price"
                  type="number"
                  min="0"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: parseInt(e.target.value) })}
                  readOnly
                  className="bg-gray-100"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Input
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Booking</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

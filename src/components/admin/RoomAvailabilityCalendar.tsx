
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Textarea
} from '@/components/ui/textarea';
import { format, isSameDay, isToday, addDays, isBefore } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  CheckCircle, 
  Clock, 
  AlarmClock, 
  AlertCircle, 
  RotateCcw, 
  Calendar as CalendarIcon2,
  ArrowRight 
} from 'lucide-react';
import { useRoomAvailability, RoomAvailabilityDay } from '@/hooks/useRoomAvailability';
import { cn } from '@/lib/utils';
import { Room } from '@/types/booking';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface RoomAvailabilityCalendarProps {
  room: Room;
  className?: string;
}

export function RoomAvailabilityCalendar({ room, className }: RoomAvailabilityCalendarProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('available');
  const [updateSource, setUpdateSource] = useState<string>('admin');
  const [notes, setNotes] = useState('');
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [isQuickSetDialogOpen, setIsQuickSetDialogOpen] = useState(false);
  const [quickFromDate, setQuickFromDate] = useState<Date | undefined>(new Date());
  const [quickToDate, setQuickToDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [quickStatus, setQuickStatus] = useState<string>('available');

  const {
    getAvailabilityByDate,
    updateSelectedDates,
    updateDateRange,
    selectedDates,
    setSelectedDates,
    toggleDateSelection,
    dateRange,
    setDateRange,
  } = useRoomAvailability(room.id);

  const handleUpdateAvailability = () => {
    if (isRangeMode && dateRange.from) {
      updateDateRange(updateStatus, updateSource, notes);
    } else if (selectedDates.length > 0) {
      updateSelectedDates(updateStatus, updateSource, notes);
    }
    
    setIsUpdateDialogOpen(false);
    setNotes('');
  };

  const handleQuickSetAvailability = () => {
    if (!quickFromDate || !quickToDate) {
      toast({
        title: "Missing dates",
        description: "Please select both from and to dates",
        variant: "destructive"
      });
      return;
    }
    
    // Make sure from date is before to date
    if (isBefore(quickToDate, quickFromDate)) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }
    
    // Call the updateDateRange function with the quick set values
    const result = updateDateRange(quickStatus, 'admin', `Quick update by admin on ${new Date().toLocaleDateString()}`, quickFromDate, quickToDate);
    
    // Close the dialog
    setIsQuickSetDialogOpen(false);
  };

  const renderDayContent = (day: Date) => {
    const dayData = getAvailabilityByDate(day);
    
    if (!dayData) {
      return null;
    }
    
    const isPast = isBefore(day, new Date()) && !isToday(day);
    
    return (
      <div 
        className={cn(
          'w-full h-full p-1 rounded-md relative',
          selectedDates.some(d => isSameDay(d, day)) && 'bg-hotel-gold/20 border border-hotel-gold',
          isPast && 'opacity-50'
        )}
      >
        <div className={cn('absolute top-0 right-0 h-2 w-2 rounded-full',
          dayData.status === 'available' ? 'bg-green-500' :
          dayData.status === 'maintenance' ? 'bg-red-500' : 
          dayData.status === 'offline-booking' ? 'bg-amber-500' : 
          dayData.status === 'online-booking' ? 'bg-blue-500' :
          dayData.status === 'unavailable' ? 'bg-gray-500' :
          'bg-blue-500'
        )} />
        
        <span className={cn(
          'text-xs absolute bottom-0 left-0 right-0 text-center',
          isToday(day) && 'font-bold'
        )}>
          {day.getDate()}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">Available</Badge>;
      case 'online-booking':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">Online Booking</Badge>;
      case 'offline-booking':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">Offline Booking</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">Maintenance</Badge>;
      case 'unavailable':
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/30">Unavailable</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className={cn("bg-hotel-midnight overflow-hidden", className)}>
      <CardHeader className="bg-hotel-slate border-b border-hotel-gold/20">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-hotel-gold">{room.name} Availability</CardTitle>
            <CardDescription className="text-white/70">
              Manage availability dates for this room
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
              onClick={() => setIsQuickSetDialogOpen(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Quick Set Availability
            </Button>
            <Button
              variant={isRangeMode ? 'default' : 'outline'}
              className={isRangeMode ? 'bg-hotel-gold text-hotel-midnight' : 'border-hotel-gold/30 text-white'}
              onClick={() => {
                setIsRangeMode(true);
                setSelectedDates([]);
              }}
            >
              <CalendarIcon2 className="h-4 w-4 mr-2" />
              Range Mode
            </Button>
            <Button
              variant={!isRangeMode ? 'default' : 'outline'}
              className={!isRangeMode ? 'bg-hotel-gold text-hotel-midnight' : 'border-hotel-gold/30 text-white'}
              onClick={() => {
                setIsRangeMode(false);
                setDateRange({ from: undefined, to: undefined });
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Select Mode
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            {isRangeMode ? (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange({
                      from: range.from,
                      to: range.to || range.from
                    });
                  }
                }}
                className="bg-hotel-slate rounded-md border border-hotel-gold/20 pointer-events-auto"
                disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
              />
            ) : (
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                className="bg-hotel-slate rounded-md border border-hotel-gold/20 pointer-events-auto"
                disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
                components={{
                  Day: ({ date, ...props }) => {
                    return (
                      <button
                        onClick={() => toggleDateSelection(date)}
                        className={cn(
                          'h-9 w-9 relative rounded-md text-center text-xs',
                          selectedDates.some(d => isSameDay(d, date)) && 'bg-hotel-gold/20 border border-hotel-gold',
                          !selectedDates.some(d => isSameDay(d, date)) && 'hover:bg-hotel-midnight/50'
                        )}
                      >
                        {renderDayContent(date)}
                      </button>
                    );
                  },
                }}
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="mb-4 bg-hotel-slate p-4 rounded-md border border-hotel-gold/20">
              <h3 className="text-lg font-semibold text-hotel-gold mb-2">Legend</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-white/80">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-white/80">Online Booking</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-white/80">Offline Booking</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-white/80">Maintenance</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4 bg-hotel-slate p-4 rounded-md border border-hotel-gold/20">
              <h3 className="text-lg font-semibold text-hotel-gold mb-2">Selected Dates</h3>
              
              {isRangeMode ? (
                dateRange.from ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-hotel-gold" />
                      <span className="text-white">
                        {format(dateRange.from, 'PPP')}
                        {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() && ` – ${format(dateRange.to, 'PPP')}`}
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-sm">
                      {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() 
                        ? `${Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected` 
                        : '1 day selected'}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/70">No date range selected</p>
                )
              ) : selectedDates.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-white">{selectedDates.length} day{selectedDates.length > 1 ? 's' : ''} selected</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDates.slice(0, 3).map((date, i) => (
                      <Badge key={i} variant="outline" className="bg-hotel-midnight/50 border-hotel-gold/30">
                        {format(date, 'MMM d')}
                      </Badge>
                    ))}
                    {selectedDates.length > 3 && (
                      <Badge variant="outline" className="bg-hotel-gold/20 text-hotel-gold">
                        +{selectedDates.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-white/70">No dates selected</p>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              <Button 
                disabled={(isRangeMode && !dateRange.from) || (!isRangeMode && selectedDates.length === 0)}
                className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                onClick={() => setIsUpdateDialogOpen(true)}
              >
                Update Availability
              </Button>
              
              <Button 
                variant="outline"
                className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                onClick={() => {
                  setSelectedDates([]);
                  setDateRange({ from: undefined, to: undefined });
                }}
                disabled={(isRangeMode && !dateRange.from) || (!isRangeMode && selectedDates.length === 0)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Quick Set Availability Dialog */}
      {isQuickSetDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-hotel-slate rounded-md border border-hotel-gold/20 p-4 w-full max-w-md">
            <h3 className="text-xl font-bold text-hotel-gold mb-4">Quick Set Availability</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-1 block">From Date</label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-hotel-gold/30 bg-hotel-midnight"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {quickFromDate ? format(quickFromDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-hotel-slate border-hotel-gold/20">
                        <Calendar
                          mode="single"
                          selected={quickFromDate}
                          onSelect={setQuickFromDate}
                          disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <label className="text-white text-sm mb-1 block">To Date</label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-hotel-gold/30 bg-hotel-midnight"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {quickToDate ? format(quickToDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-hotel-slate border-hotel-gold/20">
                        <Calendar
                          mode="single"
                          selected={quickToDate}
                          onSelect={setQuickToDate}
                          disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Set Status for Range</label>
                <Select 
                  value={quickStatus}
                  onValueChange={setQuickStatus}
                >
                  <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-hotel-slate border-hotel-gold/20">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-hotel-midnight/70 p-3 rounded border border-hotel-gold/20">
                <p className="text-white/80 text-sm">
                  {quickFromDate && quickToDate ? (
                    <>
                      Setting {quickStatus} status for dates from {format(quickFromDate, 'MMM d, yyyy')} to {format(quickToDate, 'MMM d, yyyy')}
                      {' '}({Math.round((quickToDate.getTime() - quickFromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                    </>
                  ) : (
                    <>Please select both dates</>
                  )}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline"
                  className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                  onClick={() => setIsQuickSetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  onClick={handleQuickSetAvailability}
                  disabled={!quickFromDate || !quickToDate}
                >
                  Apply to Date Range
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Regular Update Dialog */}
      {isUpdateDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-hotel-slate rounded-md border border-hotel-gold/20 p-4 w-full max-w-md">
            <h3 className="text-xl font-bold text-hotel-gold mb-4">Update Availability</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Set Status</label>
                <Select 
                  value={updateStatus}
                  onValueChange={setUpdateStatus}
                >
                  <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-hotel-slate border-hotel-gold/20">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="online-booking">Online Booking</SelectItem>
                    <SelectItem value="offline-booking">Offline Booking</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-white text-sm mb-1 block">Source</label>
                <Select 
                  value={updateSource}
                  onValueChange={setUpdateSource}
                >
                  <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-hotel-slate border-hotel-gold/20">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-white text-sm mb-1 block">Notes (optional)</label>
                <Textarea 
                  className="bg-hotel-midnight border-hotel-gold/30 text-white"
                  placeholder="Add any notes about this change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline"
                  className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  onClick={handleUpdateAvailability}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

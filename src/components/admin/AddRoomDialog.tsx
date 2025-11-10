import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const roomAmenities = [
  { id: "wifi", label: "Free Wi-Fi" },
  { id: "breakfast", label: "Complimentary Breakfast" },
  { id: "parking", label: "Free Parking" },
  { id: "ac", label: "Air Conditioning" },
  { id: "tv", label: "Smart TV" },
  { id: "minibar", label: "Mini Bar" },
  { id: "safe", label: "In-room Safe" },
  { id: "bathtub", label: "Bathtub" },
  { id: "shower", label: "Rainfall Shower" },
  { id: "workspace", label: "Work Desk" },
  { id: "roomservice", label: "24/7 Room Service" },
  { id: "coffeemachine", label: "Coffee Machine" },
];

const roomCategories = [
  { id: "deluxe", name: "Deluxe Room" },
  { id: "executive", name: "Executive Room" },
  { id: "suite", name: "Suite Room" },
  { id: "standard", name: "Standard Room" },
];

const roomSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  breakfast_price: z.string().refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Breakfast price must be a positive number or zero",
  }).optional(),
  image_url: z.string().url("Please enter a valid URL for the room image"),
  capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Capacity must be a positive number",
  }),
  beds: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Number of beds must be a positive number",
  }),
  bathrooms: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Number of bathrooms must be a positive number",
  }),
  status: z.enum(["available", "occupied", "maintenance"]),
  category: z.string().min(1, "Please select a room category"),
});

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const queryClient = useQueryClient();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      breakfast_price: "",
      image_url: "",
      capacity: "2",
      beds: "1",
      bathrooms: "1",
      status: "available",
      category: "standard",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `rooms/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Upload error: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const addRoom = useMutation({
    mutationFn: async (data: z.infer<typeof roomSchema>) => {
      let finalImageUrl = data.image_url;
      
      // Upload image if file is selected
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      
      if (selectedAmenities.length === 0) {
        throw new Error("Please select at least one amenity");
      }

      // Build the room data with category and breakfast_price
      const roomData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        breakfast_price: data.breakfast_price ? parseFloat(data.breakfast_price) : null,
        image_url: finalImageUrl,
        capacity: parseInt(data.capacity),
        beds: parseInt(data.beds),
        bathrooms: parseInt(data.bathrooms),
        amenities: selectedAmenities.map(id => {
          const amenity = roomAmenities.find(a => a.id === id);
          return amenity ? amenity.label : id;
        }),
        is_available: data.status !== "maintenance",
        category: data.category,
        status: data.status
      };

      // Insert the room data
      const { error } = await supabase.from("rooms").insert([roomData]);

      if (error) {
        console.error("Error adding room:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room added successfully");
      form.reset();
      setSelectedAmenities([]);
      setImageFile(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Failed to add room:", error);
      toast.error(`Failed to add room: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof roomSchema>) => {
    addRoom.mutate(data);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(current => 
      current.includes(amenityId)
        ? current.filter(id => id !== amenityId)
        : [...current, amenityId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-hotel-gold text-xl">Add New Room</DialogTitle>
          <DialogDescription className="text-white/70">
            Fill in the details below to add a new room to the hotel inventory.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Room Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                        placeholder="Deluxe Suite"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Price per Night (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        step="0.01"
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                        placeholder="5000"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="breakfast_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Breakfast Price (Optional) (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                      placeholder="1000"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Room Category</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold">
                        <SelectValue placeholder="Select room category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                      {roomCategories.map(category => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id} 
                          className="cursor-pointer hover:bg-hotel-midnight"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel className="text-white">Room Image</FormLabel>
              <div className="flex flex-col space-y-3">
                <Input 
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold"
                />
                <p className="text-xs text-white/60">Upload an image or provide a URL below</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Image URL (or upload above)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                      placeholder="https://example.com/room-image.jpg"
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold min-h-[120px]" 
                      placeholder="Describe the room features and amenities..."
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1"
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="beds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Beds</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1"
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Bathrooms</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1"
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Room Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold">
                        <SelectValue placeholder="Select room status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                      <SelectItem value="available" className="cursor-pointer hover:bg-hotel-midnight">Available</SelectItem>
                      <SelectItem value="occupied" className="cursor-pointer hover:bg-hotel-midnight">Occupied</SelectItem>
                      <SelectItem value="maintenance" className="cursor-pointer hover:bg-hotel-midnight">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
              <FormLabel className="text-white block">Room Amenities</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {roomAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`amenity-${amenity.id}`}
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                      className="border-hotel-gold/50 data-[state=checked]:bg-hotel-gold data-[state=checked]:text-hotel-midnight"
                    />
                    <Label 
                      htmlFor={`amenity-${amenity.id}`}
                      className="text-white cursor-pointer"
                    >
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-hotel-gold/30 text-white hover:bg-hotel-gold hover:text-hotel-midnight"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                disabled={isUploading || addRoom.isPending}
              >
                {isUploading || addRoom.isPending ? "Saving..." : "Add Room"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

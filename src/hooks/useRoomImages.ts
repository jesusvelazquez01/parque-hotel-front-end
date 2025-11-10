
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RoomImage } from '@/types/roomImages';

export const useRoomImages = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomImages, setRoomImages] = useState<RoomImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageToDelete, setImageToDelete] = useState<RoomImage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, room_number, category_type')
        .order('category_type', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setRooms(data || []);
      // Auto-select the first room if available
      if (data && data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRoomImages = async (roomId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('room_images')
        .select('*')
        .eq('room_id', roomId)
        .order('is_primary', { ascending: false })
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      setRoomImages(data || []);
    } catch (error) {
      console.error('Error fetching room images:', error);
      toast.error('Failed to load room images');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    fetchRoomImages(roomId);
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !selectedRoom) return;
    
    try {
      setUploading(true);
      
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedRoom}_${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('room_images')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('room_images')
        .getPublicUrl(fileName);
      
      // Check if this is the first image for the room (make primary if so)
      const isPrimary = roomImages.length === 0;
      
      // Save image reference to database
      const { data: imageData, error: imageError } = await supabase
        .from('room_images')
        .insert([
          {
            room_id: selectedRoom,
            image_url: publicUrl,
            is_primary: isPrimary,
            order_index: roomImages.length
          }
        ])
        .select();
      
      if (imageError) throw imageError;
      
      toast.success('Image uploaded successfully');
      
      // Refresh images
      fetchRoomImages(selectedRoom);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };
  
  const handleSetPrimary = async (image: RoomImage) => {
    if (!selectedRoom) return;
    
    try {
      setLoading(true);
      
      // First, set all images for this room as not primary
      const { error: updateError } = await supabase
        .from('room_images')
        .update({ is_primary: false })
        .eq('room_id', selectedRoom);
        
      if (updateError) throw updateError;
      
      // Then set the selected image as primary
      const { error: primaryError } = await supabase
        .from('room_images')
        .update({ is_primary: true })
        .eq('id', image.id);
        
      if (primaryError) throw primaryError;
      
      toast.success('Primary image updated');
      
      // Refresh images
      fetchRoomImages(selectedRoom);
      
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to set primary image');
    } finally {
      setLoading(false);
    }
  };
  
  const openDeleteDialog = (image: RoomImage) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };
  
  const deleteImage = async () => {
    if (!imageToDelete || !selectedRoom) {
      setIsDeleteDialogOpen(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Extract filename from URL
      const urlParts = imageToDelete.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('room_images')
        .remove([fileName]);
        
      // Even if storage delete fails, try to remove from database
      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('room_images')
        .delete()
        .eq('id', imageToDelete.id);
        
      if (dbError) throw dbError;
      
      toast.success('Image deleted successfully');
      
      // Refresh images
      fetchRoomImages(selectedRoom);
      
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  return {
    rooms,
    selectedRoom,
    roomImages,
    loading,
    uploading,
    imageToDelete,
    isDeleteDialogOpen,
    fetchRooms,
    handleRoomSelect,
    handleFileUpload,
    handleSetPrimary,
    openDeleteDialog,
    deleteImage,
    setIsDeleteDialogOpen,
  };
};

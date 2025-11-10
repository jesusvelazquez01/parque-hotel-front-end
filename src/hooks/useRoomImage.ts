
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RoomImage } from '@/types/roomImages';
import { RoomCategoryType } from '@/types/booking';

export const useRoomImage = (roomId?: string) => {
  const [images, setImages] = useState<RoomImage[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomImages = async () => {
      try {
        setIsLoading(true);
        if (!roomId) {
          setImages([]);
          setPrimaryImage(null);
          return;
        }

        const { data, error } = await supabase
          .from('room_images')
          .select('*')
          .eq('room_id', roomId)
          .order('is_primary', { ascending: false }) // Primary images first
          .order('order_index', { ascending: true });

        if (error) throw error;

        // Set all images
        setImages(data || []);
        
        // Find primary image or first image
        const primary = data?.find(img => img.is_primary);
        if (primary) {
          setPrimaryImage(primary.image_url);
        } else if (data && data.length > 0) {
          setPrimaryImage(data[0].image_url);
        } else {
          setPrimaryImage(null);
        }
      } catch (err: any) {
        console.error('Error fetching room images:', err);
        setError(err.message || 'Failed to fetch room images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomImages();
  }, [roomId]);

  // Updated function to use the correct RoomCategoryType
  const fetchImagesByRoomCategory = async (categoryType: RoomCategoryType) => {
    try {
      setIsLoading(true);
      
      // First get a room id from the category
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('category_type', categoryType)
        .limit(1);
        
      if (roomError) throw roomError;
      if (!roomData || roomData.length === 0) {
        setImages([]);
        setPrimaryImage(null);
        setError(`No rooms found for category: ${categoryType}`);
        return null;
      }
      
      // Then fetch images for that room
      const targetRoomId = roomData[0].id;
      
      const { data, error } = await supabase
        .from('room_images')
        .select('*')
        .eq('room_id', targetRoomId)
        .order('is_primary', { ascending: false })
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Set all images
      setImages(data || []);
      
      // Find primary image or first image
      const primary = data?.find(img => img.is_primary);
      if (primary) {
        setPrimaryImage(primary.image_url);
        return primary.image_url;
      } else if (data && data.length > 0) {
        setPrimaryImage(data[0].image_url);
        return data[0].image_url;
      } else {
        setPrimaryImage(null);
        return null;
      }
    } catch (err: any) {
      console.error('Error fetching room images by category:', err);
      setError(err.message || 'Failed to fetch room images');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    images, 
    imageUrls: images.map(img => img.image_url),
    primaryImage, 
    isLoading, 
    error,
    fetchImagesByRoomCategory
  };
};

export default useRoomImage;

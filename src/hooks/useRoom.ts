
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Room, RoomCategoryType } from "@/types/booking";
import { toast } from "sonner";

export const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (error) throw error;

        // Ensure we handle all required fields, including price_per_night mapping from price
        const roomData: Room = {
          ...data,
          price_per_night: data.price, // Map price to price_per_night
          category: data.category || 'All Rooms', // Default category if not set
          category_type: data.category_type as RoomCategoryType || 'Royal Deluxe', // Ensure category type is properly set
          breakfast_price: data.breakfast_price || 0, // Ensure breakfast price is available
        };

        setRoom(roomData);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError(err as Error);
        toast.error("Failed to fetch room details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  return { room, isLoading, error };
};

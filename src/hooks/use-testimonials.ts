
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial } from '@/types/testimonial';

export const useTestimonials = () => {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { data: testimonials, isLoading, error } = useQuery({
    queryKey: ['testimonials', filterRating],
    queryFn: async () => {
      // For now, return mock data since we don't have a testimonials table yet
      // In a real implementation, we would query Supabase here
      
      const mockTestimonials: Testimonial[] = [
        {
          id: 1,
          name: "Emma Thompson",
          role: "Business Traveler",
          text: "The Royal Pavilion exceeded all my expectations. The service was impeccable and the amenities were top-notch. I'll definitely be returning for my next business trip.",
          rating: 5,
          image: "https://via.placeholder.com/150?text=Emma"
        },
        {
          id: 2,
          name: "Michael Chen",
          role: "Vacationer",
          text: "My family and I had an amazing stay. The rooms were spacious and clean, and the staff went above and beyond to make our vacation special.",
          rating: 4,
          image: "https://via.placeholder.com/150?text=Michael"
        },
        {
          id: 3,
          name: "Sarah Johnson",
          role: "Food Critic",
          text: "The restaurant at The Royal Pavilion is a hidden gem. The fusion cuisine was innovative and delicious - a must-try for any food enthusiast.",
          rating: 5,
          image: "https://via.placeholder.com/150?text=Sarah"
        }
      ];

      if (filterRating !== null) {
        return mockTestimonials.filter(t => t.rating >= filterRating);
      }

      return mockTestimonials;
    },
  });

  return {
    testimonials: testimonials || [],
    isLoading,
    error,
    filterRating,
    setFilterRating
  };
};

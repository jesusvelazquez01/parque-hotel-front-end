
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from '@/components/LazyImage';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  category: string;
  description?: string;
}

const GallerySection = () => {
  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GalleryImage[];
    }
  });

  const categories = React.useMemo(() => {
    if (!galleryImages) return [];
    const uniqueCategories = [...new Set(galleryImages.map(image => image.category))];
    return uniqueCategories;
  }, [galleryImages]);

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const filteredImages = React.useMemo(() => {
    if (!galleryImages) return [];
    if (!selectedCategory) return galleryImages;
    return galleryImages.filter(image => image.category === selectedCategory);
  }, [galleryImages, selectedCategory]);

  if (isLoading) {
    return (
      <div className="py-20 text-center bg-hotel-midnight">
        <div className="animate-pulse">
          <div className="h-8 bg-hotel-gold/20 w-48 mx-auto rounded"></div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/2] bg-hotel-slate rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 bg-hotel-midnight">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center font-semibold text-hotel-gold mb-10 font-['Cormorant_Garamond']">
          Our Gallery
        </h2>
        
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-hotel-gold text-hotel-midnight'
                  : 'bg-hotel-slate text-white hover:bg-hotel-gold/20'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-hotel-gold text-hotel-midnight'
                    : 'bg-hotel-slate text-white hover:bg-hotel-gold/20'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.length > 0 ? filteredImages.map(image => (
            <div key={image.id} className="group">
              <Card className="overflow-hidden border-hotel-gold/20 bg-hotel-slate hover:border-hotel-gold/50 transition-all">
                <CardContent className="p-0">
                  <div className="aspect-[3/2] relative overflow-hidden">
                    <LazyImage
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full"
                      fallbackSrc="/placeholder.svg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight/90 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white text-lg font-semibold">{image.title}</h3>
                      {image.description && <p className="text-white/80 text-sm mt-1">{image.description}</p>}
                      <span className="inline-block mt-2 text-xs text-hotel-gold/80 bg-hotel-gold/10 px-2 py-1 rounded-full">
                        {image.category}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )) : (
            <div className="col-span-full text-center py-10">
              <p className="text-white/70">No gallery images found.</p>
              <p className="text-white/50 text-sm mt-2">Check back soon for new additions!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;

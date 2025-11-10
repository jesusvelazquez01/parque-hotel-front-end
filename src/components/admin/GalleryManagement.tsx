
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Image, Trash2 } from 'lucide-react';

const GalleryManagement = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageDetails, setImageDetails] = useState({
    title: '',
    description: '',
    category: 'room'
  });

  // Fetch gallery images
  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data;
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setImageDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setImageDetails(prev => ({ ...prev, category: value }));
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;
      
      // Create a storage bucket if it doesn't exist (this is handled by Supabase)
      const { error: uploadError, data } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
      throw new Error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Add image mutation
  const addImage = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('No file selected');
      }
      
      if (!imageDetails.title || !imageDetails.category) {
        throw new Error('Title and category are required');
      }

      try {
        // 1. Upload image to storage
        const imageUrl = await uploadImage(selectedFile);
        
        // 2. Save image details to database
        const { error } = await supabase
          .from('gallery_images')
          .insert([{
            title: imageDetails.title,
            description: imageDetails.description,
            category: imageDetails.category,
            image_url: imageUrl
          }]);
          
        if (error) throw error;
        
        // Reset form
        setSelectedFile(null);
        setImageDetails({
          title: '',
          description: '',
          category: 'room'
        });
        
        return { success: true };
      } catch (error: any) {
        console.error('Error adding image:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Image added to gallery successfully!');
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      
      // Reset the file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    onError: (error: any) => {
      console.error('Failed to add image to gallery:', error);
      toast.error(`Failed to add image to gallery: ${error.message}`);
    }
  });

  // Delete image mutation
  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { data: imageData } = await supabase
        .from('gallery_images')
        .select('image_url')
        .eq('id', imageId)
        .single();
      
      if (imageData) {
        // Extract file path from URL
        const imageUrl = imageData.image_url;
        const storageUrl = supabase.storage.from('gallery').getPublicUrl('').data.publicUrl;
        const filePath = imageUrl.replace(storageUrl, '');
        
        // Delete from storage if it's our storage URL
        if (imageUrl.includes(storageUrl)) {
          await supabase.storage.from('gallery').remove([filePath]);
        }
      }
      
      // Delete from database
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Image deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete image: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addImage.mutate();
  };

  const handleDelete = (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteImage.mutate(imageId);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery Management</h1>
          <p className="text-white/70">Manage hotel gallery images</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-hotel-slate p-6 rounded-lg shadow-lg border border-hotel-gold/20">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Image</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-white">Image File</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="bg-hotel-midnight border-hotel-gold/30 text-white file:bg-hotel-gold file:text-hotel-midnight file:border-0"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-white/80">
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Image Title</Label>
              <Input
                id="title"
                name="title"
                value={imageDetails.title}
                onChange={handleInputChange}
                placeholder="Enter image title"
                required
                className="bg-hotel-midnight border-hotel-gold/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select 
                value={imageDetails.category} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                  <SelectItem value="room" className="cursor-pointer hover:bg-hotel-midnight/50">Room</SelectItem>
                  <SelectItem value="restaurant" className="cursor-pointer hover:bg-hotel-midnight/50">Restaurant</SelectItem>
                  <SelectItem value="exterior" className="cursor-pointer hover:bg-hotel-midnight/50">Exterior</SelectItem>
                  <SelectItem value="amenities" className="cursor-pointer hover:bg-hotel-midnight/50">Amenities</SelectItem>
                  <SelectItem value="other" className="cursor-pointer hover:bg-hotel-midnight/50">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={imageDetails.description}
                onChange={handleInputChange}
                placeholder="Enter image description"
                className="bg-hotel-midnight border-hotel-gold/30 text-white min-h-[100px]"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
              disabled={!selectedFile || uploading || addImage.isPending}
            >
              {uploading || addImage.isPending ? 'Uploading...' : 'Upload Image'}
            </Button>
          </form>
        </div>
        
        {/* Gallery Preview */}
        <div className="lg:col-span-2 bg-hotel-slate p-6 rounded-lg shadow-lg border border-hotel-gold/20">
          <h2 className="text-xl font-semibold text-white mb-4">Gallery Images</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-white">Loading images...</div>
            </div>
          ) : galleryImages && galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image: any) => (
                <div key={image.id} className="group relative rounded-lg overflow-hidden h-48 bg-hotel-midnight">
                  <img 
                    src={image.image_url} 
                    alt={image.title}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-70"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <h3 className="text-white font-medium truncate">{image.title}</h3>
                    <p className="text-white/80 text-sm">{image.category}</p>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center min-h-[200px] bg-hotel-midnight/50 rounded-lg border border-dashed border-hotel-gold/30 p-6">
              <Image className="h-12 w-12 text-hotel-gold/60 mb-4" />
              <p className="text-white/70 text-center">No gallery images found</p>
              <p className="text-white/50 text-sm text-center mt-1">
                Upload images using the form to create your gallery
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryManagement;


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  created_at: string;
}

export const useGalleryImages = () => {
  const queryClient = useQueryClient();

  const { data: hasPermission = false } = useQuery({
    queryKey: ['upload-permission'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // First check if this is an employee or admin account
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle();
      
      // If this is an employee or admin, they automatically have upload permission
      if (employeeData) {
        return employeeData.role === 'admin' || true; // All employees have upload permission
      }

      // Otherwise, this is a regular user - check permissions
      const { data, error } = await supabase
        .from('upload_permissions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
      
      return !!data;
    }
  });

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch gallery images');
        throw error;
      }

      return data as GalleryImage[];
    },
  });

  const uploadImage = useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      category, 
      description 
    }: { 
      file: File; 
      title: string; 
      category: string; 
      description?: string;
    }) => {
      // First check if the user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to upload images');
        throw new Error('You must be logged in to upload images');
      }
      
      const user = session.user;

      // Check if this is an employee account (from employees table)
      const { data: employeeData } = await supabase
        .from('employees')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      // If this is an employee, they automatically have permission
      if (!employeeData) {
        // For regular users, check permission status
        const { data: permissionData } = await supabase
          .from('upload_permissions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
          
        if (!permissionData) {
          toast.error('You do not have permission to upload images.');
          throw new Error('User does not have upload permission');
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Check if the gallery bucket exists
      try {
        // Upload to gallery bucket
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError.message);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('gallery_images')
          .insert({
            title,
            description,
            category,
            image_url: publicUrl,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      } catch (error: any) {
        console.error('Error in image upload:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Image uploaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to upload image: ' + error.message);
    },
  });

  return {
    images,
    isLoading,
    uploadImage,
    hasPermission
  };
};

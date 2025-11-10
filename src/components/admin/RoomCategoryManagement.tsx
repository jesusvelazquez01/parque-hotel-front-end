
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash } from 'lucide-react';

interface RoomCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const RoomCategoryManagement = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(null);

  // Fetch all room categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['roomCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as RoomCategory[];
    }
  });

  // Create new category
  const createCategory = useMutation({
    mutationFn: async (newCategory: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from('room_categories')
        .insert([newCategory])
        .select();

      if (error) throw error;
      return data[0] as RoomCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomCategories'] });
      toast.success('Category created successfully');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create category: ${error.message}`);
    }
  });

  // Update category
  const updateCategory = useMutation({
    mutationFn: async (category: { id: string; name: string; description: string }) => {
      const { data, error } = await supabase
        .from('room_categories')
        .update({ 
          name: category.name, 
          description: category.description 
        })
        .eq('id', category.id)
        .select();

      if (error) throw error;
      return data[0] as RoomCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomCategories'] });
      toast.success('Category updated successfully');
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update category: ${error.message}`);
    }
  });

  // Delete category
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      // First check if there are any rooms using this category
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id')
        .eq('category_id', id);

      if (roomsError) throw roomsError;

      if (rooms && rooms.length > 0) {
        throw new Error(`Cannot delete category with ${rooms.length} associated rooms`);
      }

      const { error } = await supabase
        .from('room_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomCategories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete category: ${error.message}`);
    }
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    createCategory.mutate({
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim()
    });
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    updateCategory.mutate({
      id: selectedCategory.id,
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim()
    });
  };

  const handleDeleteCategory = (category: RoomCategory) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      deleteCategory.mutate(category.id);
    }
  };

  const openEditDialog = (category: RoomCategory) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-hotel-gold">Room Categories</h2>
        <Button 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hotel-gold"></div>
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="bg-hotel-slate border-hotel-gold/20">
              <CardHeader>
                <CardTitle className="text-hotel-gold">{category.name}</CardTitle>
                <CardDescription className="text-white/70">
                  {new Date(category.created_at || '').toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-white/80">
                {category.description || 'No description provided.'}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-hotel-gold/30 text-white hover:bg-hotel-gold/20"
                  onClick={() => openEditDialog(category)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-hotel-slate rounded-lg border border-hotel-gold/20">
          <p className="text-white text-lg mb-4">No room categories found</p>
          <p className="text-white/70">Create a category to get started</p>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Add New Category</DialogTitle>
            <DialogDescription className="text-white/70">
              Create a new room category for organizing your hotel rooms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-white">Category Name</Label>
              <Input 
                id="category-name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold"
                placeholder="Deluxe Room"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description" className="text-white">Description</Label>
              <Textarea 
                id="category-description" 
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold min-h-[100px]"
                placeholder="Describe this room category..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="border-hotel-gold/30 text-white hover:bg-hotel-gold/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Edit Category</DialogTitle>
            <DialogDescription className="text-white/70">
              Update the room category details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name" className="text-white">Category Name</Label>
              <Input 
                id="edit-category-name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description" className="text-white">Description</Label>
              <Textarea 
                id="edit-category-description" 
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="bg-hotel-midnight border-hotel-gold/30 text-white focus:border-hotel-gold min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-hotel-gold/30 text-white hover:bg-hotel-gold/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditCategory}
              className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
              disabled={updateCategory.isPending}
            >
              {updateCategory.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomCategoryManagement;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserRole } from '@/context/AuthContext';
import { Pencil, Trash2, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
}

const formSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['customer', 'employee', 'admin', 'superadmin'] as const),
});

const CustomerManagement = () => {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      role: 'customer',
    },
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load customers');
        throw error;
      }
      return data as Profile[];
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!selectedCustomer) throw new Error('No customer selected');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role: data.role,
        })
        .eq('id', selectedCustomer.id);

      if (error) {
        throw error;
      }
      
      return {
        id: selectedCustomer.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: data.role as UserRole
      };
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profiles'], (oldData: Profile[] | undefined) => {
        if (!oldData) return [updatedProfile];
        return oldData.map((profile) =>
          profile.id === updatedProfile.id ? updatedProfile : profile
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      setIsEditDialogOpen(false);
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update customer');
      console.error('Error updating customer:', error);
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        throw error;
      }
      
      return profileId;
    },
    onSuccess: (deletedProfileId) => {
      queryClient.setQueryData(['profiles'], (oldData: Profile[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(profile => profile.id !== deletedProfileId);
      });
      
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      setIsDeleteDialogOpen(false);
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    },
  });

  const handleEditClick = (profile: Profile) => {
    setSelectedCustomer(profile);
    form.reset({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email,
      role: profile.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (profile: Profile) => {
    setSelectedCustomer(profile);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedCustomer) return;
    deleteProfileMutation.mutate(selectedCustomer.id);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedCustomer) return;
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center p-4 text-white">Loading customers...</div>;
  }

  return (
    <div className="rounded-lg border border-hotel-gold/20 bg-hotel-slate">
      <div className="flex items-center justify-between p-4 border-b border-hotel-gold/20">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-hotel-gold">Customer Management</h2>
          <p className="text-sm text-white/70">
            Manage registered users and their roles
          </p>
        </div>
      </div>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-hotel-midnight/50 hover:bg-hotel-midnight/70 border-hotel-gold/20">
              <TableHead className="text-hotel-gold">Name</TableHead>
              <TableHead className="text-hotel-gold">Email</TableHead>
              <TableHead className="text-hotel-gold">Current Role</TableHead>
              <TableHead className="text-hotel-gold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((profile) => (
              <TableRow key={profile.id} className="hover:bg-hotel-midnight/30 border-hotel-gold/20">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-hotel-gold" />
                    <span className="text-white">{profile.first_name} {profile.last_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-white">{profile.email}</TableCell>
                <TableCell className="text-white">{profile.role || 'customer'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(profile)}
                      className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(profile)}
                      className="bg-red-500/20 text-red-300 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Edit Customer</DialogTitle>
            <DialogDescription className="text-white/70">
              Update customer information and role
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">First Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        className="bg-hotel-midnight border-hotel-gold/30 text-white focus:ring-hotel-gold focus:border-hotel-gold"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-hotel-slate text-white border-hotel-gold/30">
                        <SelectItem value="customer" className="hover:bg-hotel-midnight text-white">Customer</SelectItem>
                        <SelectItem value="employee" className="hover:bg-hotel-midnight text-white">Employee</SelectItem>
                        <SelectItem value="admin" className="hover:bg-hotel-midnight text-white">Admin</SelectItem>
                        <SelectItem value="superadmin" className="hover:bg-hotel-midnight text-white">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {selectedCustomer && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20">
            <DialogHeader>
              <DialogTitle className="text-hotel-gold">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-white/70">
                Are you sure you want to delete this customer? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-hotel-midnight/50 p-4 rounded-lg">
                <p><span className="text-white/70">Name:</span> <span className="text-white">{selectedCustomer.first_name} {selectedCustomer.last_name}</span></p>
                <p><span className="text-white/70">Email:</span> <span className="text-white">{selectedCustomer.email}</span></p>
                <p><span className="text-white/70">Role:</span> <span className="text-white">{selectedCustomer.role}</span></p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerManagement;

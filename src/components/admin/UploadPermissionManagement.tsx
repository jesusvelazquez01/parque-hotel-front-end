
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui"; // Importing from ui index file
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserX } from 'lucide-react';

interface Permission {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  updated_at: string | null;
  updated_by: string | null;
  reason: string | null;
  profiles?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string | null;
  } | null;
}

export const UploadPermissionManagement = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['upload-permission-requests'],
    queryFn: async () => {
      // Fetch user profiles directly, not via relation
      const { data, error } = await supabase
        .from('upload_permissions')
        .select('*');

      if (error) throw error;
      
      // Create an array to store the enhanced permissions with profile data
      const enhancedData: Permission[] = [];
      
      // For each permission, fetch the associated profile
      for (const permission of data || []) {
        // Get user profile data for this permission
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, first_name, last_name, role')
          .eq('id', permission.user_id)
          .single();
          
        // Add the permission with its profile data to our array
        enhancedData.push({
          ...permission,
          profiles: profileData || { 
            email: 'Unknown email', 
            first_name: null, 
            last_name: null,
            role: null
          }
        });
      }
      
      return enhancedData;
    }
  });

  const updatePermission = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('upload_permissions')
        .update({ 
          status,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upload-permission-requests'] });
      toast.success('Permission status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update permission: ' + error.message);
    }
  });

  const removeUserPermissions = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string, reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, reject any pending requests
      const { error: updateError } = await supabase
        .from('upload_permissions')
        .update({ 
          status: 'rejected',
          updated_by: user.id,
          updated_at: new Date().toISOString(),
          reason: `Permission revoked: ${reason}`
        })
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (updateError) throw updateError;

      // Then, add a rejection record to make it clear permissions were revoked
      const { error: insertError } = await supabase
        .from('upload_permissions')
        .insert({ 
          user_id: userId,
          status: 'rejected',
          updated_by: user.id,
          reason: `Employee permissions revoked: ${reason}`
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upload-permission-requests'] });
      toast.success('User permissions revoked successfully');
    },
    onError: (error) => {
      toast.error('Failed to revoke permissions: ' + error.message);
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group requests by user for better management
  const userPermissions = requests.reduce((acc: Record<string, Permission[]>, request) => {
    const userId = request.user_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(request);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Permission Requests</CardTitle>
        <CardDescription>
          Manage user requests for gallery upload permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  {request.profiles?.first_name || ''} {request.profiles?.last_name || ''}
                  <br />
                  <span className="text-sm text-gray-500">{request.profiles?.email || 'Unknown email'}</span>
                </TableCell>
                <TableCell>
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${request.profiles?.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                    ${request.profiles?.role === 'employee' ? 'bg-blue-100 text-blue-800' : ''}
                    ${request.profiles?.role === 'customer' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {request.profiles?.role || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  {format(new Date(request.requested_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${request.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${request.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => updatePermission.mutate({ id: request.id, status: 'approved' })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updatePermission.mutate({ id: request.id, status: 'rejected' })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {request.status === 'approved' && request.profiles?.role === 'employee' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          <UserX size={14} /> Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-hotel-slate text-white border-hotel-midnight">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-hotel-gold">Revoke Upload Permissions</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Are you sure you want to revoke upload permissions for {request.profiles?.first_name} {request.profiles?.last_name}?
                            This is typically done when an employee leaves or changes roles.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <label className="text-sm text-white/70 mb-2 block">Reason for revoking permissions</label>
                          <Textarea 
                            id="revoke-reason"
                            placeholder="e.g. Employee left the company"
                            className="bg-hotel-midnight border-hotel-midnight text-white"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                              const reason = (document.getElementById('revoke-reason') as HTMLTextAreaElement).value;
                              removeUserPermissions.mutate({ 
                                userId: request.user_id,
                                reason: reason || 'Permission revoked by admin'
                              });
                            }}
                          >
                            Revoke Permissions
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

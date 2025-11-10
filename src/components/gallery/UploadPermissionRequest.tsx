
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Link } from 'react-router-dom';

export const UploadPermissionRequest = () => {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<{id: string} | null>(null);

  // Fetch user profile to ensure it exists
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        // For employees or admins, we consider them as having a valid profile
        if (user.role === 'employee' || user.role === 'admin') {
          setUserProfile({ id: user.id });
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Error checking user profile. Please try again later.');
          return;
        }
        
        setUserProfile(data);
      };
      
      fetchUserProfile();
    }
  }, [user]);

  const { data: permission, isLoading } = useQuery({
    queryKey: ['upload-permission'],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('upload_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user // Only run query if user is authenticated
  });

  const requestPermission = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!userProfile) throw new Error('User profile not found');

      const { error } = await supabase
        .from('upload_permissions')
        .insert({
          user_id: user.id,
          reason
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upload-permission'] });
      toast.success('Permission request submitted successfully');
      setReason('');
    },
    onError: (error) => {
      toast.error('Failed to submit request: ' + error.message);
    }
  });

  // If not authenticated, show a more professional authentication prompt with styled buttons
  if (!isAuthenticated) {
    return (
      <Card className="bg-hotel-midnight border border-hotel-gold/20">
        <CardHeader>
          <CardTitle className="text-hotel-gold">Request Upload Permission</CardTitle>
          <CardDescription className="text-white/70">
            Authentication is required to request gallery upload permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link to="/login">
            <Button className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold/20">
              Register
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Employees and admins shouldn't need to request permission
  if (isAuthenticated && user && (user.role === 'employee' || user.role === 'admin')) {
    return null; // Don't show anything for employees and admins
  }

  if (isLoading) {
    return (
      <Card className="bg-hotel-midnight border border-hotel-gold/20">
        <CardHeader>
          <CardTitle className="text-hotel-gold">Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (permission?.status === 'approved') {
    return (
      <Card className="bg-green-900/20 border-green-500/30 border">
        <CardHeader>
          <CardTitle className="text-green-400">Upload Permission Granted</CardTitle>
          <CardDescription className="text-green-300/80">
            You have permission to upload images to the gallery
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission?.status === 'rejected') {
    return (
      <Card className="bg-red-900/20 border-red-500/30 border">
        <CardHeader>
          <CardTitle className="text-red-400">Upload Permission Denied</CardTitle>
          <CardDescription className="text-red-300/80">
            Your request was denied. You may submit a new request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            requestPermission.mutate();
          }}>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need upload permission..."
              className="mb-4 bg-hotel-midnight border-hotel-slate"
            />
            <Button 
              type="submit" 
              disabled={!reason || requestPermission.isPending}
              className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
            >
              Submit New Request
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (permission?.status === 'pending') {
    return (
      <Card className="bg-amber-900/20 border-amber-500/30 border">
        <CardHeader>
          <CardTitle className="text-amber-400">Request Pending</CardTitle>
          <CardDescription className="text-amber-300/80">
            Your request is being reviewed by administrators
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-hotel-midnight border border-hotel-gold/20">
      <CardHeader>
        <CardTitle className="text-hotel-gold">Request Upload Permission</CardTitle>
        <CardDescription className="text-white/70">
          Submit a request to upload images to the gallery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          requestPermission.mutate();
        }}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you need upload permission..."
            className="mb-4 bg-hotel-midnight border-hotel-slate"
          />
          <Button 
            type="submit" 
            disabled={!reason || requestPermission.isPending}
            className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
          >
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

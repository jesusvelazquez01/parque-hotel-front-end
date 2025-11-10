
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  // Safe context access with null check
  const context = useContext(AuthContext);
  
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    // Return a safe default that won't crash the app
    // Include ALL functions that are used throughout the app
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => { 
        toast({
          title: "Authentication Error",
          description: "Auth context not available. Please refresh the page.",
          variant: "destructive"
        });
        throw new Error('Auth context not available');
      },
      logout: async () => { 
        toast({
          title: "Authentication Error",
          description: "Auth context not available. Please refresh the page.",
          variant: "destructive"
        });
        throw new Error('Auth context not available');
      },
      // Add missing functions from errors
      register: async () => {
        toast({
          title: "Authentication Error",
          description: "Auth context not available. Please refresh the page.",
          variant: "destructive"
        });
        throw new Error('Auth context not available');
      },
      adminLogin: async () => {
        toast({
          title: "Authentication Error",
          description: "Auth context not available. Please refresh the page.",
          variant: "destructive"
        });
        throw new Error('Auth context not available');
      },
      refreshUser: async () => ({ user: null, profile: null }),
      safeLogout: async () => ({ success: false, error: new Error('Auth context not available') }),
    };
  }
  
  // Add the refreshUser function that's being used in LoginForm.tsx
  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // No need to set any state here as the auth listener in AuthContext 
        // will update the user state automatically
        return { user, profile };
      }
      
      return { user: null, profile: null };
    } catch (error) {
      console.error('Error refreshing user:', error);
      return { user: null, profile: null };
    }
  };

  // Improved function to clear supabase session storage and then logout
  const safeLogout = async () => {
    try {
      // First check if there's an active session
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log('No active session found, cleaning up local state');
        // No session to logout from, but we can still clear local state
        localStorage.removeItem('supabase.auth.token');
        return { success: true };
      }
      
      // Perform the actual logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during supabase logout:', error);
        throw error;
      }
      
      // Also clear any stored session data as a fallback
      localStorage.removeItem('supabase.auth.token');
      
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error };
    }
  };

  return {
    ...context,
    refreshUser,
    safeLogout,
  };
};

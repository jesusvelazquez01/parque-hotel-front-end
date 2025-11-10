
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminDashboardFooter from '@/components/admin/AdminDashboardFooter';
import { toast } from '@/hooks/use-toast';

const AdminLayout = () => {
  console.log("AdminLayout component rendered");
  const navigate = useNavigate();
  
  // Try/catch block to handle potential context errors
  try {
    const { user, safeLogout } = useAuth();

    // Verify admin access
    useEffect(() => {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login');
        return;
      }
      
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        console.log("User role not admin or superadmin:", user.role);
        navigate('/login');
        // Use the updated toast format for error
        toast({
          title: "Access Denied",
          description: "Admin access required",
          variant: "destructive",
        });
        return;
      }
      
      // Redirect superadmin users to superadmin dashboard if they're at the admin root
      if (user.role === 'superadmin' && window.location.pathname === '/admin') {
        console.log("Superadmin detected, redirecting to dashboard");
        navigate('/admin/super-admin');
      }
      
    }, [user, navigate]);

    const handleLogout = async () => {
      try {
        const { success } = await safeLogout();
        if (success) {
          toast({
            title: "Logged Out",
            description: "Logged out successfully",
          });
          navigate('/');
        } else {
          toast({
            title: "Logout Failed",
            description: "Logout failed, please try again",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
        toast({
          title: "Error",
          description: "An error occurred during logout",
          variant: "destructive",
        });
        // Force navigate to login in case of error
        navigate('/login');
      }
    };

    if (!user) {
      return null; // Don't render anything while checking auth
    }

    return (
      <div className="min-h-screen bg-hotel-midnight flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-hotel-slate border-b border-hotel-gold/20 py-4 px-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/29a8d07f-d88a-4169-8e28-2a8e6dc62932.png" 
                  alt="The Royal Pavilion" 
                  className="h-12"
                />
                <h1 className="text-2xl font-semibold text-white">
                  {user?.role === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                </h1>
              </div>
              <div className="text-white">
                <span>Welcome, {user?.firstName || (user?.role === 'superadmin' ? 'Super Admin' : 'Admin')}</span>
                {user?.role === 'superadmin' && (
                  <span className="ml-2 bg-hotel-gold text-hotel-midnight text-xs px-2 py-0.5 rounded">
                    Super Admin
                  </span>
                )}
              </div>
            </div>
          </header>
          
          {/* Content */}
          <main className="flex-1 bg-hotel-midnight overflow-y-auto p-6">
            <Outlet />
          </main>
          
          {/* Footer */}
          <AdminDashboardFooter />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in AdminLayout:", error);
    // If context fails, redirect to login
    navigate('/login');
    return null;
  }
};

export default AdminLayout;

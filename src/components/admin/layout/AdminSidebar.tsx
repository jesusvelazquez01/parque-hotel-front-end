
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hotel,
  Users,
  Settings,
  Image,
  RefreshCcw,
  Calendar,
  Table as TableIcon,
  LogOut,
  CheckSquare,
  ShieldCheck,
  Tag,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const AdminSidebar = () => {
  const { user, safeLogout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  // Determine if user is superadmin
  const isSuperAdmin = user?.role === 'superadmin';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { success } = await safeLogout();
      if (success) {
        toast({
          title: "Logged Out",
          description: "Logged out successfully",
        });
        navigate('/login');
      } else {
        toast({
          title: "Logout Failed",
          description: "Failed to log out",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Updated navigation items with correct routes including promo codes
  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { title: 'Hotel Bookings', icon: Hotel, href: '/admin/hotel-bookings' },
    { title: 'Room Management', icon: Hotel, href: '/admin/rooms' },
    { title: 'Room Availability', icon: Calendar, href: '/admin/room-availability' },
    { title: 'Offers & Promotions', icon: Tag, href: '/admin/offers' },
    { title: 'Promo Codes', icon: Ticket, href: '/admin/promo-codes' },
    { title: 'Employees', icon: Users, href: '/admin/employees' },
    { title: 'Gallery', icon: Image, href: '/admin/gallery' },
    { title: 'Refund Requests', icon: RefreshCcw, href: '/admin/refund-requests' },
  ];
  
  // Add Super Admin link only for superadmins
  if (isSuperAdmin) {
    navItems.push({ 
      title: 'Super Admin', 
      icon: ShieldCheck, 
      href: '/admin/super-admin' 
    });
  }
  
  // Add settings link for all
  navItems.push({ 
    title: 'Settings', 
    icon: Settings, 
    href: '/admin/settings' 
  });

  return (
    <aside className="w-64 bg-hotel-slate border-r border-hotel-gold/20">
      <div className="p-4">
        <NavLink to="/" className="flex items-center mb-6">
          <img 
            src="/lovable-uploads/29a8d07f-d88a-4169-8e28-2a8e6dc62932.png" 
            alt="The Royal Pavilion" 
            className="h-10"
          />
        </NavLink>
      </div>
      
      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-white hover:bg-hotel-midnight/50 rounded-md transition-colors group ${
                isActive ? 'bg-hotel-gold/20 text-hotel-gold' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5 text-hotel-gold mr-3" />
            <span>{item.title}</span>
          </NavLink>
        ))}
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center px-4 py-3 text-white hover:bg-hotel-midnight/50 rounded-md transition-colors group w-full text-left mt-6"
        >
          <LogOut className="h-5 w-5 text-red-400 mr-3" />
          <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminHeader = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hotel-gold/20 bg-hotel-midnight/80 backdrop-blur supports-[backdrop-filter]:bg-hotel-midnight/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex flex-1 items-center justify-between">
          <Link to="/admin" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/29a8d07f-d88a-4169-8e28-2a8e6dc62932.png" 
              alt="The Royal Pavilion" 
              className="h-10"
            />
          </Link>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-hotel-gold/20 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          
          <div className={cn(
            "flex items-center gap-4",
            isMobile && "absolute top-16 left-0 w-full bg-hotel-midnight border-b border-hotel-gold/20 px-4 py-2 flex-col items-start gap-2 transition-all duration-200",
            isMobile && !isMobileMenuOpen && "hidden"
          )}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-hotel-gold/20">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">{user?.email}</span>
              <Button variant="ghost" size="icon" className="text-white hover:bg-hotel-gold/20">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;


import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ChevronUp, User, Home, Utensils, Calendar, Image, Info, Phone, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRestaurantDropdownOpen, setIsRestaurantDropdownOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsRestaurantDropdownOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enlaces del restaurante
  const restaurantLinks = [
    { name: "Restaurante Fusión", path: "/restaurante-fusion" },
    { name: "Llamas Parrilla", path: "/llamas-parrilla" },
    { name: "Cocina Internacional", path: "/cocina-internacional" },
  ];

  // Determinar el color de fondo según la ruta
  const getRouteSpecificBackground = () => {
    const routeBackgrounds: { [key: string]: string } = {
      '/galeria': 'bg-hotel-verde-oscuro',
      '/sobre-nosotros': 'bg-hotel-verde-oscuro',
      '/contacto': 'bg-hotel-verde-oscuro',
      '/llamas-parrilla': 'bg-hotel-verde-oscuro',
      '/restaurante-fusion': 'bg-hotel-verde-oscuro',
      '/salones-eventos': 'bg-hotel-verde-oscuro',
      '/': 'bg-transparent', // Página de inicio con fondo transparente
    };

    return routeBackgrounds[location.pathname] || 'bg-hotel-verde-oscuro/90 backdrop-blur-lg';
  };

  // Function to toggle restaurant dropdown in mobile view
  const toggleMobileRestaurantDropdown = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsRestaurantDropdownOpen(!isRestaurantDropdownOpen);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out shadow-md",
        isScrolled
          ? `${getRouteSpecificBackground()} bg-opacity-95 backdrop-blur-md py-2 border-b border-hotel-verde-claro/20`
          : `${getRouteSpecificBackground()} py-4`
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>
        
        {isMobile ? (
          <>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Mobile Navigation Menu */}
            <div
              className={cn(
                "fixed inset-0 bg-hotel-midnight bg-opacity-98 flex flex-col pt-20 transition-all duration-300 ease-in-out z-40",
                isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
              )}
            >
              <nav className="flex flex-col items-center justify-start space-y-5 w-full px-6 max-h-[80vh] overflow-y-auto py-8">
                {/* Home link */}
                <Link
                  to="/"
                  className={cn(
                    "text-lg font-['Montserrat'] tracking-wider uppercase text-white hover:text-hotel-verde-claro transition-colors duration-200 w-full text-center py-2",
                    location.pathname === "/" && "text-hotel-verde-claro font-semibold"
                  )}
                >
                  <Home className="inline-block mr-2 h-5 w-5" /> Inicio
                </Link>
                
                {/* Restaurant Dropdown in Mobile View - Improved with animation and visibility toggle */}
                <div className="flex flex-col items-center w-full">
                  <button 
                    className="text-lg font-['Montserrat'] tracking-wider uppercase text-white hover:text-hotel-verde-claro mb-2 flex items-center gap-2 w-full justify-center py-2"
                    onClick={toggleMobileRestaurantDropdown}
                  >
                    <Utensils className="inline-block mr-2 h-5 w-5" /> Restaurante {isRestaurantDropdownOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  
                  {/* Animated dropdown content */}
                  <div 
                    className={cn(
                      "flex flex-col gap-3 items-center w-full bg-hotel-midnight/50 rounded-md overflow-hidden transition-all duration-300",
                      isRestaurantDropdownOpen 
                        ? "max-h-[200px] opacity-100 py-3 border-t border-b border-hotel-gold/20" 
                        : "max-h-0 opacity-0 py-0 border-none"
                    )}
                  >
                    {restaurantLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "text-base font-['Montserrat'] text-white hover:text-hotel-verde-claro transition-colors duration-200 py-1 px-4 w-full text-left",
                          location.pathname === link.path && "text-hotel-verde-claro font-medium"
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Updated Majestic Banquet link */}
                <Link
                  to="/salones-eventos"
                  className={cn(
                    "text-lg font-['Montserrat'] tracking-wider uppercase text-white hover:text-hotel-verde-claro transition-colors duration-200 w-full text-center py-2",
                    location.pathname === "/salones-eventos" && "text-hotel-verde-claro font-semibold"
                  )}
                >
                  <Calendar className="inline-block mr-2 h-4 w-4" /> Salones de Eventos
                </Link>
                
                {/* Gallery, About, Contact links */}
                <Link
                  to="/galeria"
                  className={cn(
                    "text-lg font-['Montserrat'] tracking-wider uppercase text-white hover:text-hotel-verde-claro transition-colors duration-200 w-full text-center py-2",
                    location.pathname === "/galeria" && "text-hotel-verde-claro font-semibold"
                  )}
                >
                  <Image className="inline-block mr-2 h-4 w-4" /> Galería
                </Link>
                <Link
                  to="/sobre-nosotros"
                  className={cn(
                    "text-lg font-['Montserrat'] tracking-wider uppercase text-white hover:text-hotel-verde-claro transition-colors duration-200 w-full text-center py-2",
                    location.pathname === "/sobre-nosotros" && "text-hotel-verde-claro font-semibold"
                  )}
                >
                  <Info className="inline-block mr-2 h-4 w-4" /> Sobre Nosotros
                </Link>
                <Link
                  to="/contacto"
                  className={cn(
                    "text-lg font-['Montserrat'] tracking-wider uppercase text-white hover:text-hotel-verde-claro transition-colors duration-200 w-full text-center py-2",
                    location.pathname === "/contacto" && "text-hotel-verde-claro font-semibold"
                  )}
                >
                  <Phone className="inline-block mr-2 h-4 w-4" /> Contacto
                </Link>
                
                {/* Authentication buttons - Improved mobile view */}
                {user ? (
                  <div className="flex flex-col gap-3 items-center mt-4 w-full border-t border-hotel-gold/20 pt-4">
                    <span className="text-white/80 text-sm font-['Montserrat']">{user.email}</span>
                    {user.role === "admin" && (
                      <Link 
                        to="/admin" 
                        className="text-hotel-gold hover:underline font-['Montserrat'] py-2"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      to="/refunds" 
                      className="text-white hover:text-hotel-gold font-['Montserrat'] py-2 flex items-center gap-2"
                    >
                      <User size={16} /> My Refunds
                    </Link>
                    <Button 
                      variant="outline" 
                      className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold/10 hover:text-hotel-gold w-full max-w-[200px] font-['Montserrat']"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-3 mt-4 items-center border-t border-hotel-gold/20 pt-4">
                    <Link
                      to="/refund-request"
                      className="w-full max-w-[200px]"
                    >
                      <Button
                        className="bg-hotel-gold/20 border border-hotel-gold/40 hover:bg-hotel-gold/30 text-white font-['Montserrat'] w-full"
                      >
                        Refund Request
                      </Button>
                    </Link>
                    <Link
                      to="/login"
                      className="w-full max-w-[200px]"
                    >
                      <Button
                        className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-['Montserrat'] w-full"
                      >
                        <LogIn className="mr-2 h-4 w-4" /> Ingresar
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      className="w-full max-w-[200px]"
                    >
                      <Button className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-['Montserrat'] w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </>
        ) : (
          <nav className="flex items-center space-x-8">
            {/* Home link */}
            <Link
              to="/"
              className={cn(
                "text-sm font-['Montserrat'] uppercase tracking-wider text-white hover:text-hotel-gold transition-colors duration-200 relative flex items-center gap-1.5",
                location.pathname === "/" && "text-hotel-gold font-medium"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
            
            {/* Restaurant Dropdown in Desktop View - Improved with proper focus handling */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-sm font-['Montserrat'] uppercase tracking-wider text-white hover:text-hotel-gold transition-colors duration-200 focus:bg-transparent focus:text-hotel-gold p-0 h-auto"
                >
                  <Utensils className="h-4 w-4" />
                  <span>Restaurante</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="center" 
                className="bg-hotel-slate border border-hotel-gold/20 rounded-md p-2 min-w-[200px] z-[100] shadow-lg animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2"
              >
                {restaurantLinks.map((link) => (
                  <DropdownMenuItem 
                    key={link.path} 
                    asChild 
                    className="cursor-pointer hover:bg-hotel-midnight focus:bg-hotel-midnight focus:text-hotel-gold"
                  >
                    <Link 
                      to={link.path} 
                      className={cn(
                        "text-white hover:text-hotel-gold py-2 w-full",
                        location.pathname === link.path && "text-hotel-gold"
                      )}
                    >
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Updated Majestic Banquet link */}
            <Link
              to="/salones-eventos"
              className={cn(
                "text-sm font-['Montserrat'] uppercase tracking-wider text-white hover:text-hotel-gold transition-colors duration-200 relative flex items-center gap-1.5",
                location.pathname === "/salones-eventos" && "text-hotel-gold font-medium"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Eventos</span>
            </Link>
            
            {/* Gallery, About, Contact links */}
            <Link
              to="/sobre-nosotros"
              className={cn(
                "text-sm font-['Montserrat'] uppercase tracking-wider text-white hover:text-hotel-gold transition-colors duration-200 flex items-center gap-1.5",
                location.pathname === "/sobre-nosotros" && "text-hotel-gold font-medium"
              )}
            >
              <Info className="h-4 w-4" />
              <span>Nosotros</span>
            </Link>
            <Link
              to="/contacto"
              className={cn(
                "text-sm font-['Montserrat'] uppercase tracking-wider text-white hover:text-hotel-gold transition-colors duration-200 flex items-center gap-1.5",
                location.pathname === "/contacto" && "text-hotel-gold font-medium"
              )}
            >
              <Phone className="h-4 w-4" />
              <span>Contacto</span>
            </Link>
            
            {/* Authentication buttons */}
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm font-['Montserrat'] text-white hover:text-hotel-gold transition-colors duration-200 focus:bg-transparent focus:text-hotel-gold p-0 h-auto"
                    >
                      <User size={16} />
                      <span className="ml-1">{user.email?.split('@')[0]}</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-hotel-slate border border-hotel-gold/20 rounded-md p-2 min-w-[200px] z-[100] shadow-lg"
                  >
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="text-hotel-gold hover:bg-hotel-midnight/50 cursor-pointer">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-hotel-gold/20" />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/refunds" className="text-white hover:bg-hotel-midnight/50 cursor-pointer flex items-center gap-2">
                        <User size={14} /> My Refund Requests
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-hotel-gold/20" />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-hotel-gold hover:bg-hotel-midnight/50 cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/refund-request">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-hotel-gold/40 bg-hotel-gold/10 text-white hover:bg-hotel-gold/30 hover:text-white font-['Montserrat']"
                  >
                    Refund Request
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="sm"
                    className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-['Montserrat']"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight font-['Montserrat']"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

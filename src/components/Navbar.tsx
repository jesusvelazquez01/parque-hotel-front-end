import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Enlaces de navegación
  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Sobre Nosotros', path: '/sobre-nosotros' },
    { name: 'Restaurante', path: '/restaurante' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-hotel-verde-oscuro/95 backdrop-blur-md shadow-md py-2 border-b border-hotel-verde-claro/20" 
          : "bg-hotel-verde-oscuro/90 py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">
              <span className="text-hotel-verde-claro">Parque</span> Hotel
            </span>
          </Link>

          {/* Navegación de escritorio */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`text-white hover:text-hotel-verde-claro transition-colors font-medium ${
                  location.pathname === link.path ? 'text-hotel-verde-claro' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Botones de autenticación */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/iniciar-sesion">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/registro">
              <Button className="bg-hotel-verde-claro text-hotel-verde-oscuro hover:bg-hotel-verde-claro/90">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-hotel-verde-claro focus:outline-none"
              aria-label="Menú"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'
          }`}
        >
          <div className="flex flex-col space-y-4 mt-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`block py-2 text-white hover:text-hotel-verde-claro font-medium ${
                  location.pathname === link.path ? 'text-hotel-verde-claro' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-600 mt-4">
              <div className="space-y-4">
                <Link to="/iniciar-sesion" className="block">
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/registro" className="block">
                  <Button className="w-full bg-hotel-verde-claro text-hotel-verde-oscuro hover:bg-hotel-verde-claro/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

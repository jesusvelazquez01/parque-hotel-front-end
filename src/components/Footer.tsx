
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-hotel-verde-oscuro py-12 border-t border-hotel-verde-claro/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and company info */}
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="text-white/80 mt-4 text-sm max-w-xs text-center md:text-left">
              Disfrute de la combinación perfecta entre confort y naturaleza en el corazón de Córdoba. Su refugio de tranquilidad y elegancia.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-white/70 hover:text-hotel-beige transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-hotel-beige transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-hotel-beige transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="text-center md:text-left">
            <h3 className="text-hotel-verde-claro text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/80 hover:text-hotel-beige transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-hotel-beige rounded-full mr-2"></span>Inicio</Link></li>
              <li><Link to="/habitaciones" className="text-white/80 hover:text-hotel-beige transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-hotel-beige rounded-full mr-2"></span>Habitaciones</Link></li>
              <li><Link to="/sobre-nosotros" className="text-white/80 hover:text-hotel-beige transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-hotel-beige rounded-full mr-2"></span>Sobre Nosotros</Link></li>
              <li><Link to="/servicios" className="text-white/80 hover:text-hotel-beige transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-hotel-beige rounded-full mr-2"></span>Servicios</Link></li>
              <li><Link to="/galeria" className="text-white/80 hover:text-hotel-beige transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-hotel-beige rounded-full mr-2"></span>Galería</Link></li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div className="text-center md:text-left">
            <h3 className="text-hotel-verde-claro text-xl font-bold mb-4">Contacto</h3>
            <address className="not-italic text-white/80 space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-hotel-beige mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Av. Principal 1234,</p>
                  <p>Barrio Parque, Córdoba,</p>
                  <p>Argentina, X5000</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-hotel-beige mr-2" />
                <a href="tel:+543514567890" className="hover:text-hotel-beige transition-colors">+54 351 456-7890</a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-hotel-beige mr-2" />
                <a href="mailto:info@parquehotel.com" className="hover:text-hotel-beige transition-colors">info@parquehotel.com</a>
              </div>
            </address>
          </div>
        </div>
        
        {/* Redes Sociales */}
        <div className="mt-8 flex justify-center space-x-6">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-hotel-beige transition-colors">
            <Facebook className="h-6 w-6" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-hotel-beige transition-colors">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-hotel-beige transition-colors">
            <Twitter className="h-6 w-6" />
          </a>
        </div>

        {/* Enlaces legales y copyright */}
        <div className="mt-10 pt-6 border-t border-hotel-verde-claro/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-white/70 text-sm">
            &copy; {currentYear} Parque Hotel. Todos los derechos reservados.
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/politica-privacidad" className="text-white/70 hover:text-hotel-beige transition-colors">
              Política de Privacidad
            </Link>
            <Link to="/terminos-servicio" className="text-white/70 hover:text-hotel-beige transition-colors">
              Términos de Servicio
            </Link>
            <Link to="/politica-cookies" className="text-white/70 hover:text-hotel-beige transition-colors">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

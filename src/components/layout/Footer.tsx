import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-hotel-verde-oscuro text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold font-['Cormorant_Garamond'] tracking-wider">
              <span className="text-hotel-verde-claro">PARQUE</span> HOTEL
            </h2>
            <p className="text-gray-300 text-sm">
              Disfrute de una experiencia única en el corazón de la naturaleza. En Parque Hotel combinamos el lujo con la calidez de la atención personalizada, ofreciendo alojamiento de primera categoría, gastronomía excepcional y servicios de clase mundial en un entorno natural inigualable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 rounded-full bg-hotel-verde-medio/30 flex items-center justify-center hover:bg-hotel-verde-claro hover:text-hotel-verde-oscuro transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-hotel-verde-medio/30 flex items-center justify-center hover:bg-hotel-verde-claro hover:text-hotel-verde-oscuro transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z"></path>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-hotel-verde-medio/30 flex items-center justify-center hover:bg-hotel-verde-claro hover:text-hotel-verde-oscuro transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.162 5.65593C21.3986 5.99362 20.589 6.2154 19.76 6.31393C20.6337 5.79136 21.2877 4.96894 21.6 3.99993C20.78 4.48793 19.881 4.82993 18.944 5.01493C18.3146 4.34151 17.4804 3.89489 16.5709 3.74451C15.6615 3.59413 14.7279 3.74842 13.9153 4.18338C13.1026 4.61834 12.4564 5.30961 12.0771 6.14972C11.6978 6.98983 11.6067 7.93171 11.818 8.82893C10.1551 8.74558 8.52832 8.31345 7.04328 7.56059C5.55823 6.80773 4.24812 5.75098 3.19799 4.45893C2.82628 5.09738 2.63095 5.82315 2.63199 6.56193C2.63199 8.01193 3.36999 9.29293 4.49199 10.0429C3.828 10.022 3.17862 9.84271 2.59799 9.51993V9.57193C2.59819 10.5376 2.93236 11.4735 3.5439 12.221C4.15544 12.9684 5.00649 13.4814 5.95299 13.6729C5.33661 13.84 4.6903 13.8646 4.06299 13.7449C4.30897 14.5762 4.80706 15.3031 5.48771 15.824C6.16836 16.3449 6.99903 16.6337 7.85699 16.6499C6.99938 17.3313 6.00514 17.8349 4.94458 18.1321C3.88402 18.4293 2.77899 18.5142 1.68799 18.3819C3.56844 19.6114 5.76403 20.2641 8.00999 20.2619C15.882 20.2619 20.089 13.8889 20.089 8.36193C20.089 8.18193 20.084 7.99993 20.076 7.82193C20.8949 7.2301 21.6016 6.49695 22.163 5.65693L22.162 5.65593Z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-medium text-hotel-verde-claro">Enlaces Rápidos</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/habitaciones" className="text-gray-400 hover:text-hotel-gold flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Habitaciones</span>
                </Link>
              </li>
              <li>
                <Link to="/restaurante-fusion" className="text-gray-400 hover:text-hotel-gold flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Restaurante</span>
                </Link>
              </li>
              <li>
                <Link to="/salones-eventos" className="text-gray-400 hover:text-hotel-gold flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Salones de Eventos</span>
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-gray-400 hover:text-hotel-gold flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Galería</span>
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="text-gray-400 hover:text-hotel-gold flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Sobre Nosotros</span>
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-400 hover:text-hotel-gold flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Contacto</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-medium text-hotel-verde-claro">Información de Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-hotel-gold mr-3 mt-0.5" />
                <span className="text-gray-300">Av. Principal 1234, Barrio Parque, Córdoba, Argentina, X5000</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-hotel-gold mr-3" />
                <a href="tel:+543511234567" className="text-gray-300 hover:text-hotel-verde-claro">+54 351 123-4567</a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-hotel-gold mr-3" />
                <div className="text-gray-300 flex flex-col">
                  <a href="mailto:info@parquehotel.com" className="hover:text-hotel-verde-claro">info@parquehotel.com</a>
                  <a href="mailto:reservas@parquehotel.com" className="hover:text-hotel-verde-claro">reservas@parquehotel.com</a>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-medium text-hotel-verde-claro">Boletín Informativo</h3>
            <p className="text-gray-300 text-sm">
              Suscríbase a nuestro boletín para recibir ofertas especiales y actualizaciones.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-white/10 border border-hotel-verde-claro/30 focus:ring-hotel-verde-claro text-white p-3 rounded-md placeholder-gray-400"
              />
              <Button className="bg-hotel-verde-claro hover:bg-hotel-verde-oscuro text-hotel-verde-oscuro hover:text-white transition-colors">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-hotel-slate mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {currentYear} Parque Hotel. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacidad" className="text-gray-300 text-sm hover:text-hotel-verde-claro">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="text-gray-300 text-sm hover:text-hotel-verde-claro">
                Términos de Servicio
              </Link>
              <Link to="/cookies" className="text-gray-300 text-sm hover:text-hotel-verde-claro">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

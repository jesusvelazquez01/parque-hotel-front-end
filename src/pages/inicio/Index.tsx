
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Star, BedDouble, Users } from "lucide-react";
import RoomCard from "@/components/RoomCard";
import TestimonialCard from "@/components/TestimonialCard";
import AmenityIcon from "@/components/AmenityIcon";
import { cn } from "@/lib/utils";
import { useRooms } from "@/hooks/useRooms";
import TestimonialSlider from "@/components/TestimonialSlider";
import SpecialOffers from "@/components/SpecialOffers";
import RoyalSlider from "@/components/RoyalSlider";
import TestimonialsSection from "@/components/TestimonialsSection";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import AutoPlay from "embla-carousel-autoplay";

const heroSlides = [
  {
    id: 1,
    image: "/lovable-uploads/97f56bdc-f996-4bf4-b8e9-c07d6c6a217a.png",
    title: "Parque Hotel",
    subtitle: "Donde la naturaleza y el lujo se encuentran en armonía",
  },
  {
    id: 2,
    image: "/lovable-uploads/574264f5-0bf6-4036-8da9-a855d962ae68.png",
    title: "Bienvenidos a Córdoba",
    subtitle: "Disfruta de la mejor ubicación en el corazón de la ciudad",
  },
  {
    id: 3,
    image: "/lovable-uploads/d1215680-8097-4d66-9438-2b376a16879d.png",
    title: "Recepción Elegante",
    subtitle: "Un recibimiento cálido y servicio personalizado",
  },
  {
    id: 4,
    image: "/lovable-uploads/d9eba171-d2c1-4f51-b0d3-1d83bf996f38.png",
    title: "Salón de Estar",
    subtitle: "Espacios diseñados para tu comodidad y relajación",
  },
  {
    id: 5,
    image: "/lovable-uploads/0c7c4437-568c-4865-9a8c-320106cc189e.png",
    title: "Gastronomía Excelente",
    subtitle: "Sabores únicos en nuestro restaurante gourmet",
  },
  {
    id: 6,
    image: "/lovable-uploads/781db283-ded7-4cad-b792-078d83b6063c.png",
    title: "Experiencia Culinaria",
    subtitle: "Ambiente acogedor y platos excepcionales",
  },
  {
    id: 7,
    image: "/lovable-uploads/22a8915f-8bbd-493b-ad72-3a35bc05719f.png",
    title: "Cenas Inolvidables",
    subtitle: "Saborea la mejor gastronomía local e internacional",
  },
  {
    id: 8,
    image: "/lovable-uploads/8dc41469-ed9e-43d9-b646-bbefa80b2a92.png",
    title: "Salón de Eventos",
    subtitle: "El lugar perfecto para tus celebraciones especiales",
  },
  {
    id: 9,
    image: "/lovable-uploads/8cdc8832-253c-4076-96e3-240da9633f6c.png",
    title: "Celebraciones",
    subtitle: "Espacios versátiles para todo tipo de eventos",
  },
  {
    id: 10,
    image: "/lovable-uploads/48f8c676-f02e-4a25-9991-f737b50f8025.png",
    title: "Bodas y Eventos",
    subtitle: "Hacemos realidad los eventos más soñados",
  },
  {
    id: 11,
    image: "/lovable-uploads/ab53c1df-49b0-40e9-8250-e7e6e2202139.png",
    title: "Terraza Panorámica",
    subtitle: "Disfruta de vistas espectaculares al atardecer",
  },
  {
    id: 12,
    image: "/lovable-uploads/a9554a17-de0c-4692-a2a4-f6fcd78871c4.png",
    title: "Vida Nocturna",
    subtitle: "Ambientes únicos para disfrutar con amigos",
  },
  {
    id: 13,
    image: "/lovable-uploads/211fa833-4fe1-465d-8104-afb529629eb7.png",
    title: "Bar Exclusivo",
    subtitle: "Los mejores cócteles en un ambiente sofisticado",
  },
];

const testimonials = [
  {
    id: 1,
    name: "CARLOS GUTIÉRREZ",
    role: "Huésped",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    text: "Excelente experiencia en el Parque Hotel. El personal fue maravilloso desde la reserva hasta el check-out. Las habitaciones son espaciosas y con una decoración preciosa. La comida en el restaurante fue deliciosa. ¡Volveré sin dudarlo!",
    rating: 5,
  },
  {
    id: 2,
    name: "MARÍA LÓPEZ",
    role: "Huésped",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    text: "El ambiente del hotel es increíble. Recién inaugurado con instalaciones de primera. Tienen un salón de eventos con capacidad para 150 personas. Las habitaciones son espaciosas y muy limpias. ¡Altamente recomendado!",
    rating: 5,
  },
  {
    id: 3,
    name: "SOFÍA MARTÍNEZ",
    role: "Huésped",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    text: "Un lugar excepcional, excelente ubicación y comida deliciosa. Las habitaciones son una maravilla, muy cómodas y con una vista preciosa al parque. ¡Volveré pronto!",
    rating: 5,
  },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { rooms, isLoading: roomsLoading } = useRooms();

  // Extract just the image URLs, titles, and subtitles for the RoyalSlider
  const heroImages = heroSlides.map(slide => slide.image);
  const heroTitles = heroSlides.map(slide => slide.title);
  const heroSubtitles = heroSlides.map(slide => slide.subtitle);

  // Handle slide change from RoyalSlider
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const parallaxElements = heroRef.current.querySelectorAll('.parallax');
        
        parallaxElements.forEach((element) => {
          const speed = (element as HTMLElement).dataset.speed || "0.5";
          (element as HTMLElement).style.transform = `translateY(${scrollPosition * parseFloat(speed)}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lista de tipos de habitación a mostrar
  const roomTypesToShow = ['Habitación Deluxe', 'Suite Ejecutiva', 'Suite Presidencial'];
  
  // Obtener una habitación de cada categoría
  const getOneRoomPerCategory = () => {
    if (!rooms || rooms.length === 0) return [];
    
    // Si no hay habitaciones en la base de datos, creamos unas de ejemplo
    if (rooms.length === 0) {
      return [
        {
          id: 1,
          name: 'Habitación Deluxe',
          description: 'Amplia habitación con vista al parque, cama king size y baño de lujo.',
          price: 25000,
          image: '/images/rooms/deluxe.jpg',
          maxOccupancy: 2,
          amenities: ['WiFi', 'Aire acondicionado', 'TV pantalla plana', 'Minibar']
        },
        {
          id: 2,
          name: 'Suite Ejecutiva',
          description: 'Elegante suite con sala de estar independiente y vista panorámica.',
          price: 35000,
          image: '/images/rooms/ejecutiva.jpg',
          maxOccupancy: 3,
          amenities: ['WiFi', 'Aire acondicionado', 'TV pantalla plana', 'Minibar', 'Jacuzzi']
        },
        {
          id: 3,
          name: 'Suite Presidencial',
          description: 'La máxima expresión de lujo con amplio espacio, terraza privada y servicios exclusivos.',
          price: 50000,
          image: '/images/rooms/presidencial.jpg',
          maxOccupancy: 4,
          amenities: ['WiFi', 'Aire acondicionado', 'TV pantalla plana', 'Minibar', 'Jacuzzi', 'Desayuno incluido']
        }
      ];
    }
    
    const selectedRooms = [];
    const seenCategories = new Set();
    
    // Recorrer todas las habitaciones y tomar la primera de cada categoría deseada
    for (const room of rooms) {
      if (roomTypesToShow.includes(room.name) && !seenCategories.has(room.name)) {
        // Actualizar descripciones y detalles según la nueva identidad
        const updatedRoom = { ...room };
        if (room.name === 'Habitación Deluxe') {
          updatedRoom.description = 'Amplia habitación con vista al parque, cama king size y baño de lujo.';
        } else if (room.name === 'Suite Ejecutiva') {
          updatedRoom.description = 'Elegante suite con sala de estar independiente y vista panorámica.';
        } else if (room.name === 'Suite Presidencial') {
          updatedRoom.description = 'La máxima expresión de lujo con amplio espacio, terraza privada y servicios exclusivos.';
        }
        selectedRooms.push(updatedRoom);
        seenCategories.add(room.name);
      }
      
      // Si ya encontramos una de cada categoría, dejamos de buscar
      if (seenCategories.size === roomTypesToShow.length) {
        break;
      }
    }
    
    return selectedRooms;
  };
  
  // Obtener las habitaciones filtradas
  const displayRooms = getOneRoomPerCategory();

  return (
    <>
      {/* Hero section with RoyalSlider */}
      <section 
        ref={heroRef}
        className="relative h-screen overflow-hidden"
      >
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-xl animate-slide-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 font-['Cormorant_Garamond']">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {heroSlides[currentSlide].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reservas">
                  <Button className="bg-hotel-verde-claro hover:bg-hotel-verde-medio text-hotel-verde-oscuro font-medium px-8 py-6 text-lg transition-colors">
                    Reservar Ahora
                  </Button>
                </Link>
                <Link to="/contacto">
                  <Button 
                    variant="outline" 
                    className="border-hotel-beige text-hotel-beige hover:bg-hotel-beige/10 hover:border-hotel-beige/80 px-8 py-6 text-lg transition-colors"
                  >
                    Contáctenos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RoyalSlider component */}
        <div className="absolute inset-0 z-0">
          <RoyalSlider 
            images={heroImages} 
            titles={[]} 
            subtitles={[]}
            autoplay={true}
            delay={6000}
            height="h-screen"
            onSlideChange={handleSlideChange}
            className="rounded-none shadow-none"
            showDots={false}
          />
        </div>

        {/* Bottom indicators */}
        <div className="absolute bottom-10 z-20 left-0 right-0 flex justify-center space-x-3 overflow-x-auto px-4">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0",
                currentSlide === index
                  ? "w-8 bg-hotel-gold"
                  : "bg-white/50 hover:bg-white"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Welcome section */}
      <section className="py-20 px-4 bg-gradient-to-b from-hotel-midnight to-hotel-slate">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="w-4 h-4 fill-hotel-verde-claro text-hotel-verde-claro" />
                  <Star className="w-4 h-4 fill-hotel-verde-claro text-hotel-verde-claro" />
                  <Star className="w-4 h-4 fill-hotel-verde-claro text-hotel-verde-claro" />
                  <Star className="w-4 h-4 fill-hotel-verde-claro text-hotel-verde-claro" />
                  <Star className="w-4 h-4 fill-hotel-verde-claro text-hotel-verde-claro" />
                </div>
                <span className="text-hotel-verde-claro/80 uppercase tracking-[0.2em] text-sm">Bienvenidos a</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-hotel-verde-oscuro mb-6 font-['Cormorant_Garamond']">
                Parque Hotel
              </h2>
              <p className="text-gray-800 mb-6 leading-relaxed">
                Descubra un refugio de paz y elegancia en el corazón de Córdoba. En el Parque Hotel, cada detalle está cuidadosamente diseñado para ofrecerle una experiencia única que combina el lujo moderno con la calidez de la tradición.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Rodeado de exuberante vegetación y con una arquitectura que se integra armoniosamente con el entorno natural, nuestro hotel es el lugar perfecto para desconectar, relajarse y disfrutar de momentos inolvidables. Ya sea que viaje por negocios o placer, le garantizamos una estancia excepcional.
              </p>
              <Link to="/contacto">
                <Button variant="outline" className="border-hotel-beige text-hotel-beige hover:bg-hotel-beige/10 hover:border-hotel-beige/80 transition-colors">
                  Reservar Ahora
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2 relative animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <div className="rounded-lg overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/imagenes-hotel/lobby.jpg"
                  alt="Lobby Principal del Parque Hotel"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-lg overflow-hidden shadow-xl hidden md:block">
                <img
                  src="/imagenes-hotel/lobby-2.jpg"
                  alt="Detalle del Lobby"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <SpecialOffers />

      {/* Luxury Accommodations section - Modified to show only 1 room per category */}
      <section className="py-20 px-4 bg-hotel-midnight">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-hotel-verde-oscuro mb-4 font-['Cormorant_Garamond']">
              Nuestras Habitaciones
            </h2>
            <div className="w-24 h-[1px] bg-hotel-verde-claro mx-auto mb-6"></div>
            <p className="text-hotel-verde-oscuro/80 max-w-2xl mx-auto">
              Descubre nuestros exclusivos alojamientos diseñados para ofrecerte el máximo confort y una experiencia inolvidable.
            </p>
          </div>
          
          {roomsLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hotel-gold"></div>
            </div>
          ) : displayRooms.length > 0 ? (
            <div className="animate-fade-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayRooms.map((room) => (
                  <div key={room.id}>
                    <RoomCard room={room} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-hotel-verde-oscuro/70">No hay habitaciones disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Experiencia Única */}
      <section className="py-32 px-4 bg-cover bg-center relative" style={{ backgroundImage: "linear-gradient(rgba(27, 77, 62, 0.7), rgba(58, 125, 68, 0.7)), url('/lovable-uploads/6bd8dd57-34b5-4422-8fae-17f4f5889767.png')" }}>
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Star className="w-4 h-4 fill-white text-white" />
                <Star className="w-4 h-4 fill-white text-white" />
                <Star className="w-4 h-4 fill-white text-white" />
                <Star className="w-4 h-4 fill-white text-white" />
                <Star className="w-4 h-4 fill-white text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-['Cormorant_Garamond']">
              Una Experiencia Inolvidable
            </h2>
            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
              En el corazón de Córdoba, el Parque Hotel te invita a descubrir un refugio de paz y elegancia. 
              Déjate consentir con nuestro servicio personalizado y disfruta de una estancia inigualable donde 
              cada detalle está pensado para tu comodidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reservas">
                <Button className="bg-hotel-verde-claro hover:bg-hotel-verde-medio text-hotel-verde-oscuro font-medium px-8 py-6 text-lg transition-colors">
                  Reservar Ahora
                </Button>
              </Link>
              <Link to="/habitaciones">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg transition-colors"
                >
                  Ver Habitaciones
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <TestimonialsSection />

      {/* Newsletter section */}
      <section className="py-20 px-4 bg-gradient-to-b from-hotel-beige/20 to-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-xl shadow-lg border border-hotel-verde-claro/20">
            <h2 className="text-3xl font-bold text-center text-hotel-verde-oscuro mb-6 font-['Cormorant_Garamond']">
              Suscríbete a Nuestro Boletín
            </h2>
            <p className="text-hotel-verde-oscuro/80 text-center mb-8 max-w-2xl mx-auto">
              Mantente informado sobre nuestras ofertas especiales, eventos y experiencias exclusivas. 
              Recibe descuentos para tu próxima estadía y sé el primero en conocer nuestras novedades.
            </p>
            <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Tu dirección de correo electrónico"
                className="flex-grow p-4 rounded-md bg-white/90 border border-hotel-verde-oscuro/20 text-hotel-verde-oscuro focus:ring-hotel-verde-claro focus:border-hotel-verde-claro"
                required
              />
              <Button 
                type="submit" 
                className="bg-hotel-verde-oscuro hover:bg-hotel-verde-medio text-white font-medium transition-colors"
              >
                Suscribirse
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;

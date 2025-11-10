import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BedDouble, Wifi, Tv, Coffee, WashingMachine, Waves, Users } from 'lucide-react';

// Tipos para las habitaciones
type RoomType = {
  id: number;
  name: string;
  description: string;
  price: number;
  size: string;
  capacity: string;
  image: string;
  amenities: string[];
};

// Datos de ejemplo para las habitaciones
const rooms: RoomType[] = [
  {
    id: 1,
    name: 'Habitación Estándar',
    description: 'Una habitación acogedora perfecta para viajeros individuales o parejas que buscan comodidad a un precio asequible.',
    price: 8990,
    size: '25 m²',
    capacity: '2 personas',
    image: '/imagenes-hotel/habitacion-1.jpg',
    amenities: ['wifi', 'tv', 'cafetera', 'baño privado'],
  },
  {
    id: 2,
    name: 'Habitación Superior',
    description: 'Amplia habitación con vista al jardín, ideal para quienes buscan un poco más de espacio y comodidad.',
    price: 11990,
    size: '35 m²',
    capacity: '2-3 personas',
    image: '/imagenes-hotel/habitacion-2.jpg',
    amenities: ['wifi', 'tv', 'cafetera', 'minibar', 'baño privado con bañera'],
  },
  {
    id: 3,
    name: 'Suite Ejecutiva',
    description: 'Nuestra suite más exclusiva, con sala de estar independiente y todas las comodidades para una estancia de lujo.',
    price: 15990,
    size: '50 m²',
    capacity: '2-4 personas',
    image: '/imagenes-hotel/habitacion-3.jpg',
    amenities: ['wifi', 'tv pantalla plana', 'cafetera', 'minibar', 'baño de lujo', 'jacuzzi'],
  },
];

// Componente de ícono de comodidad
const AmenityIcon = ({ amenity }: { amenity: string }) => {
  switch (amenity) {
    case 'wifi':
      return <Wifi className="w-5 h-5 text-hotel-verde-oscuro" />;
    case 'tv':
      return <Tv className="w-5 h-5 text-hotel-verde-oscuro" />;
    case 'cafetera':
      return <Coffee className="w-5 h-5 text-hotel-verde-oscuro" />;
    case 'minibar':
      return <Waves className="w-5 h-5 text-hotel-verde-oscuro" />;
    default:
      return <BedDouble className="w-5 h-5 text-hotel-verde-oscuro" />;
  }
};

const Habitaciones = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/imagenes-hotel/hotel-fondo.jpg)' }}
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Cormorant_Garamond']">Nuestras Habitaciones</h1>
              <p className="text-xl text-hotel-verde-claro">Descubre el confort y la elegancia en cada rincón</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Habitaciones */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-200 overflow-hidden">
                {/* Imagen de la habitación */}
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-hotel-verde-oscuro">{room.name}</h2>
                  <p className="text-hotel-gold text-xl font-semibold">${room.price.toLocaleString()}</p>
                </div>
                
                <p className="text-gray-600 mb-4">{room.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <BedDouble className="w-4 h-4 mr-2" />
                  <span className="mr-4">{room.size}</span>
                  <Users className="w-4 h-4 mr-2" />
                  <span>{room.capacity}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Comodidades</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <AmenityIcon amenity={amenity} />
                        <span className="ml-2 text-sm text-gray-600 capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Link to={`/reservar?habitacion=${room.id}`} className="block w-full">
                  <Button className="w-full bg-hotel-verde-oscuro hover:bg-hotel-verde-claro">
                    Reservar Ahora
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sección de información adicional */}
        <div className="mt-16 bg-hotel-beige/20 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-hotel-verde-oscuro mb-4">Políticas del Hotel</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-hotel-verde-oscuro mb-2">Check-in / Check-out</h4>
              <p className="text-gray-600">Check-in: 14:00 hrs<br />Check-out: 12:00 hrs</p>
            </div>
            <div>
              <h4 className="font-semibold text-hotel-verde-oscuro mb-2">Política de Niños</h4>
              <p className="text-gray-600">Niños menores de 6 años se alojan gratis compartiendo cama con sus padres.</p>
            </div>
            <div>
              <h4 className="font-semibold text-hotel-verde-oscuro mb-2">Mascotas</h4>
              <p className="text-gray-600">No se admiten mascotas en las habitaciones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Habitaciones;

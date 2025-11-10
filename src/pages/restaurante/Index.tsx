import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Utensils, Clock, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

// Datos de los desayunos para el collage
const breakfastItems = [
  {
    id: 1,
    name: 'Variedad y Frescura',
    description: 'Disfruta de una selección de frutas frescas de temporada, jugos naturales y panadería recién horneada cada mañana.',
    image: '/imagenes-hotel/desayuno.jpg',
    position: 'md:col-span-2 md:row-span-2 h-64 md:h-auto',
    textPosition: 'left-0 right-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6',
    textColor: 'text-white'
  },
  {
    id: 2,
    name: 'Delicias Dulces',
    description: 'Panqueques, waffles y pastelería casera para endulzar tus mañanas.',
    image: '/imagenes-hotel/desayuno-2.jpg',
    position: 'h-48',
    textPosition: 'inset-0 bg-black/40 flex items-center justify-center p-4 text-center',
    textColor: 'text-white'
  },
  {
    id: 3,
    name: 'Opciones Saludables',
    description: 'Yogur con granola, frutos secos y miel para comenzar el día con energía.',
    image: '/imagenes-hotel/desayuno-3.jpg',
    position: 'h-48',
    textPosition: 'inset-0 bg-black/40 flex items-center justify-center p-4 text-center',
    textColor: 'text-white'
  },
  {
    id: 4,
    name: 'Desayuno Completo',
    description: 'Huevos, tostadas y acompañamientos para los paladares más exigentes.',
    image: '/imagenes-hotel/desayuno-4.jpg',
    position: 'md:col-span-2 h-64',
    textPosition: 'left-0 right-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6',
    textColor: 'text-white'
  }
];

const Desayunos: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hotel-beige/20 to-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/imagenes-hotel/desayuno.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-hotel-verde-oscuro/90 via-hotel-verde-oscuro/50 to-transparent"></div>
        
        <div className="container mx-auto h-full flex items-end pb-16 relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-['Cormorant_Garamond']">
              Desayunos en el Parque Hotel
            </h1>
            <p className="text-xl text-hotel-verde-claro mb-8">
              Disfrute de un delicioso desayuno incluido en su estadía, preparado con ingredientes frescos y de la más alta calidad.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Collage de Desayunos */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-hotel-verde-oscuro mb-4 font-['Cormorant_Garamond']">
              Nuestros Desayunos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comience su día con una experiencia culinaria que combina lo mejor de los sabores locales e internacionales, preparados con ingredientes frescos y de la más alta calidad.
            </p>
            <div className="w-24 h-1 bg-hotel-gold mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {breakfastItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative rounded-xl overflow-hidden ${item.position} group`}
              >
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute ${item.textPosition} ${item.textColor} transition-opacity duration-300 group-hover:opacity-100`}>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                    <p className="text-sm opacity-90">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 italic">
              * El desayuno está incluido en su estadía y se sirve de 7:00 AM a 10:30 AM en nuestro comedor principal.
            </p>
          </div>
        </div>
      </section>

      {/* Horario y Ubicación */}
      <section className="py-16 bg-hotel-beige/30 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-hotel-verde-oscuro mb-8 text-center font-['Cormorant_Garamond']">
              Horario y Ubicación
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-hotel-verde-oscuro/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-hotel-verde-oscuro" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-hotel-verde-oscuro mb-2">Horario de Desayunos</h3>
                  <p className="text-gray-600">
                    Lunes a Domingo: 7:00 AM - 11:30 AM<br />
                    Desayuno a la habitación: 6:30 AM - 10:30 AM
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-hotel-verde-oscuro/10 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-hotel-verde-oscuro" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-hotel-verde-oscuro mb-2">Ubicación</h3>
                  <p className="text-gray-600">
                    Restaurante Principal<br />
                    Planta Baja del Hotel
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-hotel-verde-oscuro mb-4">Información Importante</h3>
              <p className="text-gray-600">
                El desayuno está incluido en la estadía para todos nuestros huéspedes. No se requiere reserva previa.
                Para cualquier consulta especial, no dude en contactar a nuestro personal de recepción.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Beneficios */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-hotel-verde-oscuro mb-12 font-['Cormorant_Garamond']">
            Nuestros Ingredientes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Coffee className="w-8 h-8 text-hotel-gold" />,
                title: 'Café de Especialidad',
                description: 'Café de grano tostado localmente, preparado al momento para garantizar el mejor sabor.'
              },
              {
                icon: <Utensils className="w-8 h-8 text-hotel-gold" />,
                title: 'Ingredientes Locales',
                description: 'Trabajamos con productores locales para ofrecer ingredientes frescos y de temporada.'
              },
              {
                icon: <span className="text-2xl">🍯</span>,
                title: 'Miel y Mermeladas Caseras',
                description: 'Endulzamos tus mañanas con miel de abeja local y mermeladas artesanales.'
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 mx-auto bg-hotel-verde-oscuro/10 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-hotel-verde-oscuro mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Desayunos;

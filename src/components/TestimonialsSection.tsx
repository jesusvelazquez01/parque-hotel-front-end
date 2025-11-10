
import React from 'react';
import TestimonialSlider from './TestimonialSlider';
import { Testimonial } from '@/types/testimonial';

const testimonials: Testimonial[] = [
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
  {
    id: 4,
    name: "JUAN PÉREZ",
    role: "Viajero frecuente",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    text: "La atención del personal es excepcional. Se preocupan por cada detalle para que tu estancia sea perfecta. El desayuno buffet es increíble, con opciones para todos los gustos.",
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-hotel-verde-oscuro">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-hotel-verde-claro mb-3 sm:mb-4 font-['Cormorant_Garamond']">
            Experiencias de Nuestros Huéspedes
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
            Descubra lo que nuestros huéspedes dicen sobre su estancia en el Parque Hotel
          </p>
        </div>
        
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

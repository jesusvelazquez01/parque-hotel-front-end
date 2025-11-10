
import React from 'react';
import { Card } from './ui/card';
import type { Testimonial } from '@/types/testimonial';
import { CircleUser } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className="h-[320px] sm:h-[350px] md:h-[380px] p-4 sm:p-6 md:p-8 bg-hotel-midnight border border-hotel-gold/20 hover:border-hotel-gold/40 transition-all duration-300 hover:shadow-xl hover:shadow-hotel-gold/5 group">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-hotel-gold/10 border-2 border-hotel-gold/30 group-hover:border-hotel-gold/50 transition-colors duration-300 flex-shrink-0">
            <CircleUser className="w-8 h-8 sm:w-10 sm:h-10 text-hotel-gold group-hover:text-hotel-accent transition-colors duration-300" />
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-semibold text-base sm:text-lg text-white font-['Cormorant_Garamond'] line-clamp-1">{testimonial.name}</h3>
            <p className="text-hotel-gold/80 text-xs sm:text-sm line-clamp-1">{testimonial.role}</p>
            <div className="flex gap-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-hotel-gold text-sm sm:text-base transition-all duration-300 group-hover:text-hotel-accent">★</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          <p className="text-white/80 leading-relaxed italic line-clamp-6 text-xs sm:text-sm">{testimonial.text}</p>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;

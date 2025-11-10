
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from "react";
import TestimonialCard from './TestimonialCard';
import type { Testimonial } from '@/types/testimonial';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useIsMobile } from "@/hooks/useIsMobile";

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

const TestimonialSlider = ({ testimonials }: TestimonialSliderProps) => {
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  
  const isMobile = useIsMobile();

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[autoplay.current]}
      className="w-full max-w-7xl mx-auto relative"
    >
      <div className="relative mx-4 sm:mx-8 md:mx-12">
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial) => (
            <CarouselItem 
              key={testimonial.id} 
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
      <div className={isMobile ? "mt-4 flex justify-center space-x-2" : "hidden md:block"}>
        {isMobile ? (
          <div className="flex space-x-2">
            <CarouselPrevious className="relative static translate-y-0 bg-hotel-gold/10 hover:bg-hotel-gold/20 border-hotel-gold/30" />
            <CarouselNext className="relative static translate-y-0 bg-hotel-gold/10 hover:bg-hotel-gold/20 border-hotel-gold/30" />
          </div>
        ) : (
          <>
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-hotel-gold/10 hover:bg-hotel-gold/20 border-hotel-gold/30" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-hotel-gold/10 hover:bg-hotel-gold/20 border-hotel-gold/30" />
          </>
        )}
      </div>
    </Carousel>
  );
};

export default TestimonialSlider;

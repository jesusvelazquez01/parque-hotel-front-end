
import React from 'react';
import { Testimonial } from '@/types/testimonial';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialsListProps {
  testimonials: Testimonial[];
  title?: string;
}

const TestimonialsList: React.FC<TestimonialsListProps> = ({ 
  testimonials,
  title = "What Our Guests Say"
}) => {
  return (
    <div className="py-12 bg-hotel-midnight">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-hotel-gold mb-8">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-hotel-slate border border-hotel-gold/20">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="w-12 h-12 border-2 border-hotel-gold">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=Guest";
                    }}
                  />
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-white">{testimonial.name}</h3>
                  <p className="text-sm text-white/70">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
                    />
                  ))}
                </div>
                <p className="text-white/90 italic">{testimonial.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsList;

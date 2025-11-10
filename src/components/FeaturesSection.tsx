
import React from 'react';
import { cn } from '@/lib/utils';
import AmenityIcon from './AmenityIcon';

const features = [
  {
    id: 1,
    name: 'Spa & Wellness',
    icon: 'spa',
    description: 'Rejuvenate your body and mind with our premium spa treatments.'
  },
  {
    id: 2,
    name: 'Fine Dining',
    icon: 'utensils',
    description: 'Experience culinary excellence with our award-winning chefs.'
  },
  {
    id: 3,
    name: 'Infinity Pool',
    icon: 'swimming-pool',
    description: 'Swim in our stunning infinity pool overlooking the city skyline.'
  },
  {
    id: 4,
    name: 'Concierge',
    icon: 'concierge-bell',
    description: '24/7 personalized service to fulfill your every request.'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-hotel-slate">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-hotel-gold mb-4 font-['Cormorant_Garamond']">
            Exclusive Amenities
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Immerse yourself in luxury with our world-class amenities designed to make your stay unforgettable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className={cn(
                "bg-hotel-midnight/50 backdrop-blur-sm p-6 rounded-lg border border-hotel-gold/20 transform transition-transform hover:-translate-y-1 hover:shadow-lg",
                "flex flex-col items-center text-center"
              )}
              style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
            >
              <div className="mb-4 p-3 bg-hotel-gold/10 rounded-full">
                <AmenityIcon name={feature.icon} className="h-8 w-8 text-hotel-gold" />
              </div>
              <h3 className="text-xl font-semibold text-hotel-gold mb-2">{feature.name}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

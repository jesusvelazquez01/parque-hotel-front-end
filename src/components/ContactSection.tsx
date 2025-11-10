
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface ContactSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  dark?: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ 
  className = "", 
  title = "Get in Touch", 
  subtitle = "We'd love to help you plan your dining experience",
  dark = true
}) => {
  const isMobile = useIsMobile();
  
  return (
    <section className={`py-8 sm:py-12 md:py-16 ${dark ? 'bg-hotel-midnight' : 'bg-white'} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className={`rounded-lg overflow-hidden shadow-xl ${dark ? 'bg-hotel-slate/50' : 'bg-white/90'} backdrop-blur-sm p-3 sm:p-4 md:p-6 lg:p-8 border ${dark ? 'border-hotel-gold/20' : 'border-gray-200'}`}>
              <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-5 font-['Cormorant_Garamond'] ${dark ? 'text-hotel-gold' : 'text-gray-800'}`}>
                {title}
              </h3>
              
              <p className={`mb-4 sm:mb-5 md:mb-7 text-xs sm:text-sm md:text-base ${dark ? 'text-white/80' : 'text-gray-600'}`}>
                {subtitle}
              </p>
              
              <div className="space-y-2 sm:space-y-3 md:space-y-5">
                <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                  <div className={cn(
                    `rounded-full flex items-center justify-center flex-shrink-0`,
                    isMobile ? "w-8 h-8" : "w-9 h-9 sm:w-11 sm:h-11",
                    dark ? 'bg-hotel-gold/20' : 'bg-hotel-gold/10'
                  )}>
                    <Phone className={cn(
                      isMobile ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5",
                      dark ? 'text-hotel-gold' : 'text-amber-600'
                    )} />
                  </div>
                  <div className="pt-1">
                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                    <div className={`text-xs sm:text-sm md:text-base ${dark ? 'text-white' : 'text-gray-800'}`}>
                      <a 
                        href="tel:8600467805" 
                        className={`block ${dark ? 'hover:text-hotel-gold' : 'hover:text-amber-600'} transition-colors`}
                      >
                        +91 8600467805
                      </a>
                      <a 
                        href="tel:8600357805" 
                        className={`block ${dark ? 'hover:text-hotel-gold' : 'hover:text-amber-600'} transition-colors`}
                      >
                        +91 8600357805
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                  <div className={cn(
                    `rounded-full flex items-center justify-center flex-shrink-0`,
                    isMobile ? "w-8 h-8" : "w-9 h-9 sm:w-11 sm:h-11",
                    dark ? 'bg-hotel-gold/20' : 'bg-hotel-gold/10'
                  )}>
                    <Mail className={cn(
                      isMobile ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5", 
                      dark ? 'text-hotel-gold' : 'text-amber-600'
                    )} />
                  </div>
                  <div className="pt-1">
                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                    <a 
                      href="mailto:connect@theroyalpavilion.in" 
                      className={`text-xs sm:text-sm md:text-base break-all ${dark ? 'text-white hover:text-hotel-gold' : 'text-gray-800 hover:text-amber-600'} transition-colors`}
                    >
                      connect@theroyalpavilion.in
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                  <div className={cn(
                    `rounded-full flex items-center justify-center flex-shrink-0`,
                    isMobile ? "w-8 h-8" : "w-9 h-9 sm:w-11 sm:h-11",
                    dark ? 'bg-hotel-gold/20' : 'bg-hotel-gold/10'
                  )}>
                    <MapPin className={cn(
                      isMobile ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5",
                      dark ? 'text-hotel-gold' : 'text-amber-600'
                    )} />
                  </div>
                  <div className="pt-1">
                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                    <p className={`text-xs sm:text-sm md:text-base ${dark ? 'text-white' : 'text-gray-800'}`}>
                      Plot no. 28, B-Ward, Opp. IT Park, Hockey Stadium Road, Kolhapur - 416012
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 md:space-y-6 mt-2 md:mt-0">
              <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 font-['Cormorant_Garamond'] ${dark ? 'text-hotel-gold' : 'text-gray-800'}`}>
                Make a Reservation
              </h3>
              
              <p className={`text-sm md:text-base ${dark ? 'text-white/80' : 'text-gray-600'}`}>
                We'd be delighted to assist with your dining experience. Use the button below to reserve your table.
              </p>
              
              <Link to="/contact" className="inline-block">
                <Button 
                  className={`${dark ? 'bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight' : 'bg-amber-600 hover:bg-amber-700 text-white'} px-6 py-2 transition-all duration-300`}
                >
                  Reserve Your Experience
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

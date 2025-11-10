
import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, UtensilsCrossed } from 'lucide-react';

const BookingNav: React.FC = () => {
  return (
    <section className="py-16 bg-hotel-midnight">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center font-semibold text-hotel-gold mb-12 font-['Cormorant_Garamond']">
          Make a Reservation
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <Link 
            to="/booking" 
            className="flex-1 bg-hotel-slate hover:bg-hotel-gold group transition-colors duration-300 rounded-lg overflow-hidden max-w-md mx-auto"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-hotel-gold group-hover:bg-hotel-midnight flex items-center justify-center mb-4 transition-colors duration-300">
                <BedDouble className="h-8 w-8 text-hotel-midnight group-hover:text-hotel-gold transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-hotel-gold group-hover:text-hotel-midnight mb-2 transition-colors duration-300">Hotel Booking</h3>
              <p className="text-white/80 group-hover:text-hotel-midnight/90 transition-colors duration-300">
                Reserve a luxurious room for your stay with us
              </p>
              <div className="mt-6 inline-block px-6 py-2 border-2 border-hotel-gold rounded-md text-hotel-gold group-hover:text-hotel-midnight group-hover:border-hotel-midnight font-medium transition-colors duration-300">
                Book Now
              </div>
            </div>
          </Link>
          
          <Link 
            to="/table-booking" 
            className="flex-1 bg-hotel-slate hover:bg-hotel-gold group transition-colors duration-300 rounded-lg overflow-hidden max-w-md mx-auto"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-hotel-gold group-hover:bg-hotel-midnight flex items-center justify-center mb-4 transition-colors duration-300">
                <UtensilsCrossed className="h-8 w-8 text-hotel-midnight group-hover:text-hotel-gold transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-hotel-gold group-hover:text-hotel-midnight mb-2 transition-colors duration-300">Table Reservation</h3>
              <p className="text-white/80 group-hover:text-hotel-midnight/90 transition-colors duration-300">
                Secure a table at our exquisite restaurant
              </p>
              <div className="mt-6 inline-block px-6 py-2 border-2 border-hotel-gold rounded-md text-hotel-gold group-hover:text-hotel-midnight group-hover:border-hotel-midnight font-medium transition-colors duration-300">
                Reserve Table
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BookingNav;

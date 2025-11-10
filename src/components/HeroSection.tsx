
import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center">
      <div className="absolute inset-0 z-10 bg-black/40"></div>
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://res.cloudinary.com/dbutykeeh/image/upload/v1745597826/hotel_hero_wb35of.jpg')"
        }}
      ></div>
      
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 font-['Cormorant_Garamond'] leading-tight">
          Welcome to The Royal Pavilion
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 px-2">
          Experience luxury and comfort in the heart of Kolhapur
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
          <Link to="/contact" className="w-full sm:w-auto inline-block bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight px-6 py-3 rounded-md font-semibold transition-colors duration-200 text-base sm:text-lg">
            Book Your Stay
          </Link>
          
          <Link to="/rooms" className="w-full sm:w-auto inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold transition-colors duration-200 text-base sm:text-lg hover:bg-white/10">
            Explore Rooms
          </Link>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Link to="/refund-request" className="text-white text-sm hover:text-hotel-gold transition-colors underline">
            Request a Refund
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
        <div className="flex flex-col items-center animate-bounce">
          <span className="text-white text-sm mb-2">Scroll Down</span>
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

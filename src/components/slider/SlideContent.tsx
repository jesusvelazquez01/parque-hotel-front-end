
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

interface SlideContentProps {
  currentIndex: number;
  index: number;
  title?: string;
  subtitle?: string;
}

const SlideContent: React.FC<SlideContentProps> = ({ 
  currentIndex, 
  index, 
  title, 
  subtitle 
}) => {
  if (!title && !subtitle) return null;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full p-4 sm:p-6 md:p-8 transform transition-all duration-700 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
      <div className="container mx-auto text-center sm:text-left">
        <AnimatePresence>
          {currentIndex === index && (
            <div className="mx-auto sm:mx-0 max-w-3xl">
              {title && (
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 font-['Cormorant_Garamond'] drop-shadow-lg"
                >
                  {title}
                </motion.h3>
              )}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm sm:text-base md:text-xl text-white/90 max-w-xl mx-auto sm:mx-0 drop-shadow-md"
                >
                  {subtitle}
                </motion.p>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4"
              >
                <a href="/contact" className="inline-block bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm md:text-base">
                  Book Your Stay
                </a>
                <a href="/contact" className="inline-block bg-transparent border border-white text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-md font-medium hover:bg-white/10 transition-colors duration-200 text-xs sm:text-sm md:text-base">
                  Contact Us
                </a>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SlideContent;

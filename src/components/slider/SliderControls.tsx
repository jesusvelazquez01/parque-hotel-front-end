
import React from 'react';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface SliderControlsProps {
  isHovering: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  showArrows: boolean;
}

const SliderControls: React.FC<SliderControlsProps> = ({
  isHovering,
  scrollPrev,
  scrollNext,
  showArrows
}) => {
  const isMobile = useIsMobile();
  
  if (!showArrows) return null;
  
  return (
    <>
      <motion.button
        onClick={scrollPrev}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-20 focus:outline-none",
          isMobile ? "left-0.5 sm:left-1" : "left-1 sm:left-2 md:left-4"
        )}
        aria-label="Previous slide"
        initial={{ opacity: isMobile ? 0.8 : 0.6 }}
        animate={{ opacity: isMobile ? 0.8 : (isHovering ? 1 : 0.6) }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={cn(
          "rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-hotel-gold/90 hover:text-hotel-midnight transition-all duration-300 shadow-lg",
          isMobile ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2 md:p-3 lg:p-4"
        )}>
          <ChevronLeft className={cn(
            isMobile ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
          )} />
        </div>
      </motion.button>

      <motion.button
        onClick={scrollNext}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-20 focus:outline-none",
          isMobile ? "right-0.5 sm:right-1" : "right-1 sm:right-2 md:right-4"
        )}
        aria-label="Next slide"
        initial={{ opacity: isMobile ? 0.8 : 0.6 }}
        animate={{ opacity: isMobile ? 0.8 : (isHovering ? 1 : 0.6) }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={cn(
          "rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-hotel-gold/90 hover:text-hotel-midnight transition-all duration-300 shadow-lg",
          isMobile ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2 md:p-3 lg:p-4"
        )}>
          <ChevronRight className={cn(
            isMobile ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
          )} />
        </div>
      </motion.button>
    </>
  );
};

export default SliderControls;

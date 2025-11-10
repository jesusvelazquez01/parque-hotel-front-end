
import React from 'react';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

interface SliderDotsProps {
  images: string[];
  currentIndex: number;
  scrollTo: (index: number) => void;
  showDots: boolean;
}

const SliderDots: React.FC<SliderDotsProps> = ({
  images,
  currentIndex,
  scrollTo,
  showDots
}) => {
  const isMobile = useIsMobile();
  
  if (!showDots || !images || images.length === 0) return null;
  
  return (
    <div className={cn(
      "absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/40 backdrop-blur-md rounded-full",
      isMobile ? "bottom-24" : "bottom-20 sm:bottom-16 md:bottom-14"
    )}>
      {images.map((_, index) => (
        <button
          key={index}
          className={cn(
            "transition-all duration-300 transform",
            currentIndex === index 
              ? "scale-100" 
              : "scale-75 opacity-70 hover:opacity-100 hover:scale-90"
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={currentIndex === index ? "true" : "false"}
        >
          <div className={cn(
            isMobile ? "w-1.5 h-1.5" : "w-2 h-2 sm:w-2.5 sm:h-2.5",
            "rounded-full",
            currentIndex === index 
              ? "bg-hotel-gold shadow-[0_0_5px_rgba(212,175,55,0.5)]" 
              : "bg-white/70 hover:bg-white"
          )}/>
        </button>
      ))}
    </div>
  );
};

export default SliderDots;

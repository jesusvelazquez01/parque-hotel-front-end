
import React from "react";
import { cn } from "@/lib/utils";
import SlideContent from "./slider/SlideContent";
import SliderControls from "./slider/SliderControls";
import SliderProgress from "./slider/SliderProgress";
import SliderDots from "./slider/SliderDots";
import { useSlider } from "@/hooks/useSlider";

interface RoyalSliderProps {
  images: string[];
  titles?: string[];
  subtitles?: string[];
  autoplay?: boolean;
  loop?: boolean;
  delay?: number;
  height?: string;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
}

const RoyalSlider = ({ 
  images, 
  titles,
  subtitles,
  autoplay = true, 
  loop = true, 
  delay = 5000,
  height = "h-[70vh]",
  showArrows = true,
  showDots = true,
  className = "",
  onSlideChange
}: RoyalSliderProps) => {
  const {
    emblaRef,
    currentIndex,
    slideProgress,
    isHovering,
    sliderRef,
    scrollPrev,
    scrollNext,
    scrollTo,
    setIsHovering
  } = useSlider({
    autoplay,
    loop,
    delay,
    onSlideChange
  });

  return (
    <div 
      ref={sliderRef}
      className={cn(
        "relative overflow-hidden rounded-lg shadow-xl",
        "transition-all duration-500 ease-in-out",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image Slider"
    >
      {/* Main Slider */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={`flex ${height}`}>
          {images.map((image, index) => (
            <div
              key={index}
              className="relative flex-none w-full h-full"
              aria-label={`Slide ${index + 1} of ${images.length}`}
              aria-hidden={currentIndex !== index}
              role="group"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-15000 ease-out"
                style={{
                  backgroundImage: `url('${image}')`,
                  transform: currentIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 15s ease-out'
                }}
              />
              
              {/* Enhanced gradients and overlays for richer appearance */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-hotel-midnight/15 mix-blend-color transition-opacity duration-500"></div>
              
              {/* Gold accent bottom bar with subtle shadow */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-hotel-gold/70 via-hotel-gold to-hotel-gold/70 shadow-[0_0_10px_rgba(212,175,55,0.7)]"></div>
              
              {/* Content with enhanced animations */}
              <SlideContent 
                currentIndex={currentIndex} 
                index={index}
                title={titles?.[index]}
                subtitle={subtitles?.[index]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <SliderControls 
        isHovering={isHovering}
        scrollPrev={scrollPrev}
        scrollNext={scrollNext}
        showArrows={showArrows}
      />

      {/* Progress Bar */}
      <SliderProgress 
        slideProgress={slideProgress}
        showDots={showDots}
      />

      {/* Dots Navigation */}
      <SliderDots
        images={images}
        currentIndex={currentIndex}
        scrollTo={scrollTo}
        showDots={showDots}
      />
    </div>
  );
};

export default RoyalSlider;

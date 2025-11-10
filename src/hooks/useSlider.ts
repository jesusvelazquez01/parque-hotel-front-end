
import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoPlay from "embla-carousel-autoplay";

interface UseSliderProps {
  autoplay?: boolean;
  loop?: boolean;
  delay?: number;
  onSlideChange?: (index: number) => void;
}

export const useSlider = ({
  autoplay = true,
  loop = true,
  delay = 5000,
  onSlideChange
}: UseSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Initialize Embla Carousel with AutoPlay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop, 
    skipSnaps: false,
    dragFree: false
  }, autoplay ? [AutoPlay({ delay, stopOnInteraction: false, stopOnMouseEnter: true })] : []);

  // Slide progress state
  const [slideProgress, setSlideProgress] = useState(0);

  // Setup Embla Carousel event handlers
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
      if (onSlideChange) {
        onSlideChange(emblaApi.selectedScrollSnap());
      }
    };

    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      const slideProgress = emblaApi.scrollSnapList().length > 1 
        ? Math.max(0, Math.min(1, progress)) 
        : 0;
      setSlideProgress(slideProgress * 100);
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", onScroll);

    // Initial call
    onSelect();
    onScroll();
    
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", onScroll);
    };
  }, [emblaApi, onSlideChange]);

  // Slide navigation handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sliderRef.current && isHovering) {
        if (e.key === "ArrowLeft") {
          scrollPrev();
        } else if (e.key === "ArrowRight") {
          scrollNext();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollPrev, scrollNext, isHovering]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (emblaApi) emblaApi.reInit();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [emblaApi]);

  return {
    emblaRef,
    currentIndex,
    slideProgress,
    isHovering,
    sliderRef,
    scrollPrev,
    scrollNext,
    scrollTo,
    setIsHovering
  };
};


import React from 'react';

interface SliderProgressProps {
  slideProgress: number;
  showDots: boolean;
}

const SliderProgress: React.FC<SliderProgressProps> = ({ slideProgress, showDots }) => {
  if (showDots) return null;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-0" data-testid="slider-progress">
      <div className="h-1 w-full bg-black/30 backdrop-blur-sm">
        <div 
          className="h-full bg-hotel-gold transition-all ease-out"
          style={{ 
            width: `${slideProgress || 0}%`,
            transitionDuration: '300ms'
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(slideProgress || 0)}
        ></div>
      </div>
    </div>
  );
};

export default SliderProgress;

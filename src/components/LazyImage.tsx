import React, { useState, useEffect, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  fallbackSrc?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholderColor?: string;
  imageSrcArray?: string[]; // Add support for multiple images
  primaryImageOnly?: boolean; // Option to show only primary image
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  fallbackSrc = '/placeholder.svg',
  objectFit = 'cover',
  placeholderColor = 'bg-gray-200',
  imageSrcArray,
  primaryImageOnly = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Handle image loading with retries
  const loadImage = useCallback((imageUrl: string, retryCount = 0) => {
    if (retryCount >= 2) {
      console.error(`Failed to load image after retries: ${imageUrl}`);
      setHasError(true);
      return;
    }
    
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
      setImageSrc(imageUrl);
      setIsLoaded(true);
      setHasError(false);
    };
    
    img.onerror = () => {
      console.warn(`Failed to load image (attempt ${retryCount + 1}): ${imageUrl}`);
      // Wait a moment before retry
      setTimeout(() => {
        loadImage(imageUrl, retryCount + 1);
      }, 1000);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setHasError(false);
    setImageSrc(null);
    
    // If we have an array of images, use the first one
    let imageUrl = src;
    
    if (imageSrcArray && imageSrcArray.length > 0) {
      // If primaryImageOnly is true, we look for primary image
      if (primaryImageOnly) {
        // In our context, the primary image is always the first in the array
        imageUrl = imageSrcArray[0];
      } else {
        // Otherwise just use the first image
        imageUrl = imageSrcArray[0];
      }
    }
    
    if (!imageUrl) {
      setHasError(true);
      return;
    }
    
    // If src is a relative path without protocol, make sure it's properly formed
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
      imageUrl = `/${imageUrl}`;
    }
    
    return loadImage(imageUrl);
  }, [src, imageSrcArray, primaryImageOnly, loadImage]);

  return (
    <div 
      className={`relative ${className}`} 
      style={{ 
        aspectRatio: width && height ? `${width}/${height}` : 'auto',
        width: width || 'auto',
        height: height || 'auto'
      }}
    >
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 ${placeholderColor} animate-pulse flex items-center justify-center`}>
          <div className="w-10 h-10 border-4 border-hotel-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={hasError ? fallbackSrc : (imageSrc || fallbackSrc)}
        alt={alt}
        className={`w-full h-full object-${objectFit} transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'} duration-300`}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default LazyImage;

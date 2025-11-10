
import React from 'react';
import { Image } from 'lucide-react';

interface NoImagesPlaceholderProps {
  message?: string;
  subMessage?: string;
}

const NoImagesPlaceholder: React.FC<NoImagesPlaceholderProps> = ({
  message = "No images available for this room",
  subMessage = "Upload an image to display it here"
}) => {
  return (
    <div className="bg-hotel-slate rounded-md p-8 text-center">
      <Image className="mx-auto h-12 w-12 text-white/50 mb-4" />
      <p className="text-white/70">{message}</p>
      <p className="text-white/50 text-sm mt-2">{subMessage}</p>
    </div>
  );
};

export default NoImagesPlaceholder;

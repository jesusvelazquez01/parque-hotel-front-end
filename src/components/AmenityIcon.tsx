
import React from "react";
import { Bed, Utensils, Image, Clock, Users, Bath } from "lucide-react";

interface AmenityIconProps {
  name: string;
  className?: string;
}

const AmenityIcon: React.FC<AmenityIconProps> = ({ name, className }) => {
  // Map icon name to Lucide icon component
  const getIcon = () => {
    switch (name) {
      case "bed":
        return <Bed className={className || "h-12 w-12 text-hotel-gold"} />;
      case "utensils":
        return <Utensils className={className || "h-12 w-12 text-hotel-gold"} />;
      case "swimming-pool":
        return <Bath className={className || "h-12 w-12 text-hotel-gold"} />;
      case "concierge-bell":
        return <Users className={className || "h-12 w-12 text-hotel-gold"} />;
      case "spa":
        return <Bath className={className || "h-12 w-12 text-hotel-gold"} />; // Using Bath as substitute for Spa
      default:
        return <Bed className={className || "h-12 w-12 text-hotel-gold"} />;
    }
  };

  return getIcon();
};

export default AmenityIcon;

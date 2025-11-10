
import React from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";

const Logo = () => {
  const isMobile = useIsMobile();
  
  return (
    <Link to="/" className="flex items-center">
      <img 
        src="/lovable-uploads/29a8d07f-d88a-4169-8e28-2a8e6dc62932.png"
        alt="The Royal Pavilion Logo" 
        className={`transition-all duration-300 ${isMobile ? "h-10 w-auto" : "h-16 w-auto"}`}
        loading="eager" // Make logo load with high priority
        width={isMobile ? "80" : "128"} // Add width attribute for better layout stability
        height={isMobile ? "40" : "64"} // Add height attribute for better layout stability
      />
    </Link>
  );
};

export default Logo;

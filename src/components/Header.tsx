
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Logo from './Logo';

// Updated restaurantMenuItems
const restaurantMenuItems = [
  { label: "Fusion Feast", href: "/fusion-feast" },
  { label: "Flames", href: "/flames" },
  { label: "Majestic Banquet", href: "/majestic-banquetes" }, // Updated from "Majestic Banquetes" to "Majestic Banquet"
];

const Header = () => {
  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
          </div>
          <Navbar />
        </div>
      </div>
    </header>
  );
};

export default Header;

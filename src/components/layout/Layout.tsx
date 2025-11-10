
import React from "react";
import Navbar from "../Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import AdminHeader from "../admin/layout/AdminHeader";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden ${isAdminRoute ? 'bg-hotel-verde-oscuro' : ''}`}>
      {isAdminRoute ? <AdminHeader /> : <Navbar />}
      <main className="flex-grow overflow-hidden bg-white">{children}</main>
      {!isAdminRoute && !hideFooter && <Footer />}
    </div>
  );
};

export default Layout;

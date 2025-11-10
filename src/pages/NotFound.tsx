
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-hotel-slate to-hotel-midnight py-20">
        <div className="max-w-md w-full px-6 py-12 bg-hotel-midnight/80 backdrop-blur-md rounded-xl border border-hotel-gold/20 shadow-xl text-center">
          <h1 className="text-6xl font-bold mb-4 text-hotel-gold font-['Cormorant_Garamond']">404</h1>
          <div className="w-16 h-1 bg-hotel-gold mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
          <p className="text-white/70 mb-8">
            We couldn't find the page you were looking for. The page might have been moved, deleted, or never existed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button className="w-full sm:w-auto bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight flex items-center gap-2">
                <Home size={16} />
                Return Home
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="outline" className="w-full sm:w-auto border-hotel-gold/30 text-hotel-gold hover:bg-hotel-gold/10 flex items-center gap-2">
                <Search size={16} />
                Browse Rooms
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto text-white/70 hover:text-white flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

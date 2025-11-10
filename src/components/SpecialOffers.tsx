
import React, { useState, useEffect } from 'react';
import { useOffers } from '@/hooks/useOffers';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  BadgePercent, 
  BadgeDollarSign, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Gift,
  Scroll
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Slider } from "@/components/ui/slider";

const SpecialOffers: React.FC = () => {
  const { activeOffers, isLoadingActive } = useOffers();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || !activeOffers || activeOffers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === activeOffers.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, activeOffers]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const handleViewOffer = (offer: any) => {
    setSelectedOffer(offer);
    setIsDialogOpen(true);
  };

  const getDiscountBadge = (offer: any) => {
    if (offer.discount_type === 'percentage') {
      return (
        <div className="absolute -top-3 -right-3 bg-hotel-gold text-hotel-midnight rounded-full p-3 shadow-lg transform rotate-12 flex items-center justify-center z-10">
          <BadgePercent className="h-5 w-5 mr-1" />
          <span className="font-bold text-lg">{offer.discount_value}%</span>
        </div>
      );
    } else {
      return (
        <div className="absolute -top-3 -right-3 bg-hotel-gold text-hotel-midnight rounded-full p-3 shadow-lg transform rotate-12 flex items-center justify-center z-10">
          <BadgeDollarSign className="h-5 w-5 mr-1" />
          <span className="font-bold text-lg">{offer.discount_value}</span>
        </div>
      );
    }
  };

  if (isLoadingActive) {
    return (
      <div className="py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hotel-gold"></div>
      </div>
    );
  }

  if (!activeOffers || activeOffers.length === 0) {
    return null; // Don't show the section if there are no offers
  }

  return (
    <section className="py-16 px-4 relative bg-gradient-to-b from-hotel-midnight to-hotel-slate overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-hotel-gold/5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-hotel-gold/5 blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-center mb-4"
          >
            <div className="h-px w-12 bg-hotel-gold"></div>
            <span className="mx-4 text-hotel-gold font-medium px-4 py-2 rounded-full border border-hotel-gold/30 text-sm flex items-center">
              <Gift className="h-4 w-4 mr-2" /> EXCLUSIVE OFFERS
            </span>
            <div className="h-px w-12 bg-hotel-gold"></div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-6 font-['Cormorant_Garamond']"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-hotel-gold">Special</span> Offers & Promotions
          </motion.h2>
          
          <motion.div 
            className="w-24 h-px bg-hotel-gold mx-auto mb-6"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          ></motion.div>
          
          <motion.p 
            className="text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Take advantage of our exclusive deals and promotions for an unforgettable luxury experience
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "center",
              loop: activeOffers.length > 1,
            }}
            className="w-full"
            setApi={(api) => {
              api?.on("select", () => {
                const selectedSlide = api.selectedScrollSnap();
                setCurrentSlide(selectedSlide);
              });
            }}
          >
            <CarouselContent>
              {activeOffers.map((offer) => (
                <CarouselItem key={offer.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <div className="relative h-full">
                    {/* Discount Badge */}
                    {getDiscountBadge(offer)}
                    
                    <div className="bg-gradient-to-br from-hotel-slate/80 to-hotel-midnight/95 rounded-lg overflow-hidden shadow-2xl border border-hotel-gold/10 h-full flex flex-col transform transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hotel-gold to-transparent"></div>
                      
                      {offer.image_url ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={offer.image_url}
                            alt={offer.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-hotel-midnight to-transparent opacity-50"></div>
                        </div>
                      ) : (
                        <div className="h-24 bg-gradient-to-r from-hotel-midnight/50 to-hotel-slate/50 flex items-center justify-center">
                          <Scroll className="h-12 w-12 text-hotel-gold/50" />
                        </div>
                      )}
                      
                      <div className="p-6 flex-grow flex flex-col relative">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-hotel-gold transition-colors duration-300">{offer.title}</h3>
                        
                        {offer.short_description && (
                          <p className="text-white/70 mb-4">{offer.short_description}</p>
                        )}

                        <div className="bg-hotel-midnight/50 rounded-lg p-4 mb-4 border border-hotel-gold/10">
                          <div className="text-xl font-bold text-hotel-gold">
                            Save {offer.discount_value}{offer.discount_type === 'percentage' ? '%' : ' INR'}
                          </div>
                          <div className="flex items-center text-white/70 text-sm mt-2">
                            <Clock className="h-4 w-4 mr-2 text-hotel-gold/70" />
                            Valid until {formatDate(offer.end_date)}
                          </div>
                        </div>

                        {offer.coupon_code && (
                          <div className="mb-4 flex items-center">
                            <div className="flex-1 bg-hotel-midnight/50 border border-dashed border-hotel-gold/30 rounded-lg p-2 text-center">
                              <span className="font-mono font-bold tracking-wider text-white">
                                {offer.coupon_code}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyCode(offer.coupon_code!)}
                              className={`ml-2 border-hotel-gold/30 text-white hover:bg-hotel-gold hover:text-hotel-midnight ${
                                copiedCode === offer.coupon_code
                                  ? "bg-hotel-gold text-hotel-midnight"
                                  : ""
                              }`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="mt-auto flex flex-col gap-2">
                          <Button 
                            variant="outline"
                            className="w-full border-hotel-gold/30 text-white hover:bg-transparent hover:text-hotel-gold hover:border-hotel-gold"
                            onClick={() => handleViewOffer(offer)}
                          >
                            View Details
                          </Button>
                          <Button 
                            className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
                            onClick={() => window.location.href = '/hotel-booking'}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="hidden md:flex justify-center mt-8">
              <CarouselPrevious className="relative -left-0 mx-2 bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent hover:text-hotel-midnight" />
              <CarouselNext className="relative -right-0 mx-2 bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent hover:text-hotel-midnight" />
            </div>
          </Carousel>

          {/* Indicators */}
          {activeOffers.length > 1 && (
            <div className="mt-8 flex justify-center items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-hotel-gold/30 text-white mr-4 hover:bg-hotel-gold hover:text-hotel-midnight"
                onClick={() => setAutoplay(!autoplay)}
              >
                {autoplay ? (
                  <span className="text-xs">II</span>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex-1 max-w-[240px]">
                <Slider
                  value={[currentSlide]}
                  max={activeOffers.length - 1}
                  step={1}
                  onValueChange={(val) => {
                    setCurrentSlide(val[0]);
                    // Find the carousel API and set the slide
                    const carousel = document.querySelector('[data-carousel="offers"]');
                    // This is just for visual effect, actual slide is controlled by carousel
                  }}
                />
              </div>
              
              <div className="ml-4 text-white/70 text-sm">
                {currentSlide + 1} / {activeOffers.length}
              </div>
            </div>
          )}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="md:hidden flex justify-center mt-8">
          <Button 
            variant="outline" 
            className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight mx-auto"
            onClick={() => window.location.href = '/hotel-booking'}
          >
            View All Offers
          </Button>
        </div>
      </div>

      {/* Offer Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-hotel-slate to-hotel-midnight text-white border border-hotel-gold/20">
          {selectedOffer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-hotel-gold">
                  {selectedOffer.title}
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  Valid until {formatDate(selectedOffer.end_date)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {selectedOffer.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={selectedOffer.image_url}
                      alt={selectedOffer.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-hotel-midnight/50 rounded-lg p-4 border border-hotel-gold/20">
                    <h3 className="text-lg font-semibold text-hotel-gold mb-2">Offer Details</h3>
                    <p className="text-white/90">{selectedOffer.description}</p>
                  </div>
                  
                  <div className="bg-hotel-midnight/50 rounded-lg p-4 border border-hotel-gold/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/70">Discount</div>
                        <div className="text-2xl font-bold text-hotel-gold">
                          {selectedOffer.discount_value}
                          {selectedOffer.discount_type === 'percentage' ? '%' : ' INR'}
                        </div>
                      </div>
                      
                      {selectedOffer.discount_type === 'percentage' ? (
                        <BadgePercent className="h-8 w-8 text-hotel-gold" />
                      ) : (
                        <BadgeDollarSign className="h-8 w-8 text-hotel-gold" />
                      )}
                    </div>
                  </div>
                  
                  {selectedOffer.coupon_code && (
                    <div className="bg-hotel-midnight/50 rounded-lg p-4 border border-hotel-gold/20">
                      <h3 className="text-lg font-semibold text-hotel-gold mb-2">Coupon Code</h3>
                      <div className="flex items-center">
                        <div className="flex-1 bg-black/20 border border-dashed border-hotel-gold/30 rounded p-3 text-center">
                          <span className="font-mono font-bold tracking-wider text-white text-lg">
                            {selectedOffer.coupon_code}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleCopyCode(selectedOffer.coupon_code)}
                          className="ml-2 border-hotel-gold/30 text-white hover:bg-hotel-gold hover:text-hotel-midnight"
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        Use this code during checkout to avail the offer
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
                    onClick={() => {
                      setIsDialogOpen(false);
                      window.location.href = '/hotel-booking';
                    }}
                  >
                    Book Now and Avail Offer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SpecialOffers;

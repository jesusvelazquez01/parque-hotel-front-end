
import React from 'react';
import { Offer } from '@/hooks/useOffers';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface OfferPreviewProps {
  offer: Offer;
}

const OfferPreview: React.FC<OfferPreviewProps> = ({ offer }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const handleCopyCode = () => {
    if (offer.coupon_code) {
      navigator.clipboard.writeText(offer.coupon_code);
    }
  };

  const isOfferActive = () => {
    const now = new Date();
    const start = new Date(offer.start_date);
    const end = new Date(offer.end_date);
    return offer.status === 'active' && now >= start && now <= end;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
      {offer.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={offer.image_url}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold text-gray-800">{offer.title}</h3>
          {isOfferActive() ? (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              Inactive
            </span>
          )}
        </div>
        
        {offer.short_description && (
          <p className="text-gray-600 mt-2">{offer.short_description}</p>
        )}

        <div className="mt-4 bg-gray-50 rounded p-4">
          <div className="text-xl font-bold text-gray-900">
            Save {offer.discount_value}{offer.discount_type === 'percentage' ? '%' : ' INR'}
          </div>
          <p className="text-gray-500 text-sm">
            Valid from {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
          </p>
        </div>

        {offer.coupon_code && (
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-100 border border-dashed border-gray-300 rounded p-2 text-center">
              <span className="font-mono font-bold tracking-wider text-gray-800">
                {offer.coupon_code}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="ml-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-4 text-gray-600">
          <h4 className="font-semibold text-gray-800">Details:</h4>
          <p className="mt-1">{offer.description}</p>
        </div>

        <div className="mt-6">
          <Button className="w-full bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfferPreview;

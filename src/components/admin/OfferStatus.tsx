
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Offer } from '@/hooks/useOffers';

interface OfferStatusProps {
  offer: Offer;
}

export const OfferStatus: React.FC<OfferStatusProps> = ({ offer }) => {
  const now = new Date();
  const startDate = new Date(offer.start_date);
  const endDate = new Date(offer.end_date);

  const isActive = offer.status === 'active';
  const hasStarted = now >= startDate;
  const hasEnded = now > endDate;

  if (!isActive) {
    return (
      <Badge variant="outline" className="bg-gray-200 text-gray-700 border-gray-300">
        Inactive
      </Badge>
    );
  }

  if (hasEnded) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        Expired
      </Badge>
    );
  }

  if (!hasStarted) {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
        Scheduled
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
      Active
    </Badge>
  );
};

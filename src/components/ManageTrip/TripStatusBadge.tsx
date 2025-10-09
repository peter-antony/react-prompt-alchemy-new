import React from 'react';
import { Badge } from '@/components/ui/badge';
import { manageTripStore } from '@/stores/mangeTripStore';

export const TripStatusBadge = () => {
  const { tripData } = manageTripStore();
  const { Header } = tripData || {};
  if (!Header?.TripNo) return null;

  return (
    <div className="flex items-center gap-4 mb-6 font-semibold">
      <div>{Header?.TripNo}</div>
      <Badge className="badge-fresh-green rounded-2xl">
        {Header?.TripStatus}
      </Badge>
      <Badge className="badge-orange rounded-2xl">
        {Header?.BillingStatus}
      </Badge>
    </div>
  );
};

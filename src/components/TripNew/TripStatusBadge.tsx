import React from 'react';
import { Badge } from '@/components/ui/badge';

export const TripStatusBadge = () => (
  <div className="flex items-center gap-4 mb-6 font-semibold">
    <div>TRIP00000001</div>
    <Badge className="badge-fresh-green rounded-2xl">
      Released
    </Badge>
    <Badge className="badge-orange rounded-2xl">
      Draft Bill Raised
    </Badge>
  </div>
);
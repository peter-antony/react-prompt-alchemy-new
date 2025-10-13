import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TripStatusBadgeProps {
  status?: string;
}

export const TripStatusBadge = ({ status }: TripStatusBadgeProps) => (
  <div className="flex items-center gap-2 mb-6">
    <Badge className="bg-status-released text-white px-3 py-1">
      {status || 'Released'}
    </Badge>
    <Badge className="bg-status-draft text-white px-3 py-1">
      Draft Bill Raised
    </Badge>
  </div>
);
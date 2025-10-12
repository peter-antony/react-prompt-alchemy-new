import React from 'react';
import { Badge } from '@/components/ui/badge';
import { manageTripStore } from '@/stores/mangeTripStore';

export const TripStatusBadge = () => {
  const { tripData } = manageTripStore();
  const { Header } = tripData || {};
  const statusColors: Record<string, string> = {
    // Trip Status colors
    Released: "badge-fresh-green rounded-2xl",
    Executed: "badge-purple rounded-2xl",
    Fresh: "badge-blue rounded-2xl",
    Cancelled: "badge-red rounded-2xl",
    Deleted: "badge-red rounded-2xl",
    Save: "badge-green rounded-2xl",
    "Under Amendment": "badge-orange rounded-2xl",
    Confirmed: "badge-green rounded-2xl",
    Initiated: "badge-blue rounded-2xl",
    "Under Execution": "badge-purple rounded-2xl",

    // Trip Billing Status colors
    "Draft Bill Raised": "badge-orange rounded-2xl",
    "Not Eligible": "badge-red rounded-2xl",
    "Revenue leakage": "badge-red rounded-2xl",
    "Invoice Created": "badge-blue rounded-2xl",
    "Invoice Approved": "badge-fresh-green rounded-2xl",
  };
  if (!Header?.TripNo) return null;

  const getStatusClass = (status?: string): string => {
    return statusColors[status ?? ""] || "badge-gray rounded-2xl";
  };

  return (
    <div className="flex items-center gap-4 mb-6 font-semibold">
      <div>{Header?.TripNo}</div>
      {Header?.TripStatus && <Badge className={getStatusClass(Header?.TripStatus)}>
        {Header?.TripStatus}
      </Badge>
      }
      {Header?.BillingStatus && <Badge className={getStatusClass(Header?.BillingStatus)}>
        {Header?.BillingStatus}
      </Badge>
      }
    </div>
  );
};

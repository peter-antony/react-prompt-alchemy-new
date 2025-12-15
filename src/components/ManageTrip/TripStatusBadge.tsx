import React from 'react';
import { Badge } from '@/components/ui/badge';
import { manageTripStore } from '@/stores/mangeTripStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { format } from 'date-fns';

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd-MM-yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6 font-semibold">
      <div>{Header?.TripNo}</div>
      {Header?.TripStatus && (
        <div className="flex items-center gap-3">
          <Badge className={getStatusClass(Header?.TripStatus)}>
            {Header?.TripStatus}
          </Badge>
          {Header?.TripStatus === 'Cancelled' && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer relative flex justify-center">
                    <Info size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  side="bottom"
                  align="start"
                  className="p-0 w-80 bg-white border border-gray-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50"
                >
                  <div className="border-b border-gray-100 bg-blue-50 text-xs font-semibold text-gray-700 px-3 py-3 rounded-t-xl">
                    Cancellation Details
                  </div>

                  <div className="p-3 text-xs text-gray-700 space-y-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">Cancellation Requested Date</div>
                      <div className="text-gray-500">
                        {formatDate(Header?.Cancellation?.CancellationRequestedDateTime)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">Reason Code</div>
                      <div className="text-gray-500">
                        {Header?.Cancellation?.CancellationReasonCode
                          ? `${Header?.Cancellation?.CancellationReasonCode} - `
                          : ""}
                        {Header?.Cancellation?.CancellationReasonCodeDescription || "-"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">Remarks</div>
                      <div className="text-gray-500 break-words">
                        {Header?.Cancellation?.CancellationRemarks || "-"}
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {Header?.BillingStatus && <Badge className={getStatusClass(Header?.BillingStatus)}>
        {Header?.BillingStatus}
      </Badge>
      }
    </div>
  );
};

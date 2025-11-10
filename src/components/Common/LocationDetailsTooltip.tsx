import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Package } from 'lucide-react';

interface LocationDetailsTooltipProps {
  row: any; // You might want to define a more specific type for row
  type: 'LegLocationFormat' | 'LegLocationFormat'; // Example types
  value?: any; // Add value prop
  propKey?: string; // Add key prop, renamed to propKey to avoid conflict with React's key
}

const LocationDetailsTooltip: React.FC<LocationDetailsTooltipProps> = ({ row, type, value, propKey }) => {

  const renderTooltipContent = () => {
    if (propKey === "ArrivalPoint" && type === "LegLocationFormat") {
      return (
        <div className="space-y-2">
          <div>
            <div className="font-medium text-gray-900">{row?.DeparturePointDescription || "-"}</div>
            <div className="text-gray-500">{row?.DeparturePoint || "-"}</div>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="font-medium text-gray-900">{row?.ArrivalPointDescription || "-"}</div>
            <div className="text-gray-500">{row?.ArrivalPoint || "-"}</div>
          </div>
        </div>
      );
    }

    if (propKey === "PlannedActual" && type === "LegLocationFormat") {
      const planned = row?.Consignment?.[0]?.Planned?.[0] || {};
      const events = row?.Consignment?.[0] || {};
      return (
        <div className="space-y-2">
          {[
            { label: "Wagon Quantity", value: `${events.TotalWagons || "-"} Nos` },
            { label: "Container Quantity", value: `${events.TotalContainer || "-"} Nos` },
            { label: "Product Weight", value: `${events.TotalProductWeight || "-"} Ton` },
            { label: "THU Quantity", value: `${events.TotalTHU || "-"} Nos` },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-600">{item.label}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-[1px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    // <TooltipProvider>
    //   <Tooltip>
    //     <TooltipTrigger asChild>
    //       <div className={`ml-2 cursor-pointer relative ${propKey != 'ArrivalPoint' ? 'w-full flex justify-center' : ''}`}>
    //         <Info size={16} />
    //       </div>
    //     </TooltipTrigger>
    //     <TooltipContent side="bottom" className="p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
    //       <div className="text-xs font-semibold mb-1">
    //         {propKey === 'ArrivalPoint' ? 'Location Details' : 'Planned/Actual Details'}
    //       </div>
    //       {renderTooltipContent()}
    //     </TooltipContent>
    //   </Tooltip>
    // </TooltipProvider>
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`ml-2 cursor-pointer relative ${propKey !== 'ArrivalPoint' ? 'w-full flex justify-center' : ''
              }`}
          >
            <Info size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="start"
          className="p-0 w-60 bg-white border border-gray-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50"
        >
          <div className="border-b border-gray-100 bg-blue-50 text-xs font-semibold text-gray-700 px-3 py-3 rounded-t-xl">
            {propKey === 'ArrivalPoint' ? 'Location Details' : 'Planned/Actual Details'}
          </div>

          <div className="p-3 text-xs text-gray-700 space-y-2">
            {renderTooltipContent()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LocationDetailsTooltip;

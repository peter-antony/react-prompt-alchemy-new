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
    if (propKey === "ArrivalPoint" && type === 'LegLocationFormat') {
      return (
        <div className="text-xs">
          <div>{row?.ArrivalPoint || '-'}</div>
          <div>{row?.ArrivalPointDescription || '-'}</div>
          <hr />
          <div>{row?.DeparturePoint || '-'}</div>
          <div>{row?.DeparturePointDescription || '-'}</div>
        </div>
      );
    } else if (propKey === 'PlannedActual' && type === 'LegLocationFormat') {
      return (
        <div className="text-xs space-y-1">
          <div className="flex justify-between"><span className='mr-3'>Wagon Quantity</span><span>{row?.Consignment?.[0]?.Planned?.[0]?.WagonQty || '-'} Nos</span></div>
          <div className="flex justify-between"><span className='mr-3'>Container Quantity</span><span>{row?.Consignment?.[0]?.Planned?.[0]?.ContainerQty || '-'} Nos</span></div>
          <div className="flex justify-between"><span className='mr-3'>Product Weight</span><span>{row?.Consignment?.[0]?.Planned?.[0]?.ProductWeight || '-'} Ton</span></div>
          <div className="flex justify-between"><span className='mr-3'>THU Quantity</span><span>{row?.Consignment?.[0]?.Planned?.[0]?.ThuQty || '-'} Nos</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`ml-2 cursor-pointer relative ${propKey != 'ArrivalPoint' ? 'w-full flex justify-center' : ''}`}>
            <Info size={16} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="text-xs font-semibold mb-1">
            {propKey === 'ArrivalPoint' ? 'Location Details' : 'Planned/Actual Details'}
          </div>
          {renderTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LocationDetailsTooltip;

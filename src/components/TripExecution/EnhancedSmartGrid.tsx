import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Info, 
  CheckCircle, 
  Package, 
  Edit3 
} from 'lucide-react';

interface ActivityData {
  sno: number;
  behaviour: 'pickup' | 'via' | 'bhub';
  location: string;
  locationDetails?: { code: string; name: string }[];
  plannedActual: string;
  plannedActualDetails?: { 
    wagonQuantity: string;
    containerQuantity: string;
    productWeight: string;
    thuQuantity: string;
  };
  consignment: string;
  status: 'completed' | 'in-progress' | 'pending';
}

const activitiesData: ActivityData[] = [
  {
    sno: 1,
    behaviour: 'pickup',
    location: 'BER-BER',
    locationDetails: [
      { code: 'BER', name: 'Berlin' },
      { code: 'BER', name: 'Berlin' }
    ],
    plannedActual: 'Planned: 12:00\nActual: 12:15',
    plannedActualDetails: {
      wagonQuantity: '12 Nos',
      containerQuantity: '12 Nos',
      productWeight: '23 Ton',
      thuQuantity: '12 Nos'
    },
    consignment: 'CON001',
    status: 'completed'
  },
  {
    sno: 2,
    behaviour: 'via',
    location: 'BER-FRK',
    plannedActual: 'Planned: 18:00\nActual: -',
    consignment: 'CON001',
    status: 'completed'
  },
  {
    sno: 3,
    behaviour: 'bhub',
    location: 'FRK-PAR',
    plannedActual: 'Planned: 06:00\nActual: -',
    consignment: 'CON001',
    status: 'completed'
  }
];

const BehaviorBadge = ({ behavior }: { behavior: 'pickup' | 'via' | 'bhub' }) => {
  const config = {
    pickup: { label: 'Pickup', className: 'bg-behavior-pickup text-behavior-pickup-text border-behavior-pickup-text/20' },
    via: { label: 'Via', className: 'bg-pink-50 text-behavior-via-text border-behavior-via-text/20' },
    bhub: { label: 'Bhub', className: 'bg-teal-50 text-behavior-bhub-text border-behavior-bhub-text/20' }
  };
  
  return (
    <Badge variant="outline" className={`${config[behavior].className} border`}>
      {config[behavior].label}
    </Badge>
  );
};

const LocationCell = ({ location, details }: { location: string; details?: { code: string; name: string }[] }) => {
  if (!details) return <span className="text-sm">{location}</span>;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-sm">{location}</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Location Details</h4>
            {details.map((detail, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                <span className="font-medium">{detail.code}</span>
                <div className="text-xs">{detail.name}</div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const PlannedActualCell = ({ plannedActual, details }: { 
  plannedActual: string; 
  details?: { 
    wagonQuantity: string;
    containerQuantity: string;
    productWeight: string;
    thuQuantity: string;
  }
}) => {
  if (!details) {
    return (
      <div className="flex items-center gap-1">
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer">
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Planned/Actual Details</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Wagon Quantity</span>
                <span className="text-primary font-medium">{details.wagonQuantity}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Container Quantity</span>
                <span className="text-primary font-medium">{details.containerQuantity}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Product Weight</span>
                <span className="text-primary font-medium">{details.productWeight}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">THU Quantity</span>
                <span className="text-primary font-medium">{details.thuQuantity}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const EnhancedSmartGrid = () => {
  return (
    <div className="space-y-4">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
            <span className="text-white text-xs font-medium">3</span>
          </div>
          <h3 className="font-semibold text-base">Activities & Consignment</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-9 h-8 w-64" />
          </div>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">S. No.</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Behaviour</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Planned/Actual</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Consignment</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {activitiesData.map((activity, index) => (
                <tr key={activity.sno} className="border-t hover:bg-muted/20">
                  <td className="p-3 text-sm">{activity.sno}</td>
                  <td className="p-3">
                    <BehaviorBadge behavior={activity.behaviour} />
                  </td>
                  <td className="p-3">
                    <LocationCell location={activity.location} details={activity.locationDetails} />
                  </td>
                  <td className="p-3">
                    <PlannedActualCell 
                      plannedActual={activity.plannedActual} 
                      details={activity.plannedActualDetails} 
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{activity.consignment}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <CheckCircle className="h-4 w-4 text-status-success" />
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
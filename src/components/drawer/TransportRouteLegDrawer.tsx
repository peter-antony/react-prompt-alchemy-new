import React, { useState } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel/DynamicPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelConfig } from '@/types/dynamicPanel';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TripInfo {
  TripID: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  DepartureActualDate: string;
  ArrivalActualDate: string;
  LoadType: string;
  TripStatus: string;
  DraftBillNo: string | null;
  DraftBillStatus: string | null;
  DraftBillWarning: string | null;
  SupplierID: string;
  SupplierDescription: string;
}

interface LegDetail {
  LegSequence: number;
  LegID: string;
  LegUniqueId: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  TransportMode: string;
  LegStatus: string | null;
  TripInfo: TripInfo[] | null;
  ModeFlag: string;
  ReasonForUpdate: string | null;
  QCCode1: string | null;
  QCCode1Value: string | null;
  Remarks: string | null;
}

interface TransportRoute {
  ExecutionPlanID: string;
  CustomerOrderID: string;
  CustomerID: string;
  CustomerName: string;
  Service: string;
  ServiceDescription: string;
  SubService: string;
  SubServiceDescription: string;
  CODeparture: string;
  CODepartureDescription: string;
  COArrival: string;
  COArrivalDescription: string;
  RouteID: string;
  RouteDescription: string;
  Status: string;
  LegDetails: LegDetail[];
  ReasonForUpdate: string;
}

interface TransportRouteLegDrawerProps {
  route: TransportRoute;
  onAddLeg: () => void;
  onRemoveLeg: (index: number) => void;
  onUpdateLeg: (index: number, field: string, value: any) => void;
  onSave: () => Promise<void>;
  fetchDepartures: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
  fetchArrivals: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
}

export const TransportRouteLegDrawer: React.FC<TransportRouteLegDrawerProps> = ({
  route,
  onAddLeg,
  onRemoveLeg,
  onUpdateLeg,
  onSave,
  fetchDepartures,
  fetchArrivals
}) => {
  const [reasonForUpdate, setReasonForUpdate] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    await onSave();
    toast({
      title: 'Success',
      description: 'Route details saved successfully',
    });
  };

  const createLegPanelConfig = (legIndex: number): PanelConfig => {
    const leg = route.LegDetails?.[legIndex];
    if (!leg) return {};

    return {
      LegSequence: {
        id: 'LegSequence',
        label: 'Leg Sequence',
        fieldType: 'text',
        value: leg.LegSequence.toString(),
        mandatory: true,
        visible: true,
        editable: false,
        order: 1,
        width: 'third'
      },
      LegID: {
        id: 'LegID',
        label: 'Leg ID',
        fieldType: 'select',
        value: leg.LegID,
        mandatory: true,
        visible: true,
        editable: true,
        order: 2,
        width: 'third',
        options: [
          { label: 'LEG01', value: 'LEG01' },
          { label: 'LEG02', value: 'LEG02' },
          { label: 'LEG03', value: 'LEG03' },
          { label: 'LEG04', value: 'LEG04' }
        ],
        onChange: (value) => onUpdateLeg(legIndex, 'LegID', value)
      },
      Departure: {
        id: 'Departure',
        label: 'Departure',
        fieldType: 'lazyselect',
        value: leg.DepartureDescription || leg.Departure,
        mandatory: true,
        visible: true,
        editable: true,
        order: 3,
        width: 'third',
        fetchOptions: fetchDepartures,
        onChange: (value) => onUpdateLeg(legIndex, 'Departure', value)
      },
      Arrival: {
        id: 'Arrival',
        label: 'Arrival',
        fieldType: 'lazyselect',
        value: leg.ArrivalDescription || leg.Arrival,
        mandatory: true,
        visible: true,
        editable: true,
        order: 4,
        width: 'third',
        fetchOptions: fetchArrivals,
        onChange: (value) => onUpdateLeg(legIndex, 'Arrival', value)
      },
      LegBehaviour: {
        id: 'LegBehaviour',
        label: 'Leg Behaviour',
        fieldType: 'select',
        value: leg.LegBehaviour,
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'third',
        options: [
          { label: 'Pick', value: 'Pick' },
          { label: 'LHV', value: 'LHV' },
          { label: 'Dvry', value: 'Dvry' }
        ],
        onChange: (value) => onUpdateLeg(legIndex, 'LegBehaviour', value)
      },
      TransportMode: {
        id: 'TransportMode',
        label: 'Transport Mode',
        fieldType: 'select',
        value: leg.TransportMode,
        mandatory: true,
        visible: true,
        editable: true,
        order: 6,
        width: 'third',
        options: [
          { label: 'Rail', value: 'Rail' },
          { label: 'Road', value: 'Road' },
          { label: 'Air', value: 'Air' },
          { label: 'Sea', value: 'Sea' }
        ],
        onChange: (value) => onUpdateLeg(legIndex, 'TransportMode', value)
      }
    };
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'INCMPLT':
      case 'In-Complete':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PRTDLV':
      case 'Partial-Delivered':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLegStatusBadgeClass = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (status) {
      case 'CF':
      case 'Initiated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AC':
      case 'Released':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Leg Details</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={onAddLeg}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Order Info */}
        <div className="flex gap-2 items-center mb-4">
          <Badge variant="outline" className="text-sm">
            {route.CustomerOrderID}
          </Badge>
          <Badge 
            variant="outline"
            className={getStatusBadgeClass(route.Status)}
          >
            {route.Status}
          </Badge>
        </div>

        {/* Customer & Service Info Grid */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Customer</p>
            <p className="font-medium">{route.CustomerOrderID} - {route.CustomerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">From and To Location</p>
            <p className="font-medium">{route.CODepartureDescription} - {route.COArrivalDescription}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Service</p>
            <p className="font-medium">{route.ServiceDescription}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Sub-Service</p>
            <p className="font-medium">{route.SubServiceDescription}</p>
          </div>
        </div>
      </div>

      {/* Legs Section */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {route.LegDetails?.map((leg, index) => (
            <Card key={leg.LegUniqueId} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
                onClick={() => onRemoveLeg(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <DynamicPanel
                panelId={`leg-${index}`}
                panelTitle="Leg Sequence"
                panelConfig={createLegPanelConfig(index)}
                initialData={leg}
                collapsible={true}
                panelWidth="full"
                showPreview={false}
                badgeValue={leg.LegSequence.toString()}
              />

              {/* Trip Details with Badges */}
              {leg.TripInfo && leg.TripInfo.length > 0 && (
                <div className="px-6 pb-4">
                  {leg.TripInfo.map((trip, tripIndex) => (
                    <div key={tripIndex} className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap mb-2">
                      <span>
                        {trip.TripID} : {trip.DepartureDescription}, {trip.DepartureActualDate} → {trip.ArrivalDescription}, {trip.ArrivalActualDate}
                      </span>
                      {trip.LoadType && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                          {trip.LoadType}
                        </Badge>
                      )}
                      {trip.TripStatus && (
                        <Badge 
                          variant="outline"
                          className={getLegStatusBadgeClass(trip.TripStatus)}
                        >
                          {trip.TripStatus}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {leg.LegStatus && (
                <div className="px-6 pb-4">
                  <Badge 
                    variant="outline"
                    className={getLegStatusBadgeClass(leg.LegStatus)}
                  >
                    Status: {leg.LegStatus}
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Reason for Update */}
        <div className="mt-6">
          <Label htmlFor="reasonForUpdate">Reason For Update</Label>
          <Select value={reasonForUpdate} onValueChange={setReasonForUpdate}>
            <SelectTrigger id="reasonForUpdate" className="mt-2">
              <SelectValue placeholder="Select Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="route_change">Route Change</SelectItem>
              <SelectItem value="vehicle_change">Vehicle Change</SelectItem>
              <SelectItem value="driver_change">Driver Change</SelectItem>
              <SelectItem value="schedule_update">Schedule Update</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Last Modified: Samuel Wilson 10:10:00 AM
        </p>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

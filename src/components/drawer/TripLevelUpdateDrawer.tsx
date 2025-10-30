
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NextPlan {
  TripID: string;
  TripStatus: string;
}

interface CustomerOrderDetail {
  CustomerOrderNo: string;
  ExecutionLegID: string;
  ExecutionLegSeqNo: number;
  ExecutionPlanID: string;
  ExecutionLegBehaviour: string;
  ExecutionLegBehaviourDescription: string;
  DeparturePoint: string;
  DeparturePointDescription: string;
  ArrivalPoint: string;
  ArrivalPointDescription: string;
  NextPlan: NextPlan[];
}

interface ExecutionLegDetail {
  LegSequence: number;
  LegID: string;
  LegIDDescription: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  ReasonForUpdate: string | null;
  Remarks: string | null;
  QuickCode1: string | null;
  QuickCodeValue1: string | null;
  ModeFlag: string;
  WarningMsg: string | null;
  CustomerOrderDetails: Array<{
    CustomerOrderNo: string;
    LegUniqueId: string;
  }>;
}

interface LegDetail {
  LegSeqNo: number;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  LegID: string;
  LegIDDescription: string;
  DeparturePoint: string;
  DeparturePointDescription: string;
  DepartureDateTime: string;
  ArrivalPoint: string;
  ArrivalPointDescription: string;
  ArrivalDateTime: string;
  TransportMode: string | null;
  SupplierID: string;
  SupplierDescription: string;
  CustomerOrderDetails: CustomerOrderDetail[];
  ExecutionLegDetails: ExecutionLegDetail[];
}

interface TripData {
  Header: {
    TripID: string;
    TripOU: number;
    TripStatus: string;
    TripStatusDescription: string;
  };
  LegDetails: LegDetail[];
  WarnningDetails: {
    HeaderWarningMsg: string | null;
  };
}

interface TripLevelUpdateDrawerProps {
  tripData: TripData;
  onAddExecutionLeg: (legIndex: number) => void;
  onRemoveExecutionLeg: (legIndex: number, execLegIndex: number) => void;
  onUpdateExecutionLeg: (legIndex: number, execLegIndex: number, field: string, value: any) => void;
  onSave: () => Promise<void>;
  fetchDepartures: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
  fetchArrivals: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
}

export const TripLevelUpdateDrawer: React.FC<TripLevelUpdateDrawerProps> = ({
  tripData,
  onAddExecutionLeg,
  onRemoveExecutionLeg,
  onUpdateExecutionLeg,
  onSave,
  fetchDepartures,
  fetchArrivals,
}) => {
  const [selectedLegIndex, setSelectedLegIndex] = useState<number>(0);
  const [reasonForUpdate, setReasonForUpdate] = useState<string>('');
  const { toast } = useToast();

  const selectedLeg = tripData.LegDetails[selectedLegIndex];

  const handleSave = async () => {
    await onSave();
    toast({
      title: "Success",
      description: "Trip details saved successfully",
    });
  };

  const getTripStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'DR': 'bg-gray-100 text-gray-800 border-gray-200',
      'Initiated': 'bg-blue-100 text-blue-800 border-blue-200',
      'Confirmed': 'bg-green-100 text-green-800 border-green-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderExecutionLegFields = (
    legIndex: number,
    execLegIndex: number,
    execLeg: ExecutionLegDetail
  ) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Leg Sequence</Label>
            <Input
              type="number"
              value={execLeg.LegSequence}
              onChange={(e) => onUpdateExecutionLeg(legIndex, execLegIndex, 'LegSequence', parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Leg ID</Label>
            <Select
              value={execLeg.LegID}
              onValueChange={(value) => onUpdateExecutionLeg(legIndex, execLegIndex, 'LegID', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Leg ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Leg 1">Leg 1</SelectItem>
                <SelectItem value="Leg 2">Leg 2</SelectItem>
                <SelectItem value="Leg 3">Leg 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Departure</Label>
            <DynamicLazySelect
              value={execLeg.Departure}
              onChange={(value) => onUpdateExecutionLeg(legIndex, execLegIndex, 'Departure', value)}
              fetchOptions={fetchDepartures}
              placeholder="Select Departure"
            />
          </div>

          <div className="space-y-2">
            <Label>Arrival</Label>
            <DynamicLazySelect
              value={execLeg.Arrival}
              onChange={(value) => onUpdateExecutionLeg(legIndex, execLegIndex, 'Arrival', value)}
              fetchOptions={fetchArrivals}
              placeholder="Select Arrival"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Leg Behaviour</Label>
            <Select
              value={execLeg.LegBehaviour}
              onValueChange={(value) => onUpdateExecutionLeg(legIndex, execLegIndex, 'LegBehaviour', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Behaviour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pick">Pick</SelectItem>
                <SelectItem value="LHV">LHV (Line Haul Vendor)</SelectItem>
                <SelectItem value="Dvry">Dvry (Delivery)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reason For Update</Label>
            <Input
              value={execLeg.ReasonForUpdate || ''}
              onChange={(e) => onUpdateExecutionLeg(legIndex, execLegIndex, 'ReasonForUpdate', e.target.value)}
              placeholder="Enter reason"
            />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Input
              value={execLeg.Remarks || ''}
              onChange={(e) => onUpdateExecutionLeg(legIndex, execLegIndex, 'Remarks', e.target.value)}
              placeholder="Enter remarks"
            />
          </div>
        </div>
      </div>
    );
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 border-b bg-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Leg Details</h2>
            <Badge className="border" variant="outline">{tripData.Header.TripID}</Badge>
            <Badge className={cn("border", getTripStatusBadgeClass(tripData.Header.TripStatus))}>
              {tripData.Header.TripStatusDescription}
            </Badge>
          </div>
        </div>
      </div>

      {/* Body - Two Panel Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-6 overflow-hidden">
        {/* Left Panel - Leg List */}
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3">
            {tripData.LegDetails.map((leg, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  selectedLegIndex === index && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => setSelectedLegIndex(index)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {String(index + 1).padStart(2, '0')} - {leg.LegID}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {leg.CustomerOrderDetails.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[60px]">{leg.DeparturePointDescription}</span>
                      <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{leg.ArrivalPointDescription}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateTime(leg.DepartureDateTime)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateTime(leg.ArrivalDateTime)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Right Panel - Selected Leg Details */}
        <ScrollArea className="h-full">
          {selectedLeg && (
            <div className="space-y-6 pr-4">
              {/* Customer Order Details Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Customer Order Details</h3>
                  <Badge variant="outline">{selectedLeg.CustomerOrderDetails.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {selectedLeg.CustomerOrderDetails.map((order, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{order.CustomerOrderNo}</span>
                            <Badge variant="secondary" className="text-xs">
                              {order.ExecutionLegBehaviourDescription}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">From: </span>
                            <span className="font-medium">{order.DeparturePointDescription}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <span className="font-medium">{order.ArrivalPointDescription}</span>
                          </div>
                        </div>

                        {order.NextPlan && order.NextPlan.length > 0 && (
                          <div className="border-t pt-2">
                            <div className="text-xs text-muted-foreground mb-2">Next Trip:</div>
                            <div className="flex flex-wrap gap-2">
                              {order.NextPlan.map((plan, planIdx) => (
                                <Badge
                                  key={planIdx}
                                  className={cn("text-xs", getTripStatusBadgeClass(plan.TripStatus))}
                                >
                                  {plan.TripID}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Leg Details Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Leg Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddExecutionLeg(selectedLegIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Leg
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedLeg.ExecutionLegDetails.map((execLeg, execIdx) => (
                    <Card key={execIdx} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            Execution Leg {execIdx + 1}
                          </h4>
                          {selectedLeg.ExecutionLegDetails.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveExecutionLeg(selectedLegIndex, execIdx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        {renderExecutionLegFields(selectedLegIndex, execIdx, execLeg)}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-20 px-6 py-4 border-t bg-card space-y-4">
        <div className="max-w-md">
          <label className="text-sm font-medium mb-2 block">Reason For Update</label>
          <Select value={reasonForUpdate} onValueChange={setReasonForUpdate}>
            <SelectTrigger>
              <SelectValue placeholder="Select Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supplier_change">Supplier Change</SelectItem>
              <SelectItem value="route_optimization">Route Optimization</SelectItem>
              <SelectItem value="delay">Delay</SelectItem>
              <SelectItem value="customer_request">Customer Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};
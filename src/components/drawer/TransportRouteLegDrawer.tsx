import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel/DynamicPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelConfig } from '@/types/dynamicPanel';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTransportRouteStore } from '@/stores/transportRouteStore';
import { quickOrderService } from '@/api/services/quickOrderService';

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
  // Remove all the props since we'll use the store directly
}

export interface TransportRouteLegDrawerRef {
  getFormData: () => any;
  syncFormDataToStore: () => void;
}

export const TransportRouteLegDrawer = forwardRef<TransportRouteLegDrawerRef, TransportRouteLegDrawerProps>((props, ref) => {
  const [reasonForUpdate, setReasonForUpdate] = useState('');
  const { toast } = useToast();
  
  // Refs for each DynamicPanel
  const dynamicPanelRefs = useRef<{ [key: string]: any }>({});
  
  // Use the store directly
  const {
    selectedRoute,
    isLoading,
    error,
    addLegPanel,
    removeLegPanel,
    updateLegData,
    saveRouteDetails,
    fetchDepartures,
    fetchArrivals
  } = useTransportRouteStore();
  
  console.log('selectedRoute from store: --------------- ', selectedRoute);
  console.log('isLoading: --------------- ', isLoading);
  console.log('error: --------------- ', error);

  const fetchMasterData = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });
      
      const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
              }
            : {})
        }));
      
      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      // Return empty array on error
      return [];
    }
  };

  // Specific fetch functions for different message types
  const fetchTransportModes = fetchMasterData("Transport Mode Init");
  const fetchLegBehaviours = fetchMasterData("LegBehaviour Init");

  // Helper function to get form data
  const getFormData = () => {
    const formData: any = {
      reasonForUpdate,
      legDetails: []
    };

    console.log('🔍 Debugging getFormData:');
    console.log('dynamicPanelRefs.current:', dynamicPanelRefs.current);
    console.log('Object.keys(dynamicPanelRefs.current):', Object.keys(dynamicPanelRefs.current));

    // Get data from each DynamicPanel
    Object.keys(dynamicPanelRefs.current).forEach(panelId => {
      console.log(`🔍 Processing panel: ${panelId}`);
      const panelRef = dynamicPanelRefs.current[panelId];
      console.log(`🔍 Panel ref for ${panelId}:`, panelRef);
      
      if (panelRef && panelRef.getFormValues) {
        console.log(`🔍 Calling getFormValues for ${panelId}`);
        const panelData = panelRef.getFormValues();
        console.log(`🔍 Panel data for ${panelId}:`, panelData);
        formData.legDetails.push(panelData);
      } else {
        console.log(`❌ No valid ref or getFormValues method for ${panelId}`);
      }
    });

    console.log('📋 Form data collected:', formData);
    return formData;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => getFormData(),
    syncFormDataToStore: () => {
      console.log('🔄 syncFormDataToStore called');
      const formData = getFormData();
      console.log('🔄 Form data from getFormData:', formData);
      
      // Update store with form data
      if (selectedRoute && formData.legDetails.length > 0) {
        console.log('🔄 Updating store with form data...');
        // Update each leg individually
        formData.legDetails.forEach((legData: any, index: number) => {
          console.log(`🔄 Updating leg ${index} with data:`, legData);
          // Update each field in the leg
          Object.keys(legData).forEach(field => {
            if (legData[field] !== undefined && legData[field] !== null) {
              console.log(`🔄 Updating field ${field} with value:`, legData[field]);
              updateLegData(index, field, legData[field]);
            }
          });
        });
        
        console.log('🔄 Form data synced to store:', formData);
      } else {
        console.log('❌ No selectedRoute or empty legDetails:', { selectedRoute, legDetailsLength: formData.legDetails.length });
      }
    }
  }));

  const handleSave = async () => {
    // Get all form data from DynamicPanels
    const formData = getFormData();
    console.log('💾 Saving form data:', formData);
    
    // Here you can process the form data as needed
    // For now, we'll just show a success message
    toast({
      title: 'Success',
      description: 'Route details saved successfully',
    });
  };

  const createLegPanelConfig = (legIndex: number): PanelConfig => {
    console.log(`🔧 Creating panel config for leg ${legIndex}`);
    const leg = selectedRoute?.LegDetails?.[legIndex];
    if (!leg) {
      console.log(`❌ No leg found at index ${legIndex}`);
      return {};
    }
    
    console.log(`✅ Leg found at index ${legIndex}:`, leg);

    return {
      LegSequence: {
        id: 'LegSequence',
        label: 'Leg Sequence',
        fieldType: 'text',
        value: leg.LegSequence?.toString() || (legIndex + 1).toString(),
        mandatory: true,
        visible: true,
        editable: false,
        order: 1,
        width: 'third'
      },
      LegID: {
        id: 'LegID',
        label: 'Leg ID',
        fieldType: 'text',
        value: leg.LegID?.toString() || 'Leg ' + (legIndex + 1).toString(),
        mandatory: true,
        visible: true,
        editable: false,
        order: 2,
        width: 'third'
        // Remove onChange since we're using ref-based approach
      },
      Departure: {
        id: 'Departure',
        label: 'Departure',
        fieldType: 'lazyselect',
        value: leg.DepartureDescription || leg.Departure || '',
        mandatory: true,
        visible: true,
        editable: true,
        order: 3,
        width: 'third',
        fetchOptions: fetchDepartures
        // Remove onChange since we're using ref-based approach
      },
      Arrival: {
        id: 'Arrival',
        label: 'Arrival',
        fieldType: 'lazyselect',
        value: leg.ArrivalDescription || leg.Arrival || '',
        mandatory: true,
        visible: true,
        editable: true,
        order: 4,
        width: 'third',
        fetchOptions: fetchArrivals
        // Remove onChange since we're using ref-based approach
      },
      LegBehaviour: {
        id: 'LegBehaviour',
        label: 'Leg Behaviour',
        fieldType: 'lazyselect',
        value: leg.LegBehaviour || 'Pick',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'third',
        fetchOptions: fetchLegBehaviours
        // Remove onChange since we're using ref-based approach
      },
      TransportMode: {
        id: 'TransportMode',
        label: 'Transport Mode',
        fieldType: 'lazyselect',
        value: leg.TransportMode || 'Rail',
        mandatory: true,
        visible: true,
        editable: true,
        order: 6,
        width: 'third',
        fetchOptions: fetchTransportModes
        // Remove onChange since we're using ref-based approach
      }
    };
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'INCMPLT':
      case 'In-Complete':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PRTDLV':
      case 'Partial-Delivered':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Closed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLegStatusBadgeClass = (status: string | null) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';

    switch (status) {
      case 'CF':
      case 'Initiated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'AC':
      case 'Released':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Loaded':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Empty':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Leg Details</h2>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mx-auto mb-4"></div>
            <div className="text-lg font-semibold text-blue-700">Loading Route Details...</div>
            <div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Leg Details</h2>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-red-700 mb-2">Error Loading Route Details</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-gray-300 hover:bg-gray-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no route data
  if (!selectedRoute) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Leg Details</h2>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-700 mb-2">No Route Data</div>
            <div className="text-sm text-gray-500">Please select a route to view its details.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">

        {/* Customer & Service Info Grid */}
        <div className="grid grid-cols-5 gap-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1 font-medium">Customer</p>
            <p className="font-semibold text-gray-900">{selectedRoute?.CustomerOrderID} - {selectedRoute?.CustomerName}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1 font-medium">From and To Location</p>
            <p className="font-semibold text-gray-900">{selectedRoute?.CODepartureDescription} - {selectedRoute?.COArrivalDescription}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1 font-medium">Service</p>
            <p className="font-semibold text-gray-900">{selectedRoute?.ServiceDescription}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1 font-medium">Sub-Service</p>
            <p className="font-semibold text-gray-900">{selectedRoute?.SubServiceDescription}</p>
          </div>
          <div className='flex justify-end'>
            <Button
              variant="outline"
              size="icon"
              onClick={addLegPanel}
              className="h-8 w-8 border-gray-300 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legs Section */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {selectedRoute?.LegDetails?.map((leg, index) => {
            console.log(`🎨 Rendering DynamicPanel for leg ${index} with config:`, createLegPanelConfig(index));
            return (
            <Card key={leg.LegUniqueId} className="relative bg-white border border-gray-200 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 z-10"
                onClick={() => removeLegPanel(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <DynamicPanel
                ref={(ref) => {
                  console.log(`🔗 Setting ref for leg-${index}:`, ref);
                  if (ref) {
                    dynamicPanelRefs.current[`leg-${index}`] = ref;
                    console.log(`✅ Ref set for leg-${index}, current refs:`, dynamicPanelRefs.current);
                  }
                }}
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
                    <div key={tripIndex} className="text-sm text-gray-600 flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-medium">
                        {trip.TripID} : {trip.DepartureDescription}, {trip.DepartureActualDate} → {trip.ArrivalDescription}, {trip.ArrivalActualDate}
                      </span>
                      {trip.LoadType && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-1">
                          {trip.LoadType}
                        </Badge>
                      )}
                      {trip.TripStatus && (
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-1 ${getLegStatusBadgeClass(trip.TripStatus)}`}
                        >
                          {trip.TripStatus}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {leg.TripInfo[0]?.DraftBillNo && (
                    <div className="text-sm text-gray-600 mt-2">
                      Draftbill: {leg.TripInfo[0].DraftBillNo}
                    </div>
                  )}
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
            );
          })}
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
      <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Last Modified: Samuel Wilson 10:10:00 AM
        </p>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          Save
        </Button>
      </div>
    </div>
  );
});

TransportRouteLegDrawer.displayName = 'TransportRouteLegDrawer';

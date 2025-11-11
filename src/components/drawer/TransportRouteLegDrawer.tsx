import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel/DynamicPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PanelConfig } from '@/types/dynamicPanel';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTransportRouteStore } from '@/stores/transportRouteStore';
import { quickOrderService } from '@/api/services/quickOrderService';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { tripService } from '@/api/services/tripService';

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
  LegIDDescription: string;
  LegUniqueId: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  TransportMode: string;
  LegStatus: string | null;
  LegStatusDescription: string | null;
  TransitTime: number | null;
  TransitTimeUOM: string | null;
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


// Helper functions for removing pipe symbols
const splitAtPipe = (value: string | null | undefined) => {
  if (typeof value === "string" && value.includes("||")) {
    const [first, ...rest] = value.split("||");
    return {
      value: first.trim(),
      label: rest.join("||").trim(),
    };
  }
  return value;
};

const extractIdFromPipeSeparatedValue = (value: string | null | undefined): string => {
  if (typeof value === "string" && value.includes("||")) {
    const [id] = value.split("||");
    return id.trim();
  }
  return value || "";
};

export const TransportRouteLegDrawer = forwardRef<TransportRouteLegDrawerRef, TransportRouteLegDrawerProps>((props, ref) => {
  const [reasonForUpdate, setReasonForUpdate] = useState('');
  const [hoveredTooltipIndex, setHoveredTooltipIndex] = useState<number | null>(null);
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
  const fetchReasonForUpdate = fetchMasterData("Reason For Update Init");
  const fetchQCCode1 = fetchMasterData("ManageRouteUpdateCO QC1 Init");

  // Helper function to get form data
  const getFormData = () => {
    const formData: any = {
      reasonForUpdate,
      legDetails: []
    };

    console.log('🔍 Debugging getFormData:');
    console.log('dynamicPanelRefs.current:', dynamicPanelRefs.current);
    console.log('Object.keys(dynamicPanelRefs.current):', Object.keys(dynamicPanelRefs.current));

    // Loop through each dynamic panel (each leg)
    Object.keys(dynamicPanelRefs.current).forEach(panelId => {
      console.log(`🔍 Processing panel: ${panelId}`);
      const panelRef = dynamicPanelRefs.current[panelId];
      if (!panelRef || !panelRef.getFormValues) {
        console.log(`❌ No valid ref or getFormValues for ${panelId}`);
        return;
      }

      const panelData = panelRef.getFormValues();
      const legIndex = parseInt(panelId.replace('leg-', ''));
      const originalLeg = selectedRoute?.LegDetails?.[legIndex];
      let isModified = false;
      let departureChanged = false;
      let arrivalChanged = false;

      //  ====== Normalize and compare LegId ======
      if (panelData.LegID && panelData.LegID.includes('||')) {
        const [legId, legDesc] = panelData.LegID.split('||').map(x => x.trim());
        panelData.LegID = legId;
        panelData.LegIDDescription = legDesc;
      }
      if (
        originalLeg &&
        (originalLeg.LegID !== panelData.LegID || originalLeg.LegIDDescription !== panelData.LegIDDescription)
      ) {
        isModified = true;
      }

      // ====== Normalize and compare Departure ======
      if (panelData.Departure && panelData.Departure.includes('||')) {
        const [depCode, depDesc] = panelData.Departure.split('||').map(x => x.trim());
        panelData.Departure = depCode;
        panelData.DepartureDescription = depDesc;
      }
      if (
        originalLeg &&
        (originalLeg.Departure !== panelData.Departure ||
          originalLeg.DepartureDescription !== panelData.DepartureDescription)
      ) {
        departureChanged = true;
        isModified = true;
      }

      // ====== Normalize and compare Arrival ======
      if (panelData.Arrival && panelData.Arrival.includes('||')) {
        const [arrCode, arrDesc] = panelData.Arrival.split('||').map(x => x.trim());
        panelData.Arrival = arrCode;
        panelData.ArrivalDescription = arrDesc;
      }
      if (
        originalLeg &&
        (originalLeg.Arrival !== panelData.Arrival ||
          originalLeg.ArrivalDescription !== panelData.ArrivalDescription)
      ) {
        arrivalChanged = true;
        isModified = true;
      }

      // ====== Normalize and compare TransportMode ======
      if (panelData.TransportMode && panelData.TransportMode.includes('||')) {
        const newMode = extractIdFromPipeSeparatedValue(panelData.TransportMode);
        if (originalLeg && originalLeg.TransportMode !== newMode) {
          isModified = true;
        }
        panelData.TransportMode = newMode;
      }

      // ====== Normalize and compare LegBehaviour ======
      if (panelData.LegBehaviour && panelData.LegBehaviour.includes('||')) {
        const [behaviour, behaviourDesc] = panelData.LegBehaviour.split('||').map(x => x.trim());
        if (originalLeg && originalLeg.LegBehaviour !== behaviour) {
          isModified = true;
        }
        panelData.LegBehaviour = behaviour;
        panelData.LegBehaviourDescription = behaviourDesc;
      }

      // ====== Reset LegID if location changed ======
      if (originalLeg && originalLeg.ModeFlag !== 'Insert' && (departureChanged || arrivalChanged)) {
        console.log(`🟡 LegID set to null for leg index ${legIndex} due to location change`);
        panelData.LegID = null;
        panelData.LegIDDescription = null;
        // panelData.LegUniqueId = null;
      }

      // ====== Check for Remarks changes ======
      if (originalLeg && originalLeg.Remarks !== panelData.Remarks) {
        isModified = true;
      }

      // ====== Determine ModeFlag correctly ======
      if (originalLeg?.ModeFlag === 'Insert') {
        panelData.ModeFlag = 'Insert'; // keep new legs as Insert
      } else if (isModified) {
        panelData.ModeFlag = 'Update';
      } else {
        panelData.ModeFlag = 'Nochange';
      }

      // Push into final array
      formData.legDetails.push(panelData);

      console.log(`✅ Processed leg ${legIndex}:`, {
        ModeFlag: panelData.ModeFlag,
        isModified,
        departureChanged,
        arrivalChanged
      });
    });

    console.log('📋 Final Form Data:', formData);
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
  console.log('💾 selectedRoute form data:', selectedRoute);

  // Validate mandatory fields
  let missingFields: string[] = [];

  formData.legDetails.forEach((leg: any, index: number) => {
    const requiredFields = [
      { key: "LegSequence", label: "Leg Sequence" },
      // { key: "LegID", label: "Leg ID" },
      { key: "Departure", label: "Departure" },
      { key: "Arrival", label: "Arrival" },
      { key: "TransportMode", label: "Transport Mode" },
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!leg[key] || leg[key].toString().trim() === "") {
        missingFields.push(`Leg ${index + 1}: ${label}`);
      }
    });
  });

  if (missingFields.length > 0) {
    toast({
      title: "⚠️ Missing Mandatory Fields",
      description: (
        <div>
          Please fill in the following mandatory fields:
          {/* <ul className="list-disc ml-4 mt-2 text-red-500"> */}
            {missingFields.map((field, i) => (
              <li key={i}>{field}</li>
            ))}
          {/* </ul> */}
        </div>
      ),
      variant: "destructive",
    });
    return; // ❌ Stop execution — don't proceed with save
  }

  // Proceed with save if all required fields are filled
  const reasonValue =
    typeof reasonForUpdate === "string" && reasonForUpdate.includes("||")
      ? reasonForUpdate.split("||")[0].trim()
      : reasonForUpdate;

  const formatFinalRouteData = {
    ...selectedRoute,
    LegDetails: formData.legDetails.map(({ NetAmount, ...rest }) => rest),
    ReasonForUpdate: reasonValue,
  };

  const response = await tripService.updateCOSelection(formatFinalRouteData);
  console.log('💾 response:', response);
  console.log('💾 formatFinalRouteData:', formatFinalRouteData);

  const responseData = response as any;

  if (responseData && responseData.data) {
    toast({
      title:
        responseData.data.IsSuccess === false
          ? "⚠️ Save Failed"
          : "✅ Saved Successfully",
      description:
        responseData.data.Message || "Trip details saved successfully",
      variant:
        responseData.data.IsSuccess === false ? "destructive" : "default",
    });
  } else {
    toast({
      title: "Success",
      description: "Trip details saved successfully",
    });
  }
};


  const handleDelete = async (index: number) => {
    try {
      console.log(`🗑️ Deleting leg at index ${index}`);

      // Get the latest form data before deleting
      const formDataBeforeDelete = getFormData();
      console.log('🗑️ Form data before delete:', formDataBeforeDelete);

      // Build final payload — all legs included
      const reasonValue = typeof reasonForUpdate === "string" && reasonForUpdate.includes("||")
        ? reasonForUpdate.split("||")[0].trim()
        : reasonForUpdate;

      // Prepare legs for payload: mark only the deleted leg with ModeFlag: "Delete"
      const updatedLegs = (selectedRoute?.LegDetails || []).map((leg, i) => ({
        ...leg,
        ModeFlag: i === index ? "Delete" : "Nochange",
      }));

      const formatFinalRouteData = {
        ...selectedRoute,
        LegDetails: updatedLegs,
        ReasonForUpdate: reasonValue || "Deleted Leg",
      };

      console.log("🧾 Payload for delete:", formatFinalRouteData);

      // 4️⃣ Call the same API used for save
      const response = await tripService.updateCOSelection(formatFinalRouteData);
      console.log('🗑️ Delete response:', response);

      const responseData = response as any;

      // 5️⃣ Handle the toast message
      if (responseData && responseData.data) {
        toast({
          title:
            responseData.data.IsSuccess === false
              ? "⚠️ Delete Failed"
              : "✅ Leg Deleted Successfully",
          description:
            responseData.data.Message || "Leg deleted and route updated successfully",
          variant:
            responseData.data.IsSuccess === false ? "destructive" : "default",
        });
      } else {
        toast({
          title: "Leg Deleted",
          description: "The selected leg was deleted successfully",
        });
      }

      // 6️⃣ Finally, remove it visually from UI after API success
      if (!responseData?.data?.IsSuccess === false) {
        removeLegPanel(index);
      }

    } catch (error) {
      console.error("❌ Error deleting leg:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the leg.",
        variant: "destructive",
      });
    }
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
        editable: true,
        order: 1,
        width: 'six',
        inputType: 'number'
      },
      LegIDDescription: {
        id: 'LegIDDescription',
        label: 'Leg ID Description',
        fieldType: 'text',
        value: leg.LegIDDescription?.length > 30
          ? leg.LegIDDescription.substring(0, 30) + '...'
          : leg.LegIDDescription,
        mandatory: false,
        visible: true,
        editable: false,
        order: 2,
        width: 'six'
        // Remove onChange since we're using ref-based approach
      },
      // LegID: {
      //   id: 'LegID',
      //   label: 'Leg ID',
      //   fieldType: 'text',
      //   value: leg.LegID && leg.LegIDDescription
      //     ? `${leg.LegID} || ${leg.LegIDDescription}`
      //     : (leg.LegID || leg.LegIDDescription || ''),
      //   mandatory: false,
      //   visible: true,
      //   editable: false,
      //   order: 2,
      //   width: 'six'
      //   // Remove onChange since we're using ref-based approach
      // },
      // LegID: {
      //   id: 'LegID',
      //   label: 'Leg ID',
      //   fieldType: 'text',
      //   value: (() => {
      //     const id = leg.LegID || '';
      //     const desc = leg.LegIDDescription || '';
      //     const maxLength = 25; // adjust this to how many chars you want visible

      //     const truncatedDesc = desc.length > maxLength
      //       ? desc.substring(0, maxLength) + '...'
      //       : desc;

      //     if (id && desc) return `${id} || ${truncatedDesc}`;
      //     return id || truncatedDesc || '';
      //   })(),
      //   mandatory: true,
      //   visible: true,
      //   editable: false,
      //   order: 2,
      //   width: 'six'
      // },

      Departure: {
        id: 'Departure',
        label: 'Departure',
        fieldType: 'lazyselect',
        value: leg.Departure && leg.DepartureDescription
          ? `${leg.Departure} || ${leg.DepartureDescription}`
          : (leg.Departure || leg.DepartureDescription || ''),
        mandatory: true,
        visible: true,
        editable: true,
        order: 3,
        width: 'six',
        fetchOptions: fetchDepartures
        // Remove onChange since we're using ref-based approach
      },
      Arrival: {
        id: 'Arrival',
        label: 'Arrival',
        fieldType: 'lazyselect',
        value: leg.Arrival && leg.ArrivalDescription
          ? `${leg.Arrival} || ${leg.ArrivalDescription}`
          : (leg.Arrival || leg.ArrivalDescription || ''),
        mandatory: true,
        visible: true,
        editable: true,
        order: 4,
        width: 'six',
        fetchOptions: fetchArrivals
        // Remove onChange since we're using ref-based approach
      },
      LegBehaviour: {
        id: 'LegBehaviour',
        label: 'Leg Behaviour',
        fieldType: 'lazyselect',
        value: leg.LegBehaviour && leg.LegBehaviourDescription
          ? `${leg.LegBehaviour} || ${leg.LegBehaviourDescription}`
          : (leg.LegBehaviour || leg.LegBehaviourDescription || ''),
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        width: 'six',
        fetchOptions: fetchLegBehaviours
        // Remove onChange since we're using ref-based approach
      },
      TransportMode: {
        id: 'TransportMode',
        label: 'Transport Mode',
        fieldType: 'lazyselect',
        value: leg.TransportMode || '',
        mandatory: true,
        visible: true,
        editable: true,
        order: 6,
        width: 'six',
        fetchOptions: fetchTransportModes
        // Remove onChange since we're using ref-based approach
      },
      QCCode1: {
        id: 'QCCode1',
        label: 'QC Code 1',
        fieldType: 'inputdropdown',
        width: 'six',
        value: '', // Uncontrolled - DynamicPanel manages its own state
        mandatory: false,
        visible: true,
        editable: true,
        order: 7,
        maxLength: 255,
        fetchOptions: fetchQCCode1,
        // options: qcList1?.filter((qc: any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
        // Removed onChange events - using uncontrolled approach
      },
      Remarks: {
        id: 'Remarks',
        label: 'Remarks',
        fieldType: 'text',
        value: leg.Remarks?.toString() || '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 8,
        width: 'six'
      },
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
            <p className="text-gray-500 mb-1 font-medium">Customer Order</p>
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
                  className="absolute top-2.5 right-14 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 z-10"
                  onClick={() => handleDelete(index)}
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
                      <div
                        key={tripIndex}
                        className="text-sm text-gray-600 flex flex-col gap-1 mb-3 border-b border-gray-100 pb-2 last:border-b-0"
                      >
                        {/* Trip Details */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {trip.TripID} : {trip.DepartureDescription}, {trip.DepartureActualDate || "-"} → {trip.ArrivalDescription}, {trip.ArrivalActualDate || "-"}
                          </span>
                          {trip.LoadType && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-1">
                              {trip.LoadType}
                            </Badge>
                          )}
                          {trip.TripStatus && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-1 ${getLegStatusBadgeClass(trip.TripStatus)}`}
                              >
                                {trip.TripStatus}
                              </Badge>

                              {trip.DraftBillNo && (
                              <>
                                <span className="text-gray-400 font-semibold">|</span>
                                <div className="flex items-center gap-2 text-gray-700">
                                  <span>Draft Bill: {trip.DraftBillNo}</span>
                                  {trip.DraftBillStatus && (
                                    <Badge variant="outline" className="text-xs px-2 py-1">
                                      {trip.DraftBillStatus}
                                    </Badge>
                                  )}
                                  {/* Alert icon with per-icon tooltip */}
                                  <div
                                    className="relative"
                                  >
                                    {/** Use a unique numeric key per leg+trip to control tooltip visibility */}
                                    {/** Tooltip */}
                                    {hoveredTooltipIndex === (index * 1000 + tripIndex) && (
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50 whitespace-nowrap">
                                        Based on the route updates, kindly rerun the draft bill: {trip.DraftBillNo || "-"}.
                                        {/* Tooltip arrow */}
                                        <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 top-full left-1/2 -translate-x-1/2 -mt-1" />
                                      </div>
                                    )}
                                    <AlertTriangle
                                      className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                                      onMouseEnter={() => setHoveredTooltipIndex(index * 1000 + tripIndex)}
                                      onMouseLeave={() => setHoveredTooltipIndex(null)}
                                      onFocus={() => setHoveredTooltipIndex(index * 1000 + tripIndex)}
                                      onBlur={() => setHoveredTooltipIndex(null)}
                                    />
                                  </div>
                                </div>
                              </>
                              )}
                            </div>
                          )}

                        </div>



                        {/* Supplier and Transit Info */}
                        <div className="flex items-center gap-4 flex-wrap text-gray-700">
                          {trip.SupplierDescription && (
                            <span>
                              Supplier: {trip.SupplierDescription}
                              {/* <span className="font-medium text-gray-900">{trip.SupplierDescription}</span> */}
                            </span>
                          )}

                          {(leg.TransitTime || leg.TransitTimeUOM) && (
                            <span>
                              Transit Time: {leg.TransitTime || "-"}{" "}
                              {leg.TransitTimeUOM
                                ? leg.TransitTimeUOM.charAt(0).toUpperCase() +
                                leg.TransitTimeUOM.slice(1).toLowerCase()
                                : ""}
                            </span>
                          )}
                        </div>

                        {/* Draft Bill Info */}
                        {/* {trip.DraftBillNo && (
          <div className="flex items-center gap-4 flex-wrap text-gray-700">
            <span>
              Draftbill:{trip.DraftBillNo}
              
            </span>
            {trip.DraftBillStatus && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {trip.DraftBillStatus}
              </Badge>
            )}
          </div>
        )}  */}
                      </div>
                    ))}
                  </div>
                )}


                {/* {leg.LegStatus && (
                  <div className="px-6 pb-4">
                    <Badge
                      variant="outline"
                      className={getLegStatusBadgeClass(leg.LegStatus)}
                    >
                      Status: {leg.LegStatus}
                    </Badge>
                  </div>
                )} */}
              </Card>
            );
          })}
        </div>

        {/* Reason for Update */}
        <div className="mt-6 max-w-md">
          <Label htmlFor="reasonForUpdate">Reason For Update</Label>
          {/* <Select value={reasonForUpdate} onValueChange={setReasonForUpdate}>
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
          </Select> */}
          <DynamicLazySelect
            fetchOptions={fetchReasonForUpdate}
            value={reasonForUpdate}
            onChange={(value) => setReasonForUpdate(value as string)}
            placeholder="Select Type"
          />
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
